import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Mail,
  Clock,
  TrendingUp,
} from "lucide-react";
import { AbandonedReminderButton } from "@/components/abandoned-reminder-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtRelative = (d: Date) => {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

interface ItemSnapshot {
  name: string;
  quantity: number;
}

export default async function AbandonedCartsPage() {
  const [allCarts, recoveredCount] = await Promise.all([
    prisma.abandonedCheckout.findMany({
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
      take: 100,
    }),
    prisma.abandonedCheckout.count({ where: { recoveredAt: { not: null } } }),
  ]);

  const open = allCarts.filter((c) => !c.recoveredAt);
  const recovered = allCarts.filter((c) => c.recoveredAt);

  const totalAtRisk = open.reduce((s, c) => s + Number(c.totalAmount), 0);
  const totalRecovered = recovered.reduce(
    (s, c) => s + Number(c.totalAmount),
    0
  );
  const remindersSent = open.reduce((s, c) => s + c.reminderCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Abandoned Carts
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Customers who reached checkout but haven&apos;t completed their
          order. Send reminder emails to recover lost revenue.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Open carts
              </span>
              <div className="rounded-md bg-amber-100 p-1.5">
                <ShoppingBag className="h-4 w-4 text-amber-700" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">
              {open.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Revenue at risk
              </span>
              <div className="rounded-md bg-rose-100 p-1.5">
                <IndianRupee className="h-4 w-4 text-rose-700" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">
              {inr(totalAtRisk)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Recovered
              </span>
              <div className="rounded-md bg-emerald-100 p-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">
              {recoveredCount}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              {inr(totalRecovered)} won back
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Reminders sent
              </span>
              <div className="rounded-md bg-blue-100 p-1.5">
                <Mail className="h-4 w-4 text-blue-700" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-900">
              {remindersSent}
            </div>
          </CardContent>
        </Card>
      </div>

      {open.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
          <p className="font-medium text-zinc-700">No open abandoned carts</p>
          <p className="text-sm mt-1">
            Carts will appear here when customers reach checkout but
            don&apos;t complete their order.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="px-4 py-3 font-bold">Customer</th>
                  <th className="px-4 py-3 font-bold">Items</th>
                  <th className="px-4 py-3 font-bold text-right">Cart total</th>
                  <th className="px-4 py-3 font-bold">Last activity</th>
                  <th className="px-4 py-3 font-bold">Reminders</th>
                  <th className="px-4 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {open.map((cart) => {
                  const items = cart.itemsSnapshot as unknown as ItemSnapshot[];
                  return (
                    <tr key={cart.id} className="hover:bg-zinc-50/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">
                          {cart.user.name || "Guest"}
                        </p>
                        <p className="text-xs text-zinc-500">{cart.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-zinc-700">
                          {cart.itemsCount} item{cart.itemsCount === 1 ? "" : "s"}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                          {items
                            .slice(0, 2)
                            .map((it) => it.name)
                            .join(", ")}
                          {items.length > 2 && ` +${items.length - 2}`}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-zinc-900">
                          {inr(Number(cart.totalAmount))}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-600">
                          <Clock className="h-3 w-3 text-zinc-400" />
                          {fmtRelative(cart.updatedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {cart.reminderCount === 0 ? (
                          <span className="text-xs text-zinc-400">Not sent</span>
                        ) : (
                          <div>
                            <p className="text-xs text-zinc-700 font-medium">
                              {cart.reminderCount} sent
                            </p>
                            {cart.lastReminderAt && (
                              <p className="text-[11px] text-zinc-500">
                                {fmtRelative(cart.lastReminderAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <AbandonedReminderButton
                          id={cart.id}
                          alreadySent={cart.reminderCount}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recovered.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Recently recovered
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-zinc-100">
              {recovered.slice(0, 8).map((cart) => (
                <div
                  key={cart.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {cart.user.name || "Guest"}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {cart.email}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-bold",
                        "text-emerald-700"
                      )}
                    >
                      Recovered · {inr(Number(cart.totalAmount))}
                    </p>
                    {cart.recoveredAt && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {fmtRelative(cart.recoveredAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
