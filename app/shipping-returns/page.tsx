import { Header } from "@/components/header";
import Link from "next/link";
import { Truck, RefreshCcw, Clock, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Shipping & Returns | JMC Skin Secrets",
  description: "Learn about our shipping policies, delivery times, and hassle-free return process for JMC luxury skincare products.",
};

export default function ShippingReturnsPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-[#B59461]/20">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#F9F6F0]/50 pt-32 pb-16 lg:pt-40 lg:pb-24 border-b border-[#B59461]/10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B59461]">Customer Care</p>
          <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 leading-tight">Shipping & Returns</h1>
          <p className="text-zinc-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Our commitment to your luxury experience extends from the moment you place your order to the first drop of our premium rituals on your skin.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24 space-y-20">
        
        {/* Shipping Policy Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
            <div className="h-12 w-12 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5 text-[#B59461]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-zinc-900">Shipping Policy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 p-6 rounded-2xl border border-zinc-100 bg-zinc-50/50">
              <Clock className="h-5 w-5 text-zinc-400 mb-2" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Processing Time</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                All JMC orders are hand-packaged with care. Orders are processed and dispatched within <span className="font-bold text-zinc-900">1-2 business days</span> (excluding weekends and public holidays).
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl border border-[#B59461]/20 bg-[#F9F6F0]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Truck className="h-24 w-24 text-[#B59461]" />
              </div>
              <ShieldCheck className="h-5 w-5 text-[#B59461] mb-2 relative z-10" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#B59461] relative z-10">Delivery Timelines</h3>
              <ul className="text-sm text-zinc-600 space-y-2 relative z-10">
                <li className="flex justify-between border-b border-[#B59461]/10 pb-1">
                  <span>Standard Shipping:</span>
                  <span className="font-bold text-zinc-900">3-5 Days</span>
                </li>
                <li className="flex justify-between border-b border-[#B59461]/10 pb-1">
                  <span>Express Shipping:</span>
                  <span className="font-bold text-zinc-900">1-2 Days</span>
                </li>
                <li className="flex justify-between pt-1">
                  <span className="text-[#B59461] font-bold text-xs uppercase">Orders over ₹5,000</span>
                  <span className="font-bold text-zinc-900 text-xs uppercase tracking-widest">FREE</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
            <div className="h-12 w-12 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100">
              <RefreshCcw className="h-5 w-5 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-zinc-900">Returns & Exchanges</h2>
          </div>

          <div className="prose prose-zinc max-w-none text-sm leading-relaxed text-zinc-600 space-y-6">
            <p>
              Due to the delicate and hygienic nature of luxury skincare products, we maintain a strict but fair return policy to ensure the highest safety standards for all our clients.
            </p>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Eligibility for Returns</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>We accept returns within <span className="font-bold text-zinc-900">7 days of delivery</span> only if the product is delivered damaged, defective, or if an incorrect item was shipped.</li>
                <li>Items must be entirely unused, unopened, and in their original luxury packaging with all seals intact.</li>
                <li>Used or opened products cannot be returned under any circumstances due to hygiene and quality control protocols.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">How to Initiate a Return</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>Email our concierge team at <a href="mailto:mr.deepanshujoshi@gmail.com" className="text-[#B59461] hover:underline font-bold">mr.deepanshujoshi@gmail.com</a> within 48 hours of receiving your order.</li>
                <li>Include your Order ID, a brief description of the issue, and clear unboxing photographs/videos of the damaged or incorrect item.</li>
                <li>Once approved, our team will arrange a complimentary return pickup from your address.</li>
                <li>Upon receiving and inspecting the returned item, a full refund will be initiated to your original payment method within 5-7 business days.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-zinc-900 text-white rounded-[2rem] p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B59461] to-transparent opacity-50"></div>
          
          <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <Mail className="h-6 w-6 text-[#B59461]" />
          </div>
          
          <h2 className="text-2xl font-serif font-bold">Still have questions?</h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Our luxury skincare concierges are available to assist you with any questions regarding your order, shipping, or our premium rituals.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button className="h-12 px-8 rounded-full bg-[#B59461] hover:bg-[#9a7b4f] text-white font-bold uppercase text-[10px] tracking-widest transition-colors w-full sm:w-auto">
                Contact Concierge
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" className="h-12 px-8 rounded-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white font-bold uppercase text-[10px] tracking-widest w-full sm:w-auto bg-transparent">
                Continue Shopping <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}