"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const VISIBLE = 4;

export function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [start, setStart] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const selected = images[currentIdx];

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

  const prevThumb = () => setStart((s) => Math.max(0, s - 1));
  const nextThumb = () => setStart((s) => Math.min(images.length - VISIBLE, s + 1));

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= images.length) return;
    setCurrentIdx(idx);
    if (idx >= start + VISIBLE) setStart(Math.min(idx - VISIBLE + 1, images.length - VISIBLE));
    else if (idx < start) setStart(idx);
  };

  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
    setDragX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - touchStartX.current;
    // Resist at edges
    if ((currentIdx === 0 && diff > 0) || (currentIdx === images.length - 1 && diff < 0)) {
      setDragX(diff * 0.15);
    } else {
      setDragX(diff);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    setIsDragging(false);
    setDragX(0);
    if (Math.abs(diff) >= 50) {
      if (diff > 0) goTo(currentIdx + 1);
      else goTo(currentIdx - 1);
    }
  };

  // Track offset: each image is 100% wide, drag adds pixel offset
  const trackStyle = {
    transform: `translateX(calc(${-currentIdx * 100}% + ${dragX}px))`,
    transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

      {/* ── DESKTOP: vertical thumbnail strip ── */}
      <div className="order-2 lg:order-1 hidden lg:flex flex-col w-[88px] gap-2">
        {showArrows && (
          <button
            onClick={prevThumb}
            disabled={!canPrev}
            className={cn(
              "flex-shrink-0 h-8 w-full flex items-center justify-center rounded-lg border bg-white transition-all",
              canPrev ? "border-zinc-300 hover:border-[#50540b] hover:text-[#50540b]" : "border-zinc-100 opacity-30 cursor-default"
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {visible.map((img, i) => (
            <button
              key={start + i}
              onClick={() => goTo(start + i)}
              className={cn(
                "relative flex-1 w-full min-h-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                selected === img
                  ? "border-[#50540b] shadow-md"
                  : "border-zinc-200 opacity-60 hover:opacity-100 hover:border-zinc-400"
              )}
            >
              <Image src={img} alt={`${productName} ${start + i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
        {showArrows && (
          <button
            onClick={nextThumb}
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

      {/* ── Main image area ── */}
      <div className="order-1 lg:order-2 flex-1 flex flex-col gap-3">

        {/* Image container */}
        <div className="relative aspect-[4/5] rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden bg-[#F9F6F0] border border-zinc-100 lg:cursor-zoom-in"
          onMouseEnter={() => setShowMagnifier(true)}
          onMouseLeave={() => setShowMagnifier(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Sliding track — all images side by side */}
          <div className="absolute inset-0 flex" style={trackStyle}>
            {images.map((img, i) => (
              <div key={i} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={img}
                  alt={`${productName} ${i + 1}`}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>

          {/* Desktop magnifier */}
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

          {/* Mobile prev/next arrow buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => goTo(currentIdx - 1)}
                disabled={currentIdx === 0}
                className={cn(
                  "lg:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md transition-all active:scale-95",
                  currentIdx === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
                <ChevronLeft className="h-5 w-5 text-zinc-700" />
              </button>
              <button
                onClick={() => goTo(currentIdx + 1)}
                disabled={currentIdx === images.length - 1}
                className={cn(
                  "lg:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md transition-all active:scale-95",
                  currentIdx === images.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
              >
                <ChevronRight className="h-5 w-5 text-zinc-700" />
              </button>
            </>
          )}
        </div>

        {/* ── MOBILE: dots + thumbnails ── */}
        <div className="flex lg:hidden flex-col items-center gap-3">
          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === currentIdx ? "h-2 w-5 bg-[#50540b]" : "h-2 w-2 bg-zinc-300"
                  )}
                />
              ))}
            </div>
          )}

          {/* Thumbnail row */}
          <div className="flex items-center gap-2 w-full">
            {showArrows && (
              <button
                onClick={prevThumb}
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
                  onClick={() => goTo(start + i)}
                  className={cn(
                    "relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                    currentIdx === start + i ? "border-[#50540b]" : "border-zinc-200 opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`${productName} ${start + i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            {showArrows && (
              <button
                onClick={nextThumb}
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
        </div>
      </div>
    </div>
  );
}
