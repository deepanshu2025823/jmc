import Link from "next/link";
import Image from "next/image";
import { Plus, Package, Sparkles, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { BundleRowActions } from "@/components/bundle-row-actions";

export const dynamic = "force-dynamic";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function BundlesAdminPage() {
  const bundles = await prisma.bundle.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, imageUrl: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900">
            Bundle Deals
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Combine 2+ products at a special price to drive cross-sell.
          </p>
        </div>
        <Link href="/admin/bundles/new">
          <Button className="w-full sm:w-auto bg-zinc-900 hover:bg-[#B59461] text-white gap-2 shadow-md rounded-full px-6 font-bold text-xs uppercase tracking-widest">
            <Plus className="h-4 w-4" /> Create Bundle
          </Button>
        </Link>
      </div>

      {bundles.length === 0 ? (
        <div className="border border-zinc-200 rounded-[2rem] bg-white p-16 text-center text-zinc-500 space-y-4">
          <div className="h-16 w-16 bg-zinc-50 rounded-full mx-auto flex items-center justify-center">
            <Package className="h-8 w-8 text-zinc-300" />
          </div>
          <p className="font-serif text-lg text-zinc-700">No bundles yet</p>
          <p className="text-sm">
            Group your bestsellers together to boost average order value.
          </p>
          <Link href="/admin/bundles/new" className="inline-block mt-2">
            <Button variant="outline" className="rounded-full border-zinc-200">
              Create your first bundle
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {bundles.map((bundle) => {
            const retail = bundle.items.reduce(
              (s, it) => s + Number(it.product.price) * it.quantity,
              0
            );
            const bundlePrice = Number(bundle.bundlePrice);
            const savings = Math.max(0, retail - bundlePrice);
            const savingsPct =
              retail > 0 ? Math.round((savings / retail) * 100) : 0;

            return (
              <div
                key={bundle.id}
                className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {bundle.imageUrl ? (
                      <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-zinc-100">
                        <Image
                          src={bundle.imageUrl}
                          alt={bundle.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-[#F9F6F0] flex items-center justify-center">
                        <Package className="h-5 w-5 text-[#B59461]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-zinc-900 truncate">
                          {bundle.name}
                        </p>
                        {bundle.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                            <Sparkles className="h-2.5 w-2.5" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">
                        {bundle.items.length} products
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      bundle.isActive
                        ? "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 ring-1 ring-inset ring-emerald-200"
                        : "inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                    }
                  >
                    {bundle.isActive ? "Live" : "Hidden"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {bundle.items.slice(0, 4).map((it) => (
                    <div
                      key={it.id}
                      className="relative h-10 w-10 rounded-lg overflow-hidden bg-[#F9F6F0] border border-zinc-100"
                      title={`${it.quantity}× ${it.product.name}`}
                    >
                      {it.product.imageUrl && (
                        <Image
                          src={it.product.imageUrl}
                          alt={it.product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  ))}
                  {bundle.items.length > 4 && (
                    <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                      +{bundle.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center border-t border-zinc-100 pt-3">
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">
                      Retail
                    </p>
                    <p className="text-xs text-zinc-500 line-through mt-0.5">
                      {inr(retail)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">
                      Bundle price
                    </p>
                    <p className="text-sm font-black text-[#B59461] mt-0.5">
                      {inr(bundlePrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">
                      Save
                    </p>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {savingsPct}% off
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Link href={`/admin/bundles/${bundle.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-zinc-200 text-zinc-700"
                    >
                      <PencilLine className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                  </Link>
                  <BundleRowActions
                    id={bundle.id}
                    isActive={bundle.isActive}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
