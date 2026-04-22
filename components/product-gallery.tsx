"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const VISIBLE = 4;

export function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [selected, setSelected] = useState(images[0]);
  const [start, setStart] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.pageX - left) / width) * 100,
      y: ((e.pageY - top - window.scrollY) / height) * 100,
    });
  };

  const canPrev = start > 0;
  const canNext = start + VISIBLE < images.length;
  const visible = images.slice(start, start + VISIBLE);
  const showArrows = images.length > VISIBLE;

  const prev = () => setStart((s) => Math.max(0, s - 1));
  const next = () => setStart((s) => Math.min(images.length - VISIBLE, s + 1));

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

      {/* ── DESKTOP: vertical strip, same height as main image ── */}
      <div className="order-2 lg:order-1 hidden lg:flex flex-col w-[88px] gap-2">

        {showArrows && (
          <button
            onClick={prev}
            disabled={!canPrev}
            className={cn(
              "flex-shrink-0 h-8 w-full flex items-center justify-center rounded-lg border bg-white transition-all",
              canPrev ? "border-zinc-300 hover:border-[#50540b] hover:text-[#50540b]" : "border-zinc-100 opacity-30 cursor-default"
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}

        {/* thumbnails: flex-1 so they fill the remaining height of the row */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {visible.map((img, i) => (
            <button
              key={start + i}
              onClick={() => setSelected(img)}
              className={cn(
                "relative flex-1 w-full min-h-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                selected === img
                  ? "border-[#50540b] shadow-md"
                  : "border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-400"
              )}
            >
              <Image
                src={img}
                alt={`${productName} ${start + i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {showArrows && (
          <button
            onClick={next}
            disabled={!canNext}
            className={cn(
              "flex-shrink-0 h-8 w-full flex items-center justify-center rounded-lg border bg-white transition-all",
              canNext ? "border-zinc-300 hover:border-[#50540b] hover:text-[#50540b]" : "border-zinc-100 opacity-30 cursor-default"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── MOBILE: horizontal strip below main image ── */}
      <div className="order-2 flex lg:hidden items-center gap-2">
        {showArrows && (
          <button
            onClick={prev}
            disabled={!canPrev}
            className={cn(
              "flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border bg-white",
              canPrev ? "border-zinc-300 hover:border-[#50540b] hover:text-[#50540b]" : "border-zinc-100 opacity-30 cursor-default"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div className="flex gap-3">
          {visible.map((img, i) => (
            <button
              key={start + i}
              onClick={() => setSelected(img)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                selected === img ? "border-[#50540b]" : "border-zinc-200 opacity-60 hover:opacity-100"
              )}
            >
              <Image src={img} alt={`${productName} ${start + i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>

        {showArrows && (
          <button
            onClick={next}
            disabled={!canNext}
            className={cn(
              "flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border bg-white",
              canNext ? "border-zinc-300 hover:border-[#50540b] hover:text-[#50540b]" : "border-zinc-100 opacity-30 cursor-default"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Main image ── */}
      <div
        className="order-1 lg:order-2 relative flex-1 aspect-[4/5] rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden bg-[#F9F6F0] cursor-zoom-in border border-zinc-100"
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={selected}
          alt={productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {showMagnifier && (
          <div
            className="absolute inset-0 z-10 pointer-events-none hidden lg:block"
            style={{
              backgroundImage: `url(${selected})`,
              backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
              backgroundSize: "250%",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </div>
    </div>
  );
}
