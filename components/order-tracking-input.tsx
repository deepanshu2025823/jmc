"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, Truck } from "lucide-react";
import { toast } from "sonner";
import { setOrderTracking } from "@/actions/admin";

interface Props {
  orderId: string;
  currentTrackingNumber: string | null;
  currentCourier: string | null;
}

export function OrderTrackingInput({
  orderId,
  currentTrackingNumber,
  currentCourier,
}: Props) {
  const [trackingNumber, setTrackingNumber] = useState(
    currentTrackingNumber ?? ""
  );
  const [courier, setCourier] = useState(currentCourier ?? "");
  const [pending, startTransition] = useTransition();

  const dirty =
    trackingNumber.trim() !== (currentTrackingNumber ?? "").trim() ||
    courier.trim() !== (currentCourier ?? "").trim();

  const handleSave = () => {
    startTransition(async () => {
      const res = await setOrderTracking(orderId, {
        trackingNumber: trackingNumber.trim(),
        courier: courier.trim(),
      });
      if (res.success) toast.success("Tracking info saved");
      else toast.error(res.error || "Failed to save");
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Truck className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
        <input
          type="text"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          placeholder="Courier"
          className="w-full pl-8 pr-2 h-9 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
        />
      </div>
      <input
        type="text"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="Tracking number"
        className="flex-1 px-2.5 h-9 text-xs font-mono border border-zinc-200 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={!dirty || pending}
        className="h-9 px-3 rounded-md bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-black inline-flex items-center justify-center gap-1.5 min-w-[64px]"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <Save className="h-3.5 w-3.5" /> Save
          </>
        )}
      </button>
    </div>
  );
}
