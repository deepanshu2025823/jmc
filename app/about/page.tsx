import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck, Sun, Moon, Droplets } from "lucide-react";
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
          The Story Behind <br />
          <span className="italic font-light">Timeless Beauty</span>
        </h1>
        <p>31 years of experience, crafted into every product.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-[#F9F6F0] shadow-2xl">
            <Image 
              src="https://drive.google.com/uc?export=view&id=1-0ugLD7y_cvV43PiJ36Uzft2ZVPfGF6T" 
              alt="JMC Skincare Ritual" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <div className="space-y-8 lg:pl-10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#50540b]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#50540b]">Founder Story</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 leading-tight">
              Meet <span className="text-[#50540b]">Jaya Marwa</span>
            </h2>
            <div className="space-y-6 text-zinc-500 leading-relaxed text-lg">
              <p>
                For over 31 years, Jaya Marwa dedicated her life to skincare, beauty, and makeup—personally caring for every client who walked into her salon.
              </p>
              <p>
                With time, she decided to close that chapter. But just six months before stepping away, something changed. A new journey began.
              </p>
              <p>
                What started as a small step—creating and recommending a simple face wash to close friends and family—quickly turned into something bigger. The feedback was real, honest, and powerful.
              </p>
              <p className="font-medium text-zinc-900 italic">
                People loved the results. They asked for more.
              </p>
            </div>
            <div className="pt-6 border-t border-zinc-100 flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-serif font-bold text-zinc-900">31<span className="text-[#50540b]">+</span></p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Years of Expertise</p>
              </div>
              <div className="w-[1px] h-12 bg-zinc-200"></div>
              <div className="text-center">
                <p className="text-4xl font-serif font-bold text-zinc-900">100<span className="text-[#50540b]">%</span></p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Real Results</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F9F6F0] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-serif text-zinc-900">From Trust to <span className="italic">Transformation</span></h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-lg">Encouraged by genuine support, Jaya expanded her range. Every product is built on years of hands-on experience and real customer needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-serif font-bold text-zinc-900 mb-6 text-center">The Foundation</h3>
              <ul className="space-y-4 text-zinc-600">
                <li className="flex items-center gap-4"><Droplets className="h-5 w-5 text-[#50540b]" /> Face Wash</li>
                <li className="flex items-center gap-4"><Sun className="h-5 w-5 text-[#50540b]" /> Sunscreen (SPF 50)</li>
                <li className="flex items-center gap-4"><Moon className="h-5 w-5 text-[#50540b]" /> Night Reversal Cream</li>
                <li className="flex items-center gap-4"><Sparkles className="h-5 w-5 text-[#50540b]" /> Shampoo & Conditioner</li>
              </ul>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-serif font-bold text-zinc-900 mb-6 text-center">Growing Further</h3>
              <ul className="space-y-4 text-zinc-600">
                <li className="flex items-center gap-4"><Droplets className="h-5 w-5 text-[#50540b]" /> Serums</li>
                <li className="flex items-center gap-4"><Sparkles className="h-5 w-5 text-[#50540b]" /> Facial Kits</li>
                <li className="flex items-center gap-4"><ShieldCheck className="h-5 w-5 text-[#50540b]" /> Advanced Skincare Solutions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-serif text-zinc-900">Crafted for <span className="italic text-[#50540b]">Real Results</span></h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">Our products are not just made—they are tested through real experience.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-zinc-50 p-8 rounded-[2rem] text-center space-y-4">
            <h3 className="font-serif font-bold text-zinc-900 text-lg">Universal</h3>
            <p className="text-zinc-500 text-sm">Designed for all skin types</p>
          </div>
          <div className="bg-zinc-50 p-8 rounded-[2rem] text-center space-y-4">
            <h3 className="font-serif font-bold text-zinc-900 text-lg">Hydration & Glow</h3>
            <p className="text-zinc-500 text-sm">Focused on hydration, glow & anti-ageing</p>
          </div>
          <div className="bg-zinc-50 p-8 rounded-[2rem] text-center space-y-4">
            <h3 className="font-serif font-bold text-zinc-900 text-lg">Clear Skin</h3>
            <p className="text-zinc-500 text-sm">Made to reduce blemishes, freckles & wrinkles</p>
          </div>
          <div className="bg-zinc-50 p-8 rounded-[2rem] text-center space-y-4">
            <h3 className="font-serif font-bold text-zinc-900 text-lg">Natural Finish</h3>
            <p className="text-zinc-500 text-sm">Lightweight, natural-looking finish (no heavy makeup feel)</p>
          </div>
        </div>
        
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <p className="text-xl text-zinc-600 italic font-serif">
            "From a color-adapting BB cream to deeply nourishing night treatments, each product blends seamlessly with your skin—enhancing, not hiding."
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 text-white py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-serif">Your Daily <span className="italic text-[#d9df7a]">Ritual</span></h2>
            <p className="text-zinc-400">Simple, effective, and transformative.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-6 border border-zinc-800 p-10 rounded-[2.5rem] bg-zinc-800/30 relative overflow-hidden group hover:border-[#d9df7a]/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sun className="h-24 w-24 text-[#d9df7a]" />
              </div>
              <div className="flex items-center gap-4 pb-4">
                <h3 className="text-2xl font-serif text-[#d9df7a]">Morning</h3>
              </div>
              <ul className="space-y-6 text-zinc-300 relative z-10">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d9df7a]/20 text-[#d9df7a] flex items-center justify-center text-xs font-bold mt-1">1</div>
                  <div>Cleanse with Face Wash</div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d9df7a]/20 text-[#d9df7a] flex items-center justify-center text-xs font-bold mt-1">2</div>
                  <div>
                    Apply SPF 50 Sunscreen
                    <p className="text-sm text-zinc-500 mt-1">Light tint, no white cast</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="space-y-6 border border-zinc-800 p-10 rounded-[2.5rem] bg-zinc-800/30 relative overflow-hidden group hover:border-[#d9df7a]/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Moon className="h-24 w-24 text-[#d9df7a]" />
              </div>
              <div className="flex items-center gap-4 pb-4">
                <h3 className="text-2xl font-serif text-[#d9df7a]">Night</h3>
              </div>
              <ul className="space-y-6 text-zinc-300 relative z-10">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d9df7a]/20 text-[#d9df7a] flex items-center justify-center text-xs font-bold mt-1">1</div>
                  <div>Cleanse again</div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d9df7a]/20 text-[#d9df7a] flex items-center justify-center text-xs font-bold mt-1">2</div>
                  <div>Apply Night Cream</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center space-y-8 max-w-3xl mx-auto bg-zinc-800/40 p-10 rounded-[2.5rem] border border-zinc-800">
            <h4 className="text-xl font-serif text-[#d9df7a]">With consistent use, skin feels:</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm font-medium tracking-wide">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-[#d9df7a]" />
                <span>More moisturized</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-600"></div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#d9df7a]" />
                <span>Naturally glowing</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-600"></div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#d9df7a]" />
                <span>Visibly smoother over time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-32 text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 leading-tight">
          Ready to Begin Your <br /><span className="italic text-[#50540b]">Skin Journey?</span>
        </h2>
        <p className="text-zinc-500 text-lg max-w-xl mx-auto">
          Experience skincare built on trust, care, and 3 decades of expertise.
        </p>
        <Link href="/shop" className="inline-block pt-4">
          <Button className="h-16 px-10 bg-zinc-900 hover:bg-[#50540b] text-white rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all duration-300">
            Explore Our Collection
          </Button>
        </Link>
      </div>

    </main>
  );
}