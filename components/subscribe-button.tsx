"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Repeat, Sparkles, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { startSubscription } from "@/actions/subscription";

interface Props {
  productId: string;
  productName: string;
  basePrice: number;
  discountPct: number;
  intervalMonths: number;
  isUserLoggedIn: boolean;
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function SubscribeButton({
  productId,
  productName,
  basePrice,
  discountPct,
  intervalMonths,
  isUserLoggedIn,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const subPrice = Math.round(basePrice * (1 - discountPct / 100));
  const savings = basePrice - subPrice;

  const handleSubscribe = () => {
    if (!isUserLoggedIn) {
      toast.error("Please log in to subscribe");
      router.push(`/login?callbackUrl=/product/${productId}`);
      return;
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof typeof shipping)[] = ["name", "phone", "address", "city", "state", "pincode"];
    for (const k of required) {
      if (!shipping[k].trim()) {
        return toast.error(`Please enter ${k}`);
      }
    }
    startTransition(async () => {
      const res = await startSubscription({ productId, shipping });
      if (res.success && res.authUrl) {
        toast.success("Redirecting to Razorpay to authenticate…");
        window.location.href = res.authUrl;
      } else {
        toast.error(res.error || "Could not start subscription");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSubscribe}
        className="w-full h-14 rounded-full border-2 border-[#B59461] text-[#B59461] font-bold uppercase text-[10px] tracking-widest hover:bg-[#B59461] hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Repeat className="h-4 w-4" />
        Subscribe & Save {discountPct}% · {inr(subPrice)}
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl">
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="bg-gradient-to-br from-[#B59461] to-[#50540b] text-white px-8 py-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Subscribe & Save
                </p>
              </div>
              <h2 className="font-serif text-2xl mt-1">{productName}</h2>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>Every {intervalMonths} month{intervalMonths > 1 ? "s" : ""}</span>
                <div className="text-right">
                  <p className="text-xs line-through opacity-70">{inr(basePrice)}</p>
                  <p className="text-xl font-bold">{inr(subPrice)}</p>
                </div>
              </div>
              <p className="text-[10px] mt-2 opacity-90">
                You save {inr(savings)} every cycle · cancel anytime
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Shipping address
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-xs">Full name</Label>
                  <Input
                    value={shipping.name}
                    onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Full name"
                    className="h-10"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={shipping.phone}
                    onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                    placeholder="+91 ..."
                    className="h-10"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Street address</Label>
                  <Input
                    value={shipping.address}
                    onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                    placeholder="Flat, building, street"
                    className="h-10"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={shipping.pincode}
                    onChange={(e) =>
                      setShipping((s) => ({
                        ...s,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    placeholder="Pincode"
                    className="h-10"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                  <Input
                    value={shipping.city}
                    onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                    placeholder="City"
                    className="h-10"
                    required
                  />
                  <Input
                    value={shipping.state}
                    onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                    placeholder="State"
                    className="h-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-12 bg-zinc-900 hover:bg-black text-white font-bold uppercase text-xs tracking-widest"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Continue to payment"
                )}
              </Button>
              <p className="text-[10px] text-zinc-400 text-center">
                Powered by Razorpay · Cancel any time from your profile
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
