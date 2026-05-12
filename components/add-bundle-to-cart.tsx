"use client";

import { useState } from "react";
import { ShoppingBag, Loader2, Check } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BundleItem {
  productId: string;
  quantity: number;
  name: string;
  imageUrl: string | null;
  retailPrice: number;
}

interface Props {
  bundleId: string;
  bundleName: string;
  bundlePrice: number;
  items: BundleItem[];
}

/**
 * Adds every bundle product to the cart at proportionally-split prices so the
 * cart subtotal equals the bundle price. Splits proportionally to each line's
 * retail value so individual line totals stay sensible.
 */
export function AddBundleToCart({
  bundleId,
  bundleName,
  bundlePrice,
  items,
}: Props) {
  const addToCart = useCartStore((s) => s.addToCart);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const retailTotal = items.reduce(
    (s, it) => s + it.retailPrice * it.quantity,
    0
  );

  const handleAdd = () => {
    if (items.length === 0 || retailTotal <= 0) {
      toast.error("This bundle has no valid items");
      return;
    }
    setLoading(true);
    try {
      let allocated = 0;
      items.forEach((it, idx) => {
        const lineRetail = it.retailPrice * it.quantity;
        let lineTotal: number;
        if (idx === items.length - 1) {
          // Allocate the remainder to the last line to avoid rounding leaks.
          lineTotal = Math.max(0, bundlePrice - allocated);
        } else {
          lineTotal = Math.round((lineRetail / retailTotal) * bundlePrice);
          allocated += lineTotal;
        }
        const perUnit = lineTotal / it.quantity;
        for (let q = 0; q < it.quantity; q++) {
          addToCart({
            id: it.productId,
            name: it.name,
            price: perUnit,
            imageUrl: it.imageUrl ?? "",
          });
        }
      });
      toast.success(`${bundleName} added to your bag`);
      setAdded(true);
      setTimeout(() => setCartOpen(true), 150);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={loading}
      data-bundle-id={bundleId}
      className={cn(
        "w-full h-12 rounded-full inline-flex items-center justify-center gap-2",
        "font-black uppercase text-xs tracking-widest shadow-xl transition-colors",
        added
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "bg-zinc-900 hover:bg-black text-white"
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : added ? (
        <>
          <Check className="h-4 w-4" /> Added to bag
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Add bundle to bag
        </>
      )}
    </button>
  );
}
