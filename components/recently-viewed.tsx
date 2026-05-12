"use client";

import Link from "next/link";
import Image from "next/image";
import { History, ChevronRight } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

interface Props {
  /** Hide this product from the list (when shown on a PDP) */
  excludeId?: string;
  /** Visual treatment */
  variant?: "section" | "compact";
  /** Override heading */
  heading?: string;
  /** Optional custom subheading line */
  eyebrow?: string;
}

export function RecentlyViewed({
  excludeId,
  variant = "section",
  heading,
  eyebrow,
}: Props) {
  const { items, hydrated, clear } = useRecentlyViewed();

  if (!hydrated) return null;
  const list = items.filter((it) => it.id !== excludeId);
  if (list.length === 0) return null;

  const eyebrowText = eyebrow ?? "Continue Browsing";
  const headingText = heading ?? "Recently Viewed";

  if (variant === "compact") {
    return (
      <section className="border-t border-zinc-100 bg-white py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-zinc-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                {eyebrowText}
              </p>
            </div>
            <button
              type="button"
              onClick={clear}
              className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-700"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {list.map((it) => (
              <Link
                key={it.id}
                href={`/product/${it.id}`}
                className="shrink-0 w-[140px] group"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F9F6F0] border border-zinc-100">
                  {it.imageUrl && (
                    <Image
                      src={it.imageUrl}
                      alt={it.name}
                      fill
                      sizes="140px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <p className="mt-2 text-xs font-bold text-zinc-900 line-clamp-2 leading-tight">
                  {it.name}
                </p>
                <p className="text-[11px] font-bold text-[#B59461] mt-1">
                  {inr(it.price)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 border-t border-zinc-100 bg-zinc-50/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-[#B59461]" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B59461]">
                {eyebrowText}
              </p>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-zinc-900">
              {headingText}
            </h2>
          </div>
          <button
            type="button"
            onClick={clear}
            className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 border-b border-transparent hover:border-zinc-900 pb-0.5 transition-all"
          >
            Clear history
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {list.map((it) => (
            <Link
              key={it.id}
              href={`/product/${it.id}`}
              className="group space-y-3"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F9F6F0] border border-zinc-100">
                {it.imageUrl && (
                  <Image
                    src={it.imageUrl}
                    alt={it.name}
                    fill
                    sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-serif font-bold text-zinc-900 text-sm line-clamp-2 leading-tight">
                  {it.name}
                </p>
                <p className="text-xs font-bold text-[#B59461]">
                  {inr(it.price)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-[#50540b] transition-colors">
                View again <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
