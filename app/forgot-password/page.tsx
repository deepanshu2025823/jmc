"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setMessage("Reset link sent! Please check your email.");
    } else {
      setMessage("User not found or something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <Link href="/login" className="text-sm text-zinc-500 flex items-center gap-2 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Forgot Password?</h1>
          <p className="text-zinc-500 text-sm mt-1">No worries, we'll send you reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" type="email" placeholder="name@example.com" 
              value={email} onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>
          {message && (
            <div className={`p-3 rounded-md text-sm ${message.includes('sent') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
          <Button type="submit" className="w-full bg-zinc-900" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
}