import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { rangeLabel, type RangeKey } from "@/lib/analytics-ranges";

export { parseRange, RANGE_OPTIONS, rangeLabel } from "@/lib/analytics-ranges";
export type { RangeKey } from "@/lib/analytics-ranges";

const PAID_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export interface ResolvedRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
}

export function resolveRange(range: RangeKey): ResolvedRange {
  const now = new Date();
  let start: Date;
  let end: Date = endOfDay(now);

  switch (range) {
    case "today":
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      start = startOfDay(y);
      end = endOfDay(y);
      break;
    }
    case "7d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      start = startOfDay(s);
      break;
    }
    case "30d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 29);
      start = startOfDay(s);
      break;
    }
    case "90d": {
      const s = new Date(now);
      s.setDate(s.getDate() - 89);
      start = startOfDay(s);
      break;
    }
    case "this_month":
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    case "last_month":
      start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      break;
    case "this_year":
      start = startOfDay(new Date(now.getFullYear(), 0, 1));
      break;
  }

  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return { start, end, prevStart, prevEnd };
}

function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return ((curr - prev) / prev) * 100;
}

export interface KpiMetric {
  current: number;
  previous: number;
  change: number | null;
}

export interface TrendPoint {
  date: string;
  current: number;
  previous: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string | null;
  revenue: number;
  units: number;
}

export interface CategorySlice {
  name: string;
  value: number;
}

