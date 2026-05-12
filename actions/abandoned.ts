"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export interface AbandonedItemSnapshot {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

/**
 * Logs / refreshes an abandoned checkout for the current user.
 * Called by checkout page once the user lands on it.
 * Idempotent: a single record per user that gets refreshed each visit.
 */
export async function logAbandonedCheckout(input: {
  items: AbandonedItemSnapshot[];
  totalAmount: number;
  couponCode?: string | null;
}): Promise<{ success: boolean }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false };

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, phone: true },
    });
    if (!user) return { success: false };

    if (!input.items || input.items.length === 0) {
      return { success: false };
    }

    const itemsCount = input.items.reduce(
      (s, it) => s + (it.quantity || 1),
      0
    );

    await prisma.abandonedCheckout.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        itemsSnapshot: input.items as unknown as object,
        itemsCount,
        totalAmount: input.totalAmount,
        couponCode: input.couponCode ?? null,
        recoveredAt: null,
        recoveredOrderId: null,
        reminderCount: 0,
        lastReminderAt: null,
      },
      update: {
        email: user.email,
        phone: user.phone,
        itemsSnapshot: input.items as unknown as object,
        itemsCount,
        totalAmount: input.totalAmount,
        couponCode: input.couponCode ?? null,
        // If we're updating an already-recovered record, reset its state.
        recoveredAt: null,
        recoveredOrderId: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("logAbandonedCheckout error:", error);
    return { success: false };
  }
}

/** Marks a user's abandoned checkout as recovered when they finally place an order. */
export async function markCheckoutRecovered(
  userId: string,
  orderId: string
): Promise<void> {
  try {
    const existing = await prisma.abandonedCheckout.findUnique({
      where: { userId },
      select: { id: true, recoveredAt: true },
    });
    if (!existing || existing.recoveredAt) return;
    await prisma.abandonedCheckout.update({
      where: { userId },
      data: {
        recoveredAt: new Date(),
        recoveredOrderId: orderId,
      },
    });
  } catch (error) {
    console.error("markCheckoutRecovered error:", error);
  }
}

export async function sendAbandonedCheckoutReminder(
  abandonedCheckoutId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const checkout = await prisma.abandonedCheckout.findUnique({
      where: { id: abandonedCheckoutId },
      include: { user: { select: { name: true } } },
    });
    if (!checkout) return { success: false, error: "Not found" };
    if (checkout.recoveredAt) {
      return { success: false, error: "Already recovered" };
    }

    const { sendAbandonedReminderEmail } = await import("@/lib/abandoned-email");
    await sendAbandonedReminderEmail({
      to: checkout.email,
      name: checkout.user.name,
      items: checkout.itemsSnapshot as unknown as AbandonedItemSnapshot[],
      totalAmount: Number(checkout.totalAmount),
    });

    await prisma.abandonedCheckout.update({
      where: { id: checkout.id },
      data: {
        reminderCount: { increment: 1 },
        lastReminderAt: new Date(),
      },
    });

    revalidatePath("/admin/abandoned-carts");
    return { success: true };
  } catch (error) {
    console.error("sendAbandonedCheckoutReminder error:", error);
    const msg = error instanceof Error ? error.message : "Failed to send";
    return { success: false, error: msg };
  }
}
