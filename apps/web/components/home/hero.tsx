"use client";

import Link from "next/link";
import Image from "next/image";
import { Map, Tent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmenityIcon } from "@/components/amenity-icon";
import { SearchBox } from "@/components/search-box";
import type { Banner } from "@/lib/api";

const DEFAULTS = {
  imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80",
  title: "กางเต็นท์ที่ไหนดี? เปิดแผนที่ แล้วออกเดินทาง",
  subtitle: "ค้นหาลานกางเต็นท์จากทุกภาคของไทย กรองตามวิว ราคา สิ่งอำนวยความสะดวก อ่านรีวิวจริงจากนักแคมป์",
  ctaLabel: "เปิดแผนที่ลานกางเต็นท์",
};

const QUICK = [
  { label: "ใกล้กรุงเทพ", q: "region=west", icon: "car_access" },
  { label: "วิวภูเขา", q: "amenities=mountain_view", icon: "mountain_view" },
  { label: "ริมน้ำ", q: "amenities=riverside", icon: "riverside" },
  { label: "มือใหม่ไปง่าย", q: "amenities=beginner_friendly", icon: "beginner_friendly" },
  { label: "รถเก๋งเข้าได้", q: "amenities=car_access", icon: "car_access" },
  { label: "พาสัตว์เลี้ยงได้", q: "amenities=pet_friendly", icon: "pet_friendly" },
  { label: "มีไฟฟ้า", q: "amenities=electricity", icon: "electricity" },
  { label: "มีห้องน้ำ", q: "amenities=toilet", icon: "toilet" },
];

export function Hero({ banner }: { banner?: Banner | null }) {
  const b = {
    imageUrl: banner?.imageUrl || DEFAULTS.imageUrl,
    title: banner?.title || DEFAULTS.title,
    subtitle: banner?.subtitle || DEFAULTS.subtitle,
    ctaLabel: banner?.ctaLabel || DEFAULTS.ctaLabel,
  };

  return (
    <section className="grain relative overflow-hidden">
      {/* background image */}
      <div className="absolute inset-0">
        <Image src={b.imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/55 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,hsl(var(--ember)/0.25),transparent_45%)]" />
      </div>

      <div className="container relative pb-16 pt-20 md:pb-24 md:pt-28">
        <div className="max-w-2xl">
          <span className="stamp animate-fade-up border-primary-foreground/30 bg-white/10 text-primary-foreground backdrop-blur">
            <Tent className="size-3.5" /> ลานกางเต็นท์ทั่วไทยบนแผนที่เดียว
          </span>

          <h1
            className="mt-5 font-display text-4xl leading-[1.1] text-primary-foreground animate-fade-up sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            {b.title}
          </h1>

          <p
            className="mt-5 max-w-xl text-base text-primary-foreground/85 animate-fade-up sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            {b.subtitle}
          </p>

          {/* search */}
          <div className="mt-7 max-w-2xl animate-fade-up" style={{ animationDelay: "180ms" }}>
            <SearchBox />
            <Button asChild variant="ember" size="lg" className="mt-3 h-12">
              <Link href="/map"><Map className="size-5" /> {b.ctaLabel}</Link>
            </Button>
          </div>

          {/* quick filters */}
          <div
            className="mt-6 flex flex-wrap gap-2 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            {QUICK.map((f) => (
              <Link
                key={f.label}
                href={`/map?${f.q}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur transition hover:border-ember hover:bg-ember hover:text-ember-foreground"
              >
                <AmenityIcon keyName={f.icon} className="size-3.5" />
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
