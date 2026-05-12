import { updateCoupon } from "@/actions/coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });

  if (!coupon) redirect("/admin/coupons");

  const updateCouponWithId = updateCoupon.bind(null, coupon.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/coupons">
          <Button variant="outline" size="icon" className="border-zinc-200">
            <ArrowLeft className="h-4 w-4 text-zinc-600" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Edit Coupon</h1>
          <p className="text-zinc-500 text-sm">Update settings for {coupon.code}</p>
        </div>
      </div>

      <form action={updateCouponWithId} className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
        <div className="space-y-2">
          <Label>Coupon Code</Label>
          <Input name="code" defaultValue={coupon.code} required className="uppercase h-11" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Discount Value</Label>
            <Input name="discountValue" type="number" defaultValue={coupon.discountValue} required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select name="type" defaultValue={coupon.type} className="w-full h-11 border rounded-md px-3 text-sm focus:ring-1 focus:ring-zinc-900 outline-none">
              <option value="FIXED">Flat (₹)</option>
              <option value="PERCENTAGE">Percentage (%)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Min Order Amount (₹) <span className="text-xs text-zinc-400 font-normal">— optional</span></Label>
          <Input
            name="minOrderAmount"
            type="number"
            min="0"
            step="1"
            defaultValue={coupon.minOrderAmount ? Number(coupon.minOrderAmount) : ""}
            placeholder="e.g. 999"
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Total Uses <span className="text-xs text-zinc-400 font-normal">— optional</span></Label>
            <Input
              name="usageLimit"
              type="number"
              min="1"
              defaultValue={coupon.usageLimit ?? ""}
              placeholder="∞"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Per User <span className="text-xs text-zinc-400 font-normal">— optional</span></Label>
            <Input
              name="perUserLimit"
              type="number"
              min="1"
              defaultValue={coupon.perUserLimit ?? ""}
              placeholder="∞"
              className="h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Starts <span className="text-xs text-zinc-400 font-normal">— optional</span></Label>
            <Input
              name="startsAt"
              type="date"
              defaultValue={coupon.startsAt ? new Date(coupon.startsAt).toISOString().split('T')[0] : ""}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input
              name="expiresAt"
              type="date"
              defaultValue={new Date(coupon.expiresAt).toISOString().split('T')[0]}
              required
              className="h-11"
            />
          </div>
        </div>

        <p className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-lg p-3">
          Used so far: <span className="font-bold text-zinc-700">{coupon.usageCount}</span>
          {coupon.usageLimit ? ` of ${coupon.usageLimit}` : " redemptions"}
        </p>

        <Button type="submit" className="w-full h-12 bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors">
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </form>
    </div>
  );
}