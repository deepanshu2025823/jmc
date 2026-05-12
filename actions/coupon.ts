"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseOptionalDecimal(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  if (value === null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createCoupon(formData: FormData) {
  const code = (formData.get("code") as string).toUpperCase();
  const discountValue = parseInt(formData.get("discountValue") as string);
  const type = formData.get("type") as string;
  const expiresAt = new Date(formData.get("expiresAt") as string);
  const startsAt = parseOptionalDate(formData.get("startsAt"));
  const minOrderAmount = parseOptionalDecimal(formData.get("minOrderAmount"));
  const usageLimit = parseOptionalInt(formData.get("usageLimit"));
  const perUserLimit = parseOptionalInt(formData.get("perUserLimit"));

  await prisma.coupon.create({
    data: {
      code,
      discountValue,
      type,
      startsAt,
      expiresAt,
      minOrderAmount,
      usageLimit,
      perUserLimit,
    },
  });

  revalidatePath("/admin/coupons");
}

export async function updateCoupon(id: string, formData: FormData) {
  const code = (formData.get("code") as string).toUpperCase();
  const discountValue = parseInt(formData.get("discountValue") as string);
  const type = formData.get("type") as string;
  const expiresAt = new Date(formData.get("expiresAt") as string);
  const startsAt = parseOptionalDate(formData.get("startsAt"));
  const minOrderAmount = parseOptionalDecimal(formData.get("minOrderAmount"));
  const usageLimit = parseOptionalInt(formData.get("usageLimit"));
  const perUserLimit = parseOptionalInt(formData.get("perUserLimit"));

  await prisma.coupon.update({
    where: { id },
    data: {
      code,
      discountValue,
      type,
      startsAt,
      expiresAt,
      minOrderAmount,
      usageLimit,
      perUserLimit,
    },
  });

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}