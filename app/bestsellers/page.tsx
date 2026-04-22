import prisma from "@/lib/prisma";
import { BestsellersClient } from "./bestsellers-client";

export const dynamic = "force-dynamic";

export default async function BestsellersPage() {
  let plainProducts: any[] = [];

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
      images: Array.isArray(product.images) ? product.images : [product.imageUrl],
    }));
  } catch (error) {
    console.error("BestsellersPage DB error:", error);
  }

  return <BestsellersClient initialProducts={plainProducts} />;
}
