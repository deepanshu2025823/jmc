import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-[#F9F6F0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 lg:pt-32 lg:pb-24 flex flex-col lg:flex-row items-center">
        <div className="flex-1 space-y-8 z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-zinc-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#50540b]">Luxury Skincare Expert</span>
          </div>
          <h1 className="text-4xl lg:text-7xl font-serif text-zinc-900 leading-[1.1]">
            Radiant Skin <br /> <span className="italic text-[#50540b]">Starts Here</span>
          </h1>
          <p className="text-zinc-600 max-w-lg text-[12px] md:text-xl leading-relaxed mx-auto lg:mx-0">
            Experience the perfection of nature-meets-science with our premium skincare range tailored for your unique beauty.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            
            <Link href="/shop">
              <Button size="lg" className="bg-[#50540b] hover:bg-[#967a4f] text-white rounded-full px-8 h-14 text-md shadow-lg shadow-[#50540b]/20">
                Shop the Collection <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/contact" className="text-zinc-900 font-bold border-b-2 border-zinc-900 pb-1 hover:text-[#50540b] transition-colors">
              Contact Us
            </Link>

          </div>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8 opacity-70">
            <div className="text-center lg:text-left">
              <p className="font-bold text-xl">50K+</p>
              <p className="text-xs uppercase tracking-tighter text-zinc-500">Happy Clients</p>
            </div>
            <div className="text-center lg:text-left border-x px-8 border-zinc-200">
              <p className="font-bold text-xl">4.9★</p>
              <p className="text-xs uppercase tracking-tighter text-zinc-500">Avg Rating</p>
            </div>
            <div className="text-center lg:text-left">
              <p className="font-bold text-xl">100+</p>
              <p className="text-xs uppercase tracking-tighter text-zinc-500">Products</p>
            </div>
          </div>
        </div>

        <div className="flex-1 relative mt-16 lg:mt-0 w-full max-w-xl">
          <div className="relative aspect-[4/5] rounded-t-full overflow-hidden border-[12px] border-white shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1552046122-03184de85e08?q=80&w=1974&auto=format&fit=crop"
              alt="Model with glowing skin"
              fill
              className="object-cover"
              priority 
              sizes="(max-width: 768px) 100vw, 33vw" 
            />
          </div>
          <div className="absolute top-10 right-0 bg-white p-4 rounded-2xl shadow-xl border flex flex-col items-center gap-1 animate-bounce">
            <p className="text-lg font-black italic">4.9★</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase">10k+ Reviews</p>
          </div>
        </div>
      </div>
    </section>
  );
}