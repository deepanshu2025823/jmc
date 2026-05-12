import prisma from "@/lib/prisma";
import { BundleForm } from "@/components/bundle-form";

export const dynamic = "force-dynamic";

export default async function NewBundlePage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true, imageUrl: true },
  });

  return (
    <BundleForm
      initial={{
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        bundlePrice: 0,
        isActive: true,
        isFeatured: false,
        items: [],
      }}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        imageUrl: p.imageUrl,
      }))}
    />
  );
}
