"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  X,
  ArrowUpDown,
  Loader2,
  Check,
  Users as UsersIcon,
  ShieldAlert,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "ALL", label: "All users", icon: UsersIcon },
  { value: "USER", label: "Customers", icon: UserCircle },
  { value: "ADMIN", label: "Admins", icon: ShieldAlert },
] as const;

const SORT_OPTIONS = [
  { value: "joined", label: "Joined date" },
  { value: "name", label: "Name" },
  { value: "orders", label: "Orders count" },
  { value: "spent", label: "Total spent" },
] as const;

interface Props {
  q: string;
  role: string;
  sort: string;
  order: string;
}

export function UsersTableToolbar({ q, role, sort, order }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(q);
  const initialQ = useRef(q);
  // Keep input synced when external state changes (e.g. clear via URL).
  useEffect(() => {
    if (q !== initialQ.current) {
      setSearchValue(q);
      initialQ.current = q;
    }
  }, [q]);

  const update = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      router.refresh();
    });
  };

  // Debounce search input.
  useEffect(() => {
    if (searchValue === q) return;
    const id = setTimeout(() => {
      update({ q: searchValue || null });
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const sortLabel =
    SORT_OPTIONS.find((s) => s.value === sort)?.label ?? "Joined date";

  const hasFilters = q !== "" || role !== "ALL" || sort !== "joined" || order !== "desc";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="pl-9 pr-9 h-10 bg-white"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => setSearchValue("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {pending && (
          <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-zinc-400" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5">
          {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = role === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => update({ role: value === "ALL" ? null : value })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-zinc-200 bg-white h-9"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="text-xs font-medium">
                {sortLabel}{" "}
                <span className="text-zinc-400">
                  {order === "asc" ? "↑" : "↓"}
                </span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
            {SORT_OPTIONS.map((s) => (
              <DropdownMenuItem
                key={s.value}
                onSelect={() => update({ sort: s.value })}
                className="flex items-center justify-between"
              >
                <span>{s.label}</span>
                {sort === s.value && <Check className="h-4 w-4 text-zinc-700" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Direction</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => update({ order: "desc" })}
              className="flex items-center justify-between"
            >
              <span>Descending</span>
              {order === "desc" && <Check className="h-4 w-4 text-zinc-700" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => update({ order: "asc" })}
              className="flex items-center justify-between"
            >
              <span>Ascending</span>
              {order === "asc" && <Check className="h-4 w-4 text-zinc-700" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              update({ q: null, role: null, sort: null, order: null })
            }
            className="text-xs text-zinc-500 hover:text-zinc-900"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
        )}
      </div>
    </div>
  );
}
