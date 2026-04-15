import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { otpCache } from "@/lib/otp-store"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = body.identifier || body.email;
    
    if (!identifier) {
      return NextResponse.json({ error: "Email or Phone is required" }, { status: 400 });
    }

    const targetIdentifier = identifier.toLowerCase().trim();
    const isEmail = targetIdentifier.includes("@");
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpCache.set(targetIdentifier, {
      code: otp,
      expires: Date.now() + 10 * 60 * 1000, 
    });

    if (isEmail) {
      const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", 
      port: 465,              
      secure: true,           
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false 
      }
    });

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 20px; background-color: #fafafa; font-family: Arial, sans-serif;">
      
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f4f4f5; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        
        <tr>
          <td style="background-color: #09090b; padding: 40px 20px; text-align: center;">
            <h1 style="color: #B59461; margin: 0; font-family: 'Georgia', serif; font-size: 32px; letter-spacing: 6px; text-transform: uppercase;">JMC<span style="color: #ffffff;">.</span></h1>
            <p style="color: #a1a1aa; font-size: 10px; letter-spacing: 3px; margin: 10px 0 0 0; text-transform: uppercase;">The Art of Radiant Skin</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #18181b; margin: 0 0 15px 0; font-family: 'Georgia', serif; font-size: 22px; font-weight: normal; italic">Your Secure Access Code</h2>
            <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 35px 0;">
              Your bespoke luxury experience is just a step away. Use the code below to verify your identity and enter the boutique.
            </p>

            <div style="background-color: #F9F6F0; border-radius: 12px; padding: 25px 20px; margin-bottom: 35px; border: 1px solid #e5e5e5;">
              <h1 style="color: #18181b; margin: 0; font-size: 36px; letter-spacing: 12px; font-weight: bold; font-family: 'Courier New', Courier, monospace;">${otp}</h1>
            </div>

            <p style="color: #a1a1aa; font-size: 12px; line-height: 1.5; margin: 0;">
              This code will gracefully expire in <strong style="color: #18181b;">10 minutes</strong>.<br>If you did not request this access, please ignore this message.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background-color: #fafafa; padding: 25px; text-align: center; border-top: 1px solid #f4f4f5;">
            <p style="color: #a1a1aa; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
              &copy; ${new Date().getFullYear()} JMC Secret Rituals. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: `"JMC Secret Rituals" <${process.env.EMAIL_USER}>`,
      to: targetIdentifier,
      subject: "JMC Rituals - Your Secure Access Code",
      html: emailHtml,
    });
    } else {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      
      if (!accountSid || !authToken) {
        throw new Error("Twilio credentials are not configured in environment variables.");
      }

      let formattedPhone = targetIdentifier;
      if (!formattedPhone.startsWith('+')) {
        const digits = formattedPhone.replace(/\D/g, '');
        // Default to India (+91) if exactly 10 digits are entered without a country code
        formattedPhone = digits.length === 10 ? `+91${digits}` : `+${digits}`;
      }

      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: `Your JMC Secret Rituals secure access code is: ${otp}. It will gracefully expire in 10 minutes.`,
        messagingServiceSid: messagingServiceSid,
        to: formattedPhone,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV OTP GENERATED] For ${targetIdentifier}: ${otp}`);
    }

    return NextResponse.json({ message: "OTP Sent successfully" }); 
    
  } catch (error) {
    console.error("OTP Error Detail:", error);
    return NextResponse.json({ error: "Failed to send OTP email. Please try again." }, { status: 500 });
  }
}