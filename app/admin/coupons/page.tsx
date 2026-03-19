import { Ticket, Plus, Trash2, Calendar, Percent, Banknote, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link"; 
import prisma from "@/lib/prisma";
import { createCoupon, deleteCoupon } from "@/actions/coupon";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8 p-4 sm:p-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Coupons & Offers</h1>
        <p className="text-zinc-500 mt-2 text-sm sm:text-base">Create and manage discount codes for your customers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form action={createCoupon} className="bg-white p-6 rounded-xl border shadow-sm space-y-4 sticky top-6">
            <h2 className="font-bold flex items-center gap-2 border-b pb-3">
              <Plus className="h-4 w-4" /> Create New Coupon
            </h2>
            <div className="space-y-2">
              <Label>Coupon Code</Label>
              <Input name="code" placeholder="e.g. SUMMER50" required className="uppercase h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input name="discountValue" type="number" placeholder="50" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select name="type" className="w-full h-11 border rounded-md px-3 text-sm focus:ring-1 focus:ring-zinc-900 outline-none">
                  <option value="FIXED">Flat (₹)</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input name="expiresAt" type="date" required className="h-11" />
            </div>
            <Button type="submit" className="w-full bg-zinc-900 text-white h-11">Create Coupon</Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-lg">Active Coupons</h2>
          {coupons.length === 0 ? (
            <div className="border border-dashed p-12 text-center rounded-xl text-zinc-400">
              <Ticket className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No coupons created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((coupon: any) => (
                <div key={coupon.id} className="bg-white border-2 border-zinc-100 rounded-xl p-5 relative overflow-hidden group shadow-sm">
                  
                  <div className="flex justify-between items-center mb-6">
                    <div className="bg-zinc-900 text-white px-3 py-1 rounded-lg font-mono font-bold tracking-widest text-sm">
                      {coupon.code}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/coupons/${coupon.id}/edit`} className="z-10">
                        <Button size="icon" variant="ghost" className="text-zinc-600 hover:text-blue-600 hover:bg-blue-50 h-8 w-8">
                          <PencilLine className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <form action={deleteCoupon.bind(null, coupon.id)} className="z-10">
                        <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-red-500 hover:bg-red-50 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center shrink-0">
                      {coupon.type === "PERCENTAGE" ? <Percent className="h-6 w-6 text-zinc-600" /> : <Banknote className="h-6 w-6 text-zinc-600" />}
                    </div>
                    <div>
                      <p className="text-2xl font-black text-zinc-900">
                        {coupon.type === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        <span className="text-xs font-normal text-zinc-500 ml-1">OFF</span>
                      </p>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-1 uppercase font-bold tracking-wider">
                        <Calendar className="h-3 w-3" /> Expires: {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'})}
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute top-1/2 -left-3 h-6 w-6 bg-zinc-50 rounded-full border-r border-zinc-200 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 -right-3 h-6 w-6 bg-zinc-50 rounded-full border-l border-zinc-200 -translate-y-1/2"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}