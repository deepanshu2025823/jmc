"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { clearAllLeads } from "@/actions/admin";

export function ClearLeadsButton({ totalLeads }: { totalLeads: number }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (totalLeads === 0) {
      toast.info("There are no leads to clear.");
      return;
    }

    const confirmed = confirm(
      `Permanently delete ALL ${totalLeads} customer lead${totalLeads === 1 ? "" : "s"}?\n\n` +
        `This will also remove their orders, order items, and addresses.\n` +
        `Admin accounts are not affected.\n\n` +
        `This action CANNOT be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const res = await clearAllLeads();
      if (res.success) {
        toast.success(`Cleared ${res.deleted ?? 0} lead${res.deleted === 1 ? "" : "s"}.`);
      } else {
        toast.error(res.error || "Failed to clear leads.");
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || totalLeads === 0}
      variant="destructive"
      className="rounded-full h-10 px-5 font-bold text-xs uppercase tracking-widest shadow-sm"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      )}
      {isPending ? "Clearing..." : "Clear All"}
    </Button>
  );
}
