import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: [{ discountValue: "desc" }, { createdAt: "desc" }],
      select: {
        code: true,
        discountValue: true,
        type: true,
        expiresAt: true,
        minOrderAmount: true,
        usageLimit: true,
        usageCount: true,
      },
    });

    const visible = coupons.filter(
      (c) => c.usageLimit === null || c.usageCount < c.usageLimit
    );

    return NextResponse.json({
      coupons: visible.map((c) => ({
        code: c.code,
        discountValue: c.discountValue,
        type: c.type,
        expiresAt: c.expiresAt.toISOString(),
        minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
      })),
    });
  } catch (error) {
    console.error("Active coupons fetch error:", error);
    return NextResponse.json({ coupons: [] }, { status: 200 });
  }
}
