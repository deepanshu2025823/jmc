"use client";
import { useState } from "react";
import { Sparkles, ArrowRight, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SkinQuizModal } from "./skin-quiz-modal";

export function QuizBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="px-4 py-16 md:px-10">
        <div className="max-w-7xl mx-auto relative rounded-[3rem] overflow-hidden bg-zinc-900 group">
          
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1590156221173-ec849e6d015c"
              alt="Skincare Texture"
              fill
              className="object-cover opacity-50 transition-transform duration-1000 group-hover:scale-110"
              priority
              unoptimized 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-transparent"></div>
          </div>

          <div className="relative z-10 p-8 md:p-20 flex flex-col lg:flex-row items-center gap-12">
            
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#50540b]/20 border border-[#50540b]/30 px-4 py-1.5 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-[#50540b]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#50540b]">AI Skin Analysis</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-serif text-white leading-[1.1]">
                Find Your <br />
                <span className="italic text-[#50540b]">Perfect Ritual</span>
              </h2>
              
              <p className="text-zinc-400 max-w-lg text-lg leading-relaxed">
                Answer a few simple questions and JMC Pro 2.5 Flash will curate a routine just for you.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  size="lg" 
                  className="bg-[#50540b] hover:bg-[#967a4f] text-white rounded-full px-10 h-14 text-md font-bold group/btn shadow-xl shadow-[#50540b]/20"
                >
                  Start Skin Quiz 
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
                <p className="text-zinc-500 text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#50540b]" /> Powered by JMC Pro
                </p>
              </div>
            </div>

            <div className="flex-1 w-full max-w-md hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-[#50540b] blur-[100px] opacity-20"></div>
                
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] space-y-8 shadow-2xl">
                  <div className="flex justify-between items-start">
                    <div className="h-14 w-14 rounded-2xl bg-[#50540b] flex items-center justify-center shadow-lg shadow-[#50540b]/40">
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-2xl">98%</p>
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Accuracy Rate</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
                      <span>AI Analysis Engine</span>
                      <span className="text-[#50540b]">JMC 2.5 Flash</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#50540b] w-1/3 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 opacity-50">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-zinc-300 text-center font-bold uppercase">Oiliness</div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-zinc-300 text-center font-bold uppercase">Texture</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SkinQuizModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}