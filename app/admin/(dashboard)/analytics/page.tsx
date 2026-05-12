import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  Layers,
  Activity,
  ArrowRight,
  Minus,
} from "lucide-react";
import { getAnalytics, parseRange } from "@/actions/analytics";
import { AnalyticsRangePicker } from "@/components/analytics-range-picker";
import {
  RevenueTrendChart,
  CategoryPieChart,
  OrderStatusChart,
  TopProductsBarChart,
} from "@/components/analytics-charts";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const compact = (n: number) =>
  new Intl.NumberFormat("en-IN", { notation: "compact" }).format(n);

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PAID: "bg-blue-50 text-blue-700 ring-blue-200",
  SHIPPED: "bg-violet-50 text-violet-700 ring-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function ChangeBadge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400">
        <Minus className="h-3 w-3" /> n/a
      </span>
    );
  }
  if (Math.abs(value) < 0.05) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }
  const positive = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        positive ? "text-emerald-600" : "text-rose-600"
      )}
    >
      {positive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function KpiCard({
  label,
  value,
  change,
  previous,
  icon: Icon,
  format = "number",
}: {
  label: string;
  value: number;
  change: number | null;
  previous: number;
  icon: React.ComponentType<{ className?: string }>;
  format?: "currency" | "number";
}) {
  const display =
    format === "currency" ? inr(value) : compact(Math.round(value));
  const prevDisplay =
    format === "currency" ? inr(previous) : compact(Math.round(previous));
  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {label}
          </span>
          <div className="rounded-md bg-zinc-100 p-1.5">
            <Icon className="h-4 w-4 text-zinc-600" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
          {display}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <ChangeBadge value={change} />
          <span className="text-xs text-zinc-400">
            vs {prevDisplay} prev period
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDateRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  return `${fmt(s)} – ${fmt(e)}`;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const data = await getAnalytics(range);

  const topProductsForChart = data.topProducts
    .slice(0, 6)
    .map((p) => ({ name: p.name, revenue: p.revenue }))
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {formatDateRange(data.start, data.end)} · Compared to{" "}
            {formatDateRange(data.prevStart, data.prevEnd)}
          </p>
        </div>
        <AnalyticsRangePicker current={data.range} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard
          label="Total Sales"
          value={data.kpis.revenue.current}
          previous={data.kpis.revenue.previous}
          change={data.kpis.revenue.change}
          icon={IndianRupee}
          format="currency"
        />
        <KpiCard
          label="Orders"
          value={data.kpis.orders.current}
          previous={data.kpis.orders.previous}
          change={data.kpis.orders.change}
          icon={ShoppingCart}
        />
        <KpiCard
          label="Avg Order Value"
          value={data.kpis.aov.current}
          previous={data.kpis.aov.previous}
          change={data.kpis.aov.change}
          icon={Activity}
          format="currency"
        />
        <KpiCard
          label="Items Sold"
          value={data.kpis.itemsSold.current}
          previous={data.kpis.itemsSold.previous}
          change={data.kpis.itemsSold.change}
          icon={Package}
        />
        <KpiCard
          label="New Customers"
          value={data.kpis.newCustomers.current}
          previous={data.kpis.newCustomers.previous}
          change={data.kpis.newCustomers.change}
          icon={Users}
        />
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" /> Revenue trend
            </CardTitle>
            <p className="mt-1 text-xs text-zinc-500">
              Daily revenue from paid, shipped & delivered orders
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-900" />
              <span className="text-zinc-600">This period</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 bg-zinc-400" />
              <span className="text-zinc-600">Previous period</span>
            </span>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          <RevenueTrendChart data={data.trend} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" /> Top products by
              revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsBarChart data={topProductsForChart} />
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-violet-600" /> Sales by category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={data.salesByCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-600" /> Order status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={data.statusBreakdown} />
            <div className="mt-4 space-y-2">
              {data.statusBreakdown.length === 0 && (
                <p className="text-xs text-zinc-400">
                  No orders in this period
                </p>
              )}
              {data.statusBreakdown.map((s) => (
                <div
                  key={s.status}
                  className="flex items-center justify-between text-xs"
                >
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 font-medium ring-1 ring-inset",
                      STATUS_BADGE[s.status] ?? "bg-zinc-50 text-zinc-700"
                    )}
                  >
                    {s.status}
                  </span>
                  <span className="text-zinc-600">
                    {s.count} · {inr(s.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" /> Top customers
            </CardTitle>
            <Link
              href="/admin/customers"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {data.topCustomers.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-400">
                No customer activity in this period
              </p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {data.topCustomers.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {c.name}
                        </p>
                        <p className="text-xs text-zinc-500">{c.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900">
                        {inr(c.revenue)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {c.orders} order{c.orders === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-zinc-600" /> Top sellers detail
          </CardTitle>
          <Link
            href="/admin/products"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
          >
            Manage products <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {data.topProducts.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-400">
              No products sold in this period
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                    <th className="py-2 font-medium">#</th>
                    <th className="py-2 font-medium">Product</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 text-right font-medium">Units</th>
                    <th className="py-2 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {data.topProducts.map((p, i) => (
                    <tr key={p.id}>
                      <td className="py-3 text-zinc-400">{i + 1}</td>
                      <td className="py-3 font-medium text-zinc-900">
                        {p.name}
                      </td>
                      <td className="py-3 text-zinc-500">
                        {p.category || "—"}
                      </td>
                      <td className="py-3 text-right text-zinc-700">
                        {p.units}
                      </td>
                      <td className="py-3 text-right font-semibold text-zinc-900">
                        {inr(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Distinct customers
          </p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {data.totals.distinctCustomers}
          </p>
          <p className="text-xs text-zinc-500">in selected period</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Categories selling
          </p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {data.salesByCategory.length}
          </p>
          <p className="text-xs text-zinc-500">unique categories</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Inventory on hand
          </p>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {compact(data.totals.inventoryStock)}
          </p>
          <p className="text-xs text-zinc-500">units across all products</p>
        </div>
      </div>
    </div>
  );
}
