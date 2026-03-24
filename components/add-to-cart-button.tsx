"use client";
import { useCartStore } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export function AddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <Button 
      onClick={() => addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl
      })}
      size="lg" 
      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-full h-14 font-black uppercase text-xs tracking-widest shadow-2xl"
    >
      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Bag
    </Button>
  );
}