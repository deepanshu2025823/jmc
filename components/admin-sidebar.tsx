"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Sparkles, 
  Ticket, 
  BarChart3,
  Mail,
  Settings,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  { 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/admin" 
  },
  { 
    label: "Analytics", 
    icon: BarChart3, 
    href: "/admin/analytics" 
  },
  { 
    label: "Products", 
    icon: Package, 
    href: "/admin/products" 
  },
  { 
    label: "Orders", 
    icon: ShoppingCart, 
    href: "/admin/orders" 
  },
  { 
    label: "Customer Leads", 
    icon: Users, 
    href: "/admin/leads" 
  },
  { 
    label: "Newsletter", 
    icon: Mail, 
    href: "/admin/newsletter" 
  },
  { 
    label: "Coupons", 
    icon: Ticket, 
    href: "/admin/coupons" 
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white border-r border-zinc-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex h-20 items-center border-b border-zinc-50 px-8">
        <Link href="/admin" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B59461] shadow-lg shadow-[#B59461]/20 transition-transform group-hover:scale-110">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-serif text-2xl font-black tracking-tighter text-zinc-900">
            JMC <span className="text-[#B59461]">.</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5 p-6 mt-4">
        <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Main Menu
        </p>
        
        {routes.map((route) => {
          const isActive = pathname === route.href || (route.href !== "/admin" && pathname.startsWith(route.href));

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-[#B59461] text-white shadow-md shadow-[#B59461]/20"
                  : "text-zinc-500 hover:bg-[#F9F6F0] hover:text-[#B59461]"
              )}
            >
              <route.icon className={cn(
                "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-white" : "text-zinc-400 group-hover:text-[#B59461]"
              )} />
              {route.label}
              
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="rounded-[2rem] bg-zinc-900 p-6 text-white relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#B59461]/10 blur-2xl group-hover:bg-[#B59461]/20 transition-all" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#B59461] fill-[#B59461]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">AI Engine</span>
            </div>
            <p className="text-xs font-medium leading-relaxed text-zinc-300">
              Gemini 1.5 Flash is actively monitoring skin rituals.
            </p>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase">System Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}