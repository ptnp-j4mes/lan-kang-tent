"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Tent } from "lucide-react";
import { getAllCampsites } from "@/lib/api";
import type { CampsiteLight } from "@/lib/types";
import { cn } from "@/lib/utils";

type Suggestion = { kind: "camp" | "province" | "query"; label: string; sub?: string; href: string };

// ponytail: query-based suggestions for now. Swap this one function for an AI
// endpoint later (POST /api/search/suggest) — the UI below stays unchanged.
function querySuggest(q: string, data: CampsiteLight[]): Suggestion[] {
  const ql = q.trim().toLowerCase();
  if (!ql) return [];
  const camps = data
    .filter((c) => c.name.toLowerCase().includes(ql))
    .slice(0, 5)
    .map<Suggestion>((c) => ({ kind: "camp", label: c.name, sub: c.province, href: `/campsites/${c.slug}` }));
  const provinces = [...new Set(data.filter((c) => c.province.toLowerCase().includes(ql)).map((c) => c.province))]
    .slice(0, 3)
    .map<Suggestion>((p) => ({ kind: "province", label: p, sub: "จังหวัด", href: `/province/${encodeURIComponent(p)}` }));
  return [...camps, ...provinces].slice(0, 7);
}

export function SearchBox({
  placeholder = "ค้นหาลานกางเต็นท์ จังหวัด หรือชื่อสถานที่",
  size = "lg",
  className,
}: {
  placeholder?: string;
  size?: "lg" | "md";
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [data, setData] = useState<CampsiteLight[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllCampsites().then(setData).catch(() => {});
  }, []);
  useEffect(() => {
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const sug = querySuggest(q, data);
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    go(q.trim() ? `/campsites?keyword=${encodeURIComponent(q.trim())}` : "/campsites");
  };
  const h = size === "lg" ? "h-14" : "h-11";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <form onSubmit={submit}>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn("w-full rounded-full border border-white/20 bg-card/95 pl-12 pr-28 text-base shadow-lift outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ember", h)}
        />
        <button type="submit" className={cn("absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-ember px-4 font-semibold text-ember-foreground transition hover:brightness-105", size === "lg" ? "h-11" : "h-8 text-sm")}>
          <Search className="size-4" /> ค้นหา
        </button>
      </form>

      {open && sug.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-card text-left shadow-lift">
          {sug.map((s, i) => (
            <li key={i}>
              <button onClick={() => go(s.href)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-accent/60">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  {s.kind === "province" ? <MapPin className="size-3.5" /> : <Tent className="size-3.5" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-primary">{s.label}</span>
                  {s.sub && <span className="block text-xs text-muted-foreground">{s.sub}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
