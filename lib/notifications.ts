import prisma from "@/lib/prisma";

export type NotificationType = "ORDER" | "STOCK" | "REVIEW" | "ABANDONED";

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 5);

export async function createNotification(input: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
        metadata: (input.metadata as unknown) as object | undefined,
      },
    });
  } catch (error) {
    // Never block the calling flow on notification failures.
    console.error("createNotification error:", error);
  }
}

/**
 * Checks the given product IDs and emits a low-stock notification for any
 * that have dipped below threshold and don't already have an unread alert.
 */
export async function checkLowStock(productIds: string[]): Promise<void> {
  try {
    if (productIds.length === 0) return;
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true },
    });

    // Look up recent STOCK notifications to dedupe (last 24h).
    const sinceCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentStockNotifs = await prisma.notification.findMany({
      where: { type: "STOCK", createdAt: { gte: sinceCutoff } },
      select: { link: true },
    });
    const recentLinks = new Set(
      recentStockNotifs.map((n) => n.link).filter(Boolean) as string[]
    );

    for (const p of products) {
      if (p.stock > LOW_STOCK_THRESHOLD) continue;
      const link = `/admin/products/${p.id}/edit`;
      if (recentLinks.has(link)) continue;

      const isOOS = p.stock <= 0;
      await createNotification({
        type: "STOCK",
        title: isOOS ? "Out of stock" : "Low stock alert",
        message: isOOS
          ? `${p.name} is now out of stock`
          : `${p.name} has only ${p.stock} unit${p.stock === 1 ? "" : "s"} left`,
        link,
        metadata: { productId: p.id, stock: p.stock },
      });
    }
  } catch (error) {
    console.error("checkLowStock error:", error);
  }
}
