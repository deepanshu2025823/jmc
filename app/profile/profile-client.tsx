"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { User, Package, Calendar, Clock, ArrowRight, ShieldCheck, ShoppingBag, MapPin, CreditCard, Bell, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

export function ProfileClient({ user }: { user: any }) {
  const [activeSheet, setActiveSheet] = useState<"invoice" | "addresses" | "notifications" | "profile" | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [mounted, setMounted] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(user);
  
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState(user.phone || "");
  const [profileDob, setProfileDob] = useState(user.dob || "");
  const [profileGender, setProfileGender] = useState(user.gender || "");
  const [emailNotif, setEmailNotif] = useState(user.emailNotif ?? true);
  const [smsNotif, setSMSNotif] = useState(user.smsNotif ?? false);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: "", city: "", state: "", pincode: "" });
  const [savedAddresses, setSavedAddresses] = useState(user.addresses || []);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (userData) {
      const isPhone = userData.email?.includes('@phone.jmc.local');
      setProfileName(isPhone && !userData.name ? '' : (userData.name || ''));
      setProfilePhone(userData.phone || (isPhone ? userData.email.replace('@phone.jmc.local', '') : ''));
      setProfileDob(userData.dob || "");
      setProfileGender(userData.gender || "");
    }
  }, [userData]);

  const openInvoice = (order: any) => {
    setSelectedOrder(order);
    setActiveSheet("invoice");
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update_profile", 
          name: profileName,
          phone: profilePhone,
          dob: profileDob,
          gender: profileGender
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUserData({ ...userData, name: updated.name, phone: updated.phone, dob: updated.dob, gender: updated.gender });
        toast.success("Profile updated successfully");
        setActiveSheet(null);
      } else throw new Error();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if(newAddress.street && newAddress.city && newAddress.pincode) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add_address", ...newAddress, isDefault: savedAddresses.length === 0 })
        });
        if (res.ok) {
          const addedAddress = await res.json();
          setSavedAddresses([...savedAddresses, addedAddress]);
          setNewAddress({ street: "", city: "", state: "", pincode: "" });
          setIsAddingAddress(false);
          toast.success("Address saved successfully");
        } else throw new Error();
      } catch(err) {
        toast.error("Failed to save address");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_address", addressId })
      });
      if (res.ok) {
        setSavedAddresses(savedAddresses.filter((a: any) => a.id !== addressId));
        toast.success("Address removed");
      } else throw new Error();
    } catch(err) {
      toast.error("Failed to delete address");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleNotification = async (type: "email" | "sms", value: boolean) => {
    if (type === "email") setEmailNotif(value);
    if (type === "sms") setSMSNotif(value);
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update_notifications", 
          emailNotif: type === 'email' ? value : emailNotif, 
          smsNotif: type === 'sms' ? value : smsNotif 
        })
      });
      toast.success("Preferences updated");
    } catch(err) {
      toast.error("Failed to update preferences");
    }
  };

  if (!mounted) return null;
  
  const isPhone = userData?.email?.includes('@phone.jmc.local');
  const displayEmail = isPhone ? userData.email.replace('@phone.jmc.local', '') : userData.email;
  const displayName = isPhone && !userData.name ? 'Valued Client' : (userData.name || 'Valued Client');
  const avatarInitial = isPhone && !userData.name ? 'V' : (userData.name?.charAt(0).toUpperCase() || 'J');

  return (
    <main className="min-h-screen bg-[#fafafa] pb-32">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 md:pt-48">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="h-28 w-28 rounded-full bg-[#50540b] flex items-center justify-center text-white text-5xl font-serif shadow-xl">
                  {avatarInitial}
                </div>
                <div className="absolute bottom-0 right-0 bg-emerald-50 p-2 rounded-full border-2 border-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <h1 className="text-2xl font-serif font-bold text-zinc-900 mb-1">{displayName}</h1>
              <p className="text-xs text-zinc-400 font-medium tracking-wide break-all mb-6">{displayEmail}</p>
              
              <div className="w-full pt-6 border-t border-zinc-50 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Orders</p>
                  <p className="text-xl font-serif font-bold text-zinc-900 mt-1">{user.orders.length}</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#F9F6F0] px-4 py-2 rounded-full">
                  <User className="h-3 w-3 text-[#50540b]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#50540b]">Elite Member</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Account Settings</h3>
              <div className="space-y-4">
                <button onClick={() => setActiveSheet("profile")} className="w-full flex items-center justify-between text-sm font-bold text-zinc-700 hover:text-[#50540b] transition-colors py-2 border-b border-zinc-50 pb-4 mb-4">
                  <span className="flex items-center gap-3"><User className="h-4 w-4" /> Update Profile</span> <ArrowRight className="h-4 w-4 opacity-50" />
                </button>
                <button onClick={() => setActiveSheet("addresses")} className="w-full flex items-center justify-between text-sm font-bold text-zinc-700 hover:text-[#50540b] transition-colors py-2">
                  <span className="flex items-center gap-3"><MapPin className="h-4 w-4" /> Shipping Addresses</span> <ArrowRight className="h-4 w-4 opacity-50" />
                </button>
                <button onClick={() => setActiveSheet("notifications")} className="w-full flex items-center justify-between text-sm font-bold text-zinc-700 hover:text-[#50540b] transition-colors py-2 border-t border-zinc-50 pt-4">
                  <span className="flex items-center gap-3"><Bell className="h-4 w-4" /> Notification Preferences</span> <ArrowRight className="h-4 w-4 opacity-50" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-zinc-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900">Order <span className="italic font-light">History</span></h2>
                <Link href="/shop">
                  <Button variant="outline" className="rounded-full text-[10px] font-black uppercase tracking-widest border-zinc-200 h-10 px-6 hover:bg-[#F9F6F0] hover:text-[#50540b] hover:border-[#50540b] transition-all">
                    New Ritual
                  </Button>
                </Link>
              </div>

              {user.orders.length === 0 ? (
                <div className="text-center py-20 bg-[#fafafa] rounded-[2rem] px-4 border border-dashed border-zinc-200">
                  <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><ShoppingBag className="h-8 w-8 text-zinc-300" /></div>
                  <p className="font-serif text-xl text-zinc-900 mb-2">No orders yet</p>
                  <p className="text-sm text-zinc-400 mb-8 max-w-sm mx-auto">Your luxury skincare journey awaits.</p>
                  <Link href="/shop">
                    <Button className="bg-zinc-900 hover:bg-[#50540b] text-white rounded-full font-black uppercase text-[10px] tracking-[0.2em] h-14 px-10 shadow-xl transition-all">Explore Boutique</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {user.orders.map((order: any) => (
                    <div key={order.id} className="group border border-zinc-100 rounded-[2rem] p-6 md:p-8 hover:shadow-xl hover:border-zinc-200 transition-all duration-500 bg-white">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-zinc-50 pb-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#F9F6F0] h-12 w-12 flex items-center justify-center rounded-full shrink-0"><Package className="h-5 w-5 text-[#50540b]" /></div>
                          <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Order Ref</p>
                            <p className="text-sm font-mono font-bold text-zinc-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-2 rounded-full">
                            <Calendar className="h-3 w-3 text-zinc-400" />
                            <span className="text-[10px] font-bold text-zinc-600">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className={cn("flex items-center gap-2 px-3 py-2 rounded-full", order.status === 'DELIVERED' ? "bg-emerald-50" : "bg-amber-50")}>
                            <Clock className={cn("h-3 w-3", order.status === 'DELIVERED' ? "text-emerald-500" : "text-amber-500")} />
                            <span className={cn("text-[10px] font-black tracking-widest uppercase", order.status === 'DELIVERED' ? "text-emerald-700" : "text-amber-700")}>{order.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {order.orderItems.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-zinc-50 rounded-2xl transition-colors">
                            <div className="h-16 w-16 bg-[#F9F6F0] rounded-xl overflow-hidden shrink-0 border border-zinc-100">
                              <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-sm md:text-base font-bold text-zinc-900 truncate">{item.product.name}</p>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm md:text-md font-black text-[#50540b]">₹{Number(item.price).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-6 border-t border-zinc-50 flex flex-row items-center justify-between">
                        <div>
                           <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Paid</p>
                           <p className="text-xl md:text-2xl font-serif font-bold text-zinc-900 leading-none">₹{Number(order.totalAmount).toLocaleString()}</p>
                        </div>
                        <Button onClick={() => openInvoice(order)} variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-[#50540b] hover:text-zinc-900 hover:bg-transparent p-0 flex items-center gap-1">
                          View Invoice <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={activeSheet === "invoice"} onOpenChange={(o) => !o && setActiveSheet(null)}>
        <SheetContent aria-describedby={undefined} className="w-full sm:max-w-lg p-0 border-none shadow-2xl bg-white flex flex-col z-[110]">
          <SheetHeader className="p-8 border-b border-zinc-100 bg-[#fafafa]">
            <div className="flex justify-between items-center">
              <SheetTitle className="font-serif text-3xl font-bold text-zinc-900">Receipt</SheetTitle>
              <Button onClick={() => window.print()} variant="outline" size="sm" className="rounded-full border-zinc-200">
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
            </div>
            {selectedOrder && <p className="text-xs text-zinc-500 font-mono mt-2">Ref: #{selectedOrder.id.toUpperCase()}</p>}
          </SheetHeader>
          <div className="flex-1 p-8 overflow-y-auto">
            {selectedOrder && (
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-dashed border-zinc-200 pb-8">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#50540b]">JMC Secret Rituals</h3>
                    <p className="text-xs text-zinc-500 mt-1">Luxury Skincare Expert</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Date</p>
                    <p className="text-sm font-bold text-zinc-900">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Items Billed</p>
                  {selectedOrder.orderItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <p className="text-sm font-bold text-zinc-700">{item.product.name} <span className="text-zinc-400 text-xs ml-2">x{item.quantity}</span></p>
                      <p className="text-sm font-bold text-zinc-900">₹{Number(item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-100 pt-6 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-zinc-500">
                    <p>Subtotal</p> <p>₹{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center text-xl font-serif font-black text-zinc-900 pt-3 border-t border-zinc-100">
                    <p>Total Paid</p> <p>₹{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-[#F9F6F0] p-4 rounded-xl text-center mt-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#50540b]">Thank you for your purchase</p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={activeSheet === "profile"} onOpenChange={(o) => !o && setActiveSheet(null)}>
        <SheetContent aria-describedby={undefined} className="w-full sm:max-w-md border-none shadow-2xl p-8 z-[110]">
          <SheetHeader className="mb-8">
            <SheetTitle className="font-serif text-3xl font-bold text-zinc-900">Update Profile</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Full Name</Label>
                <Input 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  placeholder="Enter your full name" 
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone Number</Label>
                <Input 
                  value={profilePhone} 
                  onChange={(e) => setProfilePhone(e.target.value)} 
                  placeholder="+91 0000000000" 
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b]" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Date of Birth</Label>
                  <Input 
                    type="date"
                    value={profileDob} 
                    onChange={(e) => setProfileDob(e.target.value)} 
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b] text-sm px-3" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Gender</Label>
                  <select value={profileGender} onChange={(e) => setProfileGender(e.target.value)} className="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-[#50540b] focus:ring-2 focus:ring-[#50540b]/20 outline-none transition-all text-zinc-700">
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-[#50540b] transition-colors">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={activeSheet === "addresses"} onOpenChange={(o) => {
        if(!o) {
          setActiveSheet(null);
          setIsAddingAddress(false); 
        }
      }}>
        <SheetContent aria-describedby={undefined} className="w-full sm:max-w-md border-none shadow-2xl p-8 z-[110] overflow-y-auto">
          <SheetHeader className="mb-8">
            <SheetTitle className="font-serif text-3xl font-bold text-zinc-900">Your Addresses</SheetTitle>
          </SheetHeader>
          
          {!isAddingAddress ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              {savedAddresses.map((addr: any) => (
                <div key={addr.id} className={cn("border rounded-2xl p-5 relative", addr.isDefault ? "border-[#50540b] bg-[#F9F6F0]/30" : "border-zinc-200 bg-white")}>
                  <button disabled={isLoading} onClick={() => handleDeleteAddress(addr.id)} className="absolute bottom-4 right-4 p-2 text-zinc-400 hover:text-red-500 transition-colors bg-white rounded-full border border-zinc-100 hover:border-red-100 shadow-sm">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {addr.isDefault && <span className="absolute top-4 right-4 bg-[#50540b] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Default</span>}
                  <p className="font-bold text-zinc-900 text-sm mb-1">{displayName}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{addr.street},<br/>{addr.city}, {addr.state},<br/>{addr.pincode}, India</p>
                </div>
              ))}
              
              <Button onClick={() => setIsAddingAddress(true)} className="w-full h-14 border border-dashed border-zinc-300 bg-transparent text-zinc-500 hover:bg-zinc-50 rounded-2xl transition-colors">
                 + Add New Address
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSaveAddress} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Street Address</Label>
                <Input required value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} placeholder="Apartment, suite, block, etc." className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">City</Label>
                  <Input required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} placeholder="City" className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">State</Label>
                  <Input required value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} placeholder="State" className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Pincode</Label>
                <Input required value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} placeholder="000000" className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:border-[#50540b]" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => setIsAddingAddress(false)} variant="outline" className="flex-1 h-12 rounded-xl text-xs font-bold border-zinc-200">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 h-12 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-[#50540b] transition-colors">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Address"}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={activeSheet === "notifications"} onOpenChange={(o) => !o && setActiveSheet(null)}>
        <SheetContent aria-describedby={undefined} className="w-full sm:max-w-md border-none shadow-2xl p-8 z-[110]">
          <SheetHeader className="mb-8">
            <SheetTitle className="font-serif text-3xl font-bold text-zinc-900">Notifications</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
              <div>
                <p className="font-bold text-sm text-zinc-900">Email Updates</p>
                <p className="text-xs text-zinc-500">Order confirmations and receipts.</p>
              </div>
              <button onClick={() => toggleNotification("email", !emailNotif)} className={cn("w-12 h-7 rounded-full transition-colors relative", emailNotif ? "bg-[#50540b]" : "bg-zinc-200")}>
                <div className={cn("h-5 w-5 bg-white rounded-full absolute top-1 transition-all shadow-sm", emailNotif ? "left-6" : "left-1")} />
              </button>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
              <div>
                <p className="font-bold text-sm text-zinc-900">SMS Alerts</p>
                <p className="text-xs text-zinc-500">Delivery tracking and real-time updates.</p>
              </div>
              <button onClick={() => toggleNotification("sms", !smsNotif)} className={cn("w-12 h-7 rounded-full transition-colors relative", smsNotif ? "bg-[#50540b]" : "bg-zinc-200")}>
                <div className={cn("h-5 w-5 bg-white rounded-full absolute top-1 transition-all shadow-sm", smsNotif ? "left-6" : "left-1")} />
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </main>
  );
}