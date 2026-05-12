import prisma from "@/lib/prisma";
import { OrdersClient } from "./orders-client";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [orders, settings] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        orderItems: {
          include: { product: true },
        },
      },
    }),
    prisma.storeSettings.findFirst(),
  ]);

  const safeOrders = orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    totalAmount: Number(order.totalAmount),
    orderItems: order.orderItems.map(item => ({
      ...item,
      price: Number(item.price),
      product: {
        ...item.product,
        price: Number(item.product.price),
        createdAt: item.product.createdAt.toISOString(),
        updatedAt: item.product.updatedAt.toISOString(),
      }
    }))
  }));

  return (
    <OrdersClient
      orders={safeOrders}
      isShiprocketEnabled={settings?.isShiprocketEnabled ?? false}
    />
  );
}