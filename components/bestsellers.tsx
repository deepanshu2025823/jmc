"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Heart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart-store";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function Bestsellers() {
  const [products, setProducts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false); 

  const store = useCartStore();
  const addToCart = store?.addToCart;
  const addToWishlist = store?.addToWishlist;
  const wishlist = store?.wishlist || [];

  useEffect(() => {
    setMounted(true);
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products/bestsellers");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setProducts(data.slice(0, 3)); 
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  if (!mounted) return null;

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-4 mb-12 md:mb-20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-[1px] w-8 bg-[#B59461]"></div>
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-[#B59461]">
            Curated Selection
          </span>
          <div className="h-[1px] w-8 bg-[#B59461]"></div>
        </div>
        <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 tracking-tight">
          Our <span className="italic font-light">Bestsellers</span>
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-10 md:gap-y-16">
        {products.map((product) => {
          const images = Array.isArray(product.images) ? product.images : [];
          const secondaryImage = images.length > 1 ? images[1] : product.imageUrl;
          
          const isWishlisted = Array.isArray(wishlist) && wishlist.some((item: any) => item.id === product.id);

          return (
            <div key={product.id} className="group flex flex-col space-y-3 md:space-y-5">
              <div className="relative aspect-[3/4] rounded-2xl md:rounded-[2rem] bg-[#F9F6F0] overflow-hidden group/img shadow-sm transition-all duration-500 hover:shadow-xl">
                
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                  <Image 
                    src={product.imageUrl || "/placeholder-product.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-opacity duration-700 ease-in-out group-hover/img:opacity-0"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />

                  <Image 
                    src={(secondaryImage as string) || product.imageUrl || "/placeholder-product.jpg"}
                    alt={`${product.name} alternate`}
                    fill
                    className="object-cover absolute inset-0 opacity-0 transition-all duration-700 ease-in-out group-hover/img:opacity-100 group-hover/img:scale-110"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </Link>

                <div className="absolute top-3 left-3 md:top-5 md:left-5 flex flex-col gap-2 z-20 pointer-events-none">
                   <span className="bg-white/90 backdrop-blur-md text-[9px] md:text-[10px] font-black px-2 py-1 rounded-full text-zinc-900 uppercase tracking-tighter shadow-sm">
                     New Arrival
                   </span>
                </div>

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (addToWishlist) {
                      addToWishlist({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        quantity: 1
                      });
                      toast.success(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist");
                    }
                  }}
                  className="absolute top-3 right-3 md:top-5 md:right-5 p-2 bg-white/80 backdrop-blur-md rounded-full transition-all shadow-sm z-30"
                >
                  <Heart className={cn(
                    "h-4 w-4 md:h-5 md:w-5 transition-colors",
                    isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-400 hover:text-red-500"
                  )} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 translate-y-full group-hover/img:translate-y-0 transition-transform duration-500 ease-out z-30">
                   <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (addToCart) {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl,
                          quantity: 1
                        });
                        toast.success("Added to Cart");
                      }
                    }}
                    className="w-full bg-zinc-900 text-white hover:bg-[#B59461] rounded-full font-bold h-10 md:h-12 shadow-2xl transition-colors border-none"
                   >
                     <ShoppingCart className="mr-2 h-4 w-4" /> 
                     <span className="hidden sm:inline">Add to Cart</span>
                     <span className="sm:hidden text-xs">Add</span>
                   </Button>
                </div>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center gap-1">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} className="h-2.5 w-2.5 md:h-3 md:w-3 fill-[#B59461] text-[#B59461]" />
                   ))}
                   <span className="text-[9px] md:text-[10px] text-zinc-400 font-bold ml-1 tracking-widest uppercase">Verified</span>
                </div>
                
                <Link href={`/product/${product.id}`} className="block group/title">
                  <h3 className="font-serif text-lg md:text-2xl text-zinc-900 font-bold leading-tight truncate group-hover/title:text-[#B59461] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-widest">
                  {product.category || "Luxury Care"}
                </p>

                <Link href={`/product/${product.id}`} className="pt-1 flex items-center justify-between">
                  <p className="text-lg md:text-2xl font-black text-[#B59461] italic">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                  <span className="text-[14px] md:text-[16px] text-zinc-300 font-medium line-through">
                    ₹{(Number(product.price) + 500).toLocaleString("en-IN")}
                  </span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-16 md:mt-24">
        <Link href="/shop">
          <Button variant="outline" className="rounded-full px-12 md:h-14 border-zinc-200 text-zinc-500 font-bold hover:border-[#B59461] hover:text-[#B59461] hover:bg-[#F9F6F0] transition-all duration-300 shadow-sm">
            Explore Full Boutique
          </Button>
        </Link>
      </div>
    </section>
  );
}