"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Loader2, Mail, ArrowLeft } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link"; 
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile"; 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isAdminFlow = callbackUrl.includes("/admin");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid Admin Credentials");
      toast.error("Access Denied");
      setLoading(false);
    } else {
      toast.success("Welcome to Command Center");
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handleSendOTP = async () => {
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setIsOtpStep(true);
        toast.success("Verification code sent!");
      } else {
        toast.error("Failed to send OTP. Please check your network.");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Please enter the complete 6-digit code.");
    
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      otp,
      redirect: false,
      callbackUrl,
    });

    if (result?.ok) {
      toast.success("Verified successfully");
      router.push(callbackUrl);
      router.refresh();
    } else {
      toast.error("Invalid verification code");
      setOtp(""); 
      inputRefs.current[0]?.focus(); 
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); 
    if (val) {
      const newOtp = otp.split("");
      newOtp[index] = val.slice(-1); 
      const combinedOtp = newOtp.join("");
      setOtp(combinedOtp);
      if (index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newOtp = otp.split("");
      if (newOtp[index]) {
        newOtp[index] = "";
        setOtp(newOtp.join(""));
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  useEffect(() => {
    if (isOtpStep) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOtpStep]);

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
              {!isAdminFlow ? "The Art of" : "Command"} <br />
              <span className="italic text-[#50540b] font-light">
                {!isAdminFlow ? "Radiant Skin" : "Center"}
              </span>
            </h1>
            <p className="text-zinc-400 text-sm lg:text-base leading-relaxed max-w-sm">
              {!isAdminFlow 
                ? "Verify your identity to access your bespoke luxury skincare rituals. Seamless and highly secure."
                : "Manage your entire luxury skincare empire from one secure interface."}
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
              {!isAdminFlow ? "Client Portal" : "Admin Login"}
            </h2>
            <p className="text-zinc-500 text-sm md:text-base">
              {!isAdminFlow ? "Enter your email to receive a secure access code." : "Enter your credentials to proceed."}
            </p>
          </div>

          <div className="bg-white lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-[2rem] shadow-xl lg:shadow-none border border-zinc-100 lg:border-none">
            
            {isAdminFlow && (
              <form onSubmit={handleAdminLogin} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {error && <div className="p-4 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl text-center uppercase tracking-widest">{error}</div>}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Admin Email</Label>
                  <Input type="email" placeholder="admin@jmc.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-14 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b] focus:ring-[#50540b]/20 transition-all" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password</Label>
                    <Link href="/forgot-password" className="text-[10px] font-bold text-[#50540b] hover:text-zinc-900 transition-colors uppercase tracking-widest">Forgot?</Link>
                  </div>
                  <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-14 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b] focus:ring-[#50540b]/20 transition-all" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-zinc-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#50540b] transition-all shadow-lg hover:shadow-xl mt-4">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Access Dashboard <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>
            )}

            {!isAdminFlow && (
              <div className="relative">
                {!isOtpStep ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email Address</Label>
                      <Input 
                        type="email" 
                        placeholder="client@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="h-14 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b] focus:ring-[#50540b]/20 transition-all px-5" 
                      />
                    </div>
                    <Button onClick={handleSendOTP} disabled={loading} className="w-full h-14 rounded-xl bg-zinc-900 hover:bg-[#50540b] text-white font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg hover:shadow-xl mt-4">
                      {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Send Access Code <Mail className="ml-2 h-4 w-4" /></>}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="space-y-4 text-center">
                      <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Code sent to <br/><span className="text-zinc-900 lowercase tracking-normal text-sm mt-1 inline-block">{email}</span>
                      </Label>
                      
                      <div className="flex justify-center gap-2 md:gap-3 pt-2">
                        {[...Array(6)].map((_, i) => (
                          <input
                            key={i}
                            ref={(el) => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otp[i] || ""}
                            onChange={(e) => handleOtpChange(i, e)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-serif font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[#50540b] focus:ring-2 focus:ring-[#50540b]/20 outline-none transition-all shadow-sm"
                          />
                        ))}
                      </div>

                    </div>
                    <div className="space-y-4 pt-2">
                      <Button type="submit" disabled={loading || otp.length < 6} className="w-full h-14 rounded-xl bg-[#50540b] hover:bg-[#967a4f] text-white font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg hover:shadow-xl disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify & Enter"}
                      </Button>
                      <button 
                        type="button" 
                        onClick={() => { setIsOtpStep(false); setOtp(""); }} 
                        className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                      >
                        <ArrowLeft className="h-3 w-3" /> Change Email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin h-8 w-8 text-[#50540b]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}