"use client";

import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function InvoiceToolbar({ backHref }: { backHref: string }) {
  return (
    <div className="print:hidden sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-zinc-200">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to order
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 hover:bg-black text-white px-5 h-10 text-[10px] font-bold uppercase tracking-widest"
        >
          <Printer className="h-3.5 w-3.5" /> Print / Save PDF
        </button>
      </div>
    </div>
  );
}
