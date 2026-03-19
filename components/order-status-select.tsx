"use client";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/actions/order";
import { Loader2 } from "lucide-react";

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus || "PENDING");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`w-full text-xs font-bold rounded-md px-3 py-2 border appearance-none cursor-pointer outline-none transition-colors
          ${status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
          ${status === 'PAID' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
          ${status === 'SHIPPED' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
          ${status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' : ''}
          ${status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : ''}
          ${!['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status) ? 'bg-zinc-50 text-zinc-700 border-zinc-200' : ''}
        `}
      >
        <option value="PENDING">PENDING</option>
        <option value="PAID">PAID</option>
        <option value="SHIPPED">SHIPPED</option>
        <option value="DELIVERED">DELIVERED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
        ) : (
          <svg className="h-3 w-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
}