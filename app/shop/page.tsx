import prisma from "@/lib/prisma";
import { ShopClient } from "./shop-client";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let plainProducts: any[] = [];

  try {
    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    plainProducts = rawProducts.map((product) => ({
      ...product,
      price: Number(product.price),
      images: Array.isArray(product.images) ? product.images : [product.imageUrl],
    }));
  } catch (error) {
    console.error("ShopPage DB error:", error);
  }

  return <ShopClient initialProducts={plainProducts} />;
}
