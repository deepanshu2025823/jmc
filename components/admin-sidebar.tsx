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
  BarChart3 
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
    label: "Customers", 
    icon: Users, 
    href: "/admin/customers" 
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
    <div className="flex h-full flex-col border-r bg-white shadow-sm">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-black tracking-widest text-xl uppercase">
          <Sparkles className="h-6 w-6 text-zinc-800" />
          JMC
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-4 mt-2">
        {routes.map((route) => {
          const isActive = pathname === route.href || (route.href !== "/admin" && pathname.startsWith(route.href));

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all group",
                isActive
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <route.icon className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"
              )} />
              {route.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t">
        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider text-center">
          JMC Admin v1.0
        </p>
      </div>
    </div>
  );
}