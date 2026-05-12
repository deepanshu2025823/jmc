"use client";

import { useTransition } from "react";
import { Send, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { sendAbandonedCheckoutReminder } from "@/actions/abandoned";

export function AbandonedReminderButton({
  id,
  alreadySent,
}: {
  id: string;
  alreadySent: number;
}) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const res = await sendAbandonedCheckoutReminder(id);
      if (res.success) toast.success("Reminder email sent");
      else toast.error(res.error || "Failed to send reminder");
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 h-8 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : alreadySent > 0 ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Send className="h-3.5 w-3.5" />
      )}
      {alreadySent > 0 ? "Re-send" : "Send reminder"}
    </button>
  );
}
