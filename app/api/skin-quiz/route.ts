import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface RawAiResponse {
  skinType?: string;
  routine?: string[];
  expertAdvice?: string;
  recommendedProductIds?: string[];
}

export interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string | null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const answers = body.answers as Record<string, string> | undefined;
    const userEmail = typeof body.email === "string" ? body.email.trim() : "";
    const userName = typeof body.name === "string" ? body.name.trim() : "";

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: "Missing answers" }, { status: 400 });
    }

    // Fetch in-stock products so the AI only ever recommends real items.
    const products = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        price: true,
        imageUrl: true,
      },
    });

    const catalogForPrompt = products.slice(0, 80).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      blurb: (p.description || "").replace(/\s+/g, " ").slice(0, 120),
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an expert AI Skincare Consultant for 'JMC Luxury Skincare'.
Customer concerns: ${JSON.stringify(answers)}.

Available products (pick ONLY from this list — never invent product IDs):
${JSON.stringify(catalogForPrompt)}

Recommend 2 to 3 products that best match the customer's profile. Return STRICT JSON only:
{
  "skinType": "Brief skin type name (e.g. 'Combination, Dehydrated')",
  "routine": ["AM step…", "PM step…", "Weekly step…"],
  "expertAdvice": "Short premium advice in max 25 words",
  "recommendedProductIds": ["product-id-1", "product-id-2"]
}
The recommendedProductIds MUST be IDs that exist in the list above.
`;

    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();

    let parsed: RawAiResponse;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed response. Please try again." },
        { status: 502 }
      );
    }

    const skinType = parsed.skinType?.trim() || "Balanced";
    const routine = Array.isArray(parsed.routine)
      ? parsed.routine.slice(0, 5).map((s) => String(s).trim()).filter(Boolean)
      : [];
    const expertAdvice = parsed.expertAdvice?.trim() || "";

    // Validate the AI's product picks against our actual catalog.
    const validIds = new Set(products.map((p) => p.id));
    const recommendedIds = (parsed.recommendedProductIds || [])
      .map((id) => String(id))
      .filter((id) => validIds.has(id))
      .slice(0, 3);

    const recommendedProducts: RecommendedProduct[] = recommendedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        imageUrl: p.imageUrl ?? "",
        category: p.category,
      }));

    // Persist submission for marketing follow-up.
    try {
      const session = await getServerSession(authOptions);
      const linkedUserId = session?.user?.email
        ? (
            await prisma.user.findUnique({
              where: { email: session.user.email },
              select: { id: true },
            })
          )?.id ?? null
        : null;

      const targetEmail = userEmail || session?.user?.email || "";
      if (targetEmail) {
        await prisma.skinQuizSubmission.create({
          data: {
            email: targetEmail,
            name: userName || null,
            userId: linkedUserId,
            answers,
            skinType,
            routine,
            expertAdvice,
            recommendedProductIds: recommendedIds,
          },
        });
      }
    } catch (storeErr) {
      // Don't fail the user-facing request on a storage hiccup.
      console.error("Failed to store quiz submission:", storeErr);
    }

    return NextResponse.json({
      skinType,
      routine,
      expertAdvice,
      recommendedProducts,
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
