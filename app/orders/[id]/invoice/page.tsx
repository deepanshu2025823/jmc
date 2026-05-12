import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  getInvoiceConfig,
  buildInvoiceNumber,
  splitGstInclusive,
  amountInWords,
} from "@/lib/invoice-config";
import { InvoiceToolbar } from "@/components/print-button";

export const dynamic = "force-dynamic";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const inrNum = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/orders/${id}/invoice`);
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
            select: { id: true, name: true, slug: true },
          },
        },
      },
      user: { select: { name: true, email: true } },
    },
  });
  if (!order) notFound();
  if (order.userId !== user.id && user.role !== "ADMIN") notFound();

  const { seller: SELLER, gstRate: INVOICE_GST_RATE, prefix } =
    await getInvoiceConfig();

  const invoiceNumber = buildInvoiceNumber(order.id, order.createdAt, prefix);
  const totalAmount = Number(order.totalAmount);
  const subtotalRaw = order.orderItems.reduce(
    (s, it) => s + Number(it.price) * it.quantity,
    0
  );
  const discount = Math.max(0, subtotalRaw - totalAmount);

  // GST treatment — total is GST-inclusive. Intrastate if buyer state contains
  // the same word as seller state (very rough heuristic; admin can refine).
  const sellerStateHint = (SELLER.cityLine || "").toLowerCase();
  const buyerStateHint = (order.shippingState || "").toLowerCase();
  const intrastate =
    sellerStateHint.length > 0 &&
    buyerStateHint.length > 0 &&
    sellerStateHint.includes(buyerStateHint);

  const tax = splitGstInclusive(totalAmount, INVOICE_GST_RATE, intrastate);

  return (
    <main className="min-h-screen bg-zinc-100 print:bg-white">
      <InvoiceToolbar backHref={`/orders/${order.id}`} />

      <div className="max-w-3xl mx-auto bg-white shadow-xl print:shadow-none my-8 print:my-0">
        <div className="px-8 sm:px-12 py-10 sm:py-14 print:px-10 print:py-8">
          {/* Header */}
          <header className="flex items-start justify-between gap-6 pb-8 border-b-2 border-zinc-900">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B59461]">
                Tax Invoice
              </p>
              <h1 className="mt-2 font-serif text-3xl text-zinc-900 leading-tight">
                {SELLER.name}
              </h1>
              <p className="text-xs text-zinc-500 mt-2 whitespace-pre-line">
                {SELLER.address}
              </p>
              <p className="text-xs text-zinc-500">{SELLER.cityLine}</p>
              <div className="text-[11px] text-zinc-500 mt-2 space-y-0.5">
                {SELLER.email && <p>{SELLER.email}</p>}
                {SELLER.phone && <p>{SELLER.phone}</p>}
                {SELLER.website && <p>{SELLER.website}</p>}
              </div>
              {(SELLER.gstin || SELLER.pan) && (
                <div className="text-[11px] text-zinc-700 mt-2 space-y-0.5">
                  {SELLER.gstin && (
                    <p>
                      <span className="text-zinc-400">GSTIN:</span>{" "}
                      <span className="font-mono font-bold">{SELLER.gstin}</span>
                    </p>
                  )}
                  {SELLER.pan && (
                    <p>
                      <span className="text-zinc-400">PAN:</span>{" "}
                      <span className="font-mono font-bold">{SELLER.pan}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Invoice
              </p>
              <p className="font-mono text-sm font-bold text-zinc-900 mt-1">
                {invoiceNumber}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-4">
                Date
              </p>
              <p className="text-sm text-zinc-700 mt-1">
                {fmtDate(order.createdAt)}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-4">
                Order Ref
              </p>
              <p className="font-mono text-xs text-zinc-700 mt-1">
                #{order.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </header>

          {/* Bill To */}
          <section className="grid grid-cols-2 gap-8 mt-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Bill To
              </p>
              <p className="font-bold text-zinc-900 mt-2">
                {order.shippingName || order.user.name || "Customer"}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                {order.shippingEmail || order.user.email}
              </p>
              {order.shippingPhone && (
                <p className="text-xs text-zinc-600">{order.shippingPhone}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Ship To
              </p>
              <p className="text-xs text-zinc-700 mt-2 leading-relaxed">
                {order.shippingAddress || "—"}
                {order.shippingCity && (
                  <>
                    <br />
                    {order.shippingCity}
                    {order.shippingState && `, ${order.shippingState}`}
                    {order.shippingPincode && ` - ${order.shippingPincode}`}
                  </>
                )}
              </p>
            </div>
          </section>

          {/* Items table */}
          <section className="mt-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-300 text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="py-3 text-left font-black w-12">#</th>
                  <th className="py-3 text-left font-black">Item</th>
                  <th className="py-3 text-right font-black w-16">Qty</th>
                  <th className="py-3 text-right font-black w-24">Price</th>
                  <th className="py-3 text-right font-black w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((it, idx) => {
                  const lineAmount = Number(it.price) * it.quantity;
                  return (
                    <tr key={it.id} className="border-b border-zinc-100">
                      <td className="py-3 text-zinc-500">{idx + 1}.</td>
                      <td className="py-3">
                        <p className="font-medium text-zinc-900 leading-tight">
                          {it.product.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 font-mono uppercase">
                          {it.product.slug}
                        </p>
                      </td>
                      <td className="py-3 text-right text-zinc-700">
                        {it.quantity}
                      </td>
                      <td className="py-3 text-right text-zinc-700 font-mono">
                        {inrNum(Number(it.price))}
                      </td>
                      <td className="py-3 text-right text-zinc-900 font-bold font-mono">
                        {inrNum(lineAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Totals */}
          <section className="mt-6 flex justify-end">
            <div className="w-full sm:w-80 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-mono">{inrNum(subtotalRaw)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-mono">−{inrNum(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600 pt-2 border-t border-zinc-200">
                <span>Taxable value</span>
                <span className="font-mono">{inrNum(tax.taxable)}</span>
              </div>
              {intrastate ? (
                <>
                  <div className="flex justify-between text-zinc-600">
                    <span>CGST ({INVOICE_GST_RATE / 2}%)</span>
                    <span className="font-mono">{inrNum(tax.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>SGST ({INVOICE_GST_RATE / 2}%)</span>
                    <span className="font-mono">{inrNum(tax.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-zinc-600">
                  <span>IGST ({INVOICE_GST_RATE}%)</span>
                  <span className="font-mono">{inrNum(tax.igst)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-3 mt-2 border-t-2 border-zinc-900">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                  Total payable
                </span>
                <span className="font-serif text-2xl font-bold text-zinc-900">
                  {inr(totalAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Amount in words */}
          <section className="mt-8 rounded-md bg-zinc-50 border border-zinc-200 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Amount in words
            </p>
            <p className="text-sm font-bold text-zinc-800 mt-1 capitalize">
              {amountInWords(totalAmount)}
            </p>
          </section>

          {/* Payment + footer */}
          <section className="mt-8 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Payment Method
              </p>
              <p className="text-zinc-800 font-bold mt-1">
                {order.paymentMethod === "ONLINE"
                  ? "Online (Prepaid)"
                  : "Cash on Delivery"}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-3">
                Order Status
              </p>
              <p className="text-zinc-800 font-bold mt-1 capitalize">
                {order.status.toLowerCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                For {SELLER.name}
              </p>
              <div className="mt-12 border-t border-zinc-300 pt-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Authorised Signatory
                </p>
              </div>
            </div>
          </section>

          {/* Notes */}
          <footer className="mt-10 pt-6 border-t border-zinc-200 text-[10px] text-zinc-500 leading-relaxed space-y-1">
            <p>
              All prices are inclusive of {INVOICE_GST_RATE}% GST. This is a
              computer-generated invoice and does not require a physical
              signature.
            </p>
            <p>
              For queries about this invoice, please contact {SELLER.email}.
              Returns &amp; refunds follow our published policy.
            </p>
            <p className="pt-2 text-center italic text-[#B59461]">
              Thank you for shopping with {SELLER.name} ✦
            </p>
          </footer>
        </div>
      </div>

      {/* Print-only spacer to avoid trailing blank pages */}
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          html, body { background: #fff !important; }
        }
      `}</style>
    </main>
  );
}
