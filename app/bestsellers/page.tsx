import prisma from "@/lib/prisma";
import { BestsellersClient } from "./bestsellers-client";

export const dynamic = "force-dynamic";

export default async function BestsellersPage() {
  const rawProducts = await prisma.product.findMany({
    take: 12,
    orderBy: {
      orderItems: {
        _count: 'desc'
      }
    }
  });

  const plainProducts = rawProducts.map((product) => ({
    ...product,
    price: Number(product.price),
    images: Array.isArray(product.images) ? product.images : [product.imageUrl]
  }));

  return <BestsellersClient initialProducts={plainProducts} />;
}