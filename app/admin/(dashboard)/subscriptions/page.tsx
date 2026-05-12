import Link from "next/link";
import Image from "next/image";
import {
  Repeat,
  IndianRupee,
  Calendar,
  Users,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (iso: Date | null) =>
  iso
    ? iso.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const STATUS_META: Record<string, { label: string; tint: string }> = {
  CREATED: { label: "Awaiting payment", tint: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Active", tint: "bg-emerald-100 text-emerald-700" },
  PAUSED: { label: "Paused", tint: "bg-zinc-100 text-zinc-700" },
  CANCELLED: { label: "Cancelled", tint: "bg-rose-100 text-rose-700" },
  COMPLETED: { label: "Completed", tint: "bg-blue-100 text-blue-700" },
  HALTED: { label: "Halted", tint: "bg-rose-100 text-rose-700" },
  EXPIRED: { label: "Expired", tint: "bg-zinc-100 text-zinc-500" },
};

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true, imageUrl: true } },
    },
    take: 200,
  });

  const stats = {
    active: subscriptions.filter((s) => s.status === "ACTIVE").length,
    paused: subscriptions.filter((s) => s.status === "PAUSED").length,
    cancelled: subscriptions.filter((s) => s.status === "CANCELLED").length,
    pending: subscriptions.filter((s) => s.status === "CREATED").length,
    mrr: subscriptions
      .filter((s) => s.status === "ACTIVE")
      .reduce((sum, s) => sum + Number(s.pricePerCycle) / Math.max(1, s.intervalMonths), 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Subscriptions
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Recurring revenue from auto-replenish customers. All renewals are
          handled by Razorpay; orders are auto-created on each charge.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">MRR</span>
              <div className="rounded-md bg-emerald-100 p-1.5">
                <IndianRupee className="h-4 w-4 text-emerald-700" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">
              {inr(stats.mrr)}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Estimated monthly recurring
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Active</span>
              <div className="rounded-md bg-emerald-100 p-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Pending</span>
              <div className="rounded-md bg-amber-100 p-1.5">
                <Repeat className="h-4 w-4 text-amber-700" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">{stats.pending}</div>
            <p className="text-[10px] text-zinc-400 mt-1">Awaiting customer payment auth</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Paused</span>
              <div className="rounded-md bg-zinc-100 p-1.5">
                <PauseCircle className="h-4 w-4 text-zinc-700" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">{stats.paused}</div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Cancelled</span>
              <div className="rounded-md bg-rose-100 p-1.5">
                <XCircle className="h-4 w-4 text-rose-700" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Users className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
          <p className="font-medium text-zinc-700">No subscriptions yet</p>
          <p className="text-sm mt-1 text-zinc-500">
            Mark a product as &quot;subscribable&quot; in <Link href="/admin/products" className="underline">Products</Link> and customers can start auto-replenishing.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Customer</th>
                  <th className="px-4 py-3 text-left font-bold">Product</th>
                  <th className="px-4 py-3 text-left font-bold">Cycle</th>
                  <th className="px-4 py-3 text-right font-bold">Price</th>
                  <th className="px-4 py-3 text-right font-bold">Cycles paid</th>
                  <th className="px-4 py-3 text-left font-bold">Next billing</th>
                  <th className="px-4 py-3 text-left font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {subscriptions.map((sub) => {
                  const meta = STATUS_META[sub.status] ?? STATUS_META.CREATED;
                  return (
                    <tr key={sub.id} className="hover:bg-zinc-50/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">
                          {sub.user.name || "—"}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {sub.user.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/product/${sub.product.id}`}
                          className="flex items-center gap-2 hover:text-zinc-900"
                        >
                          <div className="relative h-9 w-9 rounded-md overflow-hidden bg-[#F9F6F0] shrink-0">
                            {sub.product.imageUrl && (
                              <Image
                                src={sub.product.imageUrl}
                                alt={sub.product.name}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="text-zinc-700 truncate max-w-[160px]">
                            {sub.product.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        Every {sub.intervalMonths}mo
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-900">
                        {inr(Number(sub.pricePerCycle))}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-700">
                        {sub.cyclesPaid}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-zinc-400" />
                          {fmtDate(sub.nextBillingAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                            meta.tint
                          )}
                        >
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
