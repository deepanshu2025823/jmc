import Link from "next/link";
import Image from "next/image";
import { Sparkles, Package, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { Header } from "@/components/header";
import { AddBundleToCart } from "@/components/add-bundle-to-cart";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bundles & Rituals",
  description:
    "Save more with our curated skincare bundles. Hand-picked routines at a special combined price.",
};

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function BundlesPage() {
  const bundles = await prisma.bundle.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              price: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-b from-[#F9F6F0] to-white pt-28 lg:pt-40 pb-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#B59461]/20">
            <Sparkles className="h-3 w-3 text-[#B59461]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B59461]">
              Curated Rituals
            </p>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-zinc-900 leading-[1.1]">
            Bundle <span className="italic font-light text-[#50540b]">Deals</span>
          </h1>
          <p className="max-w-xl mx-auto text-zinc-500 text-sm md:text-base leading-relaxed">
            Hand-picked product pairings at a combined price. The smartest way
            to discover a full skincare routine.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 lg:py-16">
        {bundles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 p-16 text-center text-zinc-500">
            <Package className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="font-serif text-lg text-zinc-700">
              No bundles available yet
            </p>
            <p className="text-sm mt-1">Check back soon for curated routines.</p>
            <Link
              href="/shop"
              className="inline-block mt-5 text-[10px] font-black uppercase tracking-widest text-[#B59461] hover:text-zinc-900 border-b border-[#B59461] pb-0.5"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {bundles.map((bundle) => {
              const retailTotal = bundle.items.reduce(
                (s, it) => s + Number(it.product.price) * it.quantity,
                0
              );
              const bundlePrice = Number(bundle.bundlePrice);
              const savings = Math.max(0, retailTotal - bundlePrice);
              const savingsPct =
                retailTotal > 0
                  ? Math.round((savings / retailTotal) * 100)
                  : 0;

              return (
                <article
                  key={bundle.id}
                  className="group rounded-3xl border border-zinc-100 bg-white shadow-sm hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="relative aspect-[5/3] bg-[#F9F6F0]">
                    {bundle.imageUrl ? (
                      <Image
                        src={bundle.imageUrl}
                        alt={bundle.name}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 grid grid-cols-3 gap-1 p-3">
                        {bundle.items.slice(0, 6).map((it) => (
                          <div
                            key={it.id}
                            className="relative rounded-xl overflow-hidden bg-white"
                          >
                            {it.product.imageUrl && (
                              <Image
                                src={it.product.imageUrl}
                                alt={it.product.name}
                                fill
                                sizes="200px"
                                className="object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {bundle.isFeatured && (
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                    )}
                    <span className="absolute top-4 right-4 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow">
                      Save {savingsPct}%
                    </span>
                  </div>

                  <div className="p-6 lg:p-8 space-y-5">
                    <div>
                      <h2 className="font-serif text-2xl text-zinc-900">
                        {bundle.name}
                      </h2>
                      <p className="text-sm text-zinc-500 mt-2 leading-relaxed line-clamp-3">
                        {bundle.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        What&apos;s inside
                      </p>
                      <ul className="space-y-1.5">
                        {bundle.items.map((it) => (
                          <li
                            key={it.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <Link
                              href={`/product/${it.product.id}`}
                              className="text-zinc-700 hover:text-zinc-900 truncate flex items-center gap-1"
                            >
                              <ChevronRight className="h-3 w-3 text-[#B59461] shrink-0" />
                              {it.product.name}
                            </Link>
                            <span className="text-xs text-zinc-400 shrink-0 ml-2">
                              ×{it.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t border-zinc-100">
                      <div>
                        <p className="text-xs text-zinc-400 line-through">
                          {inr(retailTotal)}
                        </p>
                        <p
                          className={cn(
                            "text-3xl font-black text-[#B59461] italic"
                          )}
                        >
                          {inr(bundlePrice)}
                        </p>
                      </div>
                      <p className="text-xs text-emerald-700 font-bold">
                        You save {inr(savings)}
                      </p>
                    </div>

                    <AddBundleToCart
                      bundleId={bundle.id}
                      bundleName={bundle.name}
                      bundlePrice={bundlePrice}
                      items={bundle.items.map((it) => ({
                        productId: it.product.id,
                        quantity: it.quantity,
                        name: it.product.name,
                        imageUrl: it.product.imageUrl,
                        retailPrice: Number(it.product.price),
                      }))}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
