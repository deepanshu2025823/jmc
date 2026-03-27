// app/api/coupon/validate/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Please enter a coupon code" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is currently inactive" }, { status: 400 });
    }

    if (new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    return NextResponse.json({
      code: coupon.code,
      discountValue: coupon.discountValue,
      type: coupon.type,
    });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}