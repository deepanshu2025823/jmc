"use client";

import { useState, useTransition } from "react";
import { Bell, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { subscribeStockNotification } from "@/actions/stock-notify";

interface Props {
  productId: string;
  defaultEmail?: string;
}

export function StockNotifyForm({ productId, defaultEmail = "" }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your email");
    startTransition(async () => {
      const res = await subscribeStockNotification(productId, email);
      if (res.success) {
        setDone(true);
        toast.success("You'll be the first to know when it's back");
      } else {
        toast.error(res.error || "Could not save");
      }
    });
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
        <Check className="h-5 w-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-bold text-emerald-900">You&apos;re on the list</p>
          <p className="text-xs text-emerald-700">We&apos;ll email you the moment it&apos;s back.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-[#B59461]" />
        <p className="text-sm font-bold text-zinc-900">Notify me when back in stock</p>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">
        Drop your email — we&apos;ll send you a personal note the moment this
        ritual returns.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 h-11 px-4 rounded-lg border border-zinc-200 focus:border-zinc-900 outline-none text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-11 px-5 rounded-lg bg-zinc-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notify me"}
        </button>
      </form>
    </div>
  );
}
