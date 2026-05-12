"use client";

import { useCallback, useEffect, useState } from "react";

export interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  viewedAt: number;
}

const STORAGE_KEY = "jmc:recently-viewed";
const MAX_ITEMS = 12;

function readStorage(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (it): it is RecentlyViewedItem =>
        it &&
        typeof it.id === "string" &&
        typeof it.name === "string" &&
        typeof it.price === "number" &&
        typeof it.imageUrl === "string" &&
        typeof it.viewedAt === "number"
    );
  } catch {
    return [];
  }
}

function writeStorage(items: RecentlyViewedItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded / unavailable — ignore
  }
}

/**
 * Tracks the user's recently viewed products in localStorage so we can show
 * a "Continue browsing" carousel across the site. Most-recent first, deduped,
 * capped at MAX_ITEMS.
 */
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      setItems(readStorage());
      setHydrated(true);
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const track = useCallback(
    (product: Omit<RecentlyViewedItem, "viewedAt">) => {
      const current = readStorage();
      const filtered = current.filter((it) => it.id !== product.id);
      const next: RecentlyViewedItem[] = [
        { ...product, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_ITEMS);
      writeStorage(next);
      setItems(next);
    },
    []
  );

  const clear = useCallback(() => {
    writeStorage([]);
    setItems([]);
  }, []);

  return { items, track, clear, hydrated };
}
