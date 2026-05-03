import prisma from "@/lib/prisma";
import { NewArrivalsClient } from "./new-arrivals-client";
import type { StorefrontProduct } from "@/types/storefront";

export const dynamic = "force-dynamic";

export default async function NewArrivalsPage() {
  let plainProducts: StorefrontProduct[] = [];

  try {
    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
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
    console.error("NewArrivalsPage DB error:", error);
  }

  return <NewArrivalsClient initialProducts={plainProducts} />;
}
