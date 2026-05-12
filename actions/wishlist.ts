"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function getWishlistDB(): Promise<WishlistProduct[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: { id: true, name: true, price: true, imageUrl: true },
      },
    },
  });

  return items.map((it) => ({
    id: it.product.id,
    name: it.product.name,
    price: Number(it.product.price),
    imageUrl: it.product.imageUrl ?? "",
  }));
}

export async function addToWishlistDB(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not logged in" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) return { success: false, error: "Product not found" };

  try {
    await prisma.wishlistItem.create({
      data: { userId, productId },
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return { success: true };
    }
    throw err;
  }
  return { success: true };
}

export async function removeFromWishlistDB(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not logged in" };

  await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });
  return { success: true };
}

export async function syncWishlistDB(
  productIds: string[]
): Promise<WishlistProduct[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  if (productIds.length > 0) {
    const validProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const validIds = new Set(validProducts.map((p) => p.id));

    const toCreate = productIds.filter((id) => validIds.has(id));
    if (toCreate.length > 0) {
      await prisma.wishlistItem.createMany({
        data: toCreate.map((productId) => ({ userId, productId })),
        skipDuplicates: true,
      });
    }
  }

  return getWishlistDB();
}
