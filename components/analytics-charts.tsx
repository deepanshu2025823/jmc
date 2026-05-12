"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const compactInr = (n: number) => {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
};

interface RevenueChartPoint {
  date: string;
  current: number;
  previous: number;
}

export function RevenueTrendChart({ data }: { data: RevenueChartPoint[] }) {
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="curRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#18181b" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f4f4f5"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#71717a" }}
            minTickGap={24}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#71717a" }}
            tickFormatter={compactInr}
            width={64}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: 12,
            }}
            formatter={(value, name) => [
              inr(Number(value)),
              name === "current" ? "This period" : "Previous period",
            ]}
          />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="line"
            wrapperStyle={{ fontSize: 12, color: "#52525b" }}
            formatter={(v) =>
              v === "current" ? "This period" : "Previous period"
            }
          />
          <Area
            type="monotone"
            dataKey="previous"
            stroke="#a1a1aa"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="transparent"
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke="#18181b"
            strokeWidth={2.2}
            fillOpacity={1}
            fill="url(#curRev)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CategorySlice {
  name: string;
  value: number;
}

const CATEGORY_COLORS = [
  "#18181b",
  "#3f3f46",
  "#71717a",
  "#a1a1aa",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
];

export function CategoryPieChart({ data }: { data: CategorySlice[] }) {
  if (!data.length) {
    return (
      <div className="h-[260px] flex items-center justify-center text-sm text-zinc-400">
        No category data for this period
      </div>
    );
  }
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              fontSize: 12,
            }}
            formatter={(value) => inr(Number(value))}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(v) => <span className="text-zinc-600">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface StatusSlice {
  status: string;
  count: number;
  value: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PAID: "#3b82f6",
  SHIPPED: "#8b5cf6",
  DELIVERED: "#10b981",
};

export function OrderStatusChart({ data }: { data: StatusSlice[] }) {
  if (!data.length) {
    return (
      <div className="h-[260px] flex items-center justify-center text-sm text-zinc-400">
        No orders in this period
      </div>
    );
  }
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((d) => (
              <Cell
                key={d.status}
                fill={STATUS_COLORS[d.status] ?? "#71717a"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              fontSize: 12,
            }}
            formatter={(value, _name, ctx) => [
              `${Number(value)} orders`,
              (ctx?.payload as { status?: string } | undefined)?.status ?? "",
            ]}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(v) => <span className="text-zinc-600">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TopProductBar {
  name: string;
  revenue: number;
}

export function TopProductsBarChart({ data }: { data: TopProductBar[] }) {
  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-sm text-zinc-400">
        No product sales in this period
      </div>
    );
  }
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="#f4f4f5" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#71717a" }}
            tickFormatter={compactInr}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            width={140}
            tick={{ fontSize: 12, fill: "#3f3f46" }}
          />
          <Tooltip
            cursor={{ fill: "#fafafa" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4e4e7",
              fontSize: 12,
            }}
            formatter={(value) => [inr(Number(value)), "Revenue"]}
          />
          <Bar dataKey="revenue" fill="#18181b" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { inr, compactInr };
