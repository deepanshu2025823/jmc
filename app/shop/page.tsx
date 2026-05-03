import prisma from "@/lib/prisma";
import { ShopClient } from "./shop-client";
import type { StorefrontProduct } from "@/types/storefront";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let plainProducts: StorefrontProduct[] = [];

  try {
    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
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
    console.error("ShopPage DB error:", error);
  }

  return <ShopClient initialProducts={plainProducts} />;
}
