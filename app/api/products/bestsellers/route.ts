import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      products.map((product) => ({ ...product, price: Number(product.price) }))
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
