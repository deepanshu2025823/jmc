import prisma from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();
  const totalOrders = await prisma.order.count();
  
  const paidOrders = await prisma.order.findMany({
    where: { status: "PAID" },
    select: { totalAmount: true }
  });
  
  const totalRevenue = paidOrders.reduce((sum: number, order: { totalAmount: any }) => sum + Number(order.totalAmount), 0);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  let settings = await prisma.storeSettings.findFirst();
  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { isCodEnabled: true }
    });
  }

  const safeRecentOrders = recentOrders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    totalAmount: Number(order.totalAmount)
  }));

  const stats = { totalUsers, totalProducts, totalOrders, totalRevenue };

  return <DashboardClient stats={stats} recentOrders={safeRecentOrders} settings={settings} />;
}