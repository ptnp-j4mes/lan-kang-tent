import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CampsiteLight } from "@/lib/types";
import { CampsiteCard } from "./campsite-card";

export function SectionRail({
  eyebrow,
  title,
  href,
  items,
}: {
  eyebrow: string;
  title: string;
  href: string;
  items: CampsiteLight[];
}) {
  return (
    <section className="container py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">{eyebrow}</p>
          <h2 className="mt-1 font-display text-2xl text-primary sm:text-3xl">{title}</h2>
        </div>
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-ember"
        >
          ดูทั้งหมด
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="no-scrollbar -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-4">
        {items.map((c) => (
          <CampsiteCard
            key={c.id}
            c={c}
            compact
            className="w-[78vw] shrink-0 snap-start sm:w-[300px] md:w-auto"
          />
        ))}
      </div>
    </section>
  );
}
