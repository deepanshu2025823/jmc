/**
 * Seller info shown on customer invoices. Reads from env where available,
 * with sensible defaults for the JMC store. Update env vars in production:
 *
 *   STORE_NAME           — legal company name
 *   STORE_ADDRESS        — street address (multi-line, use \n)
 *   STORE_CITY           — city / state line, e.g. "New Delhi, India - 110001"
 *   STORE_GSTIN          — 15-char GST number (optional)
 *   STORE_PAN            — PAN number (optional)
 *   STORE_EMAIL          — support email
 *   STORE_PHONE          — support phone
 *   STORE_WEBSITE        — domain
 *   INVOICE_GST_RATE     — percentage (default 18 for cosmetics)
 *   INVOICE_PREFIX       — invoice number prefix (default "JMC")
 */

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

export const SELLER: SellerInfo = {
  name: process.env.STORE_NAME || "JMC Secret Rituals",
  address: process.env.STORE_ADDRESS || "Luxury Skincare House",
  cityLine: process.env.STORE_CITY || "India",
  gstin: process.env.STORE_GSTIN || null,
  pan: process.env.STORE_PAN || null,
  email: process.env.STORE_EMAIL || "support@jmcskinsecrets.com",
  phone: process.env.STORE_PHONE || "",
  website: process.env.STORE_WEBSITE || "jmcskinsecrets.com",
};

export const INVOICE_GST_RATE = Number(process.env.INVOICE_GST_RATE || 18);
export const INVOICE_PREFIX = process.env.INVOICE_PREFIX || "JMC";

/** Builds a human-friendly invoice number from order id + created date. */
export function buildInvoiceNumber(orderId: string, createdAt: Date): string {
  const yyyy = createdAt.getFullYear();
  const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
  const tail = orderId.slice(-8).toUpperCase();
  return `${INVOICE_PREFIX}-${yyyy}${mm}-${tail}`;
}

/**
 * Splits a GST-inclusive total into taxable value and tax components.
 * If buyerState matches sellerState we emit CGST + SGST, else IGST.
 */
export function splitGstInclusive(
  total: number,
  rate: number = INVOICE_GST_RATE,
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
