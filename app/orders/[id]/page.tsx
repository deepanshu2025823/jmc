import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Circle,
  Clock,
  Package,
  Truck,
  Home,
  XCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { Header } from "@/components/header";
import { CancelOrderButton } from "@/components/cancel-order-button";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "PENDING", label: "Order placed", icon: Clock },
  { key: "PAID", label: "Payment confirmed", icon: CheckCircle2 },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Home },
] as const;

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  PAID: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

const fmtDateTime = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/orders/${id}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: {
          product: {
            select: { id: true, name: true, imageUrl: true },
          },
        },
      },
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) notFound();

  if (order.userId !== user.id && user.role !== "ADMIN") {
    notFound();
  }

  const isCancelled = order.status === "CANCELLED";
  const currentStep = STATUS_INDEX[order.status] ?? 0;
  const stamps: Record<string, string | null> = {
    PENDING: order.createdAt.toISOString(),
    PAID: order.paidAt?.toISOString() ?? null,
    SHIPPED: order.shippedAt?.toISOString() ?? null,
    DELIVERED: order.deliveredAt?.toISOString() ?? null,
  };

  const subtotal = order.orderItems.reduce(
    (s, it) => s + Number(it.price) * it.quantity,
    0
  );

  const eta =
    order.status === "SHIPPED" && order.shippedAt
      ? new Date(order.shippedAt.getTime() + 5 * 24 * 60 * 60 * 1000)
      : order.status === "PAID" && order.paidAt
      ? new Date(order.paidAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      : null;

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Header />

      <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-24 lg:pt-32 pb-16">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
        </Link>

        {/* Status Hero */}
        <div className="mt-6 rounded-[2rem] bg-white border border-zinc-100 shadow-sm overflow-hidden">
          <div
            className={cn(
              "px-7 py-6 sm:px-10 sm:py-8 border-b border-zinc-100",
              isCancelled
                ? "bg-rose-50/40"
                : order.status === "DELIVERED"
                ? "bg-emerald-50/40"
                : "bg-[#F9F6F0]"
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles
                className={cn(
                  "h-4 w-4",
                  isCancelled
                    ? "text-rose-600"
                    : order.status === "DELIVERED"
                    ? "text-emerald-600"
                    : "text-[#B59461]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.25em]",
                  isCancelled
                    ? "text-rose-600"
                    : order.status === "DELIVERED"
                    ? "text-emerald-600"
                    : "text-[#B59461]"
                )}
              >
                Order {isCancelled ? "Cancelled" : order.status.replace("_", " ")}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-zinc-900">
              {isCancelled
                ? "This order has been cancelled"
                : order.status === "DELIVERED"
                ? "Your ritual has arrived"
                : order.status === "SHIPPED"
                ? "Your ritual is on the way"
                : order.status === "PAID"
                ? "Preparing your ritual"
                : "Order received"}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="font-mono font-bold text-zinc-700">
                #{order.id.slice(-8).toUpperCase()}
              </span>
              <span className="text-zinc-300">·</span>
              <span>Placed {fmtDate(order.createdAt)}</span>
              {eta && !isCancelled && order.status !== "DELIVERED" && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span>
                    Estimated delivery by{" "}
                    <span className="font-bold text-zinc-700">{fmtDate(eta)}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="px-5 py-7 sm:px-10 sm:py-9">
            {isCancelled ? (
              <div className="flex items-start gap-4 rounded-2xl bg-rose-50 border border-rose-200 p-5">
                <XCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-rose-900">
                    Cancelled on {fmtDateTime(order.cancelledAt?.toISOString() ?? null)}
                  </p>
                  {order.cancelReason && (
                    <p className="text-xs text-rose-700 mt-1">
                      Reason: {order.cancelReason}
                    </p>
                  )}
                  <p className="text-xs text-rose-700 mt-2">
                    Items have been restocked. If you paid online, the refund
                    will appear in 5–7 business days.
                  </p>
                </div>
              </div>
            ) : (
              <ol className="relative">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isComplete = i <= currentStep;
                  const isCurrent = i === currentStep;
                  const stamp = stamps[step.key];
                  const isLast = i === STEPS.length - 1;
                  return (
                    <li key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors",
                            isComplete
                              ? "bg-zinc-900 border-zinc-900 text-white"
                              : "bg-white border-zinc-200 text-zinc-300"
                          )}
                        >
                          {isComplete ? (
                            <Icon className="h-4 w-4" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={cn(
                              "w-0.5 flex-1 my-1 min-h-[28px]",
                              i < currentStep ? "bg-zinc-900" : "bg-zinc-200"
                            )}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-7">
                        <p
                          className={cn(
                            "text-sm font-bold",
                            isComplete ? "text-zinc-900" : "text-zinc-400"
                          )}
                        >
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                              Current
                            </span>
                          )}
                        </p>
                        {stamp ? (
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {fmtDateTime(stamp)}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-300 mt-0.5">
                            Awaiting update
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        {/* Tracking */}
        {!isCancelled && (order.trackingNumber || order.courier) && (
          <div className="mt-6 rounded-3xl bg-white border border-zinc-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 shrink-0 rounded-full bg-violet-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-violet-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Shipment tracking
                </p>
                <p className="font-serif text-xl text-zinc-900 mt-1">
                  {order.courier || "Courier"}
                  {order.shiprocketOrderId && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-700 ring-1 ring-inset ring-violet-200 align-middle">
                      via Shiprocket
                    </span>
                  )}
                </p>
                {order.trackingNumber && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-1.5 border border-zinc-100">
                    <span className="font-mono text-sm font-bold text-zinc-900">
                      {order.trackingNumber}
                    </span>
                    <CopyButton value={order.trackingNumber} />
                  </div>
                )}
                {order.shiprocketOrderId && order.trackingNumber ? (
                  <a
                    href={`https://shiprocket.co/tracking/${encodeURIComponent(
                      order.trackingNumber
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-700 hover:text-violet-900"
                  >
                    Track live on Shiprocket →
                  </a>
                ) : (
                  <p className="text-xs text-zinc-500 mt-3">
                    Use this number on your courier&apos;s tracking page for
                    real-time location updates.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="mt-6 rounded-3xl bg-white border border-zinc-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 sm:px-8 border-b border-zinc-100 flex items-center gap-2">
            <Package className="h-4 w-4 text-zinc-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
              Items in this order
            </p>
          </div>
          <div className="divide-y divide-zinc-100">
            {order.orderItems.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.product.id}`}
                className="flex items-center gap-4 px-6 py-4 sm:px-8 hover:bg-zinc-50/60 transition-colors"
              >
                <div className="relative h-16 w-14 sm:h-20 sm:w-16 shrink-0 rounded-lg overflow-hidden bg-[#F9F6F0] border border-zinc-100">
                  {item.product.imageUrl && (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-zinc-900 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1">
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-zinc-900 shrink-0">
                  {inr(Number(item.price) * item.quantity)}
                </p>
              </Link>
            ))}
          </div>
          <div className="px-6 py-5 sm:px-8 bg-[#fafafa] space-y-2">
            <div className="flex justify-between items-center text-xs text-zinc-500">
              <span>Subtotal</span>
              <span className="text-zinc-700 font-medium">{inr(subtotal)}</span>
            </div>
            {subtotal !== Number(order.totalAmount) && (
              <div className="flex justify-between items-center text-xs text-emerald-700">
                <span>Discount</span>
                <span className="font-bold">
                  −{inr(Math.max(0, subtotal - Number(order.totalAmount)))}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-900">
                Total paid
              </span>
              <span className="font-serif text-2xl text-zinc-900">
                {inr(Number(order.totalAmount))}
              </span>
            </div>
          </div>
        </div>

        {/* Cancel button (only for PENDING) */}
        {order.status === "PENDING" && (
          <div className="mt-6">
            <CancelOrderButton orderId={order.id} />
          </div>
        )}

        {/* Help footer */}
        <div className="mt-8 text-center text-xs text-zinc-400">
          Need help with this order?{" "}
          <Link href="/contact" className="text-zinc-700 underline">
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
}

