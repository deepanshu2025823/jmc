"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";

export async function subscribeStockNotification(
  productId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { success: false, error: "Please enter a valid email address" };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) return { success: false, error: "Product not found" };

    const session = await getServerSession(authOptions);
    let userId: string | null = null;
    if (session?.user?.email) {
      const u = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = u?.id ?? null;
    }

    await prisma.stockSubscription.upsert({
      where: { productId_email: { productId, email: trimmedEmail } },
      create: {
        productId,
        email: trimmedEmail,
        userId,
        notifiedAt: null,
      },
      update: {
        userId: userId ?? undefined,
        notifiedAt: null,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("subscribeStockNotification error:", error);
    return { success: false, error: "Could not save your request" };
  }
}

/**
 * Notifies every pending subscriber for a product. Called from product
 * actions when stock transitions from 0 → > 0.
 */
export async function notifyStockSubscribers(productId: string): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, imageUrl: true, price: true, stock: true },
    });
    if (!product || product.stock <= 0) return;

    const pending = await prisma.stockSubscription.findMany({
      where: { productId, notifiedAt: null },
      select: { id: true, email: true },
    });
    if (pending.length === 0) return;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email not configured — skipping stock notify");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });

    const storeUrl = (
      process.env.NEXT_PUBLIC_STORE_URL ||
      process.env.NEXTAUTH_URL ||
      "https://jmcskinsecrets.com"
    ).replace(/\/$/, "");

    const price = Number(product.price);
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; background:#fafafa;">
        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:520px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; border:1px solid #f4f4f5;">
          <tr><td style="background:#09090b; padding:32px; text-align:center;">
            <h1 style="color:#B59461; margin:0; font-family:Georgia,serif; font-size:24px; letter-spacing:6px; text-transform:uppercase;">JMC<span style="color:#fff;">.</span></h1>
          </td></tr>
          <tr><td style="padding:32px; text-align:center;">
            <p style="margin:0; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#B59461; font-weight:bold;">Back in stock</p>
            <h2 style="margin:10px 0 6px; font-family:Georgia,serif; font-size:22px; color:#18181b; font-weight:normal;">${product.name}</h2>
            <p style="margin:0 0 18px; font-size:13px; color:#71717a;">The ritual you were waiting for is available again.</p>
            ${product.imageUrl ? `<img src="${product.imageUrl}" alt="" width="180" height="180" style="display:block; margin:0 auto 18px; border-radius:14px; background:#F9F6F0; object-fit:cover;" />` : ""}
            <p style="margin:0 0 22px; font-family:Georgia,serif; font-size:22px; color:#B59461;">₹${price.toLocaleString("en-IN")}</p>
            <a href="${storeUrl}/product/${product.id}" style="display:inline-block; background:#18181b; color:#fff; text-decoration:none; padding:14px 32px; border-radius:999px; font-size:11px; font-weight:bold; letter-spacing:3px; text-transform:uppercase;">Shop Now →</a>
            <p style="margin:18px 0 0; font-size:10px; color:#a1a1aa;">Limited stock · order soon</p>
          </td></tr>
        </table>
      </div>`;

    for (const sub of pending) {
      try {
        await transporter.sendMail({
          from: `"JMC Secret Rituals" <${process.env.EMAIL_USER}>`,
          to: sub.email,
          subject: `🌟 Back in stock: ${product.name}`,
          html,
        });
        await prisma.stockSubscription.update({
          where: { id: sub.id },
          data: { notifiedAt: new Date() },
        });
      } catch (err) {
        console.error(`Failed to notify ${sub.email}:`, err);
      }
    }
  } catch (error) {
    console.error("notifyStockSubscribers error:", error);
  }
}
