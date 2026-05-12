"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type OrderFormData = Record<string, FormDataEntryValue | boolean | string>;

export function useOrderActions() {
  const router = useRouter();
  const { cart, appliedCoupon, clearCart } = useCartStore();

  const placeCODOrder = async (formData: OrderFormData) => {
    try {
      const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

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
          paymentMethod:
            formData.paymentMethod === "ONLINE" ? "ONLINE" : "COD",
          isPaid: formData.isPaid === true,
          coupon: appliedCoupon ? { code: appliedCoupon.code } : null,
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to place order";
      toast.error(message);
    }
  };

  return { placeCODOrder };
}