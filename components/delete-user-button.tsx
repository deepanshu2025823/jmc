"use client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({ role }: { role: string }) {
  return (
    <Button 
      type="submit" 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
      onClick={(e) => {
        if (!confirm(`Are you sure you want to completely delete this ${role}? This action cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}