"use client";
import { useState } from "react";
import { X, Loader2, CheckCircle2, ArrowRight, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendQuizResults } from "@/actions/newsletter";

const questions = [
  { id: "type", q: "How does your skin feel midday?", options: ["Oily/Shiny", "Tight/Dry", "Oily in T-zone only", "Irritated/Red"] },
  { id: "concern", q: "What's your main goal?", options: ["Clear Acne", "Anti-Aging", "Brightening", "Deep Hydration"] },
  { id: "sensitivity", q: "How sensitive is your skin?", options: ["High", "Medium", "Low"] }
];

export function SkinQuizModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState<"form" | "quiz" | "loading" | "result">("form");
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

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

  const processWithAI = async (finalAnswers: any) => {
    setCurrentStep("loading");
    try {
      const res = await fetch("/api/skin-quiz", {
        method: "POST",
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const aiData = await res.json();
      setResult(aiData);
      
      // Send Emails
      await sendQuizResults(userData, aiData);
      
      setCurrentStep("result");
    } catch (e) {
      alert("Something went wrong. Try again.");
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
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-[#B59461] mx-auto" />
                <h2 className="text-3xl font-serif text-zinc-900">Your AI Ritual</h2>
              </div>
              <div className="bg-[#F9F6F0] p-6 rounded-3xl border border-[#B59461]/20 space-y-4">
                <div className="border-b border-[#B59461]/10 pb-4">
                  <p className="text-[10px] font-bold uppercase text-zinc-400">Skin Profile</p>
                  <p className="text-xl font-bold text-[#B59461] italic">{result.skinType}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase text-zinc-400">The Routine</p>
                  {result.routine.map((step: string, i: number) => (
                    <p key={i} className="text-sm leading-relaxed flex gap-3">
                      <span className="font-bold text-[#B59461]">{i+1}.</span> {step}
                    </p>
                  ))}
                </div>
              </div>
              <Button onClick={onClose} className="w-full bg-zinc-900 h-14 rounded-full text-white font-bold">
                Done & Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}