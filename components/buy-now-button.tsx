// components/buy-now-button.tsx
"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BuyNowButton({ product, isUserLoggedIn }: { product: any, isUserLoggedIn: boolean }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBuyNow = () => {
    setLoading(true);
    
    addToCart(product);

    if (isUserLoggedIn) {
      router.push("/checkout");
    } else {
      router.push("/login?callbackUrl=/checkout");
    }
  };

  return (
    <Button 
      onClick={handleBuyNow}
      disabled={loading}
      className="w-full h-14 bg-[#B59461] hover:bg-[#967a4f] text-white rounded-full font-black uppercase text-[11px] tracking-[0.2em] shadow-xl transition-all duration-300"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <span className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" /> Buy Now
        </span>
      )}
    </Button>
  );
}