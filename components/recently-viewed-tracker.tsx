"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

interface Props {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

/**
 * Tiny client component that records a product view to localStorage.
 * Drop it inside any product page server component — it renders nothing.
 */
export function RecentlyViewedTracker(props: Props) {
  const { track } = useRecentlyViewed();

  useEffect(() => {
    track({
      id: props.id,
      name: props.name,
      price: props.price,
      imageUrl: props.imageUrl,
    });
  }, [props.id, props.name, props.price, props.imageUrl, track]);

  return null;
}
