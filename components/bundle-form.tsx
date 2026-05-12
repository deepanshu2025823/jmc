"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  Search,
  ArrowLeft,
  Sparkles,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  createBundle,
  updateBundle,
  type BundleInput,
} from "@/actions/bundle";
import { slugify } from "@/lib/csv";
import { cn } from "@/lib/utils";

export interface BundleFormProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

export interface BundleFormInitial {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  bundlePrice: number;
  isActive: boolean;
  isFeatured: boolean;
  items: { productId: string; quantity: number }[];
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function BundleForm({
  initial,
  products,
}: {
  initial: BundleFormInitial;
  products: BundleFormProduct[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [description, setDescription] = useState(initial.description);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [bundlePrice, setBundlePrice] = useState<number>(initial.bundlePrice);
  const [isActive, setIsActive] = useState(initial.isActive);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured);
  const [items, setItems] = useState(initial.items);
  const [query, setQuery] = useState("");

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const retailTotal = useMemo(
    () =>
      items.reduce((sum, it) => {
        const p = productMap.get(it.productId);
        return sum + (p ? p.price * it.quantity : 0);
      }, 0),
    [items, productMap]
  );

  const savings = Math.max(0, retailTotal - (bundlePrice || 0));
  const savingsPct =
    retailTotal > 0 ? Math.round((savings / retailTotal) * 100) : 0;

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const chosen = new Set(items.map((i) => i.productId));
    return products
      .filter((p) => !chosen.has(p.id))
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
      .slice(0, 50);
  }, [query, products, items]);

  const handleAdd = (productId: string) => {
    if (items.some((it) => it.productId === productId)) return;
    setItems((prev) => [...prev, { productId, quantity: 1 }]);
    setQuery("");
  };

  const handleQty = (productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.productId === productId
          ? { ...it, quantity: Math.max(1, Math.floor(qty)) }
          : it
      )
    );
  };

  const handleRemove = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: BundleInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || null,
      bundlePrice: Number(bundlePrice),
      isActive,
      isFeatured,
      items: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
    };

    startTransition(async () => {
      const res = initial.id
        ? await updateBundle(initial.id, payload)
        : await createBundle(payload);
      if (res.success) {
        toast.success(initial.id ? "Bundle updated" : "Bundle created");
        router.push("/admin/bundles");
        router.refresh();
      } else {
        toast.error(res.error || "Save failed");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/bundles"
          className="h-9 w-9 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {initial.id ? "Edit Bundle" : "Create Bundle"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Pick 2+ products and set a combined price. Customers see savings %
            automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
            <h2 className="font-bold text-zinc-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#B59461]" /> Bundle details
            </h2>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Daily Glow Ritual"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="daily-glow-ritual"
                className="h-11 font-mono text-xs"
              />
              <p className="text-[10px] text-zinc-500">
                Auto-derived from name unless edited. Must be unique.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="What's inside the bundle and who's it for…"
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900 resize-y"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cover image URL (optional)</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/…"
                className="h-11 text-xs"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#B59461]" /> Products in bundle
              </h2>
              <span className="text-xs text-zinc-500">
                {items.length} product{items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-3">
              {items.length === 0 && (
                <p className="text-xs text-zinc-400 text-center py-6 border border-dashed border-zinc-200 rounded-xl">
                  Search and add at least 2 products below.
                </p>
              )}
              {items.map((it) => {
                const product = productMap.get(it.productId);
                if (!product) return null;
                return (
                  <div
                    key={it.productId}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/30 p-3"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[#F9F6F0] shrink-0">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {inr(product.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) =>
                          handleQty(it.productId, Number(e.target.value) || 1)
                        }
                        className="h-9 w-16 text-center text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemove(it.productId)}
                        className="h-9 w-9 rounded-md text-rose-500 hover:bg-rose-50 inline-flex items-center justify-center"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-zinc-100 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products to add…"
                  className="w-full pl-9 pr-3 h-10 rounded-lg border border-zinc-200 text-sm focus:border-zinc-900 outline-none"
                />
              </div>
              {filteredProducts.length > 0 && (
                <div className="max-h-60 overflow-y-auto border border-zinc-100 rounded-lg divide-y divide-zinc-50">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAdd(p.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 text-left"
                    >
                      <div className="relative h-9 w-9 rounded-md overflow-hidden bg-[#F9F6F0] shrink-0">
                        {p.imageUrl && (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-zinc-500">{inr(p.price)}</p>
                      </div>
                      <Plus className="h-4 w-4 text-[#B59461]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 sticky top-6">
            <h2 className="font-bold text-zinc-900">Pricing</h2>
            <div className="space-y-2">
              <Label>Bundle price (₹) *</Label>
              <Input
                type="number"
                min={1}
                value={bundlePrice}
                onChange={(e) => setBundlePrice(Number(e.target.value) || 0)}
                placeholder="1999"
                className="h-11"
                required
              />
            </div>
            <div className="rounded-xl bg-[#F9F6F0] p-4 space-y-2">
              <div className="flex justify-between text-xs text-zinc-600">
                <span>Retail total</span>
                <span className="line-through font-mono">
                  {inr(retailTotal)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-zinc-600">
                <span>Bundle price</span>
                <span className="font-bold text-[#B59461] font-mono">
                  {inr(bundlePrice || 0)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#B59461]/20">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700">
                  Customer saves
                </span>
                <span className="font-bold text-emerald-700">
                  {savingsPct}% off
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-zinc-700">Active (visible to customers)</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    isActive ? "bg-emerald-500" : "bg-zinc-300"
                  )}
                >
                  <div
                    className={cn(
                      "h-3 w-3 bg-white rounded-full absolute top-1 transition-all shadow",
                      isActive ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-zinc-700 inline-flex items-center gap-1">
                  Featured <Sparkles className="h-3 w-3 text-amber-500" />
                </span>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    isFeatured ? "bg-amber-500" : "bg-zinc-300"
                  )}
                >
                  <div
                    className={cn(
                      "h-3 w-3 bg-white rounded-full absolute top-1 transition-all shadow",
                      isFeatured ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </label>
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-12 bg-zinc-900 hover:bg-black text-white font-bold uppercase text-xs tracking-widest"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {initial.id ? "Save changes" : "Create bundle"}
            </Button>
          </div>
        </aside>
      </div>
    </form>
  );
}
