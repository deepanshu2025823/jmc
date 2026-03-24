import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert AI Skincare Consultant for 'JMC Luxury Skincare'. 
      Analyze these customer concerns: ${JSON.stringify(answers)}.
      Provide a personalized skincare ritual.
      Response MUST be in strict JSON format:
      {
        "skinType": "Brief name of skin type",
        "routine": ["step 1", "step 2", "step 3"],
        "expertAdvice": "A short premium advice (max 20 words)"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}