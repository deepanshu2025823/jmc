"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, Check, Loader2 } from "lucide-react";
import { RANGE_OPTIONS, type RangeKey } from "@/lib/analytics-ranges";

export function AnalyticsRangePicker({ current }: { current: RangeKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const label =
    RANGE_OPTIONS.find((r) => r.key === current)?.label ?? "Last 30 days";

  const set = (key: RangeKey) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("range", key);
    startTransition(() => {
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-zinc-200 bg-white"
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          <span className="font-medium">{label}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {RANGE_OPTIONS.map(({ key, label }) => (
          <DropdownMenuItem
            key={key}
            onSelect={() => set(key)}
            className="flex items-center justify-between"
          >
            <span>{label}</span>
            {current === key && <Check className="h-4 w-4 text-zinc-700" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
