"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCartStore, type ProductInput } from "@/hooks/use-cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  product: ProductInput;
}

/**
 * Mobile-only sticky CTA that slides up once the user scrolls past the
 * main "Add to Bag" button. Sits above the bottom nav for safe stacking.
 */
export function MobileStickyCta({ product }: Props) {
  const addToCart = useCartStore((s) => s.addToCart);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const cart = useCartStore((s) => s.cart);
  const inCart = cart.some((it) => it.id === product.id);

  const [visible, setVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      // Show once user has scrolled past the hero/CTA region.
      setVisible(y > 600);
      lastY.current = y;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAdd = () => {
    setAdding(true);
    addToCart(product);
    toast.success("Added to your bag");
    setTimeout(() => {
      setAdding(false);
      setCartOpen(true);
    }, 200);
  };

  return (
    <div
      className={cn(
        "md:hidden fixed left-3 right-3 z-[105] transition-all duration-300",
        // Sit above the existing mobile bottom nav (~70px) with safe-area inset.
        "bottom-[calc(72px+env(safe-area-inset-bottom))]",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-[150%] opacity-0 pointer-events-none"
      )}
    >
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex items-center gap-3 p-2 pl-3">
        {product.imageUrl && (
          <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-[#F9F6F0]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 truncate">
            {product.name}
          </p>
          <p className="text-sm font-black text-[#B59461]">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className={cn(
            "h-12 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shrink-0 transition-colors inline-flex items-center gap-2",
            inCart
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-zinc-900 hover:bg-black text-white"
          )}
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {inCart ? "In bag" : "Add"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
