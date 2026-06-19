"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Map, Search, Tent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmenityIcon } from "@/components/amenity-icon";

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

export function Hero() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <section className="grain relative overflow-hidden">
      {/* background image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80"
          alt=""
          className="size-full object-cover"
        />
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
            กางเต็นท์ที่ไหนดี?
            <span className="block text-ember">เปิดแผนที่ แล้วออกเดินทาง</span>
          </h1>

          <p
            className="mt-5 max-w-xl text-base text-primary-foreground/85 animate-fade-up sm:text-lg"
            style={{ animationDelay: "120ms" }}
          >
            ค้นหาลานกางเต็นท์จากทุกภาคของไทย กรองตามวิว ราคา สิ่งอำนวยความสะดวก
            อ่านรีวิวจริงจากนักแคมป์ แล้วบันทึกที่หมายต่อไปของคุณ
          </p>

          {/* search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/map?keyword=${encodeURIComponent(q)}`);
            }}
            className="mt-7 flex flex-col gap-2 animate-fade-up sm:flex-row"
            style={{ animationDelay: "180ms" }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาลานกางเต็นท์ จังหวัด หรือชื่อสถานที่"
                className="h-14 w-full rounded-full border border-white/20 bg-card/95 pl-12 pr-4 text-base shadow-lift outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ember"
              />
            </div>
            <Button type="submit" variant="ember" size="lg" className="h-14 px-8">
              <Map className="size-5" /> เปิดแผนที่ลานกางเต็นท์
            </Button>
          </form>

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
