"use client";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function MobileSidebar() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white w-64">
        <VisuallyHidden.Root><SheetTitle>Navigation Menu</SheetTitle></VisuallyHidden.Root>
        <AdminSidebar />
      </SheetContent>
    </Sheet>
  );
}