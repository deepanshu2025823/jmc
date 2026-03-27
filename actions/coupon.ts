"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCoupon(formData: FormData) {
  const code = (formData.get("code") as string).toUpperCase();
  const discountValue = parseInt(formData.get("discountValue") as string);
  const type = formData.get("type") as string;
  const expiresAt = new Date(formData.get("expiresAt") as string);

  await prisma.coupon.create({
    data: { code, discountValue, type, expiresAt }
  });

  revalidatePath("/admin/coupons");
}

export async function updateCoupon(id: string, formData: FormData) {
  const code = (formData.get("code") as string).toUpperCase();
  const discountValue = parseInt(formData.get("discountValue") as string);
  const type = formData.get("type") as string;
  const expiresAt = new Date(formData.get("expiresAt") as string);

  await prisma.coupon.update({
    where: { id },
    data: { code, discountValue, type, expiresAt }
  });

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}