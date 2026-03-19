import prisma from "@/lib/prisma";
import { SalesChart } from "@/components/sales-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const orders = await prisma.order.findMany({
    where: { status: "PAID" },
    select: { totalAmount: true, createdAt: true },
    orderBy: { createdAt: "asc" }
  });

  const salesData = orders.reduce((acc: any, order: { totalAmount: any; createdAt: Date }) => {
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!acc[date]) acc[date] = 0;
    acc[date] += Number(order.totalAmount);
    return acc;
  }, {});

  const chartData = Object.keys(salesData).map(date => ({
    date,
    revenue: salesData[date]
  }));

  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: 5
  });

  const productDetails = await Promise.all(
    topProducts.map(async (p) => {
      const details = await prisma.product.findUnique({ where: { id: p.productId }, select: { name: true } });
      return { name: details?.name || "Unknown", count: p._count.productId };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Business Analytics</h1>
        <p className="text-zinc-500 mt-2">Deep dive into your store's performance and sales trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" /> Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" /> Top Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {productDetails.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <p className="text-xs text-zinc-500">{item.count} units sold</p>
                  </div>
                  <div className="text-sm font-bold text-zinc-400">#0{i+1}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}