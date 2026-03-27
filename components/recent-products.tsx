"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export function RecentProducts({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      const res = await fetch("/api/products/bestsellers"); 
      const data = await res.json();
      const filtered = data.filter((p: any) => p.id !== currentProductId).slice(0, 4);
      setProducts(filtered);
    };
    fetchRecent();
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="py-20 border-t border-zinc-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B59461]">Complete the Ritual</p>
            <h2 className="text-3xl md:text-4xl font-serif text-zinc-900 italic">Recently <span className="not-italic">Curated</span></h2>
          </div>
          <Link href="/shop" className="text-[10px] font-bold uppercase tracking-widest border-b border-zinc-900 pb-1 hover:text-[#B59461] hover:border-[#B59461] transition-all">
            View All Rituals
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group space-y-4">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-[#F9F6F0]">
                <Image 
                  src={product.imageUrl} 
                  alt={product.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="space-y-1 px-1">
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 fill-[#B59461] text-[#B59461]" />
                  ))}
                </div>
                <h3 className="font-serif text-md text-zinc-900 group-hover:text-[#B59461] transition-colors truncate">{product.name}</h3>
                <p className="text-sm font-black text-zinc-900">₹{Number(product.price).toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}