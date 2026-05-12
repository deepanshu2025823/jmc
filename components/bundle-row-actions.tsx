"use client";

import { useTransition } from "react";
import { Trash2, Power, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteBundle, toggleBundleActive } from "@/actions/bundle";

export function BundleRowActions({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleBundleActive(id);
      if (res.success) {
        toast.success(
          res.isActive ? "Bundle is now live" : "Bundle hidden from store"
        );
      } else {
        toast.error(res.error || "Failed to toggle");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this bundle permanently?")) return;
    startTransition(async () => {
      const res = await deleteBundle(id);
      if (res.success) toast.success("Bundle deleted");
      else toast.error(res.error || "Failed to delete");
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={pending}
        className="rounded-lg border-zinc-200 text-zinc-700"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
        ) : (
          <Power className="h-3.5 w-3.5 mr-1" />
        )}
        {isActive ? "Hide" : "Activate"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </>
  );
}
