"use client";

import { useState } from "react";
import { Share2, Check, MessageCircle, Link2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  productName: string;
  productUrl: string;
}

/**
 * Tries the native Web Share API first (best mobile UX). Falls back to a
 * small popover with WhatsApp share + copy-link.
 */
export function ProductShareButton({ productName, productUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = `Check out ${productName} on JMC Secret Rituals — ${productUrl}`;

  const handleClick = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} on JMC Secret Rituals`,
          url: productUrl,
        });
        return;
      } catch {
        // user cancelled — fall through to popover
      }
    }
    setOpen((s) => !s);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Share this product"
        className="inline-flex items-center gap-2 px-4 h-10 rounded-full border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 text-xs font-bold uppercase tracking-widest text-zinc-700 transition-colors"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-40 w-64 rounded-2xl bg-white border border-zinc-200 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-sm"
          >
            <span className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <MessageCircle className="h-4 w-4 text-white" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-zinc-900">WhatsApp</p>
              <p className="text-[11px] text-zinc-500">Share with a friend</p>
            </div>
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 text-sm text-left"
          >
            <span className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Link2 className="h-4 w-4 text-zinc-700" />
              )}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-zinc-900">
                {copied ? "Copied!" : "Copy link"}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">{productUrl}</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
