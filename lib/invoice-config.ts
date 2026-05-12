/**
 * Invoice / seller config — DB-backed with env fallback.
 *
 * Source of truth (in order of precedence):
 *   1. StoreSettings row (admin can edit via /admin/profile)
 *   2. Environment variables (STORE_NAME, STORE_GSTIN, etc.)
 *   3. Hard-coded defaults
 *
 * Call `getInvoiceConfig()` (async) from server components / server actions.
 */

import prisma from "@/lib/prisma";

export interface SellerInfo {
  name: string;
  address: string;
  cityLine: string;
  gstin: string | null;
  pan: string | null;
  email: string;
  phone: string;
  website: string;
}

export interface InvoiceConfig {
  seller: SellerInfo;
  gstRate: number;
  prefix: string;
}

const DEFAULTS: SellerInfo = {
  name: process.env.STORE_NAME || "JMC Secret Rituals",
  address: process.env.STORE_ADDRESS || "Luxury Skincare House",
  cityLine: process.env.STORE_CITY || "India",
  gstin: process.env.STORE_GSTIN || null,
  pan: process.env.STORE_PAN || null,
  email: process.env.STORE_EMAIL || "support@jmcskinsecrets.com",
  phone: process.env.STORE_PHONE || "",
  website: process.env.STORE_WEBSITE || "jmcskinsecrets.com",
};

const DEFAULT_GST_RATE = Number(process.env.INVOICE_GST_RATE || 18);
const DEFAULT_PREFIX = process.env.INVOICE_PREFIX || "JMC";

export async function getInvoiceConfig(): Promise<InvoiceConfig> {
  try {
    const s = await prisma.storeSettings.findFirst({
      select: {
        storeName: true,
        storeAddress: true,
        storeCity: true,
        storePhone: true,
        storeEmail: true,
        storeWebsite: true,
        storeGstin: true,
        storePan: true,
        invoiceGstRate: true,
        invoicePrefix: true,
      },
    });

    const seller: SellerInfo = {
      name: s?.storeName?.trim() || DEFAULTS.name,
      address: s?.storeAddress?.trim() || DEFAULTS.address,
      cityLine: s?.storeCity?.trim() || DEFAULTS.cityLine,
      gstin: s?.storeGstin?.trim() || DEFAULTS.gstin,
      pan: s?.storePan?.trim() || DEFAULTS.pan,
      email: s?.storeEmail?.trim() || DEFAULTS.email,
      phone: s?.storePhone?.trim() || DEFAULTS.phone,
      website: s?.storeWebsite?.trim() || DEFAULTS.website,
    };

    return {
      seller,
      gstRate:
        s?.invoiceGstRate && s.invoiceGstRate > 0
          ? s.invoiceGstRate
          : DEFAULT_GST_RATE,
      prefix: s?.invoicePrefix?.trim() || DEFAULT_PREFIX,
    };
  } catch (error) {
    console.error("getInvoiceConfig fallback to env:", error);
    return {
      seller: DEFAULTS,
      gstRate: DEFAULT_GST_RATE,
      prefix: DEFAULT_PREFIX,
    };
  }
}

/** Builds a human-friendly invoice number from order id + created date. */
export function buildInvoiceNumber(
  orderId: string,
  createdAt: Date,
  prefix: string
): string {
  const yyyy = createdAt.getFullYear();
  const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
  const tail = orderId.slice(-8).toUpperCase();
  return `${prefix}-${yyyy}${mm}-${tail}`;
}

/**
 * Splits a GST-inclusive total into taxable value and tax components.
 * If buyerState matches sellerState we emit CGST + SGST, else IGST.
 */
export function splitGstInclusive(
  total: number,
  rate: number,
  intrastate = true
) {
  const taxable = total / (1 + rate / 100);
  const tax = total - taxable;
  if (intrastate) {
    return {
      taxable,
      cgst: tax / 2,
      sgst: tax / 2,
      igst: 0,
      tax,
    };
  }
  return { taxable, cgst: 0, sgst: 0, igst: tax, tax };
}

const ONES = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n]!;
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS[t]! + (o ? ` ${ONES[o]}` : "");
}

function threeDigitWords(n: number): string {
  if (n < 100) return twoDigitWords(n);
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return ONES[h]! + " hundred" + (rest ? ` ${twoDigitWords(rest)}` : "");
}

/** Converts a rupee amount to Indian-numbering English words for the invoice footer. */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  if (rupees === 0) return "Zero rupees only";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const last = rupees % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigitWords(crore)} crore`);
  if (lakh) parts.push(`${threeDigitWords(lakh)} lakh`);
  if (thousand) parts.push(`${threeDigitWords(thousand)} thousand`);
  if (last) parts.push(threeDigitWords(last));

  const joined = parts.join(" ").replace(/\s+/g, " ").trim();
  return joined.charAt(0).toUpperCase() + joined.slice(1) + " rupees only";
}
