import prisma from "@/lib/prisma";
import { BestsellersClient } from "./bestsellers-client";
import type { StorefrontProduct } from "@/types/storefront";

export const dynamic = "force-dynamic";

export default async function BestsellersPage() {
  let plainProducts: StorefrontProduct[] = [];

  try {
    const rawProducts = await prisma.product.findMany({
      take: 12,
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
    });

    plainProducts = rawProducts.map((product) => ({
      ...product,
      price: Number(product.price),
      images: (Array.isArray(product.images)
        ? (product.images as unknown[]).filter((v): v is string => typeof v === "string")
        : product.imageUrl
        ? [product.imageUrl]
        : []),
    }));
  } catch (error) {
    console.error("BestsellersPage DB error:", error);
  }

  return <BestsellersClient initialProducts={plainProducts} />;
}
