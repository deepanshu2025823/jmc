"use client";

import { useCartStore } from "@/hooks/use-cart-store";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ArrowLeft, Truck, PackageCheck, AlertCircle, CreditCard, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useOrderActions } from "@/actions/order";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutClient({ 
  isCodEnabled, 
  isRazorpayEnabled, 
  razorpayKeyId,
  userEmail,
  userName,
  userPhone,
  savedAddresses
}: { 
  isCodEnabled: boolean;
  isRazorpayEnabled: boolean;
  razorpayKeyId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  savedAddresses: any[];
}) {
  const { cart, appliedCoupon } = useCartStore() as any;
  const { placeCODOrder } = useOrderActions(); 
  const [loading, setLoading] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">(
    isCodEnabled ? "COD" : (isRazorpayEnabled ? "ONLINE" : "COD")
  );

  const [firstName, setFirstName] = useState(userName.split(' ')[0] || "");
  const [lastName, setLastName] = useState(userName.split(' ').slice(1).join(' ') || "");
  const [phone, setPhone] = useState(userPhone || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr.id);
      setAddress(defaultAddr.street);
      setCity(defaultAddr.city);
      setState(defaultAddr.state);
      setPincode(defaultAddr.pincode);
    }
  }, [savedAddresses]);

  const subtotal = cart.reduce((acc: number, item: any) => acc + (Number(item.price) * (item.quantity || 1)), 0);
  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.type === "FIXED" ? appliedCoupon.discount : (subtotal * appliedCoupon.discount) / 100;
  }
  const total = subtotal - discount;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (paymentMethod === "COD") {
      if (!isCodEnabled) return toast.error("COD is currently disabled.");
      setLoading(true);
      await placeCODOrder(data); 
      setLoading(false);
    } 
    else if (paymentMethod === "ONLINE") {
      if (!isRazorpayEnabled || !razorpayKeyId) return toast.error("Online payment is not configured yet.");
      
      setLoading(true);
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKeyId, 
        amount: Math.round(total * 100), 
        currency: "INR",
        name: "JMC Luxury Skincare",
        description: "Premium Ritual Purchase",
        image: "https://your-logo-url.com/logo.png", 
        handler: async function (response: any) {
          toast.success(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          await placeCODOrder({ ...data, paymentId: response.razorpay_payment_id, isPaid: true }); 
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}` || userName,
          email: userEmail,
          contact: data.phone || userPhone
        },
        theme: {
          color: "#50540b", 
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-serif">Your bag is empty</h2>
      <Link href="/shop"><Button className="rounded-full bg-zinc-900">Return to Shop</Button></Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50 pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-zinc-100">
            <div className="flex items-center gap-4 mb-10">
              <Link href="/cart" className="h-10 w-10 rounded-full border border-zinc-100 flex items-center justify-center hover:bg-zinc-50 transition-all">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-3xl font-serif font-bold italic text-zinc-900">Shipping <span className="not-italic">Details</span></h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {savedAddresses && savedAddresses.length > 0 && (
                <div className="space-y-3 mb-8 bg-zinc-50/50 p-4 rounded-3xl border border-zinc-100">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Select Saved Address</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr: any) => (
                      <div 
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setAddress(addr.street);
                          setCity(addr.city);
                          setState(addr.state);
                          setPincode(addr.pincode);
                        }}
                        className={cn("border rounded-2xl p-4 cursor-pointer transition-all bg-white", selectedAddressId === addr.id ? "border-[#50540b] shadow-md ring-1 ring-[#50540b]/10" : "border-zinc-200 hover:border-zinc-300")}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className={cn("h-4 w-4 mt-0.5 shrink-0", selectedAddressId === addr.id ? "text-[#50540b]" : "text-zinc-400")} />
                          <div>
                            <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div 
                      onClick={() => {
                        setSelectedAddressId("new");
                        setAddress(""); setCity(""); setState(""); setPincode("");
                      }}
                      className={cn("border rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-center text-xs font-bold uppercase tracking-widest bg-white", selectedAddressId === "new" ? "border-[#50540b] text-[#50540b] shadow-md ring-1 ring-[#50540b]/10" : "border-dashed border-zinc-300 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600")}
                    >
                      + Use New Address
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">First Name</label>
                  <Input name="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="i.e., John" className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Last Name</label>
                  <Input name="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="i.e., Doe" className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Phone Number</label>
                <Input name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 0000000000" className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Street Address</label>
                  <Input name="address" value={address} onChange={e => setAddress(e.target.value)} required placeholder="Apartment, suite, etc." className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50" />
                </div>
                <Input name="city" value={city} onChange={e => setCity(e.target.value)} required placeholder="City" className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50" />
                <Input name="state" value={state} onChange={e => setState(e.target.value)} required placeholder="State" className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50" />
                <Input name="pincode" value={pincode} onChange={e => setPincode(e.target.value)} required placeholder="Pincode" className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50" />
              </div>

              <div className="pt-10 border-t border-zinc-50 mt-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold">Choose Payment Ritual</h2>
                  {(!isCodEnabled && !isRazorpayEnabled) && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                      <AlertCircle className="h-3.5 w-3.5" /> Payments Unavailable
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => isCodEnabled && setPaymentMethod("COD")}
                    className={cn(
                      "rounded-2xl p-5 relative transition-all duration-300",
                      isCodEnabled ? "cursor-pointer border-2" : "border border-zinc-200 bg-zinc-50 opacity-60 cursor-not-allowed grayscale",
                      (paymentMethod === "COD" && isCodEnabled) ? "border-[#50540b] bg-[#F9F6F0]/30" : "border-zinc-100 hover:border-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className={cn("h-5 w-5", (paymentMethod === "COD" && isCodEnabled) ? "text-[#50540b]" : "text-zinc-400")} />
                      <div>
                        <p className="text-sm font-bold text-zinc-900">Cash on Delivery</p>
                        <p className="text-[10px] uppercase font-black mt-0.5 text-zinc-500">
                          {isCodEnabled ? "Pay when you receive" : "Disabled by Admin"}
                        </p>
                      </div>
                    </div>
                    {(paymentMethod === "COD" && isCodEnabled) && <ShieldCheck className="h-5 w-5 absolute top-5 right-5 text-[#50540b]" />}
                  </div>
                  
                  <div 
                    onClick={() => isRazorpayEnabled && setPaymentMethod("ONLINE")}
                    className={cn(
                      "rounded-2xl p-5 relative transition-all duration-300",
                      isRazorpayEnabled ? "cursor-pointer border-2" : "border border-zinc-200 bg-zinc-50 opacity-60 cursor-not-allowed grayscale",
                      (paymentMethod === "ONLINE" && isRazorpayEnabled) ? "border-[#50540b] bg-[#F9F6F0]/30" : "border-zinc-100 hover:border-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={cn("h-5 w-5", (paymentMethod === "ONLINE" && isRazorpayEnabled) ? "text-[#50540b]" : "text-zinc-400")} />
                      <div>
                        <p className="text-sm font-bold text-zinc-900">Pay Online (Secure)</p>
                        <p className="text-[10px] uppercase font-black mt-0.5 text-zinc-500">
                          {isRazorpayEnabled ? "Card, UPI, NetBanking" : "Disabled by Admin"}
                        </p>
                      </div>
                    </div>
                    {(paymentMethod === "ONLINE" && isRazorpayEnabled) && <ShieldCheck className="h-5 w-5 absolute top-5 right-5 text-[#50540b]" />}
                  </div>
                </div>
              </div>

              <Button 
                disabled={loading || (!isCodEnabled && !isRazorpayEnabled)}
                type="submit" 
                className={cn(
                  "w-full h-16 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-2xl mt-8 transition-all duration-500",
                  (!isCodEnabled && !isRazorpayEnabled) ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" : "bg-zinc-900 hover:bg-[#50540b] text-white"
                )}
              >
                {(!isCodEnabled && !isRazorpayEnabled) 
                  ? "Payments Unavailable" 
                  : loading 
                    ? <Loader2 className="h-5 w-5 animate-spin" /> 
                    : paymentMethod === "COD" 
                      ? "Confirm COD Order" 
                      : "Pay Securely with Razorpay"
                }
              </Button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm sticky top-40">
              <div className="flex items-center gap-2 mb-8">
                <PackageCheck className="h-4 w-4 text-[#50540b]" />
                <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Review Order</h2>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto space-y-5 mb-8 pr-2 custom-scrollbar">
                {cart.map((item: any) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="h-16 w-14 rounded-xl overflow-hidden bg-[#F9F6F0] shrink-0">
                       <img src={item.imageUrl} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm font-bold text-zinc-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Qty: {item.quantity}</p>
                      <p className="text-[#50540b] text-xs font-black mt-1">₹{Number(item.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 border-t border-zinc-50 pt-8">
                <div className="flex justify-between text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-zinc-900">₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold uppercase text-[10px] tracking-widest">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>- ₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-zinc-100 pt-6 mt-6">
                  <span className="font-serif text-lg text-zinc-500">Order Total</span>
                  <span className="text-3xl font-black text-[#50540b]">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}