"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cancelOrderByUser } from "@/actions/admin";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelOrderByUser(orderId, reason);
      if (res.success) {
        toast.success("Order cancelled");
        setOpen(false);
      } else {
        toast.error(res.error || "Failed to cancel");
      }
    });
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-11 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold uppercase text-[10px] tracking-widest"
      >
        <X className="h-4 w-4 mr-2" /> Cancel order
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-3">
      <div>
        <p className="text-sm font-bold text-rose-900">Cancel this order?</p>
        <p className="text-xs text-rose-700 mt-0.5">
          We&apos;ll restock the items. This can&apos;t be undone.
        </p>
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        rows={2}
        maxLength={200}
        className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="flex-1 h-10 rounded-full border-zinc-200 text-zinc-700"
        >
          Keep order
        </Button>
        <Button
          type="button"
          onClick={handleCancel}
          disabled={pending}
          className="flex-1 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Confirm cancel"
          )}
        </Button>
      </div>
    </div>
  );
}
