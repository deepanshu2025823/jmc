"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Star, ShoppingCart, Heart, Filter, X, Award } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function BestsellersClient({ initialProducts }: { initialProducts: any[] }) {
  const { addToCart, addToWishlist, wishlist } = useCartStore() as any;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = ["All", ...Array.from(new Set(initialProducts.map(p => p.category).filter(Boolean)))];

  const filteredProducts = selectedCategory === "All" 
    ? initialProducts 
    : initialProducts.filter(p => p.category === selectedCategory);

  return (
    <main className="min-h-screen bg-white pb-32">
      <Header />
      
      <div className="pt-32 md:pt-44 pb-12 px-6 text-center max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Award className="h-4 w-4 text-[#B59461]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B59461]">
            Cult Favorites
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-zinc-900 tracking-tight leading-tight">
          Our Best<span className="italic font-light">Sellers</span>
        </h1>
        <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          The most loved luxury rituals by our community. Proven formulations that deliver radiant, golden results.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-4 relative">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Star className="h-3 w-3 fill-[#B59461] text-[#B59461]" />
            {filteredProducts.length} Favorites
          </span>
          
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)} 
            className="md:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-900"
          >
            {isFilterOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            Filter
          </button>

          <div className={cn(
            "absolute md:static top-full right-0 mt-2 md:mt-0 bg-white md:bg-transparent p-4 md:p-0 shadow-xl md:shadow-none border border-zinc-100 md:border-none rounded-2xl md:rounded-none z-50 flex-col md:flex-row gap-4 md:flex",
            isFilterOpen ? "flex" : "hidden"
          )}>
            {categories.map(cat => (
              <button
                key={cat as string}
                onClick={() => { setSelectedCategory(cat as string); setIsFilterOpen(false); }}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors text-left md:text-center",
                  selectedCategory === cat 
                    ? "text-[#B59461] border-b border-[#B59461]" 
                    : "text-zinc-400 hover:text-zinc-900"
                )}
              >
                {cat as string}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-32 bg-[#F9F6F0] rounded-[3rem]">
            <p className="font-serif text-2xl text-zinc-400 italic">No bestsellers found right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
            {filteredProducts.map((product) => {
              const images = Array.isArray(product.images) ? product.images : [];
              const secondaryImage = images.length > 1 ? images[1] : product.imageUrl;
              const isWishlisted = wishlist?.some((item: any) => item.id === product.id);

              return (
                <div key={product.id} className="group flex flex-col space-y-4">
                  <div className="relative aspect-[3/4] rounded-2xl md:rounded-[2rem] bg-[#F9F6F0] overflow-hidden group/img shadow-sm transition-all duration-500 hover:shadow-xl border border-zinc-50">
                    
                    {/* "BESTSELLER" Badge */}
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20 pointer-events-none flex flex-col gap-2">
                      <span className="bg-zinc-900 text-white text-[8px] md:text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1">
                        <Star className="h-2 w-2 fill-[#B59461] text-[#B59461]" /> BESTSELLER
                      </span>
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="bg-red-50/90 backdrop-blur-md text-red-600 text-[8px] md:text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                          Low Stock
                        </span>
                      )}
                    </div>

                    <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                      <Image 
                        src={product.imageUrl || "/placeholder.jpg"}
                        alt={product.name} fill className="object-cover transition-opacity duration-700 ease-in-out group-hover/img:opacity-0"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <Image 
                        src={(secondaryImage as string) || product.imageUrl || "/placeholder.jpg"}
                        alt={`${product.name} hover`} fill className="object-cover absolute inset-0 opacity-0 transition-all duration-700 ease-in-out group-hover/img:opacity-100 group-hover/img:scale-110"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </Link>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        addToWishlist({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
                      }}
                      className="absolute top-3 right-3 md:top-4 md:right-4 p-2 bg-white/80 backdrop-blur-md rounded-full transition-all shadow-sm z-30"
                    >
                      <Heart className={cn("h-4 w-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-400")} />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 translate-y-full group-hover/img:translate-y-0 transition-transform duration-500 ease-out z-30">
                       <Button 
                        disabled={product.stock === 0}
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
                        }}
                        className="w-full bg-[#B59461] text-white hover:bg-zinc-900 rounded-full font-bold h-10 md:h-12 shadow-2xl transition-colors border-none"
                       >
                         <ShoppingCart className="mr-2 h-4 w-4" /> 
                         <span className="hidden sm:inline">{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
                         <span className="sm:hidden text-[10px]">{product.stock === 0 ? "Empty" : "Add"}</span>
                       </Button>
                    </div>

                  </div>

                  <div className="space-y-1.5 px-1">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-2 w-2 md:h-2.5 md:w-2.5 fill-[#B59461] text-[#B59461]" />
                      ))}
                      <span className="text-[9px] text-zinc-400 ml-1">(400+)</span>
                    </div>
                    
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-serif text-md md:text-lg text-zinc-900 leading-tight truncate hover:text-[#B59461] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest truncate">
                      {product.category || "Cult Favorite"}
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <p className="text-md md:text-xl font-black text-zinc-900 italic">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}