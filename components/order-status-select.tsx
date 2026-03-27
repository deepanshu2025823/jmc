"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin"; 
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; 

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus || "PENDING");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
        setStatus(currentStatus); 
      }
    });
  };

  return (
    <div className="relative inline-block w-full sm:w-auto group">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`w-full text-[10px] uppercase tracking-widest font-black rounded-lg pl-4 pr-10 py-3 border appearance-none cursor-pointer outline-none transition-all shadow-sm
          ${status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300' : ''}
          ${status === 'PAID' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300' : ''}
          ${status === 'SHIPPED' ? 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300' : ''}
          ${status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300' : ''}
          ${!['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].includes(status) ? 'bg-zinc-50 text-zinc-700 border-zinc-200' : ''}
        `}
      >
        <option value="PENDING">PENDING</option>
        <option value="PAID">PAID</option>
        <option value="SHIPPED">SHIPPED</option>
        <option value="DELIVERED">DELIVERED</option>
      </select>
      
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
        ) : (
          <svg className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
}