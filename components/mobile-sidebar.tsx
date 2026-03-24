"use client";

import { useState, useEffect } from "react";
import { Menu, Sparkles } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle 
} from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "./ui/button";

export function MobileSidebar() {
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden hover:bg-[#F9F6F0] transition-colors"
        >
          <Menu className="h-6 w-6 text-zinc-600" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="p-0 bg-white border-r-0 w-72 sm:w-80"
      >
        <VisuallyHidden.Root>
          <SheetTitle>JMC Admin Navigation Menu</SheetTitle>
        </VisuallyHidden.Root>

        <div className="flex flex-col h-full">
          <div className="flex-1" onClick={() => setOpen(false)}>
            <AdminSidebar />
          </div>
          
          <div className="p-6 bg-[#F9F6F0]/50 border-t">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 text-center">
              Luxury Management v1.0
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}