export interface StatusSlice {
  status: OrderStatus;
  count: number;
  value: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsData {
  range: RangeKey;
  rangeLabel: string;
  start: string;
  end: string;
  prevStart: string;
  prevEnd: string;
  kpis: {
    revenue: KpiMetric;
    orders: KpiMetric;
    aov: KpiMetric;
    newCustomers: KpiMetric;
    itemsSold: KpiMetric;
  };
  trend: TrendPoint[];
  topProducts: TopProduct[];
  salesByCategory: CategorySlice[];
  statusBreakdown: StatusSlice[];
  topCustomers: TopCustomer[];
  totals: {
    inventoryStock: number;
    distinctCustomers: number;
  };
}

const dayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const dayLabel = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export async function getAnalytics(range: RangeKey): Promise<AnalyticsData> {
  const { start, end, prevStart, prevEnd } = resolveRange(range);

  const [
    currOrders,
    prevOrders,
    newCustomers,
    prevNewCustomers,
    statusGroups,
    inventoryStock,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: PAID_STATUSES }, createdAt: { gte: start, lte: end } },
      select: { id: true, totalAmount: true, createdAt: true, userId: true },
    }),
    prisma.order.findMany({
      where: {
        status: { in: PAID_STATUSES },
        createdAt: { gte: prevStart, lte: prevEnd },
      },
      select: { id: true, totalAmount: true, createdAt: true, userId: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.user.count({
      where: { createdAt: { gte: prevStart, lte: prevEnd } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: start, lte: end } },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.product.aggregate({ _sum: { stock: true } }),
  ]);

  const sumRevenue = (xs: { totalAmount: unknown }[]) =>
    xs.reduce((s, o) => s + Number(o.totalAmount), 0);

  const currRevenue = sumRevenue(currOrders);
  const prevRevenue = sumRevenue(prevOrders);
  const currOrderCount = currOrders.length;
  const prevOrderCount = prevOrders.length;
  const currAOV = currOrderCount ? currRevenue / currOrderCount : 0;
  const prevAOV = prevOrderCount ? prevRevenue / prevOrderCount : 0;

  // Build daily trend buckets aligned to current period.
  const buckets = new Map<string, TrendPoint>();
  for (
    let cursor = new Date(start);
    cursor <= end;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    buckets.set(dayKey(cursor), {
      date: dayLabel(cursor),
      current: 0,
      previous: 0,
    });
  }

  for (const o of currOrders) {
    const k = dayKey(new Date(o.createdAt));
    const b = buckets.get(k);
    if (b) b.current += Number(o.totalAmount);
  }

  // Map prev-period orders onto the same axis by aligning prevStart -> start.
  const offsetMs = start.getTime() - prevStart.getTime();
  for (const o of prevOrders) {
    const shifted = new Date(new Date(o.createdAt).getTime() + offsetMs);
    const b = buckets.get(dayKey(shifted));
    if (b) b.previous += Number(o.totalAmount);
  }
  const trend = Array.from(buckets.values());

  // Order items in current range -> top products, category, items sold.
  const orderIds = currOrders.map((o) => o.id);
  const items = orderIds.length
    ? await prisma.orderItem.findMany({
        where: { orderId: { in: orderIds } },
        select: {
          quantity: true,
          price: true,
          product: { select: { id: true, name: true, category: true } },
        },
      })
    : [];

  const productAgg = new Map<string, TopProduct>();
  const categoryAgg = new Map<string, number>();
  let itemsSold = 0;

  for (const it of items) {
    const rev = Number(it.price) * it.quantity;
    itemsSold += it.quantity;

    const pid = it.product.id;
    const existing = productAgg.get(pid);
    if (existing) {
      existing.revenue += rev;
      existing.units += it.quantity;
    } else {
      productAgg.set(pid, {
        id: pid,
        name: it.product.name,
        category: it.product.category,
        revenue: rev,
        units: it.quantity,
      });
    }

    const cat = it.product.category || "Uncategorized";
    categoryAgg.set(cat, (categoryAgg.get(cat) ?? 0) + rev);
  }

  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const salesByCategory = Array.from(categoryAgg.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Items sold previous period (one extra query, kept light by selecting only what we need).
  const prevOrderIds = prevOrders.map((o) => o.id);
  let prevItemsSold = 0;
  if (prevOrderIds.length) {
    const agg = await prisma.orderItem.aggregate({
      where: { orderId: { in: prevOrderIds } },
      _sum: { quantity: true },
    });
    prevItemsSold = agg._sum.quantity ?? 0;
  }

  const statusBreakdown: StatusSlice[] = statusGroups.map((s) => ({
    status: s.status,
    count: s._count._all,
    value: Number(s._sum.totalAmount ?? 0),
  }));

  // Top customers by spend in current range.
  const customerAgg = new Map<string, { revenue: number; orders: number }>();
  for (const o of currOrders) {
    const cur = customerAgg.get(o.userId) ?? { revenue: 0, orders: 0 };
    cur.revenue += Number(o.totalAmount);
    cur.orders += 1;
    customerAgg.set(o.userId, cur);
  }
  const distinctCustomers = customerAgg.size;
  const topCustomerIds = Array.from(customerAgg.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([id]) => id);

  const customerDetails = topCustomerIds.length
    ? await prisma.user.findMany({
        where: { id: { in: topCustomerIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const topCustomers: TopCustomer[] = topCustomerIds.map((id) => {
    const u = customerDetails.find((x) => x.id === id);
    const a = customerAgg.get(id)!;
    return {
      id,
      name: u?.name || "Guest",
      email: u?.email || "",
      revenue: a.revenue,
      orders: a.orders,
    };
  });

  return {
    range,
    rangeLabel: rangeLabel(range),
    start: start.toISOString(),
    end: end.toISOString(),
    prevStart: prevStart.toISOString(),
    prevEnd: prevEnd.toISOString(),
    kpis: {
      revenue: {
        current: currRevenue,
        previous: prevRevenue,
        change: pctChange(currRevenue, prevRevenue),
      },
      orders: {
        current: currOrderCount,
        previous: prevOrderCount,
        change: pctChange(currOrderCount, prevOrderCount),
      },
      aov: {
        current: currAOV,
        previous: prevAOV,
        change: pctChange(currAOV, prevAOV),
      },
      newCustomers: {
        current: newCustomers,
        previous: prevNewCustomers,
        change: pctChange(newCustomers, prevNewCustomers),
      },
      itemsSold: {
        current: itemsSold,
        previous: prevItemsSold,
        change: pctChange(itemsSold, prevItemsSold),
      },
    },
    trend,
    topProducts,
    salesByCategory,
    statusBreakdown,
    topCustomers,
    totals: {
      inventoryStock: inventoryStock._sum.stock ?? 0,
      distinctCustomers,
    },
  };
}
