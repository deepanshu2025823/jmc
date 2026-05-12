"use client";

import { useTransition, useState } from "react";
import { Loader2, Truck, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  pushOrderToShiprocket,
  cancelShiprocketOrder,
} from "@/actions/shiprocket";

interface Props {
  orderId: string;
  isShiprocketEnabled: boolean;
  shiprocketOrderId: string | null;
  shiprocketShipmentId: string | null;
  awbCode: string | null;
  courier: string | null;
}

export function ShiprocketPushButton({
  orderId,
  isShiprocketEnabled,
  shiprocketOrderId,
  shiprocketShipmentId,
  awbCode,
  courier,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!isShiprocketEnabled && !shiprocketOrderId) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 p-3 text-xs text-zinc-500">
        Shiprocket is disabled. Enable it from the dashboard to auto-push
        orders.
      </div>
    );
  }

  const handlePush = () => {
    startTransition(async () => {
      const res = await pushOrderToShiprocket(orderId);
      if (res.success) {
        toast.success(
          res.awb
            ? `Pushed! AWB ${res.awb} via ${res.courier ?? "courier"}`
            : "Pushed to Shiprocket. AWB pending."
        );
      } else {
        toast.error(res.error || "Failed to push order");
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelShiprocketOrder(orderId);
      if (res.success) {
        toast.success("Shipment cancelled in Shiprocket");
        setConfirmCancel(false);
      } else {
        toast.error(res.error || "Failed to cancel");
      }
    });
  };

  if (shiprocketOrderId) {
    const trackUrl = awbCode
      ? `https://shiprocket.co/tracking/${encodeURIComponent(awbCode)}`
      : null;
    return (
      <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-700">
              Shipped via Shiprocket
            </p>
            <p className="text-xs font-bold text-zinc-900 mt-1">
              SR Order #{shiprocketOrderId}
              {shiprocketShipmentId && (
                <span className="text-zinc-400 font-normal">
                  {" "}
                  · Shipment #{shiprocketShipmentId}
                </span>
              )}
            </p>
            {awbCode ? (
              <p className="text-xs text-zinc-700 mt-1.5">
                <span className="text-zinc-400">AWB:</span>{" "}
                <span className="font-mono font-bold">{awbCode}</span>
                {courier && (
                  <span className="text-zinc-500"> · {courier}</span>
                )}
              </p>
            ) : (
              <p className="text-xs text-amber-700 mt-1.5">
                AWB not assigned yet. Check Shiprocket dashboard or push again.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {trackUrl && (
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-white border border-violet-200 hover:border-violet-400 text-xs font-bold uppercase tracking-wider text-violet-700"
            >
              Track <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {confirmCancel ? (
            <>
              <Button
                onClick={() => setConfirmCancel(false)}
                disabled={pending}
                variant="ghost"
                className="flex-1 h-9 text-xs uppercase tracking-wider"
              >
                Keep
              </Button>
              <Button
                onClick={handleCancel}
                disabled={pending}
                className="flex-1 h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase tracking-wider"
              >
                {pending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Confirm cancel"
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setConfirmCancel(true)}
              variant="ghost"
              className="h-9 text-xs uppercase tracking-wider text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handlePush}
      disabled={pending}
      className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-widest"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Pushing to
          Shiprocket…
        </>
      ) : (
        <>
          <Truck className="h-4 w-4 mr-2" /> Push to Shiprocket
        </>
      )}
    </Button>
  );
}
