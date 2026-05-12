"use client";

import { useSyncExternalStore } from "react";
import { Truck, PartyPopper } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart-store";
import { cn } from "@/lib/utils";

interface Props {
  threshold: number | null;
}

const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(noopSubscribe, () => true, () => false);

export function FreeShippingBar({ threshold }: Props) {
  const cart = useCartStore((s) => s.cart);
  const mounted = useIsClient();

  if (!mounted || !threshold || threshold <= 0) return null;

  const subtotal = cart.reduce(
    (s, it) => s + Number(it.price) * (it.quantity || 1),
    0
  );
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);
  const unlocked = remaining === 0 && subtotal > 0;

  return (
    <div
      className={cn(
        "w-full text-white text-[11px] font-medium",
        unlocked ? "bg-emerald-700" : "bg-zinc-900"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
        {unlocked ? (
          <>
            <PartyPopper className="h-3.5 w-3.5" />
            <span className="font-bold uppercase tracking-widest text-[10px]">
              You&apos;ve unlocked FREE shipping! 🎉
            </span>
          </>
        ) : subtotal === 0 ? (
          <>
            <Truck className="h-3.5 w-3.5" />
            <span className="uppercase tracking-widest text-[10px]">
              Free shipping on orders over ₹{threshold.toLocaleString("en-IN")}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-3 w-full max-w-xl">
            <Truck className="h-3.5 w-3.5 shrink-0" />
            <span className="uppercase tracking-widest text-[10px] whitespace-nowrap">
              Add ₹{remaining.toLocaleString("en-IN")} for FREE shipping
            </span>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B59461] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
