"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  shiprocketCreateOrder,
  shiprocketAssignAwb,
  shiprocketCancelOrder,
  clearShiprocketTokenCache,
} from "@/lib/shiprocket";

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, error: "Unauthorized" };
  }
  return { ok: true };
}

export async function updateShiprocketSettings(input: {
  isEnabled: boolean;
  email: string;
  password: string;
  pickupLocation: string;
  webhookToken?: string;
}): Promise<{ success: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const data = {
      isShiprocketEnabled: input.isEnabled,
      shiprocketEmail: input.email.trim() || null,
      shiprocketPassword: input.password.trim() || null,
      shiprocketPickupLocation: input.pickupLocation.trim() || "Primary",
      shiprocketWebhookToken: input.webhookToken?.trim() || null,
    };

    const existing = await prisma.storeSettings.findFirst();
    if (existing) {
      await prisma.storeSettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.storeSettings.create({ data });
    }
    clearShiprocketTokenCache();
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Update Shiprocket settings error:", error);
    return { success: false, error: "Failed to save Shiprocket settings" };
  }
}

export async function generateShiprocketWebhookToken(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const existing = await prisma.storeSettings.findFirst();
    if (existing) {
      await prisma.storeSettings.update({
        where: { id: existing.id },
        data: { shiprocketWebhookToken: token },
      });
    } else {
      await prisma.storeSettings.create({
        data: { shiprocketWebhookToken: token },
      });
    }

    revalidatePath("/admin");
    return { success: true, token };
  } catch (error) {
    console.error("Generate webhook token error:", error);
    return { success: false, error: "Failed to generate token" };
  }
}

export async function pushOrderToShiprocket(
  orderId: string
): Promise<{ success: boolean; error?: string; awb?: string; courier?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const settings = await prisma.storeSettings.findFirst();
    if (
      !settings?.isShiprocketEnabled ||
      !settings.shiprocketEmail ||
      !settings.shiprocketPassword
    ) {
      return {
        success: false,
        error: "Configure Shiprocket credentials in dashboard first",
      };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        user: { select: { email: true } },
      },
    });
    if (!order) return { success: false, error: "Order not found" };
    if (order.shiprocketOrderId) {
      return {
        success: false,
        error: "Order already pushed to Shiprocket",
      };
    }

    if (
      !order.shippingName ||
      !order.shippingPhone ||
      !order.shippingAddress ||
      !order.shippingCity ||
      !order.shippingState ||
      !order.shippingPincode
    ) {
      return {
        success: false,
        error: "Order is missing shipping address details",
      };
    }

    const subTotal = order.orderItems.reduce(
      (s, it) => s + Number(it.price) * it.quantity,
      0
    );

    const created = await shiprocketCreateOrder(
      settings.shiprocketEmail,
      settings.shiprocketPassword,
      {
        orderId: order.id,
        orderDate: order.createdAt,
        pickupLocation: settings.shiprocketPickupLocation || "Primary",
        paymentMethod:
          order.paymentMethod === "ONLINE" ||
          order.paymentMethod === "Prepaid"
            ? "Prepaid"
            : "COD",
        subTotal,
        customer: {
          name: order.shippingName,
          email: order.shippingEmail || order.user.email,
          phone: order.shippingPhone,
          addressLine1: order.shippingAddress,
          city: order.shippingCity,
          state: order.shippingState,
          pincode: order.shippingPincode,
        },
        items: order.orderItems.map((it) => ({
          name: it.product.name,
          sku: it.product.slug,
          units: it.quantity,
          sellingPrice: Number(it.price),
        })),
      }
    );

    if (!created.order_id || !created.shipment_id) {
      return {
        success: false,
        error: created.status || "Shiprocket did not return order/shipment id",
      };
    }

    let awb: string | null = null;
    let courier: string | null = null;
    try {
      const awbRes = await shiprocketAssignAwb(
        settings.shiprocketEmail,
        settings.shiprocketPassword,
        created.shipment_id
      );
      awb = awbRes.response?.data?.awb_code ?? null;
      courier = awbRes.response?.data?.courier_name ?? null;
    } catch (awbErr) {
      console.warn("AWB assignment failed:", awbErr);
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        shiprocketOrderId: String(created.order_id),
        shiprocketShipmentId: String(created.shipment_id),
        trackingNumber: awb ?? order.trackingNumber,
        courier: courier ?? order.courier ?? "Shiprocket",
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    revalidatePath(`/orders/${orderId}`);

    return {
      success: true,
      awb: awb ?? undefined,
      courier: courier ?? undefined,
    };
  } catch (error) {
    console.error("Push to Shiprocket error:", error);
    const message = error instanceof Error ? error.message : "Failed to push";
    return { success: false, error: message };
  }
}

export async function cancelShiprocketOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const settings = await prisma.storeSettings.findFirst();
    if (
      !settings?.shiprocketEmail ||
      !settings?.shiprocketPassword
    ) {
      return { success: false, error: "Shiprocket credentials missing" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { shiprocketOrderId: true },
    });
    if (!order?.shiprocketOrderId) {
      return { success: false, error: "Order not pushed to Shiprocket" };
    }

    await shiprocketCancelOrder(
      settings.shiprocketEmail,
      settings.shiprocketPassword,
      order.shiprocketOrderId
    );

    await prisma.order.update({
      where: { id: orderId },
      data: {
        shiprocketOrderId: null,
        shiprocketShipmentId: null,
        trackingNumber: null,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Cancel Shiprocket order error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to cancel shipment";
    return { success: false, error: message };
  }
}
