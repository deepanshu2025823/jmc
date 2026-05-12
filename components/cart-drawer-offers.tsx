"use client";

import { useEffect, useState } from "react";
import { Ticket, Check, Loader2, Sparkles, Tag } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ActiveCoupon {
  code: string;
  discountValue: number;
  type: string;
  expiresAt: string;
  minOrderAmount: number | null;
}

const fmtExpiry = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.ceil(
    (d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (days <= 0) return "Expires today";
  if (days === 1) return "Ends tomorrow";
  if (days <= 7) return `Ends in ${days} days`;
  return `Expires ${d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })}`;
};

export function CartDrawerOffers() {
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const cart = useCartStore((s) => s.cart);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const setCoupon = useCartStore((s) => s.setCoupon);

  const subtotal = cart.reduce(
    (s, it) => s + Number(it.price) * (it.quantity || 1),
    0
  );

  const [coupons, setCoupons] = useState<ActiveCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    if (!isCartOpen) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/coupon/active", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCoupons(data.coupons ?? []);
      })
      .catch(() => {
        if (!cancelled) setCoupons([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isCartOpen]);

  const apply = async (code: string) => {
    if (!code) return;
    setApplying(code);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid coupon");
      setCoupon({
        code: data.code,
        discount: data.discountValue,
        type: data.type,
      });
      toast.success(`Coupon ${data.code} applied!`);
      setManualCode("");
      setShowInput(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to apply coupon");
    } finally {
      setApplying(null);
    }
  };

  const remove = () => {
    setCoupon(null);
    toast.success("Coupon removed");
  };

  const hasOffers = coupons.length > 0;

  return (
    <div className="border-t border-zinc-200 bg-gradient-to-b from-amber-50/50 to-white">
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Offers & Coupons
        </p>
        {appliedCoupon ? (
          <button
            type="button"
            onClick={remove}
            className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowInput((s) => !s)}
            className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1"
          >
            <Ticket className="h-3 w-3" />
            {showInput ? "Hide code" : "Enter code"}
          </button>
        )}
      </div>

      {appliedCoupon && (
        <div className="px-6 pb-3">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-black tracking-widest text-emerald-900">
                {appliedCoupon.code}
              </p>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                {appliedCoupon.type === "PERCENTAGE"
                  ? `${appliedCoupon.discount}% off`
                  : `₹${appliedCoupon.discount} off`}{" "}
                applied to your bag
              </p>
            </div>
          </div>
        </div>
      )}

      {showInput && !appliedCoupon && (
        <div className="px-6 pb-3 flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply(manualCode);
              }
            }}
            placeholder="ENTER CODE"
            className="flex-1 h-9 px-3 text-xs font-mono uppercase tracking-widest border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-900"
          />
          <button
            type="button"
            disabled={!manualCode || applying === manualCode}
            onClick={() => apply(manualCode)}
            className="h-9 px-4 rounded-lg bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-black inline-flex items-center justify-center min-w-[64px]"
          >
            {applying === manualCode ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
        </div>
      )}

      {!appliedCoupon && (
        <div className="pb-4">
          {loading && coupons.length === 0 ? (
            <div className="px-6 flex items-center gap-2 text-xs text-zinc-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading offers…
            </div>
          ) : hasOffers ? (
            <div className="flex gap-2.5 overflow-x-auto px-6 pb-1 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {coupons.map((c) => {
                const busy = applying === c.code;
                const minOrder = c.minOrderAmount ?? 0;
                const eligible = minOrder === 0 || subtotal >= minOrder;
                const remaining = Math.max(0, minOrder - subtotal);
                return (
                  <button
                    key={c.code}
                    type="button"
                    disabled={busy || !eligible}
                    onClick={() => apply(c.code)}
                    className={cn(
                      "shrink-0 relative bg-white border-2 border-dashed",
                      "rounded-xl pl-3.5 pr-4 py-2.5 text-left transition-all",
                      "min-w-[170px]",
                      eligible
                        ? "border-zinc-300 hover:border-zinc-900 hover:shadow-md"
                        : "border-zinc-200 opacity-70 cursor-not-allowed",
                      busy && "cursor-wait opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Tag className="h-3.5 w-3.5 text-amber-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-zinc-900 leading-tight">
                          {c.type === "PERCENTAGE"
                            ? `${c.discountValue}% OFF`
                            : `₹${c.discountValue} OFF`}
                        </p>
                        <p className="font-mono font-bold text-[10px] tracking-widest text-zinc-700 mt-0.5">
                          {c.code}
                        </p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">
                          {minOrder > 0
                            ? `Min ₹${minOrder.toLocaleString("en-IN")} · ${fmtExpiry(c.expiresAt)}`
                            : fmtExpiry(c.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-end">
                      {busy ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 inline-flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Applying
                        </span>
                      ) : eligible ? (
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600">
                          Tap to apply →
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-700">
                          + ₹{remaining.toLocaleString("en-IN")} to unlock
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            !showInput && (
              <p className="px-6 text-[11px] text-zinc-400">
                No offers available right now.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
