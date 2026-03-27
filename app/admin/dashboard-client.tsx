"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Package, ShoppingCart, Users, ArrowUpRight, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { toggleCodSetting } from "@/actions/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { updateRazorpaySettings } from "@/actions/admin";

function RazorpaySettingsBox({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false);
  const [rzpEnabled, setRzpEnabled] = useState(settings?.isRazorpayEnabled || false);
  const [keyId, setKeyId] = useState(settings?.razorpayKeyId || "");
  const [keySecret, setKeySecret] = useState(settings?.razorpayKeySecret || "");

  const handleSave = async () => {
    setLoading(true);
    const res = await updateRazorpaySettings({ isEnabled: rzpEnabled, keyId, keySecret });
    if (res.success) {
      toast.success("Razorpay settings updated successfully!");
    } else {
      toast.error("Failed to update Razorpay settings");
    }
    setLoading(false);
  };

  return (
    <div className="p-5 bg-white/5 rounded-xl border border-[#B59461]/30 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-[#B59461] text-xs uppercase font-bold tracking-widest mb-1">Razorpay Gateway</p>
          <p className="text-sm font-bold text-zinc-300">Enable Online Payments</p>
        </div>
        <button 
          onClick={() => setRzpEnabled(!rzpEnabled)}
          className={cn("w-12 h-6 rounded-full transition-all duration-300 relative", rzpEnabled ? "bg-[#B59461]" : "bg-zinc-600")}
        >
          <div className={cn("h-4 w-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md", rzpEnabled ? "left-7" : "left-1")} />
        </button>
      </div>
      
      {rzpEnabled && (
        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Key ID</label>
            <Input 
              value={keyId} onChange={(e) => setKeyId(e.target.value)} 
              placeholder="rzp_live_xxxxxxxxx" 
              className="bg-black/50 border-white/10 text-white h-10 text-xs rounded-lg focus:border-[#B59461]" 
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Key Secret</label>
            <Input 
              type="password"
              value={keySecret} onChange={(e) => setKeySecret(e.target.value)} 
              placeholder="Enter Secret Key" 
              className="bg-black/50 border-white/10 text-white h-10 text-xs rounded-lg focus:border-[#B59461]" 
            />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full h-10 bg-[#B59461] hover:bg-[#967a4f] text-white font-bold text-xs uppercase tracking-widest mt-2 rounded-lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save API Keys"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function DashboardClient({ stats, recentOrders, settings }: { stats: any, recentOrders: any[], settings: any }) {
  const [isPending, startTransition] = useTransition();
  const [isCodEnabled, setIsCodEnabled] = useState(settings.isCodEnabled);

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleCodSetting(isCodEnabled);
      if (res.success) {
        setIsCodEnabled(res.isCodEnabled);
        toast.success(`COD has been turned ${res.isCodEnabled ? "ON" : "OFF"}`);
      } else {
        toast.error("Failed to update COD settings.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-zinc-500">Track your real-time sales, products, and customer activities.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Total Revenue</CardTitle>
            <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center shrink-0">
              <IndianRupee className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Based on PAID orders</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Total Orders</CardTitle>
            <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{stats.totalOrders}</div>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Lifetime orders</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Products</CardTitle>
            <div className="h-8 w-8 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{stats.totalProducts}</div>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Live in inventory</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Customers</CardTitle>
            <div className="h-8 w-8 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{stats.totalUsers}</div>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Registered users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        
        <Card className="lg:col-span-4 border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No orders yet.</p>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between group border-b border-zinc-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                        <ShoppingBag className="h-4 w-4 text-zinc-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">
                          {order.user?.name || "Guest Customer"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{order.user?.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-zinc-900">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                      <p className={cn("text-[10px] uppercase font-black", order.status === "DELIVERED" ? "text-emerald-500" : "text-amber-500")}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-zinc-200 shadow-sm bg-zinc-900 text-white overflow-hidden relative">
           <CardHeader>
              <CardTitle className="text-lg font-bold">Store Controls</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4 relative z-10">
              
              <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md flex items-center justify-between">
                 <div>
                   <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-1">Cash on Delivery</p>
                   <p className={cn("text-sm font-bold", isCodEnabled ? "text-emerald-400" : "text-red-400")}>
                     {isCodEnabled ? "Active Storewide" : "Disabled"}
                   </p>
                 </div>
                 <button 
                  onClick={handleToggle}
                  disabled={isPending}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all duration-300 relative",
                    isCodEnabled ? "bg-emerald-500" : "bg-zinc-600"
                  )}
                 >
                   {isPending ? (
                     <Loader2 className="h-3 w-3 text-white animate-spin absolute top-1.5 left-4" />
                   ) : (
                     <div className={cn(
                       "h-4 w-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md",
                       isCodEnabled ? "left-7" : "left-1"
                     )} />
                   )}
                 </button>
              </div>

              <RazorpaySettingsBox settings={settings} />

              <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                 <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-1">Average Order Value</p>
                 <p className="text-2xl font-bold">
                    ₹{stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : 0}
                 </p>
              </div>

              <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                 <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-1">Inventory Status</p>
                 <p className="text-xl font-medium">{stats.totalProducts} Products listed</p>
                 <Link href="/admin/products/new" className="text-xs text-zinc-300 hover:text-white underline mt-2 inline-block">
                    Add more products
                 </Link>
              </div>

           </CardContent>
           <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </Card>
      </div>
    </div>
  );
}