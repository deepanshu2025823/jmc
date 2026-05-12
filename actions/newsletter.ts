"use server";

import nodemailer from "nodemailer";
import prisma from "@/lib/prisma"; 
import { revalidatePath } from "next/cache"; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function subscribeToNewsletter(formData: FormData) {
  const rawEmail = (formData.get("email") as string | null)?.trim().toLowerCase();
  if (!rawEmail) return { success: false, error: "Email is required.", alreadySubscribed: false };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(rawEmail)) {
    return { success: false, error: "Please enter a valid email address.", alreadySubscribed: false };
  }

  try {
    const existing = await prisma.newsletter.findUnique({ where: { email: rawEmail } });

    if (existing) {
      return { success: true, alreadySubscribed: true };
    }

    await prisma.newsletter.create({ data: { email: rawEmail } });
    revalidatePath("/admin/newsletter");

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "✨ New Newsletter Subscriber - JMC",
        text: `New user subscribed: ${rawEmail}`,
      });

      await transporter.sendMail({
        from: `"JMC Luxury Skincare" <${process.env.EMAIL_USER}>`,
        to: rawEmail,
        subject: "Welcome to the JMC Glow Community! ✨",
        html: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px; background: #F9F6F0; border-radius: 16px; text-align: center; border: 1px solid #eaeaea;">
            <h1 style="color: #B59461; letter-spacing: 4px; text-transform: uppercase;">JMC.</h1>
            <h2 style="color: #18181b; font-weight: normal; margin-top: 30px;">Welcome to the Inner Circle</h2>
            <p style="color: #52525b; line-height: 1.6; margin-bottom: 30px;">
              Thank you for subscribing to our luxury skincare updates. You are now part of an exclusive community.
            </p>
            <a href="http://localhost:3000/shop" style="background-color: #09090b; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 50px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: bold;">
              Explore the Boutique
            </a>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Newsletter welcome-email error:", mailError);
    }

    return { success: true, alreadySubscribed: false };
  } catch (error) {
    console.error("Newsletter Error:", error);
    return { success: false, error: "Failed to subscribe. Please try again.", alreadySubscribed: false };
  }
}

export async function deleteNewsletterSubscriber(id: string) {
  if (!id) return { success: false, error: "Subscriber id is required." };

  try {
    await prisma.newsletter.delete({ where: { id } });
    revalidatePath("/admin/newsletter");
    return { success: true };
  } catch (error) {
    console.error("Delete Subscriber Error:", error);
    return { success: false, error: "Failed to remove subscriber." };
  }
}

export interface QuizRecommendedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string | null;
}

export interface QuizAiResult {
  skinType: string;
  routine: string[];
  expertAdvice: string;
  recommendedProducts?: QuizRecommendedProduct[];
}

const inrFmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export async function sendQuizResults(userData: { name: string, email: string }, aiResult: QuizAiResult) {
  const siteUrl = (
    process.env.NEXT_PUBLIC_STORE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://jmcskinsecrets.com"
  ).replace(/\/$/, "");

  const recommendations = aiResult.recommendedProducts || [];
  const productCards = recommendations
    .map(
      (p) => `
      <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 12px;">
        <tr>
          <td width="80" style="padding-right: 14px; vertical-align: top;">
            ${
              p.imageUrl
                ? `<a href="${siteUrl}/product/${p.id}"><img src="${p.imageUrl}" width="72" height="72" alt="" style="display:block; border-radius:10px; background:#F9F6F0; object-fit:cover; border:1px solid #f4f4f5;" /></a>`
                : ""
            }
          </td>
          <td style="vertical-align: top;">
            <p style="margin: 0; font-family: Georgia, serif; font-size: 14px; font-weight: bold; color: #18181b;">${p.name}</p>
            ${p.category ? `<p style="margin: 4px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa;">${p.category}</p>` : ""}
            <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: bold; color: #B59461;">${inrFmt(p.price)}</p>
            <a href="${siteUrl}/product/${p.id}" style="display:inline-block; margin-top:8px; font-size:10px; font-weight:bold; text-transform:uppercase; letter-spacing:2px; color:#18181b; border-bottom:1px solid #18181b; text-decoration:none;">Shop now →</a>
          </td>
        </tr>
      </table>`
    )
    .join("");

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #fafafa;">
      <table cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #f4f4f5;">
        <tr>
          <td style="background: #09090b; padding: 36px 24px; text-align: center;">
            <h1 style="color: #B59461; margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 6px; text-transform: uppercase;">JMC<span style="color:#fff;">.</span></h1>
            <p style="color:#a1a1aa; font-size:10px; letter-spacing:3px; margin:8px 0 0; text-transform:uppercase;">AI Skin Ritual</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 28px 12px;">
            <p style="margin:0; font-size:14px; color:#52525b;">Hello ${userData.name || "there"},</p>
            <h2 style="margin: 10px 0 6px; font-family: Georgia, serif; font-size: 22px; color: #18181b; font-weight: normal;">
              Your skin profile: <em style="color:#50540b;">${aiResult.skinType}</em>
            </h2>
            <p style="margin:0; font-size:13px; color:#71717a; line-height:1.6;">Here&apos;s the personalised routine our AI consultant put together for you.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 28px 0;">
            <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#F9F6F0; border-radius:12px;">
              <tr><td style="padding: 16px 18px;">
                <p style="margin:0 0 8px; font-size:10px; text-transform:uppercase; letter-spacing:2px; font-weight:bold; color:#B59461;">Your Routine</p>
                <ol style="margin:0; padding-left:18px; color:#3f3f46; font-size:13px; line-height:1.7;">
                  ${aiResult.routine.map((s) => `<li>${s}</li>`).join("")}
                </ol>
                ${aiResult.expertAdvice ? `<p style="margin:14px 0 0; font-style:italic; color:#52525b; font-size:12px;">"${aiResult.expertAdvice}"</p>` : ""}
              </td></tr>
            </table>
          </td>
        </tr>
        ${
          recommendations.length > 0
            ? `<tr>
              <td style="padding: 24px 28px 8px;">
                <p style="margin:0 0 10px; font-size:10px; text-transform:uppercase; letter-spacing:2px; font-weight:bold; color:#a1a1aa;">Recommended for you</p>
                ${productCards}
              </td>
            </tr>`
            : ""
        }
        <tr>
          <td style="padding: 16px 28px 32px; text-align:center;">
            <a href="${siteUrl}/shop" style="display:inline-block; background:#18181b; color:#fff; text-decoration:none; padding:14px 30px; border-radius:999px; font-size:11px; font-weight:bold; letter-spacing:3px; text-transform:uppercase;">Build your ritual</a>
          </td>
        </tr>
        <tr>
          <td style="background:#fafafa; padding:16px; text-align:center; border-top:1px solid #f4f4f5;">
            <p style="margin:0; color:#a1a1aa; font-size:10px; text-transform:uppercase; letter-spacing:1px;">
              &copy; ${new Date().getFullYear()} JMC Secret Rituals
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"JMC Luxury" <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: "✨ Your Personalized JMC Skin Ritual is Ready!",
      html: emailHtml,
    });

    const recsLine = recommendations.length
      ? `\nRecommendations:\n${recommendations.map((p) => `- ${p.name} (${inrFmt(p.price)})`).join("\n")}`
      : "";
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🔥 New AI Quiz Lead - JMC",
      text: `Name: ${userData.name}\nEmail: ${userData.email}\nSkin Type: ${aiResult.skinType}${recsLine}`,
    });

    return { success: true };
  } catch {
    return { error: "Email delivery failed" };
  }
}