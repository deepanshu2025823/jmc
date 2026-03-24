import prisma from "@/lib/prisma";
import { ShopClient } from "./shop-client";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const plainProducts = rawProducts.map((product) => ({
    ...product,
    price: Number(product.price),
    images: Array.isArray(product.images) ? product.images : [product.imageUrl]
  }));

  return <ShopClient initialProducts={plainProducts} />;
}