"use client";
import { useState } from "react";
import { subscribeToNewsletter } from "@/actions/newsletter";
import { Mail, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await subscribeToNewsletter(formData);
    setLoading(false);

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-96 w-96 bg-[#B59461]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 h-96 w-96 bg-[#B59461]/5 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="bg-[#F9F6F0] rounded-[40px] p-8 md:p-16 border border-[#B59461]/10 text-center space-y-8 shadow-sm">
          
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-zinc-100 mb-2">
            <Sparkles className="h-3 w-3 text-[#B59461]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B59461]">Exclusive Access</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-serif text-zinc-900 tracking-tight">
              Get Glowing Skin Tips
            </h2>
            <p className="text-zinc-500 max-w-lg mx-auto leading-relaxed">
              Join 5,000+ members receiving weekly skincare rituals and secret offers. No spam, only beauty.
            </p>
          </div>

          {status === "success" ? (
            <div className="animate-in zoom-in duration-300 py-4">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="h-12 w-12 text-[#B59461]" />
                <p className="text-lg font-bold text-zinc-900">You're on the list! ✨</p>
                <p className="text-sm text-zinc-500">Check your email for a special welcome gift.</p>
              </div>
            </div>
          ) : (
            <form action={handleSubmit} className="relative max-w-md mx-auto group">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-[#B59461] transition-colors" />
                  <input 
                    name="email"
                    type="email" 
                    placeholder="yourname@email.com" 
                    required
                    className="w-full h-14 pl-12 pr-6 rounded-full border-2 border-white focus:border-[#B59461] bg-white shadow-xl shadow-zinc-200/50 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <Button 
                  disabled={loading}
                  className="h-14 w-full sm:w-auto px-10 bg-[#B59461] text-white rounded-full font-bold hover:bg-[#967a4f] transition-all shadow-lg shadow-[#B59461]/30 shrink-0"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Subscribe"}
                </Button>
              </div>
              {status === "error" && <p className="text-red-500 text-xs mt-3 font-medium">Something went wrong. Try again.</p>}
            </form>
          )}

          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
            Unsubscribe anytime. Your data is 100% secure.
          </p>
        </div>
      </div>
    </section>
  );
}