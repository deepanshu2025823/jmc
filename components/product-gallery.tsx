"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, productName }: { images: string[], productName: string }) {
  const [selectedImg, setSelectedImg] = useState(images[0]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <div className="order-2 lg:order-1 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedImg(img)}
            className={cn(
              "relative h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
              selectedImg === img ? "border-[#B59461]" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <Image src={img} alt="thumbnail" fill className="object-cover" />
          </button>
        ))}
      </div>

      <div 
        className="order-1 lg:order-2 relative flex-1 aspect-[4/5] rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden bg-[#F9F6F0] cursor-zoom-in border border-zinc-100"
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={handleMouseMove}
      >
        <Image 
          src={selectedImg} 
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
              backgroundImage: `url(${selectedImg})`,
              backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
              backgroundSize: "250%",
              backgroundRepeat: "no-repeat"
            }}
          />
        )}
      </div>
    </div>
  );
}