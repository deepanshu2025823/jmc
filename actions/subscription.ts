"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import {
  createProductSubscription,
  cancelRazorpaySubscription,
  pauseRazorpaySubscription,
  resumeRazorpaySubscription,
} from "@/lib/razorpay-subscriptions";

export interface StartSubscriptionInput {
  productId: string;
  shipping: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export async function startSubscription(
  input: StartSubscriptionInput
): Promise<{
  success: boolean;
  authUrl?: string;
  subscriptionId?: string;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Please log in to subscribe" };
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, phone: true },
    });
    if (!user) return { success: false, error: "User not found" };

    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      select: {
        id: true,
        name: true,
        price: true,
        subscribable: true,
        subscriptionDiscountPct: true,
        subscriptionIntervalMonths: true,
      },
    });
    if (!product || !product.subscribable) {
      return { success: false, error: "This product is not subscribable" };
    }

    const basePrice = Number(product.price);
    const discount = Math.max(0, Math.min(50, product.subscriptionDiscountPct));
    const pricePerCycle = Math.round(basePrice * (1 - discount / 100));
    const amountPaise = pricePerCycle * 100;

    const created = await createProductSubscription({
      productId: product.id,
      productName: product.name,
      amountPaise,
      intervalMonths: product.subscriptionIntervalMonths,
      customer: {
        name: input.shipping.name || user.name || user.email,
        email: user.email,
        contact: input.shipping.phone || user.phone || undefined,
      },
      notes: {
        productId: product.id,
        userId: user.id,
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        productId: product.id,
        razorpaySubscriptionId: created.subscriptionId,
        razorpayPlanId: created.planId,
        status: "CREATED",
        intervalMonths: product.subscriptionIntervalMonths,
        pricePerCycle,
        shippingName: input.shipping.name,
        shippingPhone: input.shipping.phone,
        shippingAddress: input.shipping.address,
        shippingCity: input.shipping.city,
        shippingState: input.shipping.state,
        shippingPincode: input.shipping.pincode,
        authUrl: created.shortUrl,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/admin/subscriptions");

    return {
      success: true,
      authUrl: created.shortUrl,
      subscriptionId: created.subscriptionId,
    };
  } catch (error) {
    console.error("startSubscription error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to start subscription";
    return { success: false, error: message };
  }
}

export async function cancelSubscription(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Not authorized" };
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user) return { success: false, error: "Not authorized" };

    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) return { success: false, error: "Subscription not found" };
    if (sub.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "Not authorized" };
    }

    if (sub.razorpaySubscriptionId) {
      try {
        await cancelRazorpaySubscription(sub.razorpaySubscriptionId, true);
      } catch (err) {
        // Razorpay may already have cancelled it; proceed to mark locally.
        console.warn("Razorpay cancel call failed:", err);
      }
    }

    await prisma.subscription.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/admin/subscriptions");
    return { success: true };
  } catch (error) {
    console.error("cancelSubscription error:", error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}

export async function pauseSubscription(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user) return { success: false, error: "Unauthorized" };

    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) return { success: false, error: "Not found" };
    if (sub.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }
    if (!sub.razorpaySubscriptionId) {
      return { success: false, error: "No Razorpay subscription linked" };
    }

    await pauseRazorpaySubscription(sub.razorpaySubscriptionId);
    await prisma.subscription.update({
      where: { id },
      data: { status: "PAUSED" },
    });
    revalidatePath("/profile");
    revalidatePath("/admin/subscriptions");
    return { success: true };
  } catch (error) {
    console.error("pauseSubscription error:", error);
    const msg = error instanceof Error ? error.message : "Failed to pause";
    return { success: false, error: msg };
  }
}

export async function resumeSubscription(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user) return { success: false, error: "Unauthorized" };

    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) return { success: false, error: "Not found" };
    if (sub.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }
    if (!sub.razorpaySubscriptionId) {
      return { success: false, error: "No Razorpay subscription linked" };
    }

    await resumeRazorpaySubscription(sub.razorpaySubscriptionId);
    await prisma.subscription.update({
      where: { id },
      data: { status: "ACTIVE" },
    });
    revalidatePath("/profile");
    revalidatePath("/admin/subscriptions");
    return { success: true };
  } catch (error) {
    console.error("resumeSubscription error:", error);
    const msg = error instanceof Error ? error.message : "Failed to resume";
    return { success: false, error: msg };
  }
}
