"use client";

import { useTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Repeat, X, Pause, Play, Loader2, Calendar, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
} from "@/actions/subscription";
import { cn } from "@/lib/utils";

export interface CustomerSubscription {
  id: string;
  status: string;
  intervalMonths: number;
  pricePerCycle: number;
  cyclesPaid: number;
  nextBillingAt: string | null;
  startedAt: string | null;
  authUrl: string | null;
  razorpaySubscriptionId: string | null;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const STATUS_META: Record<string, { label: string; tint: string }> = {
  CREATED: { label: "Awaiting payment", tint: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Active", tint: "bg-emerald-100 text-emerald-700" },
  PAUSED: { label: "Paused", tint: "bg-zinc-100 text-zinc-700" },
  CANCELLED: { label: "Cancelled", tint: "bg-rose-100 text-rose-700" },
  COMPLETED: { label: "Completed", tint: "bg-blue-100 text-blue-700" },
  HALTED: { label: "Halted", tint: "bg-rose-100 text-rose-700" },
  EXPIRED: { label: "Expired", tint: "bg-zinc-100 text-zinc-500" },
};

export function SubscriptionCard({ sub }: { sub: CustomerSubscription }) {
  const [pending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const status = STATUS_META[sub.status] ?? STATUS_META.CREATED;
  const isActive = sub.status === "ACTIVE";
  const isPaused = sub.status === "PAUSED";
  const isCreated = sub.status === "CREATED";

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelSubscription(sub.id);
      if (res.success) {
        toast.success("Subscription cancelled");
        setConfirmCancel(false);
      } else {
        toast.error(res.error || "Failed to cancel");
      }
    });
  };

  const handlePause = () => {
    startTransition(async () => {
      const res = await pauseSubscription(sub.id);
      if (res.success) toast.success("Subscription paused");
      else toast.error(res.error || "Failed to pause");
    });
  };

  const handleResume = () => {
    startTransition(async () => {
      const res = await resumeSubscription(sub.id);
      if (res.success) toast.success("Subscription resumed");
      else toast.error(res.error || "Failed to resume");
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Link
          href={`/product/${sub.product.id}`}
          className="relative h-16 w-16 rounded-xl overflow-hidden bg-[#F9F6F0] shrink-0"
        >
          {sub.product.imageUrl && (
            <Image
              src={sub.product.imageUrl}
              alt={sub.product.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Repeat className="h-3.5 w-3.5 text-[#B59461]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#B59461]">
              Every {sub.intervalMonths}mo
            </p>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                status.tint
              )}
            >
              {status.label}
            </span>
          </div>
          <Link href={`/product/${sub.product.id}`}>
            <p className="font-serif font-bold text-zinc-900 mt-1 truncate">
              {sub.product.name}
            </p>
          </Link>
          <p className="text-sm font-bold text-[#B59461] mt-0.5">
            {inr(sub.pricePerCycle)} <span className="text-xs font-normal text-zinc-500">/ cycle</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-zinc-50">
        <div>
          <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">Cycles paid</p>
          <p className="text-zinc-700 font-bold mt-0.5">{sub.cyclesPaid}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">
            {isCreated ? "Authorize by" : "Next renewal"}
          </p>
          <p className="text-zinc-700 font-bold mt-0.5 inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {fmtDate(sub.nextBillingAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-2">
        {isCreated && sub.authUrl && (
          <a
            href={sub.authUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-zinc-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest"
          >
            Complete payment <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {isActive && (
          <button
            type="button"
            onClick={handlePause}
            disabled={pending}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pause className="h-3 w-3" />}
            Pause
          </button>
        )}
        {isPaused && (
          <button
            type="button"
            onClick={handleResume}
            disabled={pending}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Resume
          </button>
        )}
        {(isActive || isPaused || isCreated) && (
          confirmCancel ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                disabled={pending}
                className="inline-flex items-center h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={pending}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-widest"
              >
                {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                Confirm cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-rose-600 hover:bg-rose-50 text-[10px] font-bold uppercase tracking-widest"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          )
        )}
      </div>
    </div>
  );
}
