// app/order-success/page.tsx

"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setOrderId(searchParams.get("id"));
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center pt-44 px-6 text-center">
      <div className="bg-white rounded-[3rem] p-10 md:p-16 max-w-2xl w-full shadow-xl border border-zinc-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-center mb-8">
          <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-50"></div>
            <CheckCircle2 className="h-12 w-12 text-emerald-500 relative z-10" />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#B59461]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B59461]">
            Order Confirmed
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight leading-tight mb-4">
          Thank you for your <span className="italic font-light">Purchase</span>
        </h1>
        
        <p className="text-zinc-500 text-sm md:text-md leading-relaxed mb-8 max-w-md mx-auto">
          Your luxury skincare ritual is being prepared. We will send you an email with shipping details shortly.
        </p>

        <div className="bg-[#F9F6F0] rounded-2xl p-6 mb-10 flex items-center justify-center gap-4 border border-[#B59461]/20">
          <Package className="h-5 w-5 text-[#B59461]" />
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Order Reference</p>
            <p className="font-mono font-bold text-zinc-900">{orderId ? `#${orderId.slice(0, 10).toUpperCase()}` : "Processing..."}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/profile" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-14 bg-zinc-900 text-white rounded-full font-bold uppercase text-[10px] tracking-widest px-8 shadow-lg hover:bg-[#B59461] transition-all">
              Track Order
            </Button>
          </Link>
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-14 rounded-full font-bold uppercase text-[10px] tracking-widest px-8 border-zinc-200 hover:bg-zinc-50">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-zinc-50 pb-20">
      <Header />
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center pt-44 px-6">
           <Loader2 className="h-10 w-10 text-[#B59461] animate-spin" />
        </div>
      }>
        <OrderSuccessContent />
      </Suspense>
    </main>
  );
}