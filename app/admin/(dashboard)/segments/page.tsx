import Link from "next/link";
import {
  Crown,
  Repeat,
  UserPlus,
  Sparkles,
  Moon,
  UserX,
  Download,
  ExternalLink,
  Mail,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getSegmentReport,
  SEGMENT_META,
  type SegmentKey,
} from "@/lib/segments";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ICONS: Record<SegmentKey, React.ComponentType<{ className?: string }>> = {
  vip: Crown,
  repeat: Repeat,
  first_time: UserPlus,
  recent: Sparkles,
  inactive: Moon,
  no_orders: UserX,
};

const TINT_CLASSES: Record<string, string> = {
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  violet: "bg-violet-100 text-violet-700",
  zinc: "bg-zinc-100 text-zinc-700",
  rose: "bg-rose-100 text-rose-700",
};

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fmtRelative = (iso: string | null) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.round(diff / (24 * 60 * 60 * 1000));
  if (days < 1) return "Today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
};

const SEGMENT_ORDER: SegmentKey[] = [
  "vip",
  "repeat",
  "recent",
  "first_time",
  "inactive",
  "no_orders",
];

export default async function SegmentsPage() {
  const report = await getSegmentReport();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          Customer Segments
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Auto-computed groups from order history. Export any segment as CSV
          for targeted email or SMS campaigns.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {SEGMENT_ORDER.map((key) => {
          const summary = report.summaries.find((s) => s.key === key)!;
          const Icon = ICONS[key];
          const tint = TINT_CLASSES[summary.meta.tint] ?? TINT_CLASSES.zinc;
          return (
            <Card
              key={key}
              className="border-zinc-200 shadow-sm bg-white overflow-hidden"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                      {summary.meta.label}
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1">
                      {summary.count}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {summary.meta.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                      tint
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                {summary.totalRevenue > 0 && (
                  <div className="pt-2 border-t border-zinc-100">
                    <div className="flex justify-between items-baseline text-[11px]">
                      <span className="text-zinc-500">Lifetime revenue</span>
                      <span className="font-bold text-zinc-900">
                        {inr(summary.totalRevenue)}
                      </span>
                    </div>
                    {summary.count > 0 && (
                      <div className="flex justify-between items-baseline text-[11px] mt-1">
                        <span className="text-zinc-500">Avg spend</span>
                        <span className="font-bold text-zinc-700">
                          {inr(summary.averageSpend)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-10">
        {SEGMENT_ORDER.map((key) => {
          const rows = report.byKey[key];
          const meta = SEGMENT_META[key];
          if (rows.length === 0) return null;

          const tint = TINT_CLASSES[meta.tint] ?? TINT_CLASSES.zinc;
          const exportHref = `/api/admin/segments/export?segment=${key}`;
          const emails = rows
            .slice(0, 50)
            .map((r) => r.email)
            .join(",");
          const mailtoHref = `mailto:?bcc=${encodeURIComponent(emails)}`;

          return (
            <section key={key} className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center",
                      tint
                    )}
                  >
                    {(() => {
                      const Icon = ICONS[key];
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="font-bold text-zinc-900">{meta.label}</h2>
                    <p className="text-xs text-zinc-500">
                      {rows.length} customer{rows.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Mail className="h-3.5 w-3.5" /> BCC first 50
                  </a>
                  <a
                    href={exportHref}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-zinc-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold">Customer</th>
                        <th className="px-4 py-3 text-right font-bold">Orders</th>
                        <th className="px-4 py-3 text-right font-bold">Spend</th>
                        <th className="px-4 py-3 text-left font-bold">Last order</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {rows.slice(0, 10).map((c) => (
                        <tr key={c.id} className="hover:bg-zinc-50/60">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/customers/${c.id}/edit`}
                              className="inline-flex items-center gap-1 hover:text-zinc-900"
                            >
                              <span>
                                <p className="font-medium text-zinc-900">
                                  {c.name || "—"}
                                </p>
                                <p className="text-[11px] text-zinc-500">
                                  {c.email}
                                </p>
                              </span>
                              <ExternalLink className="h-3 w-3 text-zinc-300 ml-1" />
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right text-zinc-700">
                            {c.orderCount}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-900">
                            {inr(c.totalSpend)}
                          </td>
                          <td className="px-4 py-3 text-zinc-600">
                            <span title={fmtDate(c.lastOrderAt)}>
                              {fmtRelative(c.lastOrderAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 10 && (
                  <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 text-[11px] text-zinc-500">
                    Showing top 10 of {rows.length}. Export CSV to see the full list.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-[11px] text-zinc-400 text-center">
        Report generated{" "}
        {new Date(report.generatedAt).toLocaleString("en-IN")} · {report.totalCustomers}{" "}
        total customers analyzed
      </p>
    </div>
  );
}
