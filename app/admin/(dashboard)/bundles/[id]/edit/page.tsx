import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BundleForm } from "@/components/bundle-form";

export const dynamic = "force-dynamic";

export default async function EditBundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [bundle, products] = await Promise.all([
    prisma.bundle.findUnique({
      where: { id },
      include: {
        items: { select: { productId: true, quantity: true } },
      },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, imageUrl: true },
    }),
  ]);

  if (!bundle) notFound();

  return (
    <BundleForm
      initial={{
        id: bundle.id,
        name: bundle.name,
        slug: bundle.slug,
        description: bundle.description,
        imageUrl: bundle.imageUrl ?? "",
        bundlePrice: Number(bundle.bundlePrice),
        isActive: bundle.isActive,
        isFeatured: bundle.isFeatured,
        items: bundle.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
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
