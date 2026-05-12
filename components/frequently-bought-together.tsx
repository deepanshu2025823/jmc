import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import prisma from "@/lib/prisma";

interface Props {
  productId: string;
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Collaborative-filter-lite: finds products that share orders with the given
 * product. Ranks by co-occurrence frequency. Falls back gracefully when data
 * is sparse — returns null so the section auto-hides.
 */
export async function FrequentlyBoughtTogether({ productId }: Props) {
  const myOrders = await prisma.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
    take: 500,
  });
  if (myOrders.length === 0) return null;

  const orderIds = Array.from(new Set(myOrders.map((o) => o.orderId)));
  if (orderIds.length === 0) return null;

  const coItems = await prisma.orderItem.findMany({
    where: {
      orderId: { in: orderIds },
      productId: { not: productId },
    },
    select: { productId: true },
    take: 1000,
  });
  if (coItems.length === 0) return null;

  const counts = new Map<string, number>();
  for (const it of coItems) {
    counts.set(it.productId, (counts.get(it.productId) ?? 0) + 1);
  }
  const topIds = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id]) => id);

  if (topIds.length === 0) return null;

  const products = await prisma.product.findMany({
    where: { id: { in: topIds }, stock: { gt: 0 } },
    select: { id: true, name: true, price: true, imageUrl: true },
  });
  if (products.length === 0) return null;

  // Preserve frequency order.
  const ordered = topIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section className="py-16 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#B59461]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B59461]">
              Frequently Bought Together
            </p>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-zinc-900">
            Customers also reach for
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {ordered.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="group space-y-3"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F9F6F0] border border-zinc-100">
                {p.imageUrl && (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div>
                <p className="font-serif font-bold text-zinc-900 text-sm line-clamp-2 leading-tight">
                  {p.name}
                </p>
                <p className="text-xs font-bold text-[#B59461] mt-1">
                  {inr(Number(p.price))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
