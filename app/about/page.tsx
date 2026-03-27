import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Leaf, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white pb-20">
      <Header />
      
      <div className="pt-32 md:pt-44 pb-20 px-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#50540b]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#50540b]">
            Our Heritage
          </span>
        </div>
        <h1 className="text-4xl md:text-7xl font-serif text-zinc-900 tracking-tight leading-tight">
          The Secret of <br />
          <span className="italic font-light">Timeless Beauty</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-[#F9F6F0] shadow-2xl">
            <Image 
              src="https://img.freepik.com/free-photo/young-caucasian-woman-is-sitting-bed-looking-mirror-skin-care-products-nearby_1268-21221.jpg?t=st=1774099817~exp=1774103417~hmac=dd98b500d8f1ca1aab66e682e189dec24d17d50f8532e4ac329709ef023340d0&w=1060" 
              alt="JMC Skincare Ritual" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <div className="space-y-8 lg:pl-10">
            <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 leading-tight">
              Crafted with <span className="italic text-[#50540b]">Nature's</span> Finest Elements
            </h2>
            <div className="space-y-6 text-zinc-500 leading-relaxed text-lg">
              <p>
                At JMC, we believe that true luxury lies in purity. Born from a desire to merge ancient botanical secrets with modern dermatological science, our rituals are designed to honor your skin's natural balance.
              </p>
              <p>
                Every drop of our signature serums and creams is meticulously formulated. We source only the rarest, 100% organic ingredients—from 24K pure gold flakes to wild-harvested botanicals—ensuring that your daily routine transforms into a sacred ritual of self-care.
              </p>
            </div>
            <div className="pt-6 border-t border-zinc-100 flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-serif font-bold text-zinc-900">10<span className="text-[#50540b]">+</span></p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Years of Research</p>
              </div>
              <div className="w-[1px] h-12 bg-zinc-200"></div>
              <div className="text-center">
                <p className="text-4xl font-serif font-bold text-zinc-900">100<span className="text-[#50540b]">%</span></p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Organic Pure</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F9F6F0] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-serif text-zinc-900">The JMC <span className="italic">Promise</span></h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Uncompromising quality and ethics in every bottle.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-[2.5rem] text-center space-y-4 shadow-sm hover:shadow-xl transition-shadow">
              <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-zinc-900">Clean & Organic</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Sourced directly from nature, free from harsh chemicals, parabens, and synthetic fragrances.</p>
            </div>
            
            <div className="bg-white p-10 rounded-[2.5rem] text-center space-y-4 shadow-sm hover:shadow-xl transition-shadow">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-zinc-900">Dermatologist Tested</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">Clinically proven to be safe, gentle, and highly effective for even the most sensitive skin types.</p>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] text-center space-y-4 shadow-sm hover:shadow-xl transition-shadow">
              <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartHandshake className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-serif font-bold text-zinc-900">Cruelty-Free</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">We love animals. Our products are never tested on animals, ensuring guilt-free luxury.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-32 text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 leading-tight">
          Ready to elevate your <br /><span className="italic text-[#50540b]">daily ritual?</span>
        </h2>
        <Link href="/shop" className="inline-block">
          <Button className="h-16 px-10 bg-zinc-900 hover:bg-[#50540b] text-white rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all duration-300">
            Explore The Collection
          </Button>
        </Link>
      </div>

    </main>
  );
}