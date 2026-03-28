import prisma from "@/lib/prisma";
import { NewArrivalsClient } from "./new-arrivals-client";

export const dynamic = "force-dynamic";

export default async function NewArrivalsPage() {
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 12, 
  });

  const plainProducts = rawProducts.map((product) => ({
    ...product,
    price: Number(product.price),
    images: Array.isArray(product.images) ? product.images : [product.imageUrl]
  }));

  return <NewArrivalsClient initialProducts={plainProducts} />;
}