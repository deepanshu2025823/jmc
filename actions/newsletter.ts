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

export interface QuizAiResult {
  skinType: string;
  routine: string[];
  expertAdvice: string;
}

export async function sendQuizResults(userData: { name: string, email: string }, aiResult: QuizAiResult) {
  const emailHtml = `
    <div style="font-family: serif; padding: 40px; background-color: #F9F6F0; color: #18181b; border-radius: 20px;">
      <h1 style="color: #B59461; text-align: center;">JMC Luxury AI Ritual</h1>
      <p>Hello ${userData.name},</p>
      <p>Based on our AI analysis, your skin profile is: <strong>${aiResult.skinType}</strong></p>
      <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #B59461;">
        <h3 style="color: #B59461;">Your Recommended Routine:</h3>
        <ul>
          ${aiResult.routine.map((step) => `<li>${step}</li>`).join('')}
        </ul>
        <p style="font-style: italic; color: #666; margin-top: 15px;">"${aiResult.expertAdvice}"</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"JMC Luxury" <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: "✨ Your Personalized JMC Skin Ritual is Ready!",
      html: emailHtml,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🔥 New AI Quiz Lead - JMC",
      text: `Name: ${userData.name}\nEmail: ${userData.email}\nSkin Type: ${aiResult.skinType}`,
    });

    return { success: true };
  } catch {
    return { error: "Email delivery failed" };
  }
}