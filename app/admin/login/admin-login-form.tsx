"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (res?.error) {
      setError("Invalid Admin Credentials");
      toast.error("Access Denied");
      setLoading(false);
    } else {
      toast.success("Welcome to Command Center");
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden items-center justify-center p-12 lg:p-20">
        <div className="absolute inset-0 opacity-50">
          <Image
            src="https://img.freepik.com/free-photo/portrait-beautiful-sensual-brunette-woman-girl-elegant-beige-classic-clothes-wide-pants-model-isolated-white_158538-9421.jpg"
            alt="Luxury visual" fill className="object-cover" priority
            sizes="50vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <div className="relative z-10 w-full max-w-lg text-white space-y-8 mt-auto">
          <div className="flex items-center gap-2 font-black tracking-[0.2em] text-2xl uppercase">
            <Sparkles className="h-6 w-6 text-[#50540b]" /> JMC
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif text-white leading-tight mb-4">
              Command <br />
              <span className="italic text-[#50540b] font-light">Center</span>
            </h1>
            <p className="text-zinc-400 text-sm lg:text-base leading-relaxed max-w-sm">
              Manage your entire luxury skincare empire from one secure interface.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 md:p-16 lg:p-24 relative bg-zinc-50/30 lg:bg-white">

        <div className="lg:hidden absolute top-8 left-6 sm:left-12 flex items-center gap-2 font-black tracking-widest text-xl uppercase text-zinc-900">
          <Sparkles className="h-5 w-5 text-[#50540b]" /> JMC
        </div>

        <div className="w-full max-w-md mx-auto space-y-10 mt-16 lg:mt-0">
          <div className="text-left space-y-3">
            <h2 className="text-3xl md:text-4xl font-serif text-zinc-900 tracking-tight">
              Admin Login
            </h2>
            <p className="text-zinc-500 text-sm md:text-base">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <div className="bg-white lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-[2rem] shadow-xl lg:shadow-none border border-zinc-100 lg:border-none">
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {error && (
                <div className="p-4 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl text-center uppercase tracking-widest">
                  {error}
                </div>
              )}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Admin Email</Label>
                <Input
                  type="text"
                  placeholder="admin@jmc.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="h-14 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b] focus:ring-[#50540b]/20 transition-all"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password</Label>
                  <Link href="/forgot-password" className="text-[10px] font-bold text-[#50540b] hover:text-zinc-900 transition-colors uppercase tracking-widest">Forgot?</Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b] focus:ring-[#50540b]/20 transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl bg-zinc-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#50540b] transition-all shadow-lg hover:shadow-xl mt-4"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Access Dashboard <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 pt-6 border-t border-zinc-100">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            End-to-end encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
