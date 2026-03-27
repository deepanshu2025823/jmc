"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, Ticket, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner"; 

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, appliedCoupon, setCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.type === "FIXED" 
      ? appliedCoupon.discount 
      : (subtotal * appliedCoupon.discount) / 100;
  }

  const total = subtotal - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to validate coupon");
      
      setCoupon({ 
        code: data.code, 
        discount: data.discountValue, 
        type: data.type 
      });
      toast.success("Coupon applied successfully!");
      setCouponCode("");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-40 pb-20">
        <h1 className="text-4xl md:text-5xl font-serif mb-12 italic">
          Your <span className="not-italic">Selection</span>
        </h1>

        {cart.length === 0 ? (
          <div className="py-20 text-center bg-zinc-50 rounded-[3rem] space-y-6">
            <ShoppingBag className="h-16 w-16 text-zinc-200 mx-auto" />
            <p className="text-xl font-serif text-zinc-400">Your bag is empty.</p>
            <Link href="/shop" className="inline-block">
              <Button className="bg-zinc-900 text-white rounded-full px-8 h-12 uppercase text-[10px] font-bold tracking-widest">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-8">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-6 border-b pb-8 group animate-in fade-in slide-in-from-bottom-3">
                  <div className="relative h-44 w-full sm:w-36 rounded-3xl overflow-hidden bg-[#F9F6F0] shrink-0 border border-zinc-100">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-[#50540b] uppercase tracking-[0.2em] mb-1">Luxury Ritual</p>
                        <h3 className="text-xl font-serif font-bold text-zinc-900">{item.name}</h3>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-zinc-300 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center border border-zinc-200 rounded-full px-4 py-2 gap-6 bg-white shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, 'minus')}
                          className="hover:text-[#50540b] transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 'plus')}
                          className="hover:text-[#50540b] transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-2xl font-black text-[#50540b] italic">
                        ₹{(Number(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-zinc-100 rounded-[2rem] p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-[#50540b]">
                  <Ticket className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Apply Promo Code</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-bold font-mono uppercase">{appliedCoupon.code}</span>
                    </div>
                    <button 
                      onClick={() => setCoupon(null)} 
                      className="text-[10px] underline font-bold uppercase tracking-tighter"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      placeholder="Enter code..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-sm outline-none focus:ring-1 ring-[#50540b] transition-all"
                    />
                    <Button 
                      onClick={handleApplyCoupon} 
                      disabled={loading} 
                      className="rounded-xl bg-zinc-900 text-white px-6 hover:bg-black"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-[#F9F6F0] rounded-[2.5rem] p-8 space-y-6 sticky top-40 shadow-sm border border-zinc-100">
                <h2 className="text-xl font-serif font-bold text-zinc-900">Summary</h2>
                <div className="space-y-4 border-b border-zinc-200 pb-6">
                  <div className="flex justify-between text-zinc-500 text-sm font-medium">
                    <span>Subtotal</span>
                    <span className="text-zinc-900 font-bold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 text-sm font-bold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>- ₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500 text-sm font-medium">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">Complimentary</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-serif text-lg text-zinc-600">Total Amount</span>
                  <span className="text-3xl font-black text-[#50540b]">₹{total.toLocaleString()}</span>
                </div>

                <Link href="/checkout" className="block pt-4">
                  <Button className="w-full h-16 bg-zinc-900 hover:bg-[#50540b] text-white rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all duration-300">
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <p className="text-[9px] text-center font-bold text-zinc-400 uppercase tracking-widest">
                  Secure encrypted checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}