"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function submitContactForm(data: any) {
  const { firstName, lastName, email, subject, message } = data;

  try {
    await transporter.sendMail({
      from: `"${firstName} ${lastName}" <${email}>`,
      to: process.env.EMAIL_USER, 
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>New Message from Website Contact Form</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `,
    });

    await transporter.sendMail({
      from: `"JMC Luxury Skincare" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank You for Contacting JMC Luxury Skincare ✨",
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px; background: #F9F6F0; border-radius: 16px; text-align: center; border: 1px solid #eaeaea;">
          <h1 style="color: #B59461; letter-spacing: 4px; text-transform: uppercase;">JMC.</h1>
          <h2 style="color: #18181b; font-weight: normal; margin-top: 30px;">Message Received</h2>
          <p style="color: #52525b; line-height: 1.6; margin-bottom: 30px;">
            Dear ${firstName},<br><br>
            Thank you for reaching out to us. We have received your inquiry regarding "<strong>${subject}</strong>". 
            Our luxury concierge team is reviewing your message and will get back to you within 24 hours.
          </p>
          <p style="color: #B59461; font-style: italic;">Stay Glowing,</p>
          <p style="color: #18181b; font-weight: bold;">The JMC Team</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Contact Form Error:", error);
    return { success: false, error: "Failed to send message." };
  }
}