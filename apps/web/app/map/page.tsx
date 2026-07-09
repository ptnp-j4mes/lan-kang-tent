"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Crosshair,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  MapIcon,
  Search,
  SlidersHorizontal,
  Tent,
  X,
} from "lucide-react";
import type { CampsiteLight, MapFilters } from "@/lib/types";
import { filterCampsites, getAllCampsites, getAmenities } from "@/lib/api";
import { MOCK_AMENITIES, MOCK_CAMPSITES } from "@/lib/mock";
import { FilterPanel } from "@/components/map/filter-panel";
import { PreviewCard } from "@/components/map/preview-card";
import { MapCanvas } from "@/components/map/map-canvas";
import { CampsiteCard } from "@/components/campsite-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMPTY: MapFilters = { amenities: [] };
const PROVINCES = [...new Set(MOCK_CAMPSITES.map((c) => c.province))].sort();
const NEARBY_RADII = [10, 25, 50, 100];

export default function MapPage() {
  return (
    <Suspense fallback={<div className="grid h-[60vh] place-items-center"><Loader2 className="animate-spin" /></div>}>
      <MapClient />
    </Suspense>
  );
}

type View = "split" | "map" | "list";

function MapClient() {
  const params = useSearchParams();
  const [filters, setFilters] = useState<MapFilters>(EMPTY);
  const [keyword, setKeyword] = useState("");
  const [view, setView] = useState<View>("split");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [amenities, setAmenities] = useState(MOCK_AMENITIES);
  const [dataset, setDataset] = useState(MOCK_CAMPSITES as any[]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deskFilters, setDeskFilters] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  // init from URL
  useEffect(() => {
    const region = params.get("region") ?? undefined;
    const province = params.get("province") ?? undefined;
    const am = params.get("amenities");
    const kw = params.get("keyword") ?? "";
    setKeyword(kw);
    setFilters({
      ...EMPTY,
      region,
      province,
      keyword: kw || undefined,
      amenities: am ? am.split(",") : [],
    });
    getAmenities().then(setAmenities).catch(() => {});
    getAllCampsites().then(setDataset).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo<CampsiteLight[]>(
    () => filterCampsites({ ...filters, keyword: keyword || filters.keyword }, dataset),
    [filters, keyword, dataset],
  );

  const selected = results.find((c) => c.id === selectedId) ?? null;

  const requestNearby = (radius: number) => {
    if (!navigator.geolocation) {
      setGeoMsg("เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง เลือกจังหวัดแทนได้");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoMsg(null);
        setFilters((f) => ({ ...f, nearby: { lat: pos.coords.latitude, lng: pos.coords.longitude, radius } }));
      },
      () => setGeoMsg("ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง — เลือกจังหวัดด้านซ้ายแทนได้"),
    );
  };

  const reset = () => {
    setFilters(EMPTY);
    setKeyword("");
  };

  const activeFilterCount =
    (filters.region ? 1 : 0) +
    (filters.province ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.verified ? 1 : 0) +
    filters.amenities.length +
    (filters.nearby ? 1 : 0);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* top bar */}
      <div className="z-20 flex items-center gap-2 border-b bg-background/90 px-3 py-2.5 backdrop-blur sm:px-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="ค้นหาลานกางเต็นท์ จังหวัด หรือชื่อสถานที่"
            className="h-10 w-full rounded-full border border-input bg-card pl-10 pr-9 text-sm outline-none focus:ring-2 focus:ring-ember"
          />
          {keyword && (
            <button onClick={() => setKeyword("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* nearby */}
        <div className="hidden items-center gap-1 sm:flex">
          <Button variant="outline" size="sm" onClick={() => requestNearby(filters.nearby?.radius ?? 50)}>
            <Crosshair className="size-4" /> ใกล้ฉัน
          </Button>
          {filters.nearby && (
            <select
              value={filters.nearby.radius}
              onChange={(e) => requestNearby(Number(e.target.value))}
              className="h-9 rounded-full border border-input bg-card px-2 text-xs"
            >
              {NEARBY_RADII.map((r) => (
                <option key={r} value={r}>{r} กม.</option>
              ))}
            </select>
          )}
        </div>

        {/* view toggle (desktop) */}
        <div className="hidden rounded-full border bg-card p-0.5 lg:flex">
          {([
            ["split", LayoutGrid],
            ["map", MapIcon],
            ["list", ListIcon],
          ] as const).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "grid size-8 place-items-center rounded-full transition",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary",
              )}
              aria-label={v}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          {activeFilterCount > 0 && (
            <span className="ml-0.5 grid size-4 place-items-center rounded-full bg-ember text-[10px] text-ember-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {geoMsg && (
        <div className="border-b bg-ember/10 px-4 py-2 text-xs text-ember">{geoMsg}</div>
      )}

      {/* body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* desktop left: filters + list */}
        <aside
          className={cn(
            "hidden w-[400px] shrink-0 flex-col border-r bg-background lg:flex",
            view === "map" && "lg:hidden",
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-semibold text-primary">
              พบ {results.length} ลาน
            </p>
            <button
              onClick={() => setDeskFilters((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                deskFilters || activeFilterCount > 0 ? "border-ember text-ember" : "border-border text-muted-foreground hover:border-ember",
              )}
            >
              <SlidersHorizontal className="size-3.5" /> ตัวกรอง{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>
          {deskFilters && (
            <div className="max-h-[55vh] overflow-y-auto border-b bg-card/50 p-4">
              <FilterPanel filters={filters} setFilters={setFilters} amenities={amenities} provinces={PROVINCES} onReset={reset} />
            </div>
          )}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {results.length === 0 ? (
              <EmptyState onReset={reset} />
            ) : (
              results.map((c) => (
                <CampsiteCard
                  key={c.id}
                  c={c}
                  compact
                  active={c.id === selectedId || c.id === hoverId}
                  onHover={setHoverId}
                />
              ))
            )}
          </div>
        </aside>

        {/* list-only view */}
        {view === "list" && (
          <div className="flex-1 overflow-y-auto p-4 lg:hidden">
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((c) => (
                <CampsiteCard key={c.id} c={c} compact />
              ))}
            </div>
          </div>
        )}

        {/* map */}
        <div className={cn("relative flex-1", view === "list" && "hidden lg:block")}>
          <MapCanvas
            campsites={results}
            selectedId={selectedId}
            hoverId={hoverId}
            onSelect={(id) => {
              setSelectedId(id);
              setSheetOpen(true);
            }}
          />

          {/* desktop preview card */}
          {selected && (
            <div className="absolute bottom-4 left-4 z-30 hidden w-80 lg:block">
              <PreviewCard c={selected} onClose={() => setSelectedId(null)} />
            </div>
          )}

          {/* "search this area" */}
          <button className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-lift hover:bg-accent/60">
            ค้นหาในพื้นที่นี้
          </button>
        </div>
      </div>

      {/* mobile floating buttons */}
      <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2 lg:hidden">
        {[
          { icon: SlidersHorizontal, label: "ตัวกรอง", onClick: () => setFilterOpen(true) },
          { icon: ListIcon, label: "รายการ", onClick: () => setSheetOpen((v) => !v) },
          { icon: Crosshair, label: "ใกล้ฉัน", onClick: () => requestNearby(50) },
        ].map((b) => (
          <button
            key={b.label}
            onClick={b.onClick}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-lift"
          >
            <b.icon className="size-4" /> {b.label}
          </button>
        ))}
      </div>

      {/* mobile bottom sheet list */}
      <MobileSheet open={sheetOpen} count={results.length} onClose={() => setSheetOpen(false)}>
        {selected ? (
          <PreviewCard c={selected} onClose={() => setSelectedId(null)} />
        ) : (
          <div className="grid gap-3">
            {results.length === 0 ? (
              <EmptyState onReset={reset} />
            ) : (
              results.map((c) => <CampsiteCard key={c.id} c={c} compact />)
            )}
          </div>
        )}
      </MobileSheet>

      {/* mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-5">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            <FilterPanel filters={filters} setFilters={setFilters} amenities={amenities} provinces={PROVINCES} onReset={reset} />
            <Button variant="ember" className="mt-5 w-full" onClick={() => setFilterOpen(false)}>
              ดู {results.length} ลาน
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileSheet({
  open,
  count,
  onClose,
  children,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 rounded-t-3xl border-t bg-background shadow-lift transition-transform duration-300 lg:hidden",
        open ? "translate-y-0" : "translate-y-[calc(100%-3rem)]",
      )}
      style={{ maxHeight: "70vh" }}
    >
      <button onClick={onClose} className="flex w-full flex-col items-center gap-1 py-2">
        <span className="h-1.5 w-10 rounded-full bg-border" />
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Tent className="size-3.5" /> {count} ลานในพื้นที่
        </span>
      </button>
      <div className="max-h-[60vh] overflow-y-auto px-4 pb-24 pt-1">{children}</div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="grid place-items-center gap-3 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Tent className="size-6" />
      </span>
      <p className="font-display text-lg text-primary">ไม่พบลานกางเต็นท์</p>
      <p className="max-w-xs text-sm text-muted-foreground">ลองปรับตัวกรองหรือขยายพื้นที่ค้นหา</p>
      <Button variant="outline" size="sm" onClick={onReset}>
        ล้างตัวกรองทั้งหมด
      </Button>
    </div>
  );
}
