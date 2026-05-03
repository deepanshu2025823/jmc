"use client";

import { useTransition } from "react";
import { Trash2, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteNewsletterSubscriber } from "@/actions/newsletter";

interface SubscriberLite {
  id: string;
  email: string;
  createdAt: string | Date;
}

export function RemoveSubscriberButton({ id, email }: { id: string; email: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(`Remove subscriber ${email}? This cannot be undone.`)) return;

    startTransition(async () => {
      const res = await deleteNewsletterSubscriber(id);
      if (res.success) {
        toast.success("Subscriber removed.");
      } else {
        toast.error(res.error || "Failed to remove subscriber.");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleClick}
      className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 font-bold px-3"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
      )}
      {isPending ? "Removing..." : "Remove"}
    </Button>
  );
}

export function ExportCsvButton({ subscribers }: { subscribers: SubscriberLite[] }) {
  const handleExport = () => {
    if (subscribers.length === 0) {
      toast.error("No subscribers to export.");
      return;
    }

    const escape = (val: string) => {
      const needsQuotes = /[",\n\r]/.test(val);
      const escaped = val.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const header = ["#", "Email", "Subscribed On"];
    const rows = subscribers.map((sub, i) => [
      String(i + 1),
      escape(sub.email),
      escape(new Date(sub.createdAt).toISOString()),
    ]);

    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `jmc-newsletter-subscribers-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${subscribers.length} subscriber${subscribers.length === 1 ? "" : "s"}.`);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={subscribers.length === 0}
      className="rounded-full bg-zinc-900 hover:bg-[#B59461] text-white font-bold h-10 px-6"
    >
      <Download className="h-4 w-4 mr-2" />
      Export as CSV
    </Button>
  );
}
