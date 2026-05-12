import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpayWebhook } from "@/lib/razorpay-subscriptions";
import { createNotification, checkLowStock } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook handler — primarily for subscription lifecycle events.
 * Configure in Razorpay dashboard:
 *   URL: https://yourdomain.com/api/razorpay/webhook
 *   Secret: stored in StoreSettings.razorpayWebhookSecret
 *   Events: subscription.activated, subscription.charged,
 *           subscription.completed, subscription.cancelled,
 *           subscription.paused, subscription.resumed, subscription.halted
 */

interface SubscriptionPayload {
  id: string;
  status?: string;
  paid_count?: number;
  charge_at?: number;
  current_end?: number;
  current_start?: number;
}

interface WebhookEvent {
  event: string;
  payload?: {
    subscription?: { entity?: SubscriptionPayload };
    payment?: { entity?: { id?: string; amount?: number } };
  };
}

function mapStatus(rzpStatus?: string): string | null {
  if (!rzpStatus) return null;
  const s = rzpStatus.toLowerCase();
  if (s === "active") return "ACTIVE";
  if (s === "authenticated") return "ACTIVE";
  if (s === "paused") return "PAUSED";
  if (s === "cancelled") return "CANCELLED";
  if (s === "completed") return "COMPLETED";
  if (s === "halted") return "HALTED";
  if (s === "expired") return "EXPIRED";
  return null;
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature") || "";
  const rawBody = await req.text();

  const ok = await verifyRazorpayWebhook(rawBody, signature);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const subEntity = event.payload?.subscription?.entity;
    if (!subEntity?.id) {
      // Not a subscription event we handle.
      return NextResponse.json({ ok: true, ignored: true });
    }

    const local = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: subEntity.id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        product: { select: { id: true, name: true, price: true, stock: true } },
      },
    });

    if (!local) {
      console.warn("Razorpay webhook: unknown subscription", subEntity.id);
      return NextResponse.json({ ok: true, ignored: "unknown_subscription" });
    }

    const newStatus = mapStatus(subEntity.status);
    const updates: Record<string, unknown> = {};
    if (newStatus && newStatus !== local.status) updates.status = newStatus;
    if (subEntity.charge_at) {
      updates.nextBillingAt = new Date(subEntity.charge_at * 1000);
    }

    switch (event.event) {
      case "subscription.activated":
        if (!local.startedAt) updates.startedAt = new Date();
        updates.status = "ACTIVE";
        break;

      case "subscription.charged": {
        updates.status = "ACTIVE";
        updates.cyclesPaid = (subEntity.paid_count ?? local.cyclesPaid + 1);

        // Auto-create a corresponding Order with one unit of the product.
        const lineItem = {
          productId: local.product.id,
          quantity: 1,
          price: Number(local.pricePerCycle),
        };
        const created = await prisma.order.create({
          data: {
            userId: local.user.id,
            totalAmount: Number(local.pricePerCycle),
            status: "PAID",
            paidAt: new Date(),
            paymentMethod: "ONLINE",
            shippingName: local.shippingName,
            shippingPhone: local.shippingPhone,
            shippingEmail: local.user.email,
            shippingAddress: local.shippingAddress,
            shippingCity: local.shippingCity,
            shippingState: local.shippingState,
            shippingPincode: local.shippingPincode,
            customerNote: `Subscription renewal #${local.cyclesPaid + 1}`,
            orderItems: { create: lineItem },
          },
        });

        // Decrement stock atomically — but don't fail the webhook if OOS.
        await prisma.product.updateMany({
          where: { id: local.product.id, stock: { gte: 1 } },
          data: { stock: { decrement: 1 } },
        });

        await createNotification({
          type: "ORDER",
          title: "Subscription renewed",
          message: `${local.user.email} — ${local.product.name} renewal (₹${Number(local.pricePerCycle).toLocaleString("en-IN")})`,
          link: `/admin/orders`,
          metadata: { orderId: created.id, subscriptionId: local.id },
        });
        await checkLowStock([local.product.id]);
        break;
      }

      case "subscription.cancelled":
        updates.status = "CANCELLED";
        updates.cancelledAt = new Date();
        break;

      case "subscription.completed":
        updates.status = "COMPLETED";
        break;

      case "subscription.paused":
        updates.status = "PAUSED";
        break;

      case "subscription.resumed":
        updates.status = "ACTIVE";
        break;

      case "subscription.halted":
        updates.status = "HALTED";
        break;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.subscription.update({
        where: { id: local.id },
        data: updates,
      });
    }

    return NextResponse.json({ ok: true, event: event.event });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "Razorpay webhook endpoint. POST your subscription events here.",
  });
}
