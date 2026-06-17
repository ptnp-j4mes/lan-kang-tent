"use client";

import { RotateCcw, Star } from "lucide-react";
import type { Amenity, MapFilters } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AmenityIcon } from "@/components/amenity-icon";
import { REGIONS, cn } from "@/lib/utils";

export function FilterPanel({
  filters,
  setFilters,
  amenities,
  provinces,
  onReset,
}: {
  filters: MapFilters;
  setFilters: (f: MapFilters) => void;
  amenities: Amenity[];
  provinces: string[];
  onReset: () => void;
}) {
  const toggleAmenity = (key: string) => {
    const has = filters.amenities.includes(key);
    setFilters({
      ...filters,
      amenities: has ? filters.amenities.filter((k) => k !== key) : [...filters.amenities, key],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-primary">ตัวกรอง</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <RotateCcw className="size-3.5" /> ล้าง
        </Button>
      </div>

      {/* region */}
      <Field label="ภาค">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(REGIONS).map(([key, label]) => (
            <Chip
              key={key}
              active={filters.region === key}
              onClick={() => setFilters({ ...filters, region: filters.region === key ? undefined : key })}
            >
              {label}
            </Chip>
          ))}
        </div>
      </Field>

      {/* province */}
      <Field label="จังหวัด">
        <select
          value={filters.province ?? ""}
          onChange={(e) => setFilters({ ...filters, province: e.target.value || undefined })}
          className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ember"
        >
          <option value="">ทุกจังหวัด</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      {/* rating */}
      <Field label="คะแนนขั้นต่ำ">
        <div className="flex gap-1.5">
          {[3, 3.5, 4, 4.5].map((r) => (
            <Chip key={r} active={filters.rating === r} onClick={() => setFilters({ ...filters, rating: filters.rating === r ? undefined : r })}>
              <Star className="size-3 fill-current" /> {r}+
            </Chip>
          ))}
        </div>
      </Field>

      {/* price */}
      <Field label={`ราคาเริ่มต้น ≤ ฿${filters.priceMax ?? 600}`}>
        <input
          type="range"
          min={30}
          max={600}
          step={10}
          value={filters.priceMax ?? 600}
          onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
          className="w-full accent-[hsl(var(--ember))]"
        />
      </Field>

      {/* verified */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl border bg-card px-3 py-2.5 text-sm">
        <span className="font-medium">เฉพาะลานที่ยืนยันแล้ว</span>
        <input
          type="checkbox"
          checked={!!filters.verified}
          onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
          className="size-4 accent-[hsl(var(--ember))]"
        />
      </label>

      {/* amenities */}
      <Field label="สิ่งอำนวยความสะดวก">
        <div className="grid grid-cols-2 gap-1.5">
          {amenities.map((a) => (
            <button
              key={a.key}
              onClick={() => toggleAmenity(a.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-xs transition",
                filters.amenities.includes(a.key)
                  ? "border-ember bg-ember/10 text-ember"
                  : "border-border bg-card text-foreground/80 hover:border-primary/40",
              )}
            >
              <AmenityIcon keyName={a.key} className="size-3.5 shrink-0" />
              {a.name}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active ? "border-ember bg-ember text-ember-foreground" : "border-border bg-card hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}
