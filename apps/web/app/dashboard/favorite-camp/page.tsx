"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Search, Star, Trash2, X } from "lucide-react";
import { api } from "@/lib/client";
import { formatPrice } from "@/lib/utils";
import { Empty, Spin, useTab } from "../_shared";

const SORTS = [
  { v: "recent", l: "บันทึกล่าสุด" },
  { v: "rating", l: "คะแนนสูงสุด" },
  { v: "price_asc", l: "ราคาต่ำ→สูง" },
  { v: "price_desc", l: "ราคาสูง→ต่ำ" },
] as const;

export default function FavoriteCampPage() {
  const { data, loading, setData } = useTab<any[]>("/api/me/favorites");
  const [kw, setKw] = useState("");
  const [prov, setProv] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["v"]>("recent");

  const provinces = useMemo(() => [...new Set((data ?? []).map((f) => f.campsite.province))].sort(), [data]);
  const filtered = useMemo(() => {
    let list = (data ?? []).filter(
      (f) => (!prov || f.campsite.province === prov) && (!kw || f.campsite.name.toLowerCase().includes(kw.toLowerCase())),
    );
    const rate = (f: any) => f.campsite.memberRating ?? f.campsite.googleRating ?? 0;
    if (sort === "rating") list = [...list].sort((a, b) => rate(b) - rate(a));
    else if (sort === "price_asc") list = [...list].sort((a, b) => (a.campsite.priceMin ?? 0) - (b.campsite.priceMin ?? 0));
    else if (sort === "price_desc") list = [...list].sort((a, b) => (b.campsite.priceMin ?? 0) - (a.campsite.priceMin ?? 0));
    return list;
  }, [data, kw, prov, sort]);

  if (loading) return <Spin />;
  if (!data?.length) return <Empty>ยังไม่มีลานโปรด — กดรูปบุ๊กมาร์กบนการ์ดลานเพื่อบันทึก</Empty>;

  async function remove(campId: string) {
    setData((d: any) => d.filter((x: any) => x.campsiteId !== campId)); // optimistic
    await api(`/api/me/favorites/${campId}`, { method: "DELETE" }).catch(() => {});
  }

  const dirty = kw || prov || sort !== "recent";

  return (
    <div className="space-y-4">
      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-3 shadow-field">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="ค้นในลานโปรด"
            className="h-9 w-full rounded-full border border-input bg-background/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ember"
          />
        </div>
        <select value={prov} onChange={(e) => setProv(e.target.value)} className="h-9 rounded-full border border-input bg-background/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ember">
          <option value="">ทุกจังหวัด</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-9 rounded-full border border-input bg-background/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ember">
          {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length}/{data.length} ลาน</span>
        {dirty && (
          <button onClick={() => { setKw(""); setProv(""); setSort("recent"); }} className="inline-flex items-center gap-1 text-xs text-ember hover:underline">
            <X className="size-3" /> ล้าง
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">ไม่พบลานในตัวกรอง</p>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((f) => {
          const c = f.campsite;
          const rating = c.memberRating ?? c.googleRating;
          return (
            <div key={f.id} className="group overflow-hidden rounded-2xl border bg-card shadow-field transition hover:-translate-y-0.5 hover:shadow-lift">
              <Link href={`/campsites/${c.slug}`} className="relative block aspect-[16/10] bg-secondary">
                {c.photos?.[0]?.imageUrl && (
                  <Image src={c.photos[0].imageUrl} alt={c.name} fill sizes="(max-width:640px) 100vw, 400px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
                {c.isVerified && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-[11px] font-medium text-primary-foreground backdrop-blur">
                    <BadgeCheck className="size-3.5" /> ยืนยันแล้ว
                  </span>
                )}
                <span className="absolute bottom-3 left-3 rounded-full bg-ember px-2.5 py-1 text-xs font-bold text-ember-foreground shadow">
                  {formatPrice(c.priceMin)}{c.priceMax && c.priceMax !== c.priceMin ? `–${c.priceMax}` : ""}
                </span>
              </Link>

              <div className="flex items-start justify-between gap-2 p-4">
                <div className="min-w-0">
                  <Link href={`/campsites/${c.slug}`} className="block truncate font-display text-base text-primary hover:text-ember">{c.name}</Link>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {c.district ? `${c.district}, ` : ""}{c.province}
                  </p>
                  {rating && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs">
                      <Star className="size-3.5 fill-ember text-ember" />
                      <span className="font-semibold text-primary">{rating.toFixed(1)}</span>
                      {c.memberReviewCount > 0 && <span className="text-muted-foreground">· {c.memberReviewCount} รีวิว</span>}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => remove(f.campsiteId)}
                  aria-label="ลบออกจากลานโปรด"
                  className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
