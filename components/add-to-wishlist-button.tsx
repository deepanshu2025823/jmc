"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AddToWishlistButton({ product }: { product: any }) {
  const store = useCartStore();
  const wishlist = store?.wishlist || [];
  const addToWishlist = store?.addToWishlist;
  const setWishlistOpen = store?.setWishlistOpen;

  const isInWishlist = wishlist.some((item: any) => item.id === product.id);

  const handleWishlist = () => {
    if (isInWishlist) {
      toast.info("Item is already in your wishlist.");
      setWishlistOpen(true); 
    } else {
      addToWishlist(product);
      toast.success("Added to your Rituals Wishlist");
      setWishlistOpen(true); 
    }
  };

  return (
    <Button 
      onClick={handleWishlist}
      variant="outline" 
      className={cn(
        "h-14 rounded-full border-zinc-200 font-bold uppercase text-[10px] tracking-widest transition-all",
        isInWishlist ? "bg-[#F9F6F0] text-[#B59461] border-[#B59461]/30" : "hover:bg-[#F9F6F0]"
      )}
    >
      <Heart className={cn("h-4 w-4 mr-2", isInWishlist ? "fill-[#B59461] text-[#B59461]" : "text-zinc-600")} /> 
      {isInWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
    </Button>
  );
}