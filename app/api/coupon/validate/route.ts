import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { rateLimit, rateLimitHeaders, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const limit = rateLimit({
      bucket: "coupon-validate",
      identifier: getClientIp(req),
      max: 20,
      windowSec: 60,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many coupon attempts. Try again in a moment." },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    const body = await req.json();
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const subtotal =
      typeof body?.subtotal === "number" && Number.isFinite(body.subtotal)
        ? body.subtotal
        : 0;

    if (!code) {
      return NextResponse.json(
        { error: "Please enter a coupon code" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon is currently inactive" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (coupon.startsAt && now < new Date(coupon.startsAt)) {
      return NextResponse.json(
        { error: `This coupon becomes active on ${new Date(coupon.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` },
        { status: 400 }
      );
    }

    if (now > new Date(coupon.expiresAt)) {
      return NextResponse.json(
        { error: "This coupon has expired" },
        { status: 400 }
      );
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    const minOrder = coupon.minOrderAmount
      ? Number(coupon.minOrderAmount)
      : 0;
    if (minOrder > 0 && subtotal > 0 && subtotal < minOrder) {
      return NextResponse.json(
        {
          error: `Add ₹${(minOrder - subtotal).toLocaleString(
            "en-IN"
          )} more to use this coupon (min order ₹${minOrder.toLocaleString(
            "en-IN"
          )})`,
        },
        { status: 400 }
      );
    }

    if (coupon.perUserLimit !== null) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: "Please log in to use this coupon" },
          { status: 401 }
        );
      }
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (user) {
        const userUses = await prisma.couponRedemption.count({
          where: { couponId: coupon.id, userId: user.id },
        });
        if (userUses >= coupon.perUserLimit) {
          return NextResponse.json(
            { error: "You've already used this coupon the maximum number of times" },
            { status: 400 }
          );
        }
      }
    }

    return NextResponse.json({
      code: coupon.code,
      discountValue: coupon.discountValue,
      type: coupon.type,
      minOrderAmount: minOrder || null,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
