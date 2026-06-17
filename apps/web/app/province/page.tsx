import Link from "next/link";
import type { Metadata } from "next";
import { getProvinces } from "@/lib/api";
import { REGIONS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ลานกางเต็นท์ตามจังหวัด",
  description: "เลือกดูลานกางเต็นท์แยกตามจังหวัดทั่วประเทศไทย",
};

export default async function ProvinceIndex() {
  const provinces = await getProvinces();
  const byRegion = new Map<string, typeof provinces>();
  for (const p of provinces) {
    const key = p.region ?? "other";
    byRegion.set(key, [...(byRegion.get(key) ?? []), p]);
  }

  return (
    <div className="container py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">เลือกพื้นที่</p>
      <h1 className="font-display text-3xl text-primary sm:text-4xl">ลานกางเต็นท์ตามจังหวัด</h1>

      <div className="mt-8 space-y-10">
        {[...byRegion.entries()].map(([region, list]) => (
          <section key={region}>
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-primary">
              <span className="topo-divider w-8" /> {REGIONS[region] ?? region}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => (
                <Link
                  key={p.province}
                  href={`/province/${encodeURIComponent(p.province)}`}
                  className="group flex items-center justify-between rounded-xl border bg-card px-4 py-3.5 shadow-field transition hover:-translate-y-0.5 hover:border-ember"
                >
                  <span className="font-display text-lg text-primary">{p.province}</span>
                  <span className="grid size-8 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground group-hover:bg-ember group-hover:text-ember-foreground">
                    {p.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
