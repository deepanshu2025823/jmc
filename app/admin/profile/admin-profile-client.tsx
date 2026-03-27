"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, Calendar, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateAdminProfile } from "@/actions/admin";

export function AdminProfileClient({ user }: { user: any }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email); 
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!name.trim()) {
      return toast.error("Name cannot be empty");
    }
    if (!email.trim() || !email.includes("@")) {
      return toast.error("Please enter a valid email address");
    }

    startTransition(async () => {
      const res = await updateAdminProfile(user.id, name, email); 
      if (res.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.error || "Something went wrong.");
      }
    });
  };

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric'
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-5xl">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Admin Profile</h1>
        <p className="text-sm sm:text-base text-zinc-500">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4">
          <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden rounded-[2rem]">
            <div className="h-32 bg-zinc-900 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-24 w-24 bg-[#B59461] rounded-full border-4 border-white flex items-center justify-center text-white text-4xl font-serif shadow-lg">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
            <CardContent className="pt-16 pb-8 text-center px-6">
              <h2 className="text-xl font-bold text-zinc-900">{name}</h2>
              <p className="text-xs text-zinc-500 mt-1">{email}</p>
              
              <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-500 font-medium">
                    <ShieldCheck className="h-4 w-4 text-[#B59461]" /> Role
                  </span>
                  <span className="font-bold text-zinc-900 uppercase tracking-widest text-[10px] bg-zinc-100 px-3 py-1 rounded-full">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-500 font-medium">
                    <Calendar className="h-4 w-4 text-[#B59461]" /> Joined
                  </span>
                  <span className="font-bold text-zinc-900 text-xs">
                    {joinedDate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="border-zinc-200 shadow-sm bg-white rounded-[2rem]">
            <CardHeader className="pb-6 border-b border-zinc-100 px-8 pt-8">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900">
                <User className="h-5 w-5 text-[#B59461]" /> General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461] font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="pl-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461] font-medium" 
                  />
                </div>
                <p className="text-xs text-amber-600 font-medium mt-2">
                  Warning: Changing your email will log you out, and you must use the new email for future logins.
                </p>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleSave}
                  disabled={isPending || (name === user.name && email === user.email)}
                  className="h-12 px-8 rounded-xl bg-zinc-900 hover:bg-[#B59461] text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}