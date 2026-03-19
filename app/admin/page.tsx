import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Package, ShoppingCart, Users, ArrowUpRight, ShoppingBag } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-zinc-500">Track your real-time sales, products, and customer activities.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Total Revenue</CardTitle>
            <div className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center shrink-0">
              <IndianRupee className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">₹{totalRevenue.toLocaleString("en-IN")}</div>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Based on PAID orders</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Total Orders</CardTitle>
            <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{totalOrders}</div>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Lifetime orders</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Products</CardTitle>
            <div className="h-8 w-8 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{totalProducts}</div>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Live in inventory</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Customers</CardTitle>
            <div className="h-8 w-8 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{totalUsers}</div>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Registered users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No orders yet.</p>
              ) : (
                recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                        <ShoppingBag className="h-4 w-4 text-zinc-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">
                          {order.user?.name || "Guest Customer"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{order.user?.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-zinc-900">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-black">{order.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-zinc-200 shadow-sm bg-zinc-900 text-white overflow-hidden relative">
           <CardHeader>
              <CardTitle className="text-lg font-bold">Quick Insights</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                 <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-1">Average Order Value</p>
                 <p className="text-2xl font-bold">
                    ₹{totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0}
                 </p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                 <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-1">Inventory Status</p>
                 <p className="text-xl font-medium">{totalProducts} Products listed</p>
                 <Link href="/admin/products/new" className="text-xs text-zinc-300 hover:text-white underline mt-2 inline-block">
                    Add more products
                 </Link>
              </div>
           </CardContent>
           <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-white/5 rounded-full blur-3xl" />
        </Card>
      </div>
    </div>
  );
}