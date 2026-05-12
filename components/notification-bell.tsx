"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ShoppingCart,
  Package,
  Star,
  ShoppingBag,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface ApiResponse {
  unreadCount: number;
  items: NotificationItem[];
}

const POLL_INTERVAL = 30_000;

const TYPE_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  ORDER: { icon: ShoppingCart, tint: "bg-emerald-100 text-emerald-700" },
  STOCK: { icon: Package, tint: "bg-amber-100 text-amber-700" },
  REVIEW: { icon: Star, tint: "bg-violet-100 text-violet-700" },
  ABANDONED: { icon: ShoppingBag, tint: "bg-rose-100 text-rose-700" },
};

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [data, setData] = useState<ApiResponse>({ unreadCount: 0, items: [] });
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const lastSeenUnreadRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as ApiResponse;
      // Audio cue when new unread notifications arrive (not on first mount).
      if (
        lastSeenUnreadRef.current > 0 &&
        json.unreadCount > lastSeenUnreadRef.current
      ) {
        audioRef.current?.play().catch(() => {});
      }
      lastSeenUnreadRef.current = json.unreadCount;
      setData(json);
    } catch {
      // silent — polling will retry
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchNotifications);
    const id = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const markRead = async (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-read", id }),
    }).catch(() => {});
  };

  const markAllRead = async () => {
    if (data.unreadCount === 0) return;
    setMarking(true);
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-all-read" }),
    }).catch(() => {});
    await fetchNotifications();
    setMarking(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Soft chime — generated as a data URI for zero-asset overhead. */}
      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRoYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYIAAAB/f4SIjI+UmJyfoaSlpqaloqGenJiVkY2KhoF9eXVxbWlnZGNiYWFhY2VnaWxudHl9goeMkpaanaCipKWmpaShnpyXk4+LiIWBfnp2c29sa2dlY2JhYWFiZWdpbHB0eX2Ch4uPlJialJyfoaSlpqaloqOdmpaTjouHhIB8eHRwbGloZWNiYWA="
      />
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "relative h-9 w-9 rounded-full flex items-center justify-center transition-colors",
          "text-zinc-600 hover:bg-zinc-100"
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {data.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-in fade-in zoom-in">
            {data.unreadCount > 99 ? "99+" : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] rounded-xl bg-white border border-zinc-200 shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <p className="text-sm font-bold text-zinc-900">Notifications</p>
            {data.unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                disabled={marking}
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 disabled:opacity-50"
              >
                {marking ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {data.items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-zinc-400">
                <Bell className="h-8 w-8 mx-auto mb-2 text-zinc-200" />
                You&apos;re all caught up
              </div>
            ) : (
              data.items.map((n) => {
                const meta = TYPE_META[n.type] || {
                  icon: Bell,
                  tint: "bg-zinc-100 text-zinc-600",
                };
                const Icon = meta.icon;
                const Wrapper: React.ComponentType<{
                  children: React.ReactNode;
                }> = ({ children }) =>
                  n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => {
                        setOpen(false);
                        if (!n.isRead) markRead(n.id);
                      }}
                      className="block"
                    >
                      {children}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => !n.isRead && markRead(n.id)}
                      className="block w-full text-left"
                    >
                      {children}
                    </button>
                  );

                return (
                  <Wrapper key={n.id}>
                    <div
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 border-b border-zinc-50",
                        !n.isRead && "bg-blue-50/30"
                      )}
                    >
                      <div
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                          meta.tint
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-bold text-zinc-900 truncate flex-1">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-zinc-400 shrink-0">
                            {relative(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="mt-2 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                  </Wrapper>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
