import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  BadgeCheck,
  ExternalLink,
  Flag,
  MapPin,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import { getCampsiteBySlug } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/rating";
import { AmenityIcon } from "@/components/amenity-icon";
import { DetailMap } from "@/components/map/detail-map";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCampsiteBySlug(slug);
  if (!c) return { title: "ไม่พบลานกางเต็นท์" };
  return {
    title: `${c.name} ${c.province}`,
    description: c.description,
    openGraph: { images: c.coverImageUrl ? [c.coverImageUrl] : [], title: c.name },
  };
}

const GOOGLE_REVIEWS = [
  { name: "Somchai T.", rating: 5, time: "2 สัปดาห์ก่อน", text: "วิวสวยมาก เจ้าหน้าที่เป็นกันเอง อากาศเย็นสบาย" },
  { name: "Anna K.", rating: 4, time: "1 เดือนก่อน", text: "Beautiful spot, clean toilets, a bit crowded on weekends." },
];
const MEMBER_REVIEWS = [
  { name: "นักเดินทาง_ttt", rating: 5, trip: "ครอบครัว", time: "5 วันก่อน", text: "พาลูกมากางเต็นท์ครั้งแรก ปลอดภัย ห้องน้ำสะอาด รถเก๋งเข้าได้สบาย ประทับใจมาก" },
];

