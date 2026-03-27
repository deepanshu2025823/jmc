"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("id");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ userId, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setStatus("success");
      setTimeout(() => router.push("/login"), 3000);
    } else {
      setStatus("error");
    }
    setLoading(false);
  };

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center text-emerald-500">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold">Password Updated!</h2>
        <p className="text-zinc-500 text-sm">Your password has been changed successfully. Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <div className="space-y-2">
        <Label>New Password</Label>
        <Input 
          type="password" placeholder="••••••••" 
          value={password} onChange={(e) => setPassword(e.target.value)} required 
        />
      </div>
      <div className="space-y-2">
        <Label>Confirm New Password</Label>
        <Input 
          type="password" placeholder="••••••••" 
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
        />
      </div>
      {status === "error" && <p className="text-xs text-red-500 text-center">Failed to update. Try again.</p>}
      <Button type="submit" className="w-full bg-zinc-900" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Update Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-8 w-8 text-zinc-900" />
          </div>
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-zinc-500 text-sm mt-1">Please enter a strong password to secure your account.</p>
        </div>
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin mx-auto" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}