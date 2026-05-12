"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/hooks/use-cart-store";
import { syncWishlistDB } from "@/actions/wishlist";

/**
 * Bridges the local zustand wishlist with the DB:
 * - On login: pushes any local items to DB, then loads the merged DB list.
 * - On logout: clears the local wishlist so the next user doesn't inherit it.
 */
export function WishlistSyncer() {
  const { status } = useSession();
  const setWishlist = useCartStore((s) => s.setWishlist);
  const synced = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && !synced.current) {
      synced.current = true;
      const localIds = useCartStore
        .getState()
        .wishlist.map((w) => w.id);
      syncWishlistDB(localIds)
        .then((items) => setWishlist(items))
        .catch(() => {});
    }

    if (status === "unauthenticated" && synced.current) {
      synced.current = false;
      setWishlist([]);
    }
  }, [status, setWishlist]);

  return null;
}
