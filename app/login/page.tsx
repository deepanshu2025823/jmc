"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link"; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid Email or Password");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-zinc-50 font-sans">
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-40">
          <Image 
            src="https://img.freepik.com/free-photo/portrait-beautiful-sensual-brunette-woman-girl-elegant-beige-classic-clothes-wide-pants-model-isolated-white_158538-9421.jpg?t=st=1773858284~exp=1773861884~hmac=97593a955e920905a5be9f984154af3f04472e0ee976fbdbff83589b79a4eb92&w=1060" 
            alt="Luxury Skincare" 
            fill 
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent" />
        
        <div className="relative z-10 w-full max-w-lg text-white space-y-8">
          <div className="flex items-center gap-3 font-black tracking-widest text-3xl uppercase">
            <Sparkles className="h-8 w-8 text-white" />
            JMC
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Command Center</h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Manage your entire luxury skincare empire from one secure interface. Monitor sales, track inventory, and analyze customer behavior in real-time.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-300 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm w-fit">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            End-to-end encrypted connection
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="flex lg:hidden items-center gap-2 font-black tracking-widest text-2xl uppercase text-zinc-900 justify-center mb-8">
            <Sparkles className="h-8 w-8 text-zinc-900" />
            JMC
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome Back</h2>
            <p className="text-zinc-500 mt-2">Enter your admin credentials to access the dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 font-semibold">Admin Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="mr.deepanshujoshi@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 transition-all"
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-700 font-semibold">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 transition-all"
                required 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-md tracking-wide flex items-center justify-center gap-2 group transition-all" 
              disabled={loading}
            >
              {loading ? "Authenticating..." : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-8 mt-8 border-t border-zinc-100 text-center text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} JMC Luxury Skincare. Secure Admin Portal.
          </div>
        </div>
      </div>
    </div>
  );
}