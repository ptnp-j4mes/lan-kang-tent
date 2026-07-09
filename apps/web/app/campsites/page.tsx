"use client";

import { Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2, Map, MapPin, Search, SlidersHorizontal, Tent, X } from "lucide-react";
import type { MapFilters } from "@/lib/types";
import { filterCampsites, getAllCampsites } from "@/lib/api";
import { MOCK_AMENITIES, MOCK_CAMPSITES } from "@/lib/mock";
import { FilterPanel } from "@/components/map/filter-panel";
import { CampsiteCard } from "@/components/campsite-card";
import { AmenityIcon } from "@/components/amenity-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMPTY: MapFilters = { amenities: [] };
const PROVINCES = [...new Set(MOCK_CAMPSITES.map((c) => c.province))].sort();
const QUICK = [
  { label: "วิวภูเขา", key: "mountain_view" },
  { label: "ริมน้ำ", key: "riverside" },
  { label: "มือใหม่ไปง่าย", key: "beginner_friendly" },
  { label: "รถเก๋งเข้าได้", key: "car_access" },
  { label: "พาสัตว์เลี้ยงได้", key: "pet_friendly" },
  { label: "มีไฟฟ้า", key: "electricity" },
];

export default function Page() {
  return (
    <Suspense fallback={<div className="grid h-[50vh] place-items-center"><Loader2 className="animate-spin" /></div>}>
      <Listing />
    </Suspense>
  );
}

function Listing() {
  const params = useSearchParams();
  const [filters, setFilters] = useState<MapFilters>(EMPTY);
  const [sort, setSort] = useState("rating");
  const [open, setOpen] = useState(false);
  const [dataset, setDataset] = useState(MOCK_CAMPSITES as any[]);

  useEffect(() => {
    setFilters({
      ...EMPTY,
      region: params.get("region") ?? undefined,
      province: params.get("province") ?? undefined,
      amenities: params.get("amenities")?.split(",").filter(Boolean) ?? [],
      keyword: params.get("keyword") ?? undefined,
    });
    getAllCampsites().then(setDataset).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // defer filtering so typing/toggling stays responsive; grid updates without blocking
  const deferred = useDeferredValue(filters);
  const stale = deferred !== filters;
  const results = useMemo(() => {
    const list = filterCampsites(deferred, dataset);
    if (sort === "price") return [...list].sort((a, b) => (a.priceMin ?? 0) - (b.priceMin ?? 0));
    return [...list].sort((a, b) => (b.memberRating ?? 0) - (a.memberRating ?? 0));
  }, [deferred, sort, dataset]);

  const toggleQuick = (key: string) =>
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(key) ? f.amenities.filter((k) => k !== key) : [...f.amenities, key],
    }));

  const activeCount =
    filters.amenities.length + (filters.region ? 1 : 0) + (filters.province ? 1 : 0) + (filters.rating ? 1 : 0) + (filters.priceMax ? 1 : 0) + (filters.verified ? 1 : 0);

  return (
    <div>
      {/* hero banner */}
      <section className="grain relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/65 to-background" />
        </div>

        <div className="container relative py-14 md:py-20">
          <span className="stamp border-primary-foreground/30 bg-white/10 text-primary-foreground backdrop-blur">
            <Tent className="size-3.5" /> {dataset.length} ลานทั่วไทย
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-primary-foreground sm:text-5xl">
            ค้นหาลานกางเต็นท์ที่ใช่สำหรับทริปคุณ
          </h1>
          <p className="mt-3 max-w-xl text-primary-foreground/85">
            กรองตามวิว ราคา สิ่งอำนวยความสะดวก แล้วเทียบรีวิวจาก Google และนักแคมป์
          </p>

          {/* search */}
          <div className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filters.keyword ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value || undefined }))}
                placeholder="ชื่อลาน จังหวัด หรืออำเภอ"
                className="h-[52px] w-full rounded-full border border-white/20 bg-card/95 pl-12 pr-10 text-base shadow-lift outline-none focus:ring-2 focus:ring-ember"
              />
              {filters.keyword && (
                <button onClick={() => setFilters((f) => ({ ...f, keyword: undefined }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button asChild variant="ember" size="lg" className="h-[52px] px-6">
              <Link href="/map"><Map className="size-5" /> ดูบนแผนที่</Link>
            </Button>
          </div>

          {/* quick chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK.map((q) => {
              const on = filters.amenities.includes(q.key);
              return (
                <button
                  key={q.key}
                  onClick={() => toggleQuick(q.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium backdrop-blur transition",
                    on ? "border-ember bg-ember text-ember-foreground" : "border-white/25 bg-white/10 text-primary-foreground hover:border-ember",
                  )}
                >
                  <AmenityIcon keyName={q.key} className="size-3.5" /> {q.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* listing */}
      <div className="container py-10">
        <div className="flex gap-8">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border bg-card p-5 shadow-field">
              <FilterPanel filters={filters} setFilters={setFilters} amenities={MOCK_AMENITIES} provinces={PROVINCES} onReset={() => setFilters(EMPTY)} />
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="font-display text-xl text-primary">{results.length} ลาน</p>
                {activeCount > 0 && (
                  <button onClick={() => setFilters(EMPTY)} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground hover:text-ember">
                    ล้าง {activeCount} ตัวกรอง <X className="size-3" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
                  <SlidersHorizontal className="size-4" /> ตัวกรอง{activeCount > 0 ? ` (${activeCount})` : ""}
                </Button>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 rounded-full border border-input bg-card px-3 text-sm">
                  <option value="rating">เรียงตามคะแนน</option>
                  <option value="price">เรียงตามราคา</option>
                </select>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="grid place-items-center gap-3 rounded-2xl border border-dashed py-20 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground"><Tent className="size-6" /></span>
                <p className="font-display text-lg text-primary">ไม่พบลานกางเต็นท์</p>
                <p className="max-w-xs text-sm text-muted-foreground">ลองปรับคำค้นหรือล้างตัวกรอง</p>
                <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY)}>ล้างตัวกรองทั้งหมด</Button>
              </div>
            ) : (
              <div className={cn("grid gap-5 transition-opacity duration-300 sm:grid-cols-2 xl:grid-cols-3", stale && "opacity-50")}>
                {results.map((c) => <CampsiteCard key={c.id} c={c} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-5">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            <FilterPanel filters={filters} setFilters={setFilters} amenities={MOCK_AMENITIES} provinces={PROVINCES} onReset={() => setFilters(EMPTY)} />
            <Button variant="ember" className="mt-5 w-full" onClick={() => setOpen(false)}>ดู {results.length} ลาน</Button>
          </div>
        </div>
      )}
    </div>
  );
}
