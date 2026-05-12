import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Bulk stock check for cart items. Returns per-item availability so the
 * client can warn the user before checkout instead of failing at order time.
 *
 * Request:  { items: [{ id, quantity }] }
 * Response: { ok, issues: [{ id, name, requested, available }] }
 */

interface RequestItem {
  id: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items?: RequestItem[] };
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ ok: true, issues: [] });
    }

    const ids = items.map((it) => String(it.id)).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, stock: true },
    });

    const stockMap = new Map(
      products.map((p) => [p.id, { name: p.name, stock: p.stock }])
    );

    const issues: Array<{
      id: string;
      name: string;
      requested: number;
      available: number;
    }> = [];

    for (const item of items) {
      const found = stockMap.get(item.id);
      const requested = Math.max(1, Math.floor(Number(item.quantity) || 1));
      if (!found) {
        issues.push({
          id: item.id,
          name: "Unknown product",
          requested,
          available: 0,
        });
        continue;
      }
      if (found.stock < requested) {
        issues.push({
          id: item.id,
          name: found.name,
          requested,
          available: found.stock,
        });
      }
    }

    return NextResponse.json({ ok: issues.length === 0, issues });
  } catch (error) {
    console.error("Stock check error:", error);
    return NextResponse.json(
      { ok: false, error: "Stock check failed" },
      { status: 500 }
    );
  }
}
