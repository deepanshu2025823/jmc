import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutClient from "./checkout-client"; 

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  let settings = await prisma.storeSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { isCodEnabled: true, isRazorpayEnabled: false }
    });
  }

  return (
    <CheckoutClient 
      isCodEnabled={settings.isCodEnabled} 
      isRazorpayEnabled={settings.isRazorpayEnabled}
      razorpayKeyId={settings.razorpayKeyId || ""}
      userEmail={session.user.email || ""}
      userName={session.user.name || ""}
    />
  );
}