"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function UsersPagination({ page, totalPages, total, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  const go = (p: number) => {
    const next = new URLSearchParams(sp.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    start(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      router.refresh();
    });
  };

  if (total === 0) return null;

  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-zinc-500">
        Showing <span className="font-medium text-zinc-700">{startRow}–{endRow}</span> of{" "}
        <span className="font-medium text-zinc-700">{total}</span> users
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || pending}
          onClick={() => go(page - 1)}
          className="h-8 border-zinc-200 bg-white"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <span className="text-xs font-medium text-zinc-600 px-2">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || pending}
          onClick={() => go(page + 1)}
          className="h-8 border-zinc-200 bg-white"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
