import prisma from "@/lib/prisma";
import { FreeShippingBar } from "@/components/free-shipping-bar";

export async function FreeShippingBarWrapper() {
  let threshold: number | null = null;
  try {
    const settings = await prisma.storeSettings.findFirst({
      select: { freeShippingThreshold: true },
    });
    threshold = settings?.freeShippingThreshold ?? null;
  } catch {
    threshold = null;
  }
  return <FreeShippingBar threshold={threshold} />;
}