export default async function DetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCampsiteBySlug(slug);
  if (!c) notFound();

  const gmaps = `https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`;
  const gallery = [
    c.coverImageUrl,
    "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600",
    "https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=600",
  ].filter(Boolean) as string[];

  return (
    <article>
      {/* breadcrumb */}
      <div className="container pt-6 text-xs text-muted-foreground">
        <Link href="/campsites" className="hover:text-ember">ลานทั้งหมด</Link>
        {" / "}
        <Link href={`/province/${encodeURIComponent(c.province)}`} className="hover:text-ember">{c.province}</Link>
        {" / "}
        <span className="text-foreground">{c.name}</span>
      </div>

      {/* gallery */}
      <div className="container mt-4 grid gap-2 overflow-hidden rounded-3xl md:grid-cols-[2fr_1fr] md:gap-2">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl md:aspect-auto">
          <Image src={gallery[0]} alt={c.name} fill sizes="(max-width:768px) 100vw, 800px" className="object-cover" priority />
        </div>
        <div className="hidden grid-rows-2 gap-2 md:grid">
          {gallery.slice(1, 3).map((g, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl">
              <Image src={g} alt="" fill sizes="400px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="container mt-8 grid gap-10 lg:grid-cols-[1.7fr_1fr]">
        {/* main */}
        <div className="space-y-8">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              {c.isVerified && (
                <Badge variant="verified">
                  <BadgeCheck className="size-3.5" /> ลานที่ยืนยันแล้ว
                </Badge>
              )}
              <Badge variant="moss">{c.province}</Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl text-primary sm:text-4xl">{c.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {c.district ? `อ.${c.district}, ` : ""}จ.{c.province}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Rating value={c.memberRating} source="member" className="text-base" />
              <span className="h-4 w-px bg-border" />
              <Rating value={c.googleRating} source="google" className="text-base" />
              <span className="h-4 w-px bg-border" />
              <span className="font-display text-xl text-ember">{formatPrice(c.priceMin)}<span className="text-sm text-muted-foreground"> /คืน</span></span>
            </div>
          </header>

          <Section title="เกี่ยวกับลานนี้">
            <p className="leading-relaxed text-foreground/90">{c.description}</p>
          </Section>

          <Section title="สิ่งอำนวยความสะดวก">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {c.tags.map((t) => (
                <div key={t.key} className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm">
                  <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                    <AmenityIcon keyName={t.key} className="size-4" />
                  </span>
                  {t.name}
                </div>
              ))}
            </div>
          </Section>

          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="เหมาะกับใคร">
              <ul className="space-y-1.5 text-sm text-foreground/90">
                <li>· ครอบครัวที่มากับเด็กเล็ก</li>
                <li>· มือใหม่หัดกางเต็นท์</li>
                <li>· สายถ่ายรูปวิวธรรมชาติ</li>
              </ul>
            </Section>
            <Section title="ข้อควรรู้ก่อนเดินทาง">
              <ul className="space-y-1.5 text-sm text-foreground/90">
                <li>· ช่วงหน้าหนาวอากาศเย็นจัด เตรียมถุงนอนกันหนาว</li>
                <li>· ควรจองล่วงหน้าช่วงวันหยุดยาว</li>
                <li>· สัญญาณโทรศัพท์อาจไม่เสถียร</li>
              </ul>
            </Section>
          </div>

          <Section title="กฎของลาน">
            <div className="rounded-xl border border-ember/30 bg-ember/5 p-4 text-sm text-foreground/90">
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-ember" />
                งดส่งเสียงดังหลัง 22:00 น. · แยกขยะก่อนทิ้ง · ห้ามก่อไฟนอกจุดที่กำหนด · เก็บขยะกลับทุกครั้ง
              </p>
            </div>
          </Section>

          {/* map */}
          <Section title="ตำแหน่งบนแผนที่">
            <div className="h-72 overflow-hidden rounded-2xl border">
              <DetailMap campsite={c} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={gmaps} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> เปิดใน Google Maps</a>
              </Button>
              <Button asChild variant="ember" size="sm">
                <a href={directions} target="_blank" rel="noreferrer"><Navigation className="size-4" /> ขอเส้นทาง</a>
              </Button>
            </div>
          </Section>

          {/* google reviews */}
          <Section title="รีวิวจาก Google">
            <p className="mb-3 text-xs text-muted-foreground">ข้อมูลรีวิวจาก Google Maps · แสดงตาม attribution ของ Google</p>
            <div className="space-y-3">
              {GOOGLE_REVIEWS.map((r) => (
                <ReviewItem key={r.name} {...r} />
              ))}
            </div>
          </Section>

          {/* member reviews */}
          <Section title="รีวิวจากสมาชิก CampThai">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.tags.length ? `${MEMBER_REVIEWS.length} รีวิวจากนักแคมป์` : ""}</p>
              <Button asChild variant="ember" size="sm"><Link href="/login">เขียนรีวิว</Link></Button>
            </div>
            <div className="space-y-3">
              {MEMBER_REVIEWS.map((r) => (
                <ReviewItem key={r.name} {...r} member />
              ))}
            </div>
          </Section>
        </div>

        {/* sidebar */}
        <aside className="space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-2xl border bg-card p-5 shadow-field">
              <p className="font-display text-2xl text-ember">{formatPrice(c.priceMin)}<span className="text-sm text-muted-foreground"> /คืน</span></p>
              <div className="mt-4 space-y-2 text-sm">
                <a href={`tel:`} className="flex items-center gap-2 text-foreground/90 hover:text-ember"><Phone className="size-4" /> โทรสอบถาม / จอง</a>
                <a href={gmaps} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-foreground/90 hover:text-ember"><MapPin className="size-4" /> ดูเส้นทาง</a>
              </div>
              <Button asChild variant="ember" className="mt-4 w-full"><a href={directions} target="_blank" rel="noreferrer">ขอเส้นทางเดินทาง</a></Button>
              <Button variant="outline" className="mt-2 w-full">บันทึกลานนี้ไว้</Button>
            </div>

            <div className="rounded-2xl border bg-card p-5 text-sm shadow-field">
              <h4 className="mb-2 font-display text-base text-primary">เป็นเจ้าของลานนี้?</h4>
              <p className="text-muted-foreground">claim เพื่ออัปเดตราคา รูปภาพ และตอบกลับรีวิวได้</p>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full"><Link href="/owners">claim ลานนี้</Link></Button>
            </div>

            <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-xs text-muted-foreground hover:text-ember">
              <Flag className="size-3.5" /> แจ้งข้อมูลผิดพลาด
            </button>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl text-primary">{title}</h2>
      {children}
    </section>
  );
}

function ReviewItem({
  name,
  rating,
  time,
  text,
  trip,
  member,
}: {
  name: string;
  rating: number;
  time: string;
  text: string;
  trip?: string;
  member?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">
            {name[0]}
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">{name}</p>
            <p className="text-xs text-muted-foreground">{time}{trip ? ` · ${trip}` : ""}</p>
          </div>
        </div>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={i < rating ? "size-3.5 fill-ember text-ember" : "size-3.5 text-muted"} />
          ))}
        </div>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">{text}</p>
      {member && (
        <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          รีวิวสมาชิก CampThai
        </span>
      )}
    </div>
  );
}
