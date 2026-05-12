import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendAbandonedReminderEmail } from "@/lib/abandoned-email";

export const dynamic = "force-dynamic";

/**
 * Cron endpoint that finds abandoned checkouts older than 1 hour
 * and sends one reminder email each. Idempotent — `lastReminderAt`
 * gates re-sending.
 *
 * Auth options:
 *   - Vercel Cron: include `Authorization: Bearer ${CRON_SECRET}` header
 *   - Manual trigger: pass `?secret=...` matching CRON_SECRET env
 *
 * Tunables (env):
 *   - ABANDONED_AGE_MINUTES (default 60)  — age threshold
 *   - ABANDONED_MAX_REMINDERS (default 1) — max reminders per cart
 *   - CRON_SECRET — required to call (skip in dev if unset)
 */

interface ItemSnapshot {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

function authorize(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Dev convenience: skip auth if secret is unset.
    return process.env.NODE_ENV !== "production";
  }
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${expected}`) return true;
  const url = new URL(req.url);
  return url.searchParams.get("secret") === expected;
}

async function processAbandonedCarts() {
  const ageMinutes = Number(process.env.ABANDONED_AGE_MINUTES || 60);
  const maxReminders = Number(process.env.ABANDONED_MAX_REMINDERS || 1);
  const cutoff = new Date(Date.now() - ageMinutes * 60 * 1000);

  const carts = await prisma.abandonedCheckout.findMany({
    where: {
      recoveredAt: null,
      reminderCount: { lt: maxReminders },
      OR: [
        { lastReminderAt: null, updatedAt: { lt: cutoff } },
        { lastReminderAt: { lt: cutoff } },
      ],
    },
    include: { user: { select: { name: true } } },
    take: 50,
  });

  let sent = 0;
  let failed = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const cart of carts) {
    try {
      await sendAbandonedReminderEmail({
        to: cart.email,
        name: cart.user.name,
        items: cart.itemsSnapshot as unknown as ItemSnapshot[],
        totalAmount: Number(cart.totalAmount),
      });
      await prisma.abandonedCheckout.update({
        where: { id: cart.id },
        data: {
          reminderCount: { increment: 1 },
          lastReminderAt: new Date(),
        },
      });
      sent += 1;
    } catch (err) {
      failed += 1;
      errors.push({
        id: cart.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { found: carts.length, sent, failed, errors };
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await processAbandonedCarts();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Abandoned cart cron error:", error);
    return NextResponse.json(
      { error: "Cron processing failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
