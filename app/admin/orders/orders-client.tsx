"use client";

import { useState } from "react";
import { ShoppingBag, Eye, Calendar, Trash2, Package, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusSelect } from "@/components/order-status-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { clearAllOrders } from "@/actions/admin"; 
import { toast } from "sonner";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
};

export function OrdersClient({ orders }: { orders: any[] }) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const openDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleClearAll = async () => {
    const isConfirmed = window.confirm("⚠️ WARNING: This will permanently delete ALL orders from the database. Are you sure?");
    
    if (isConfirmed) {
      setIsClearing(true);
      const res = await clearAllOrders();
      if (res.success) {
        toast.success("Database Truncated: All orders cleared.");
      } else {
        toast.error(res.error || "Failed to clear orders.");
      }
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Orders Management</h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-1">Track, manage and view details of customer orders.</p>
        </div>
        
        {orders.length > 0 && (
          <Button 
            onClick={handleClearAll} 
            disabled={isClearing}
            variant="destructive" 
            className="rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-none font-bold"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? "Clearing..." : "Clear All Orders"}
          </Button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="border border-zinc-200 rounded-[2rem] bg-white shadow-sm flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
          <div className="h-20 w-20 bg-zinc-50 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-zinc-300" />
          </div>
          <p className="font-serif text-xl text-zinc-900">No orders found.</p>
          <p className="text-sm text-zinc-400">When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <>
          <div className="md:hidden flex flex-col gap-4">
            {orders.map((order: any) => (
              <div key={order.id} className="border border-zinc-200 bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#B59461] text-lg">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-xl p-4 text-sm border border-zinc-100">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-bold text-zinc-900">{order.user?.name || "Guest User"}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{order.user?.email || "N/A"}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-zinc-50">
                  <div className="flex-1">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </div>
                  <Button onClick={() => openDetails(order)} variant="outline" size="sm" className="w-full sm:w-auto h-11 rounded-lg text-zinc-700 font-bold border-zinc-200 hover:bg-zinc-50">
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50/80">
                <TableRow>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-widest text-[10px] h-12">Order ID</TableHead>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Customer</TableHead>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Date</TableHead>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Total</TableHead>
                  <TableHead className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Status</TableHead>
                  <TableHead className="text-right font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id} className="hover:bg-zinc-50/50 transition-colors h-20">
                    
                    <TableCell className="font-bold text-zinc-900 font-mono">
                      #{order.id.slice(-6).toUpperCase()}
                    </TableCell>

                    <TableCell>
                      <p className="font-bold text-zinc-900">{order.user?.name || "Guest"}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{order.user?.email || "N/A"}</p>
                    </TableCell>

                    <TableCell className="text-zinc-600 text-sm font-medium">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    
                    <TableCell className="font-black text-[#B59461] text-base">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </TableCell>
                    
                    <TableCell>
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </TableCell>

                    <TableCell className="text-right">
                      <Button onClick={() => openDetails(order)} variant="outline" size="sm" className="rounded-lg h-9 text-zinc-600 font-bold border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900">
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

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-full sm:max-w-lg p-0 border-none shadow-2xl bg-white flex flex-col z-[110]">
          <SheetHeader className="p-6 md:p-8 border-b border-zinc-100 bg-[#fafafa]">
            <SheetTitle className="font-serif text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#B59461]" /> Order Overview
            </SheetTitle>
            {selectedOrder && (
              <p className="text-sm font-mono text-zinc-500 font-bold mt-1">Ref: #{selectedOrder.id.toUpperCase()}</p>
            )}
          </SheetHeader>
          
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white">
            {selectedOrder && (
              <div className="space-y-8">
                
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <User className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Customer Info</p>
                      <p className="font-bold text-zinc-900">{selectedOrder.user?.name || "Guest"}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-zinc-200/60">
                    <p className="text-sm text-zinc-600">{selectedOrder.user?.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Purchased Rituals</p>
                  <div className="space-y-3">
                    {selectedOrder.orderItems?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 bg-white border border-zinc-100 p-3 rounded-xl">
                        <div className="h-14 w-14 bg-[#F9F6F0] rounded-lg overflow-hidden shrink-0">
                          <img src={item.product?.imageUrl} alt={item.product?.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm font-bold text-zinc-900 truncate">{item.product?.name}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-zinc-900">₹{Number(item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-zinc-100 rounded-2xl p-5 space-y-3 bg-[#fafafa]">
                  <div className="flex justify-between items-center text-sm font-bold text-zinc-500">
                    <p>Payment Method</p> <p className="text-zinc-900 uppercase">COD</p>
                  </div>
                  <div className="flex justify-between items-center text-xl font-serif font-black text-zinc-900 pt-4 border-t border-zinc-200">
                    <p>Total Paid</p> <p className="text-[#B59461]">₹{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                  </div>
                </div>
                
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}