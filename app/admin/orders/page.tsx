import { ShoppingBag, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusSelect } from "@/components/order-status-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true 
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Orders</h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-1">Track and manage customer orders.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="border border-zinc-200 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center p-12 gap-2 text-zinc-500">
          <ShoppingBag className="h-8 w-8 text-zinc-300" />
          <p>No orders placed yet.</p>
        </div>
      ) : (
        <>
          <div className="md:hidden flex flex-col gap-4">
            {orders.map((order: any) => (
              <div key={order.id} className="border border-zinc-200 bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-zinc-900">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-md p-3 text-sm border border-zinc-100">
                  <p className="text-zinc-500 text-xs mb-1">Customer</p>
                  <p className="font-medium text-zinc-900">{order.user?.name || "Guest User"}</p>
                  <p className="text-xs text-zinc-500">{order.user?.email || "N/A"}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-zinc-100">
                  <div className="flex-1">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto h-9 text-zinc-600">
                    <Eye className="h-4 w-4 mr-2" /> Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block border border-zinc-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50/80">
                <TableRow>
                  <TableHead className="font-semibold text-zinc-600">Order ID</TableHead>
                  <TableHead className="font-semibold text-zinc-600">Customer</TableHead>
                  <TableHead className="font-semibold text-zinc-600">Date</TableHead>
                  <TableHead className="font-semibold text-zinc-600">Total</TableHead>
                  <TableHead className="font-semibold text-zinc-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-zinc-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                    
                    <TableCell className="font-medium text-zinc-900">
                      #{order.id.slice(-6).toUpperCase()}
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-zinc-900">{order.user?.name || "Guest"}</p>
                      <p className="text-xs text-zinc-500">{order.user?.email || "N/A"}</p>
                    </TableCell>

                    <TableCell className="text-zinc-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                    
                    <TableCell className="font-bold text-zinc-900">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </TableCell>
                    
                    <TableCell>
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </TableCell>

                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                        <Eye className="h-4 w-4 mr-2" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}