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

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
    
    revalidatePath("/admin/orders"); 
    revalidatePath("/profile"); 
    
    return { success: true };
  } catch (error) {
    console.error("Order Status Update Error:", error);
    return { success: false, error: "Failed to update status in database." };
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