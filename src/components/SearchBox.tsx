"use client";

import { useState } from "react";
import Link from "next/link";
import type { SearchResult } from "@/lib/types";

export function SearchBox({ variant = "hero" }: { variant?: "hero" | "plain" }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  async function run(value: string) {
    setQ(value);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
    const data = (await res.json()) as SearchResult[];
    setResults(data);
    setOpen(true);
  }

  const kindLabel: Record<string, string> = {
    association: "Association",
    firm: "Firm",
    cam: "Manager",
    developer: "Developer",
  };

  return (
    <div className="relative max-w-[660px] mx-auto">
      <div className={`flex bg-white rounded-md overflow-hidden ${variant === "hero" ? "shadow-[0_8px_26px_rgba(0,20,45,0.35)]" : "border border-line"}`}>
        <input
          type="text"
          value={q}
          onChange={(e) => run(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Enter an association, firm, manager, or developer name…"
          aria-label="Search the registry"
          className="flex-1 border-0 px-[18px] py-4 text-base text-ink outline-none"
        />
        <button className="border-0 bg-gold text-navy-dark font-bold text-sm tracking-[0.06em] uppercase px-7 cursor-pointer hover:bg-[#D9B23A]">
          Search
        </button>
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-line rounded-md shadow-lg text-left overflow-hidden">
          {results.map((r, i) => (
            <li key={i} className="border-b border-line last:border-b-0">
              <Link href={r.href} className="flex items-center justify-between gap-3 px-4 py-2.5 no-underline text-ink hover:bg-paper">
                <span>
                  <span className="block font-semibold text-sm text-navy">{r.name}</span>
                  <span className="block text-xs text-mut">{r.detail}</span>
                </span>
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-mut border border-line rounded px-2 py-0.5 shrink-0">
                  {kindLabel[r.kind]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {open && q.trim().length >= 2 && results.length === 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-line rounded-md shadow-lg px-4 py-3 text-sm text-mut text-left">
          No records match “{q}”. Try a different name or check the spelling.
        </div>
      )}
    </div>
  );
}
