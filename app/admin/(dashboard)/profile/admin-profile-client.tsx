"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, Calendar, Loader2, Save, Lock, Eye, EyeOff, KeyRound, Building2, FileText, MapPin, Phone, Hash, Receipt } from "lucide-react";
import { toast } from "sonner";
import { updateAdminProfile, changeAdminPassword, updateStoreInfo } from "@/actions/admin";

export interface AdminProfileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
}

export interface StoreInfoData {
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storePhone: string;
  storeEmail: string;
  storeWebsite: string;
  storeGstin: string;
  storePan: string;
  invoiceGstRate: number;
  invoicePrefix: string;
  freeShippingThreshold: number;
  loyaltyEarnRate: number;
  loyaltyMaxRedeemPerOrder: number;
  giftWrapFee: number;
}

export function AdminProfileClient({
  user,
  storeInfo,
}: {
  user: AdminProfileUser;
  storeInfo: StoreInfoData;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isPending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPwPending, startPwTransition] = useTransition();

  // Store / Invoice info
  const [store, setStore] = useState<StoreInfoData>(storeInfo);
  const [isStorePending, startStoreTransition] = useTransition();
  const storeDirty =
    store.storeName !== storeInfo.storeName ||
    store.storeAddress !== storeInfo.storeAddress ||
    store.storeCity !== storeInfo.storeCity ||
    store.storePhone !== storeInfo.storePhone ||
    store.storeEmail !== storeInfo.storeEmail ||
    store.storeWebsite !== storeInfo.storeWebsite ||
    store.storeGstin !== storeInfo.storeGstin ||
    store.storePan !== storeInfo.storePan ||
    store.invoiceGstRate !== storeInfo.invoiceGstRate ||
    store.invoicePrefix !== storeInfo.invoicePrefix ||
    store.freeShippingThreshold !== storeInfo.freeShippingThreshold ||
    store.loyaltyEarnRate !== storeInfo.loyaltyEarnRate ||
    store.loyaltyMaxRedeemPerOrder !== storeInfo.loyaltyMaxRedeemPerOrder ||
    store.giftWrapFee !== storeInfo.giftWrapFee;

  const setStoreField = <K extends keyof StoreInfoData>(
    key: K,
    value: StoreInfoData[K]
  ) => setStore((prev) => ({ ...prev, [key]: value }));

  const handleSaveStore = () => {
    if (!store.storeName.trim()) {
      return toast.error("Store name is required");
    }
    if (store.storeGstin && !/^[0-9A-Z]{15}$/.test(store.storeGstin.trim())) {
      return toast.error("GSTIN must be exactly 15 alphanumeric characters");
    }
    if (store.storePan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(store.storePan.trim())) {
      return toast.error("PAN must be in format ABCDE1234F");
    }

    startStoreTransition(async () => {
      const res = await updateStoreInfo(store);
      if (res.success) {
        toast.success("Store information saved — invoices will use these values");
      } else {
        toast.error(res.error || "Failed to save store info");
      }
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("All password fields are required");
    }
    if (newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New password and confirmation do not match");
    }
    if (currentPassword === newPassword) {
      return toast.error("New password must be different from current password");
    }

    startPwTransition(async () => {
      const res = await changeAdminPassword(currentPassword, newPassword);
      if (res.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Failed to change password.");
      }
    });
  };

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

          <Card className="border-zinc-200 shadow-sm bg-white rounded-[2rem] mt-8">
            <CardHeader className="pb-6 border-b border-zinc-100 px-8 pt-8">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900">
                <KeyRound className="h-5 w-5 text-[#B59461]" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter your current password"
                    className="pl-11 pr-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    aria-label={showCurrent ? "Hide password" : "Show password"}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNew ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className="pl-11 pr-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    className="pl-11 pr-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 font-medium mt-2">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isPwPending ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword
                  }
                  className="h-12 px-8 rounded-xl bg-zinc-900 hover:bg-[#B59461] text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  {isPwPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-2" />
                  )}
                  {isPwPending ? "Updating..." : "Update Password"}
                </Button>
              </div>

            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm bg-white rounded-[2rem] mt-8">
            <CardHeader className="pb-6 border-b border-zinc-100 px-8 pt-8">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900">
                <Building2 className="h-5 w-5 text-[#B59461]" /> Store &amp; Invoice Information
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-2">
                Used on every customer invoice. Save here to update — no
                redeploy needed.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Store Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    value={store.storeName}
                    onChange={(e) => setStoreField("storeName", e.target.value)}
                    placeholder="JMC Secret Rituals"
                    className="pl-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Registered Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 h-4 w-4 text-zinc-400" />
                  <textarea
                    value={store.storeAddress}
                    onChange={(e) => setStoreField("storeAddress", e.target.value)}
                    placeholder="Building, street, area"
                    rows={2}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-50/50 border border-zinc-200 focus:border-[#B59461] focus:outline-none text-sm resize-y"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    City / State / Pincode
                  </label>
                  <Input
                    value={store.storeCity}
                    onChange={(e) => setStoreField("storeCity", e.target.value)}
                    placeholder="New Delhi, Delhi - 110001"
                    className="h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                  />
                  <p className="text-[10px] text-zinc-400">
                    State name matters for CGST/SGST vs IGST split.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      value={store.storePhone}
                      onChange={(e) => setStoreField("storePhone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="pl-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Support Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      type="email"
                      value={store.storeEmail}
                      onChange={(e) => setStoreField("storeEmail", e.target.value)}
                      placeholder="support@jmcskinsecrets.com"
                      className="pl-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Website
                  </label>
                  <Input
                    value={store.storeWebsite}
                    onChange={(e) => setStoreField("storeWebsite", e.target.value)}
                    placeholder="jmcskinsecrets.com"
                    className="h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    GSTIN
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      value={store.storeGstin}
                      onChange={(e) =>
                        setStoreField(
                          "storeGstin",
                          e.target.value.toUpperCase().replace(/\s/g, "")
                        )
                      }
                      placeholder="07ABCDE1234F1Z5"
                      maxLength={15}
                      className="pl-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461] font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400">15 chars. Leave empty if not registered.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    PAN
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      value={store.storePan}
                      onChange={(e) =>
                        setStoreField(
                          "storePan",
                          e.target.value.toUpperCase().replace(/\s/g, "")
                        )
                      }
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="pl-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    GST Rate (%)
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      type="number"
                      min={0}
                      max={28}
                      value={store.invoiceGstRate}
                      onChange={(e) =>
                        setStoreField(
                          "invoiceGstRate",
                          Number(e.target.value) || 0
                        )
                      }
                      className="pl-11 h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Invoice Prefix
                  </label>
                  <Input
                    value={store.invoicePrefix}
                    onChange={(e) =>
                      setStoreField(
                        "invoicePrefix",
                        e.target.value.toUpperCase().slice(0, 6)
                      )
                    }
                    placeholder="JMC"
                    className="h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461] font-mono"
                  />
                  <p className="text-[10px] text-zinc-400">
                    Example: <span className="font-mono">JMC-202412-A3F8D2B1</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Storefront experience
                </p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Free shipping threshold (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={store.freeShippingThreshold}
                    onChange={(e) =>
                      setStoreField(
                        "freeShippingThreshold",
                        Number(e.target.value) || 0
                      )
                    }
                    placeholder="e.g. 999 (set 0 to hide the bar)"
                    className="h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                  />
                  <p className="text-[10px] text-zinc-400">
                    Shown as a sticky bar at the top of the storefront.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Loyalty earn rate
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={store.loyaltyEarnRate}
                      onChange={(e) =>
                        setStoreField("loyaltyEarnRate", Number(e.target.value) || 10)
                      }
                      className="h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                    />
                    <p className="text-[10px] text-zinc-400">
                      ₹ spent per 1 point earned (default 10).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Max redeem / order
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={store.loyaltyMaxRedeemPerOrder}
                      onChange={(e) =>
                        setStoreField(
                          "loyaltyMaxRedeemPerOrder",
                          Number(e.target.value) || 0
                        )
                      }
                      className="h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                    />
                    <p className="text-[10px] text-zinc-400">
                      Max points (= ₹) a customer can apply per order.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Gift wrap fee (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={store.giftWrapFee}
                    onChange={(e) =>
                      setStoreField("giftWrapFee", Number(e.target.value) || 0)
                    }
                    placeholder="0 for complimentary"
                    className="h-12 rounded-xl bg-zinc-50/50 border-zinc-200 focus:border-[#B59461]"
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleSaveStore}
                  disabled={isStorePending || !storeDirty}
                  className="h-12 px-8 rounded-xl bg-zinc-900 hover:bg-[#B59461] text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  {isStorePending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isStorePending ? "Saving..." : "Save Store Info"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}