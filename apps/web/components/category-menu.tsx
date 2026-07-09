"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Mountain, Waves } from "lucide-react";
import { getProvinces } from "@/lib/api";
import { REGIONS, cn } from "@/lib/utils";
import type { ProvinceStat } from "@/lib/types";

const ZONES = [
  { label: "ใกล้กรุงเทพ", href: "/campsites?region=west" },
  { label: "วิวภูเขา", href: "/campsites?amenities=mountain_view", icon: Mountain },
  { label: "ริมน้ำ", href: "/campsites?amenities=riverside", icon: Waves },
  { label: "เหมาะมือใหม่", href: "/campsites?amenities=beginner_friendly" },
  { label: "พาสัตว์เลี้ยงได้", href: "/campsites?amenities=pet_friendly" },
];

export function CategoryMenu() {
  const [open, setOpen] = useState(false);
  const [provinces, setProvinces] = useState<ProvinceStat[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && provinces.length === 0) getProvinces().then(setProvinces).catch(() => {});
  }, [open, provinces.length]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="link-underline inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary"
      >
        หมวดหมู่ <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="animate-scale-in absolute left-0 top-11 z-50 w-[640px] max-w-[90vw] rounded-2xl border bg-card p-5 shadow-lift">
          <div className="grid grid-cols-3 gap-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ember">ภาค</p>
              <ul className="space-y-1">
                {Object.entries(REGIONS).map(([key, label]) => (
                  <li key={key}>
                    <Link onClick={close} href={`/campsites?region=${key}`} className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent/60 hover:text-ember">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ember">โซนยอดนิยม</p>
              <ul className="space-y-1">
                {ZONES.map((z) => (
                  <li key={z.label}>
                    <Link onClick={close} href={z.href} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent/60 hover:text-ember">
                      {z.icon ? <z.icon className="size-3.5 text-ember/70" /> : <MapPin className="size-3.5 text-ember/70" />}
                      {z.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ember">จังหวัด</p>
                <Link onClick={close} href="/province" className="text-[11px] text-muted-foreground hover:text-ember">ทั้งหมด</Link>
              </div>
              <ul className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
                {provinces.length === 0 && <li className="px-2 py-1 text-xs text-muted-foreground">กำลังโหลด…</li>}
                {provinces.map((p) => (
                  <li key={p.province}>
                    <Link onClick={close} href={`/province/${encodeURIComponent(p.province)}`} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent/60 hover:text-ember">
                      <span className="truncate">{p.province}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{p.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
