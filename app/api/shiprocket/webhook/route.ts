import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * Shiprocket → our app webhook.
 *
 * Configure in Shiprocket dashboard:
 *   Settings → API → Webhook → URL: https://yourdomain.com/api/shiprocket/webhook
 *   Use the same token in dashboard and in StoreSettings.shiprocketWebhookToken.
 *
 * Shiprocket sends a JSON body roughly like:
 * {
 *   "awb": "1234567890",
 *   "current_status": "Delivered",
 *   "current_status_id": 7,
 *   "shipment_status": 7,
 *   "order_id": "12345678",
 *   "channel_order_id": "<our internal order id>",
 *   "current_timestamp": "2024-01-01 12:00:00"
 * }
 *
 * Auth: token sent via X-Api-Key header (Shiprocket convention).
 */

interface WebhookPayload {
  awb?: string;
  current_status?: string;
  current_status_id?: number | string;
  shipment_status?: number | string;
  order_id?: string | number;
  channel_order_id?: string;
  current_timestamp?: string;
  courier_name?: string;
  etd?: string;
}

/**
 * Map Shiprocket status_id (subset) to our OrderStatus enum.
 * Reference: https://apidocs.shiprocket.in (Track Shipment status table)
 */
function mapStatus(statusId: number, statusText?: string): OrderStatus | null {
  // Cancelled / RTO / Lost / Damaged
  if (
    statusId === 8 || // CANCELED
    statusId === 9 || // RTO_INITIATED
    statusId === 10 || // RTO_DELIVERED
    statusId === 18 || // LOST
    statusId === 19 || // DAMAGED
    statusId === 13 || // CANCELLATION_REQUESTED
    statusId === 26 // RTO_OFD
  ) {
    return OrderStatus.CANCELLED;
  }

  // Delivered
  if (statusId === 7) return OrderStatus.DELIVERED;

  // Shipped / in-transit-ish (covers OFD, picked up, in transit, reached, etc.)
  if (
    statusId === 6 || // SHIPPED
    statusId === 17 || // OUT_FOR_DELIVERY
    statusId === 4 || // CANCELED — wait, 4 is something else, leave it
    statusId === 27 || // OUT_FOR_PICKUP
    statusId === 38 || // REACHED_DESTINATION_HUB
    statusId === 42 || // IN_TRANSIT
    statusId === 43 // OUT_FOR_DELIVERY
  ) {
    return OrderStatus.SHIPPED;
  }

  // Fallback: textual match if we don't recognize the id
  const txt = (statusText || "").toLowerCase();
  if (txt.includes("delivered")) return OrderStatus.DELIVERED;
  if (txt.includes("cancel") || txt.includes("rto") || txt.includes("lost")) {
    return OrderStatus.CANCELLED;
  }
  if (
    txt.includes("shipped") ||
    txt.includes("transit") ||
    txt.includes("out for delivery") ||
    txt.includes("picked")
  ) {
    return OrderStatus.SHIPPED;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const settings = await prisma.storeSettings.findFirst();
    const expectedToken = settings?.shiprocketWebhookToken?.trim();

    if (expectedToken) {
      const provided =
        req.headers.get("x-api-key") ??
        req.headers.get("X-Api-Key") ??
        req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      if (!provided || provided !== expectedToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = (await req.json()) as WebhookPayload;
    const channelOrderId = body.channel_order_id?.toString().trim();
    const awb = body.awb?.toString().trim() || null;
    const statusId = Number(body.current_status_id ?? body.shipment_status ?? 0);
    const newStatus = mapStatus(statusId, body.current_status);

    if (!channelOrderId) {
      return NextResponse.json(
        { error: "channel_order_id missing" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: channelOrderId },
      select: {
        id: true,
        status: true,
        shippedAt: true,
        deliveredAt: true,
        cancelledAt: true,
        trackingNumber: true,
        courier: true,
      },
    });

    if (!order) {
      // Don't 4xx — Shiprocket retries. Log + ack.
      console.warn("Shiprocket webhook: unknown order", channelOrderId);
      return NextResponse.json({ ok: true, ignored: "unknown_order" });
    }

    const data: Record<string, unknown> = {};
    const now = new Date();

    if (awb && awb !== order.trackingNumber) {
      data.trackingNumber = awb;
    }
    if (body.courier_name && body.courier_name !== order.courier) {
      data.courier = body.courier_name;
    }

    if (newStatus && newStatus !== order.status) {
      data.status = newStatus;
      if (newStatus === OrderStatus.SHIPPED && !order.shippedAt) {
        data.shippedAt = now;
      }
      if (newStatus === OrderStatus.DELIVERED && !order.deliveredAt) {
        data.deliveredAt = now;
        if (!order.shippedAt) data.shippedAt = now;
      }
      if (newStatus === OrderStatus.CANCELLED && !order.cancelledAt) {
        data.cancelledAt = now;
        data.cancelReason =
          body.current_status || "Cancelled via Shiprocket update";
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: true, noop: true });
    }

    await prisma.order.update({
      where: { id: order.id },
      data,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    revalidatePath(`/orders/${order.id}`);

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      updated: Object.keys(data),
      mappedStatus: newStatus,
    });
  } catch (error) {
    console.error("Shiprocket webhook error:", error);
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
      "Shiprocket webhook endpoint. POST your status updates here with X-Api-Key header.",
  });
}
