"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isVerified: boolean;
  createdAt: string;
  userName: string;
}

export interface ReviewStats {
  count: number;
  average: number;
  distribution: { stars: number; count: number; pct: number }[];
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    select: { rating: true },
  });
  const count = reviews.length;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  const average = count > 0 ? sum / count : 0;

  const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) buckets[r.rating] = (buckets[r.rating] ?? 0) + 1;

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: buckets[stars] ?? 0,
    pct: count > 0 ? ((buckets[stars] ?? 0) / count) * 100 : 0,
  }));

  return { count, average, distribution };
}

export async function getProductReviews(
  productId: string,
  limit = 50
): Promise<ReviewItem[]> {
  const rows = await prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });

  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    isVerified: r.isVerified,
    createdAt: r.createdAt.toISOString(),
    userName: r.user.name || r.user.email.split("@")[0] || "Customer",
  }));
}

export interface ReviewEligibility {
  canReview: boolean;
  reason?: "not_logged_in" | "already_reviewed";
  hasPurchased: boolean;
  existingReviewId?: string;
}

export async function getReviewEligibility(
  productId: string
): Promise<ReviewEligibility> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { canReview: false, reason: "not_logged_in", hasPurchased: false };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return { canReview: false, reason: "not_logged_in", hasPurchased: false };
  }

  const [existing, purchasedItem] = await Promise.all([
    prisma.review.findUnique({
      where: { productId_userId: { productId, userId: user.id } },
      select: { id: true },
    }),
    prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
          status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
        },
      },
      select: { id: true },
    }),
  ]);

  if (existing) {
    return {
      canReview: false,
      reason: "already_reviewed",
      hasPurchased: !!purchasedItem,
      existingReviewId: existing.id,
    };
  }

  return { canReview: true, hasPurchased: !!purchasedItem };
}

export async function createReview(
  productId: string,
  data: { rating: number; title?: string; body: string }
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Please log in to leave a review" };
  }

  const rating = Math.round(Number(data.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" };
  }

  const body = (data.body ?? "").trim();
  if (body.length < 10) {
    return {
      success: false,
      error: "Review must be at least 10 characters long",
    };
  }
  if (body.length > 2000) {
    return { success: false, error: "Review is too long (max 2000 chars)" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { success: false, error: "User not found" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) return { success: false, error: "Product not found" };

  const purchasedItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: user.id,
        status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
      },
    },
    select: { id: true },
  });

  try {
    await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        title: data.title?.trim() || null,
        body,
        isVerified: !!purchasedItem,
      },
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return { success: false, error: "You have already reviewed this product" };
    }
    throw err;
  }

  revalidatePath(`/product/${productId}`);
  return { success: true };
}

export async function deleteReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: "Not authorized" };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user) return { success: false, error: "Not authorized" };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, productId: true },
  });
  if (!review) return { success: false, error: "Review not found" };

  if (review.userId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath(`/product/${review.productId}`);
  return { success: true };
}
