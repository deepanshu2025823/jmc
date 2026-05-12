import nodemailer from "nodemailer";

interface ItemSnapshot {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface SendInput {
  to: string;
  name: string | null;
  items: ItemSnapshot[];
  totalAmount: number;
  storeUrl?: string;
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function buildHtml(input: SendInput): string {
  const storeUrl = input.storeUrl || "";
  const checkoutUrl = `${storeUrl}/checkout`;
  const greeting = input.name ? `Hi ${input.name.split(" ")[0]},` : "Hello,";

  const itemRows = input.items
    .map(
      (it) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5;">
          <table cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding-right: 14px;">
                ${
                  it.imageUrl
                    ? `<img src="${it.imageUrl}" alt="" width="64" height="64" style="display:block; border-radius:8px; background:#F9F6F0; object-fit:cover;" />`
                    : ""
                }
              </td>
              <td style="vertical-align: top;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #18181b; font-family: Georgia, serif;">${it.name}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #71717a; letter-spacing: 1px; text-transform: uppercase;">Qty ${it.quantity}</p>
              </td>
              <td style="vertical-align: top; text-align: right; padding-left: 14px;">
                <p style="margin: 0; font-size: 13px; font-weight: bold; color: #18181b;">${inr(it.price * it.quantity)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 24px; background-color: #fafafa; font-family: Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #f4f4f5;">
    <tr>
      <td style="background: #09090b; padding: 36px 24px; text-align: center;">
        <h1 style="color: #B59461; margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 6px; text-transform: uppercase;">JMC<span style="color: #fff;">.</span></h1>
        <p style="color: #a1a1aa; font-size: 10px; letter-spacing: 3px; margin: 8px 0 0 0; text-transform: uppercase;">The Art of Radiant Skin</p>
      </td>
    </tr>

    <tr>
      <td style="padding: 36px 28px 12px;">
        <p style="margin: 0; font-size: 14px; color: #52525b;">${greeting}</p>
        <h2 style="margin: 12px 0 8px; font-family: Georgia, serif; font-size: 24px; color: #18181b; font-weight: normal;">
          You left your <em style="color: #50540b;">ritual</em> behind
        </h2>
        <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
          Your selection is waiting in your bag. Complete checkout in two clicks before stocks run low.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 16px 28px 0;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0">
          ${itemRows}
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 16px 28px 24px;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #F9F6F0; border-radius: 12px;">
          <tr>
            <td style="padding: 16px 18px;">
              <p style="margin: 0; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Bag total</p>
              <p style="margin: 4px 0 0 0; font-family: Georgia, serif; font-size: 24px; color: #18181b; font-weight: bold;">${inr(input.totalAmount)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 28px 36px; text-align: center;">
        <a href="${checkoutUrl}" style="display: inline-block; background: #18181b; color: #fff; text-decoration: none; padding: 16px 36px; border-radius: 999px; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">
          Complete Checkout →
        </a>
        <p style="margin: 18px 0 0; font-size: 11px; color: #a1a1aa;">Stocks are limited and bags expire after 48h.</p>
      </td>
    </tr>

    <tr>
      <td style="background: #fafafa; padding: 18px; text-align: center; border-top: 1px solid #f4f4f5;">
        <p style="margin: 0; color: #a1a1aa; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">
          &copy; ${new Date().getFullYear()} JMC Secret Rituals
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendAbandonedReminderEmail(input: SendInput) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER / EMAIL_PASS not configured");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  const storeUrl =
    process.env.NEXT_PUBLIC_STORE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://jmcskinsecrets.com";

  await transporter.sendMail({
    from: `"JMC Secret Rituals" <${process.env.EMAIL_USER}>`,
    to: input.to,
    subject: "Your luxury ritual is waiting in your bag ✨",
    html: buildHtml({ ...input, storeUrl }),
  });
}
