"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Loader2, CheckCircle2, ArrowRight, User, Mail, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendQuizResults, type QuizAiResult } from "@/actions/newsletter";
import { useCartStore } from "@/hooks/use-cart-store";
import { toast } from "sonner";

type Answers = Record<string, string>;

const questions = [
  { id: "type", q: "How does your skin feel midday?", options: ["Oily/Shiny", "Tight/Dry", "Oily in T-zone only", "Irritated/Red"] },
  { id: "concern", q: "What's your main goal?", options: ["Clear Acne", "Anti-Aging", "Brightening", "Deep Hydration"] },
  { id: "sensitivity", q: "How sensitive is your skin?", options: ["High", "Medium", "Low"] }
];

export function SkinQuizModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState<"form" | "quiz" | "loading" | "result">("form");
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<QuizAiResult | null>(null);

  const addToCart = useCartStore((s) => s.addToCart);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  if (!isOpen) return null;

  const inr = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const addAllRecommended = () => {
    if (!result?.recommendedProducts?.length) return;
    result.recommendedProducts.forEach((p) =>
      addToCart({
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
      })
    );
    toast.success("Ritual added to your bag");
    onClose();
    setTimeout(() => setCartOpen(true), 150);
  };

  const addOne = (p: NonNullable<QuizAiResult["recommendedProducts"]>[number]) => {
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
    });
    toast.success(`${p.name} added`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("quiz");
  };

  const handleOption = (option: string) => {
    const newAnswers = { ...answers, [questions[quizStep].id]: option };
    setAnswers(newAnswers);
    if (quizStep < questions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      processWithAI(newAnswers);
    }
  };

  const processWithAI = async (finalAnswers: Answers) => {
    setCurrentStep("loading");
    try {
      const res = await fetch("/api/skin-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          name: userData.name,
          email: userData.email,
        }),
      });
      const aiData = (await res.json()) as QuizAiResult;
      setResult(aiData);

      // Send Emails (with product cards included)
      await sendQuizResults(userData, aiData);

      setCurrentStep("result");
    } catch {
      toast.error("Something went wrong. Try again.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto bg-zinc-950/90 backdrop-blur-xl">
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 transition-colors z-50">
          <X className="h-6 w-6" />
        </button>

        <div className="p-8 md:p-12">
          {currentStep === "form" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif text-zinc-900 leading-tight">Identify Your Glow</h2>
                <p className="text-zinc-500 text-sm">Enter details to receive your AI ritual via email.</p>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    placeholder="Full Name" 
                    required 
                    className="h-14 pl-12 rounded-2xl bg-zinc-50 border-none focus-visible:ring-2 focus-visible:ring-[#B59461]"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
                    required 
                    className="h-14 pl-12 rounded-2xl bg-zinc-50 border-none focus-visible:ring-2 focus-visible:ring-[#B59461]"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full h-14 bg-[#B59461] hover:bg-[#967a4f] text-white rounded-full font-bold text-lg">
                  Next Step <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          )}

          {currentStep === "quiz" && (
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[#B59461] font-bold text-[10px] uppercase tracking-widest">Question {quizStep + 1}/3</p>
                <h2 className="text-2xl font-serif text-zinc-900 leading-tight">{questions[quizStep].q}</h2>
              </div>
              <div className="grid gap-3">
                {questions[quizStep].options.map((opt) => (
                  <button 
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="w-full p-5 rounded-2xl border-2 border-zinc-50 text-left font-medium hover:border-[#B59461] hover:bg-[#F9F6F0] transition-all group flex justify-between items-center"
                  >
                    <span className="text-zinc-700">{opt}</span>
                    <ArrowRight className="h-4 w-4 text-[#B59461] opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === "loading" && (
            <div className="py-20 text-center space-y-6">
              <Loader2 className="h-16 w-16 animate-spin text-[#B59461] mx-auto" />
              <p className="font-serif text-xl animate-pulse">JMC AI is crafting your ritual...</p>
            </div>
          )}

          {currentStep === "result" && result && (
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-[#B59461] mx-auto" />
                <h2 className="text-3xl font-serif text-zinc-900">Your AI Ritual</h2>
                <p className="text-xs text-zinc-500">Sent to your email too.</p>
              </div>

              <div className="bg-[#F9F6F0] p-6 rounded-3xl border border-[#B59461]/20 space-y-4">
                <div className="border-b border-[#B59461]/10 pb-4">
                  <p className="text-[10px] font-bold uppercase text-zinc-400">Skin Profile</p>
                  <p className="text-xl font-bold text-[#B59461] italic">{result.skinType}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase text-zinc-400">The Routine</p>
                  {result.routine.map((step, i) => (
                    <p key={i} className="text-sm leading-relaxed flex gap-3">
                      <span className="font-bold text-[#B59461]">{i+1}.</span> {step}
                    </p>
                  ))}
                </div>
                {result.expertAdvice && (
                  <p className="text-xs italic text-zinc-500 pt-2 border-t border-[#B59461]/10">
                    &ldquo;{result.expertAdvice}&rdquo;
                  </p>
                )}
              </div>

              {result.recommendedProducts && result.recommendedProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#B59461]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
                      Recommended for you
                    </p>
                  </div>
                  <div className="space-y-2">
                    {result.recommendedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3"
                      >
                        <Link
                          href={`/product/${p.id}`}
                          onClick={onClose}
                          className="relative h-14 w-14 rounded-xl overflow-hidden bg-[#F9F6F0] shrink-0"
                        >
                          {p.imageUrl && (
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${p.id}`} onClick={onClose}>
                            <p className="text-sm font-bold text-zinc-900 truncate leading-tight">
                              {p.name}
                            </p>
                          </Link>
                          {p.category && (
                            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">
                              {p.category}
                            </p>
                          )}
                          <p className="text-sm font-bold text-[#B59461] mt-0.5">
                            {inr(p.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addOne(p)}
                          className="h-10 px-3 rounded-lg bg-zinc-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shrink-0"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addAllRecommended}
                    className="w-full bg-[#B59461] hover:bg-[#967a4f] h-12 rounded-full text-white font-bold uppercase text-xs tracking-widest"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" /> Add full ritual to bag
                  </Button>
                </div>
              )}

              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-12 rounded-full border-zinc-200 font-bold uppercase text-[10px] tracking-widest"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}