"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { CampsiteLight } from "@/lib/types";
import { CampsiteCard } from "./campsite-card";
import { Reveal } from "./reveal";

// swiper-style rail: native scroll-snap + arrows only. no lib.
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
  const track = useRef<HTMLDivElement>(null);

  // block trackpad/mouse horizontal scroll; keep scrollBy() working
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const block = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.preventDefault();
    };
    el.addEventListener("wheel", block, { passive: false });
    return () => el.removeEventListener("wheel", block);
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 640), behavior: "smooth" });
  };

  return (
    <section className="container py-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">{eyebrow}</p>
          <h2 className="mt-1 font-display text-2xl text-primary sm:text-3xl">{title}</h2>
        </Reveal>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            aria-label="ก่อนหน้า"
            className="hidden size-9 place-items-center rounded-full border border-border bg-card text-primary transition hover:border-ember hover:text-ember sm:grid"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="ถัดไป"
            className="hidden size-9 place-items-center rounded-full border border-border bg-card text-primary transition hover:border-ember hover:text-ember sm:grid"
          >
            <ChevronRight className="size-4" />
          </button>
          <Link href={href} className="group ml-1 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-ember">
            ดูทั้งหมด
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* overflow-x-clip clips visually without forcing overflow-y:auto → hover shadows/transforms not clipped */}
      <div className="overflow-x-clip">
        <div
          ref={track}
          style={{ touchAction: "pan-y" }}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {items.map((c, i) => (
            <Reveal
              key={c.id}
              delay={Math.min(i, 6) * 70}
              className="w-[78vw] shrink-0 snap-start sm:w-[300px]"
            >
              <CampsiteCard c={c} compact className="w-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
