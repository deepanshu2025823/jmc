"use client";

import { SessionProvider } from "next-auth/react";
import { WishlistSyncer } from "@/components/wishlist-syncer";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WishlistSyncer />
      {children}
    </SessionProvider>
  );
}