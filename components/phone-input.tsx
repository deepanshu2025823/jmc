"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  type Country,
} from "@/lib/countries";
import { cn } from "@/lib/utils";

interface Props {
  /** Selected ISO2 code */
  iso2: string;
  /** Phone number digits (without country code) */
  number: string;
  onChange: (next: { iso2: string; number: string; e164: string }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({
  iso2,
  number,
  onChange,
  placeholder = "Mobile number",
  className,
  disabled,
}: Props) {
  const country =
    COUNTRIES.find((c) => c.iso2 === iso2) ?? DEFAULT_COUNTRY;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo<Country[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => {
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesDial = c.dial.includes(q.replace(/\D/g, ""));
      const matchesIso = c.iso2.toLowerCase().includes(q);
      return matchesName || matchesDial || matchesIso;
    });
  }, [query]);

  const emit = (nextIso: string, nextNumber: string) => {
    const c = COUNTRIES.find((x) => x.iso2 === nextIso) ?? DEFAULT_COUNTRY;
    const digits = nextNumber.replace(/\D/g, "");
    const e164 = digits ? `+${c.dial}${digits}` : "";
    onChange({ iso2: nextIso, number: digits, e164 });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    emit(country.iso2, e.target.value);
  };

  const handleSelect = (next: Country) => {
    emit(next.iso2, number);
    setOpen(false);
    setQuery("");
    setTimeout(() => numberRef.current?.focus(), 50);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="flex items-stretch h-14 rounded-xl bg-zinc-50 border border-zinc-200 focus-within:border-[#50540b] focus-within:ring-2 focus-within:ring-[#50540b]/20 transition-all overflow-hidden">
        <button
          type="button"
          onClick={() => !disabled && setOpen((s) => !s)}
          disabled={disabled}
          className="flex items-center gap-2 px-3 sm:px-4 border-r border-zinc-200 hover:bg-white transition-colors disabled:opacity-50"
        >
          <span className="text-xl leading-none">{country.flag}</span>
          <span className="font-mono text-sm font-bold text-zinc-700">
            +{country.dial}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
        </button>
        <input
          ref={numberRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={number}
          onChange={handleNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent px-4 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-50"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 left-0 right-0 sm:right-auto sm:w-[360px] rounded-xl bg-white border border-zinc-200 shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-zinc-100 bg-white sticky top-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code…"
                className="w-full pl-9 pr-9 h-10 text-sm rounded-lg bg-zinc-50 border border-zinc-200 focus:border-[#50540b] focus:bg-white outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-sm text-zinc-400 text-center">
                No countries found
              </p>
            ) : (
              filtered.map((c) => {
                const selected = c.iso2 === country.iso2;
                return (
                  <button
                    key={c.iso2}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-zinc-50",
                      selected && "bg-[#F9F6F0]"
                    )}
                  >
                    <span className="text-xl shrink-0">{c.flag}</span>
                    <span className="flex-1 truncate text-zinc-800">
                      {c.name}
                    </span>
                    <span className="font-mono text-xs text-zinc-500 shrink-0">
                      +{c.dial}
                    </span>
                    {selected && (
                      <Check className="h-4 w-4 text-[#50540b] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
