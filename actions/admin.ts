"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateAdminProfile(userId: string, newName: string, newEmail: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser && existingUser.id !== userId) {
      return { success: false, error: "This email is already in use by another account." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name: newName, email: newEmail }
    });
    
    revalidatePath("/admin/profile"); 
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { success: false, error: "Failed to update profile." };
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized." };
    }

    if (!currentPassword || !newPassword) {
      return { success: false, error: "Both current and new passwords are required." };
    }

    if (newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters long." };
    }

    if (currentPassword === newPassword) {
      return { success: false, error: "New password must be different from the current password." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user || !user.password) {
      return { success: false, error: "Account not found or no password set." };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return { success: true };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { success: false, error: "Failed to change password." };
  }
}

export async function updateRazorpaySettings(data: { isEnabled: boolean, keyId: string, keySecret: string }) {
  try {
    const settings = await prisma.storeSettings.findFirst();
    
    if (settings) {
      await prisma.storeSettings.update({
        where: { id: settings.id },
        data: { 
          isRazorpayEnabled: data.isEnabled, 
          razorpayKeyId: data.keyId, 
          razorpayKeySecret: data.keySecret 
        }
      });
    } else {
      await prisma.storeSettings.create({
        data: { 
          isCodEnabled: true, 
          isRazorpayEnabled: data.isEnabled, 
          razorpayKeyId: data.keyId, 
          razorpayKeySecret: data.keySecret 
        }
      });
    }
    
    revalidatePath("/admin");
    revalidatePath("/checkout"); 
    return { success: true };
  } catch (error) {
    console.error("Razorpay Settings Error:", error);
    return { success: false };
  }
}

export interface StoreInfoInput {
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storePhone: string;
  storeEmail: string;
  storeWebsite: string;
  storeGstin: string;
  storePan: string;
  invoiceGstRate: number;
  invoicePrefix: string;
  freeShippingThreshold?: number;
  loyaltyEarnRate?: number;
  loyaltyMaxRedeemPerOrder?: number;
  giftWrapFee?: number;
}

export async function updateStoreInfo(
  data: StoreInfoInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const cleanRate =
      Number.isFinite(data.invoiceGstRate) && data.invoiceGstRate >= 0
        ? Math.floor(data.invoiceGstRate)
        : 18;

    const cleanInt = (n: number | undefined, fallback: number) => {
      const v = Math.floor(Number(n));
      return Number.isFinite(v) && v >= 0 ? v : fallback;
    };

    const payload = {
      storeName: data.storeName.trim() || null,
      storeAddress: data.storeAddress.trim() || null,
      storeCity: data.storeCity.trim() || null,
      storePhone: data.storePhone.trim() || null,
      storeEmail: data.storeEmail.trim() || null,
      storeWebsite: data.storeWebsite.trim() || null,
      storeGstin: data.storeGstin.trim().toUpperCase() || null,
      storePan: data.storePan.trim().toUpperCase() || null,
      invoiceGstRate: cleanRate,
      invoicePrefix: data.invoicePrefix.trim().toUpperCase() || "JMC",
      freeShippingThreshold: cleanInt(data.freeShippingThreshold, 0) || null,
      loyaltyEarnRate: cleanInt(data.loyaltyEarnRate, 10),
      loyaltyMaxRedeemPerOrder: cleanInt(data.loyaltyMaxRedeemPerOrder, 500),
      giftWrapFee: cleanInt(data.giftWrapFee, 0),
    };

    const existing = await prisma.storeSettings.findFirst();
    if (existing) {
      await prisma.storeSettings.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await prisma.storeSettings.create({ data: payload });
    }

    revalidatePath("/admin/profile");
    revalidatePath("/orders");
    return { success: true };
  } catch (error) {
    console.error("Store Info Update Error:", error);
    return { success: false, error: "Failed to save store information" };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        paidAt: true,
        shippedAt: true,
        deliveredAt: true,
        cancelledAt: true,
      },
    });
    if (!order) return { success: false, error: "Order not found" };

    const now = new Date();
    const data: Record<string, unknown> = { status: newStatus };
    if (newStatus === "PAID" && !order.paidAt) data.paidAt = now;
    if (newStatus === "SHIPPED" && !order.shippedAt) data.shippedAt = now;
    if (newStatus === "DELIVERED" && !order.deliveredAt)
      data.deliveredAt = now;
    if (newStatus === "CANCELLED" && !order.cancelledAt)
      data.cancelledAt = now;

    await prisma.order.update({ where: { id: orderId }, data });

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    console.error("Order Status Update Error:", error);
    return { success: false, error: "Failed to update status in database." };
  }
}

export async function setOrderTracking(
  orderId: string,
  data: { trackingNumber?: string; courier?: string }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const trimmedTracking = data.trackingNumber?.trim() || null;
    const trimmedCourier = data.courier?.trim() || null;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: trimmedTracking,
        courier: trimmedCourier,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/profile");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    console.error("Set Order Tracking Error:", error);
    return { success: false, error: "Failed to save tracking info" };
  }
}

export async function cancelOrderByUser(orderId: string, reason?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Please log in" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user) return { success: false, error: "User not found" };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { select: { productId: true, quantity: true } } },
    });
    if (!order) return { success: false, error: "Order not found" };

    if (order.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, error: "Not authorized" };
    }

    if (order.status !== "PENDING") {
      return {
        success: false,
        error: "Only pending orders can be cancelled. Contact support for help.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: reason?.trim() || null,
        },
      });
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });

    revalidatePath("/profile");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}

export async function clearAllLeads() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized." };
    }

    const result = await prisma.$transaction(async (tx) => {
      const leadUsers = await tx.user.findMany({
        where: { role: "USER" },
        select: { id: true },
      });
      const leadIds = leadUsers.map((u) => u.id);

      if (leadIds.length === 0) {
        return { deleted: 0 };
      }

      const leadOrders = await tx.order.findMany({
        where: { userId: { in: leadIds } },
        select: { id: true },
      });
      const orderIds = leadOrders.map((o) => o.id);

      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.order.deleteMany({ where: { id: { in: orderIds } } });
      }

      const deleted = await tx.user.deleteMany({
        where: { id: { in: leadIds } },
      });

      return { deleted: deleted.count };
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin/customers");
    revalidatePath("/admin/orders");

    return { success: true, deleted: result.deleted };
  } catch (error) {
    console.error("Clear All Leads Error:", error);
    return { success: false, error: "Failed to clear leads." };
  }
}

export async function clearAllOrders() {
  try {
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    
    revalidatePath("/admin/orders");
    
    return { success: true };
  } catch (error) {
    console.error("Clear Orders Error:", error);
    return { success: false, error: "Failed to clear orders database." };
  }
}

export async function toggleCodSetting(
  currentStatus: boolean
): Promise<{ success: true; isCodEnabled: boolean } | { success: false; isCodEnabled?: undefined }> {
  try {
    const settings = await prisma.storeSettings.findFirst();
    let newStatus: boolean;

    if (settings) {
      const updated = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: { isCodEnabled: !currentStatus }
      });
      newStatus = updated.isCodEnabled;
    } else {
      const created = await prisma.storeSettings.create({
        data: { isCodEnabled: !currentStatus }
      });
      newStatus = created.isCodEnabled;
    }

    revalidatePath("/admin");
    revalidatePath("/checkout");

    return { success: true, isCodEnabled: newStatus };
  } catch (error) {
    console.error("COD Toggle Error:", error);
    return { success: false };
  }
}