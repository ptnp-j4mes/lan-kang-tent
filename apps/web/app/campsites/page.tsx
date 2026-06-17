"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, SlidersHorizontal } from "lucide-react";
import type { MapFilters } from "@/lib/types";
import { filterCampsites } from "@/lib/api";
import { MOCK_AMENITIES, MOCK_CAMPSITES } from "@/lib/mock";
import { FilterPanel } from "@/components/map/filter-panel";
import { CampsiteCard } from "@/components/campsite-card";
import { Button } from "@/components/ui/button";

const EMPTY: MapFilters = { amenities: [] };
const PROVINCES = [...new Set(MOCK_CAMPSITES.map((c) => c.province))].sort();

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

  useEffect(() => {
    setFilters({
      ...EMPTY,
      region: params.get("region") ?? undefined,
      province: params.get("province") ?? undefined,
      amenities: params.get("amenities")?.split(",") ?? [],
      keyword: params.get("keyword") ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(() => {
    const list = filterCampsites(filters);
    if (sort === "price") return [...list].sort((a, b) => (a.priceMin ?? 0) - (b.priceMin ?? 0));
    return [...list].sort((a, b) => (b.memberRating ?? 0) - (a.memberRating ?? 0));
  }, [filters, sort]);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">ค้นหา</p>
        <h1 className="font-display text-3xl text-primary sm:text-4xl">ลานกางเต็นท์ทั้งหมด</h1>
        <p className="mt-1 text-sm text-muted-foreground">พบ {results.length} ลานกางเต็นท์</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border bg-card p-5 shadow-field">
            <FilterPanel filters={filters} setFilters={setFilters} amenities={MOCK_AMENITIES} provinces={PROVINCES} onReset={() => setFilters(EMPTY)} />
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
              <SlidersHorizontal className="size-4" /> ตัวกรอง
            </Button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto h-9 rounded-full border border-input bg-card px-3 text-sm"
            >
              <option value="rating">เรียงตามคะแนน</option>
              <option value="price">เรียงตามราคา</option>
            </select>
          </div>

          {results.length === 0 ? (
            <div className="grid place-items-center gap-3 rounded-2xl border border-dashed py-20 text-center">
              <p className="font-display text-lg text-primary">ไม่พบลานกางเต็นท์</p>
              <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY)}>ล้างตัวกรอง</Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((c) => (
                <CampsiteCard key={c.id} c={c} />
              ))}
            </div>
          )}
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
