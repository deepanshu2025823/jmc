/**
 * Thin wrapper around Razorpay's Subscriptions API.
 *
 * Razorpay flow:
 *   1. Create a Plan (one per product+interval)
 *   2. Create a Subscription against that plan for a customer
 *   3. Razorpay returns `short_url` — redirect customer to authenticate
 *   4. After auth, status flips to "authenticated" → "active" → "charged" each cycle
 *   5. Subscribe to webhooks: subscription.activated, subscription.charged,
 *      subscription.cancelled, subscription.completed, subscription.halted
 */

import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "@/lib/prisma";

async function getCredentials(): Promise<{ keyId: string; keySecret: string } | null> {
  const settings = await prisma.storeSettings.findFirst({
    select: { razorpayKeyId: true, razorpayKeySecret: true },
  });
  const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
  const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

async function getClient() {
  const creds = await getCredentials();
  if (!creds) return null;
  return new Razorpay({ key_id: creds.keyId, key_secret: creds.keySecret });
}

interface RzpPlan {
  id: string;
  item: { id: string; name: string; amount: number; currency: string };
  period: string;
  interval: number;
}

interface RzpSubscription {
  id: string;
  status: string;
  short_url?: string;
  current_start?: number;
  current_end?: number;
  charge_at?: number;
  total_count?: number;
  paid_count?: number;
}

export interface CreatedSubscription {
  subscriptionId: string;
  planId: string;
  shortUrl: string;
  status: string;
}

/**
 * Create (or reuse) a plan + a subscription for the given product/customer.
 * Razorpay plans are reusable so we cache the planId on the product if needed,
 * but for simplicity we recreate per subscription — Razorpay dedupes by name.
 */
export async function createProductSubscription(input: {
  productId: string;
  productName: string;
  amountPaise: number;
  intervalMonths: number;
  totalCycles?: number;
  customer: {
    name: string;
    email: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}): Promise<CreatedSubscription> {
  const client = await getClient();
  if (!client) {
    throw new Error("Razorpay credentials not configured");
  }

  const plan = (await client.plans.create({
    period: "monthly",
    interval: Math.max(1, input.intervalMonths),
    item: {
      name: `${input.productName} (every ${input.intervalMonths}mo)`,
      amount: input.amountPaise,
      currency: "INR",
      description: `Auto-replenish subscription for ${input.productName}`,
    },
    notes: input.notes,
  })) as unknown as RzpPlan;

  const sub = (await client.subscriptions.create({
    plan_id: plan.id,
    total_count: input.totalCycles ?? 60,
    quantity: 1,
    customer_notify: 1,
    notify_info: {
      notify_email: input.customer.email,
      notify_phone: input.customer.contact ?? "",
    },
    notes: {
      ...input.notes,
      productId: input.productId,
    },
  })) as unknown as RzpSubscription;

  return {
    subscriptionId: sub.id,
    planId: plan.id,
    shortUrl: sub.short_url || "",
    status: sub.status,
  };
}

export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd = false
): Promise<{ status: string }> {
  const client = await getClient();
  if (!client) throw new Error("Razorpay credentials not configured");
  const res = (await client.subscriptions.cancel(
    subscriptionId,
    cancelAtCycleEnd
  )) as unknown as { status: string };
  return { status: res.status };
}

export async function pauseRazorpaySubscription(
  subscriptionId: string
): Promise<{ status: string }> {
  const client = await getClient();
  if (!client) throw new Error("Razorpay credentials not configured");
  const res = (await client.subscriptions.pause(subscriptionId, {
    pause_at: "now",
  })) as unknown as { status: string };
  return { status: res.status };
}

export async function resumeRazorpaySubscription(
  subscriptionId: string
): Promise<{ status: string }> {
  const client = await getClient();
  if (!client) throw new Error("Razorpay credentials not configured");
  const res = (await client.subscriptions.resume(subscriptionId, {
    resume_at: "now",
  })) as unknown as { status: string };
  return { status: res.status };
}

/**
 * Verifies a Razorpay webhook signature using the configured secret.
 * Razorpay sends `X-Razorpay-Signature` header; we HMAC-SHA256 the raw body.
 */
export async function verifyRazorpayWebhook(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const settings = await prisma.storeSettings.findFirst({
    select: { razorpayWebhookSecret: true },
  });
  const secret =
    settings?.razorpayWebhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}
