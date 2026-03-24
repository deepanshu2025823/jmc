"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function updateOrderStatus(orderId: string, newStatus: any) {
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

export async function toggleCodSetting(currentStatus: boolean) {
  try {
    const settings = await prisma.storeSettings.findFirst();
    let newStatus;
    
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