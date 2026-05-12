import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminProfileClient } from "./admin-profile-client";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email as string },
    }),
    prisma.storeSettings.findFirst({
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
        freeShippingThreshold: true,
        loyaltyEarnRate: true,
        loyaltyMaxRedeemPerOrder: true,
        giftWrapFee: true,
      },
    }),
  ]);

  if (!user) return redirect("/login");

  const safeUser = {
    id: user.id,
    name: user.name || "",
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };

  const storeInfo = {
    storeName: settings?.storeName ?? "",
    storeAddress: settings?.storeAddress ?? "",
    storeCity: settings?.storeCity ?? "",
    storePhone: settings?.storePhone ?? "",
    storeEmail: settings?.storeEmail ?? "",
    storeWebsite: settings?.storeWebsite ?? "",
    storeGstin: settings?.storeGstin ?? "",
    storePan: settings?.storePan ?? "",
    invoiceGstRate: settings?.invoiceGstRate ?? 18,
    invoicePrefix: settings?.invoicePrefix ?? "JMC",
    freeShippingThreshold: settings?.freeShippingThreshold ?? 0,
    loyaltyEarnRate: settings?.loyaltyEarnRate ?? 10,
    loyaltyMaxRedeemPerOrder: settings?.loyaltyMaxRedeemPerOrder ?? 500,
    giftWrapFee: settings?.giftWrapFee ?? 0,
  };

  return <AdminProfileClient user={safeUser} storeInfo={storeInfo} />;
}