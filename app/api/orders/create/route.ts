import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { markCheckoutRecovered } from "@/actions/abandoned";
import { createNotification, checkLowStock } from "@/lib/notifications";

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

    // Atomic stock reservation + order creation. Conditional decrements
    // ensure two simultaneous orders for the last unit cannot both succeed.
    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const qty = item.quantity || 1;
          const result = await tx.product.updateMany({
            where: { id: item.id, stock: { gte: qty } },
            data: { stock: { decrement: qty } },
          });
          if (result.count === 0) {
            // Stale snapshot — surface which product so client can adjust.
            const product = await tx.product.findUnique({
              where: { id: item.id },
              select: { name: true, stock: true },
            });
            const err: Error & { code?: string; productName?: string; available?: number } =
              new Error(
                product
                  ? `Only ${product.stock} left of "${product.name}". Please adjust your bag.`
                  : "Some items are no longer available."
              );
            err.code = "INSUFFICIENT_STOCK";
            err.productName = product?.name;
            err.available = product?.stock;
            throw err;
          }
        }

        const created = await tx.order.create({
          data: {
            userId: user.id,
            totalAmount,
            status: isPaid ? "PAID" : "PENDING",
            paidAt: isPaid ? new Date() : null,
            paymentMethod,
            shippingName,
            shippingPhone: str("phone"),
            shippingEmail: str("email") ?? user.email,
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
          await tx.coupon.update({
            where: { id: couponId },
            data: { usageCount: { increment: 1 } },
          });
          await tx.couponRedemption.create({
            data: {
              couponId,
              userId: user.id,
              orderId: created.id,
            },
          });
        }

        return created;
      });
    } catch (txErr) {
      const err = txErr as Error & { code?: string };
      if (err.code === "INSUFFICIENT_STOCK") {
        return NextResponse.json(
          { error: err.message, code: "INSUFFICIENT_STOCK" },
          { status: 409 }
        );
      }
      throw txErr;
    }

    await markCheckoutRecovered(user.id, order.id);

    await createNotification({
      type: "ORDER",
      title: "New order received",
      message: `${order.shippingName || user.email} placed an order worth ₹${Math.round(
        totalAmount
      ).toLocaleString("en-IN")} (${items.length} item${
        items.length === 1 ? "" : "s"
      })`,
      link: `/admin/orders`,
      metadata: { orderId: order.id, amount: totalAmount },
    });

    await checkLowStock(items.map((it) => it.id));

    return NextResponse.json({ success: true, id: order.id });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}
