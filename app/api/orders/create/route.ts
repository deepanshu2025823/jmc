import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { markCheckoutRecovered } from "@/actions/abandoned";

interface CartItem {
  id: string;
  quantity?: number;
  price: number | string;
}

interface AppliedCouponPayload {
  code: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please login to place an order" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await req.json()) as {
      shippingDetails?: Record<string, FormDataEntryValue | boolean | string>;
      items: CartItem[];
      totalAmount: number;
      coupon?: AppliedCouponPayload | null;
      paymentMethod?: string;
      isPaid?: boolean;
    };
    const { items, totalAmount, coupon, shippingDetails } = body;
    const paymentMethod =
      body.paymentMethod === "ONLINE" ? "ONLINE" : "COD";
    const isPaid = body.isPaid === true;

    const str = (key: string): string | null => {
      const v = shippingDetails?.[key];
      if (typeof v === "string" && v.trim().length > 0) return v.trim();
      return null;
    };
    const firstName = str("firstName") ?? "";
    const lastName = str("lastName") ?? "";
    const shippingName = `${firstName} ${lastName}`.trim() || null;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Re-validate coupon at order time (server-side authoritative).
    let couponId: string | null = null;
    if (coupon?.code) {
      const subtotal = items.reduce(
        (s, it) => s + Number(it.price) * (it.quantity || 1),
        0
      );

      const matched = await prisma.coupon.findUnique({
        where: { code: coupon.code.toUpperCase() },
      });

      if (matched && matched.isActive && new Date() < new Date(matched.expiresAt)) {
        const minOrder = matched.minOrderAmount
          ? Number(matched.minOrderAmount)
          : 0;

        const usageOk =
          matched.usageLimit === null ||
          matched.usageCount < matched.usageLimit;
        const minOk = minOrder === 0 || subtotal >= minOrder;

        let perUserOk = true;
        if (matched.perUserLimit !== null) {
          const uses = await prisma.couponRedemption.count({
            where: { couponId: matched.id, userId: user.id },
          });
          perUserOk = uses < matched.perUserLimit;
        }

        if (!usageOk || !minOk || !perUserOk) {
          return NextResponse.json(
            { error: "This coupon is no longer applicable to your order" },
            { status: 400 }
          );
        }

        couponId = matched.id;
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        status: isPaid ? "PAID" : "PENDING",
        paidAt: isPaid ? new Date() : null,
        paymentMethod,
        shippingName,
        shippingPhone: str("phone"),
        shippingEmail: str("email") ?? session.user.email,
        shippingAddress: str("address"),
        shippingCity: str("city"),
        shippingState: str("state"),
        shippingPincode: str("pincode"),
        orderItems: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity || 1,
            price: Number(item.price),
          })),
        },
      },
    });

    if (couponId) {
      await Promise.all([
        prisma.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        }),
        prisma.couponRedemption.create({
          data: {
            couponId,
            userId: user.id,
            orderId: order.id,
          },
        }),
      ]);
    }

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: { decrement: item.quantity || 1 },
        },
      });
    }

    await markCheckoutRecovered(user.id, order.id);

    return NextResponse.json({ success: true, id: order.id });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}
