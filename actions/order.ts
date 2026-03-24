"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useOrderActions() {
  const router = useRouter();
  const { cart, appliedCoupon, clearCart } = useCartStore(); 

  const placeCODOrder = async (formData: any) => {
    try {
      const subtotal = cart.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);
      
      let discount = 0;
      if (appliedCoupon) {
        discount = appliedCoupon.type === "FIXED" 
          ? appliedCoupon.discount 
          : (subtotal * appliedCoupon.discount) / 100;
      }

      const totalAmount = subtotal - discount;

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingDetails: formData,
          items: cart,
          totalAmount: totalAmount,
          paymentMethod: "COD",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Order Placed Successfully!");
        clearCart(); 
        router.push(`/order-success?id=${data.id}`);
      } else {
        throw new Error(data.error || "Failed to place order");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return { placeCODOrder };
}