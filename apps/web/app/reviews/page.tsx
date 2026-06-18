import Link from "next/link";
import type { Metadata } from "next";
import { Quote, Star } from "lucide-react";
import { MOCK_CAMPSITES } from "@/lib/mock";

export const metadata: Metadata = {
  title: "รีวิวจากนักแคมป์",
  description: "รวมรีวิวลานกางเต็นท์จากสมาชิก Larn kang tent",
};

const REVIEWS = [
  { name: "พิมพ์ชนก", siteSlug: "doi-samer-dao", site: "ดอยเสมอดาว", rating: 5, trip: "คู่รัก", text: "ทะเลหมอกสวยมาก ตื่นมาเจอวิวแบบนี้คุ้มเกินราคา เจ้าหน้าที่ดูแลดี ห้องน้ำสะอาด" },
  { name: "ก้องภพ", siteSlug: "suan-phueng-river-camp", site: "สวนผึ้ง ริเวอร์ แคมป์", rating: 5, trip: "ครอบครัว", text: "พาครอบครัวมา เด็กๆ เล่นน้ำได้ รถเก๋งเข้าสบาย บรรยากาศดีมาก" },
  { name: "Natcha", siteSlug: "khao-kho-camp", site: "เขาค้อ", rating: 4, trip: "กลุ่มเพื่อน", text: "วิวดี อากาศเย็น แต่คนเยอะหน่อยช่วงวันหยุด แนะนำมาวันธรรมดา" },
  { name: "เดินป่าสายชิล", siteSlug: "phu-kradueng", site: "ภูกระดึง", rating: 5, trip: "คนเดียว", text: "เหนื่อยตอนเดินขึ้น แต่พอถึงลานสนคุ้มมาก หนาวสุดๆ เตรียมถุงนอนไปให้พร้อม" },
];

export default function ReviewsPage() {
  return (
    <div className="container py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">ชุมชน</p>
      <h1 className="font-display text-3xl text-primary sm:text-4xl">รีวิวจากนักแคมป์</h1>
      <p className="mt-1 text-sm text-muted-foreground">เสียงจริงจากสนาม จากสมาชิก Larn kang tent</p>

      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {REVIEWS.map((r) => {
          const site = MOCK_CAMPSITES.find((c) => c.slug === r.siteSlug);
          return (
            <figure key={r.name} className="break-inside-avoid rounded-2xl border bg-card p-5 shadow-field">
              <Quote className="size-6 text-ember/30" />
              <blockquote className="mt-2 text-sm leading-relaxed text-foreground/90">{r.text}</blockquote>
              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < r.rating ? "size-4 fill-ember text-ember" : "size-4 text-muted"} />
                ))}
              </div>
              <figcaption className="mt-3 border-t pt-3 text-sm">
                <span className="font-semibold text-primary">{r.name}</span>
                <span className="text-muted-foreground"> · {r.trip}</span>
                {site && (
                  <Link href={`/campsites/${site.slug}`} className="mt-0.5 block text-xs text-ember hover:underline">
                    รีวิว {r.site}
                  </Link>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
