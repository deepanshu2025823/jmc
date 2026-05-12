/**
 * Customer segmentation — pure data layer.
 *
 * Computes mutually-non-exclusive segments from existing User + Order data.
 * No new schema needed. Read-heavy; safe to call from server components.
 */

import prisma from "@/lib/prisma";

export type SegmentKey =
  | "vip"
  | "repeat"
  | "first_time"
  | "inactive"
  | "recent"
  | "no_orders";

export interface SegmentMeta {
  key: SegmentKey;
  label: string;
  description: string;
  tint: string;
}

export const SEGMENT_META: Record<SegmentKey, SegmentMeta> = {
  vip: {
    key: "vip",
    label: "VIP",
    description: "Lifetime spend ≥ ₹50,000 or 5+ orders",
    tint: "amber",
  },
  repeat: {
    key: "repeat",
    label: "Repeat buyers",
    description: "2 or more completed orders",
    tint: "emerald",
  },
  first_time: {
    key: "first_time",
    label: "First-time buyers",
    description: "Exactly one order placed",
    tint: "blue",
  },
  recent: {
    key: "recent",
    label: "Recently active",
    description: "Order placed in the last 7 days",
    tint: "violet",
  },
  inactive: {
    key: "inactive",
    label: "Inactive",
    description: "Last order > 60 days ago",
    tint: "zinc",
  },
  no_orders: {
    key: "no_orders",
    label: "No orders yet",
    description: "Signed up but never purchased",
    tint: "rose",
  },
};

export interface CustomerRow {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  orderCount: number;
  totalSpend: number;
  lastOrderAt: string | null;
  firstOrderAt: string | null;
  createdAt: string;
}

interface CustomerComputed extends CustomerRow {
  segments: Set<SegmentKey>;
}

const VIP_SPEND = 50000;
const VIP_ORDERS = 5;
const RECENT_DAYS = 7;
const INACTIVE_DAYS = 60;

async function loadCustomers(): Promise<CustomerComputed[]> {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      orders: {
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        select: { totalAmount: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const now = Date.now();

  return users.map((u) => {
    const orderCount = u.orders.length;
    const totalSpend = u.orders.reduce(
      (s, o) => s + Number(o.totalAmount),
      0
    );
    const lastOrder = u.orders[0];
    const firstOrder = u.orders[u.orders.length - 1];

    const segments = new Set<SegmentKey>();
    if (orderCount === 0) {
      segments.add("no_orders");
    } else {
      if (orderCount === 1) segments.add("first_time");
      if (orderCount >= 2) segments.add("repeat");
      if (orderCount >= VIP_ORDERS || totalSpend >= VIP_SPEND)
        segments.add("vip");

      if (lastOrder) {
        const ageDays =
          (now - lastOrder.createdAt.getTime()) / (24 * 60 * 60 * 1000);
        if (ageDays <= RECENT_DAYS) segments.add("recent");
        if (ageDays > INACTIVE_DAYS) segments.add("inactive");
      }
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      orderCount,
      totalSpend,
      lastOrderAt: lastOrder?.createdAt.toISOString() ?? null,
      firstOrderAt: firstOrder?.createdAt.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
      segments,
    };
  });
}

export interface SegmentSummary {
  key: SegmentKey;
  meta: SegmentMeta;
  count: number;
  totalRevenue: number;
  averageSpend: number;
}

export interface SegmentReport {
  generatedAt: string;
  totalCustomers: number;
  summaries: SegmentSummary[];
  byKey: Record<SegmentKey, CustomerRow[]>;
}

export async function getSegmentReport(): Promise<SegmentReport> {
  const customers = await loadCustomers();

  const byKey: Record<SegmentKey, CustomerComputed[]> = {
    vip: [],
    repeat: [],
    first_time: [],
    inactive: [],
    recent: [],
    no_orders: [],
  };

  for (const c of customers) {
    for (const s of c.segments) byKey[s].push(c);
  }

  // Sort each segment by spend desc — most valuable first.
  for (const key of Object.keys(byKey) as SegmentKey[]) {
    byKey[key].sort((a, b) => b.totalSpend - a.totalSpend);
  }

  const summaries: SegmentSummary[] = (
    Object.keys(byKey) as SegmentKey[]
  ).map((key) => {
    const list = byKey[key];
    const totalRevenue = list.reduce((s, c) => s + c.totalSpend, 0);
    return {
      key,
      meta: SEGMENT_META[key],
      count: list.length,
      totalRevenue,
      averageSpend: list.length > 0 ? totalRevenue / list.length : 0,
    };
  });

  const stripSegments = (rows: CustomerComputed[]): CustomerRow[] =>
    rows.map(({ segments: _segments, ...rest }) => {
      void _segments;
      return rest;
    });

  return {
    generatedAt: new Date().toISOString(),
    totalCustomers: customers.length,
    summaries,
    byKey: {
      vip: stripSegments(byKey.vip),
      repeat: stripSegments(byKey.repeat),
      first_time: stripSegments(byKey.first_time),
      inactive: stripSegments(byKey.inactive),
      recent: stripSegments(byKey.recent),
      no_orders: stripSegments(byKey.no_orders),
    },
  };
}

export function isSegmentKey(value: string): value is SegmentKey {
  return value in SEGMENT_META;
}

export function toCsv(rows: CustomerRow[]): string {
  const header = [
    "name",
    "email",
    "phone",
    "orders",
    "total_spend_inr",
    "first_order",
    "last_order",
    "signed_up",
  ].join(",");

  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines = rows.map((r) =>
    [
      escape(r.name ?? ""),
      escape(r.email),
      escape(r.phone ?? ""),
      String(r.orderCount),
      String(Math.round(r.totalSpend)),
      r.firstOrderAt ?? "",
      r.lastOrderAt ?? "",
      r.createdAt,
    ].join(",")
  );

  return [header, ...lines].join("\n");
}
