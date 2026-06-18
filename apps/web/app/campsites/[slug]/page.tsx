import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, BadgeCheck, ExternalLink, Flag, MapPin, Navigation, Star } from "lucide-react";
import { getCampsiteDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/rating";
import { AmenityIcon } from "@/components/amenity-icon";
import { DetailMap } from "@/components/map/detail-map";
import { FavoriteButton } from "@/components/favorite-button";
import { TripActions } from "@/components/detail/trip-actions";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCampsiteDetail(slug);
  if (!c) return { title: "ไม่พบลานกางเต็นท์" };
  return {
    title: `${c.name} ${c.province}`,
    description: c.description ?? undefined,
    openGraph: { images: c.coverImageUrl ? [c.coverImageUrl] : [], title: c.name },
  };
}

export default async function DetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCampsiteDetail(slug);
  if (!c) notFound();

  const gmaps = `https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`;

  return (
    <article>
      {/* hero banner */}
      <section className="relative h-[44vh] min-h-[360px] w-full overflow-hidden bg-primary">
        {c.gallery[0] && <Image src={c.gallery[0]} alt={c.name} fill sizes="100vw" className="object-cover" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
        <div className="container relative flex h-full flex-col justify-end pb-7">
          <nav className="text-xs text-primary-foreground/80">
            <Link href="/campsites" className="hover:text-ember">ลานทั้งหมด</Link>{" / "}
            <Link href={`/province/${encodeURIComponent(c.province)}`} className="hover:text-ember">{c.province}</Link>
          </nav>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {c.isVerified && <Badge variant="verified"><BadgeCheck className="size-3.5" /> ลานที่ยืนยันแล้ว</Badge>}
                <Badge variant="moss">{c.province}</Badge>
              </div>
              <h1 className="mt-2 font-display text-3xl text-primary-foreground drop-shadow-lg sm:text-5xl">{c.name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-primary-foreground/85">
                <MapPin className="size-4" />{c.district ? `อ.${c.district}, ` : ""}จ.{c.province}
              </p>
            </div>
            <FavoriteButton campId={c.id} className="size-10 shrink-0 bg-card/90 backdrop-blur" />
          </div>
        </div>
      </section>

      {/* thumbnails */}
      {c.gallery.length > 1 && (
        <div className="no-scrollbar container relative -mt-6 flex gap-2 overflow-x-auto pb-1">
          {c.gallery.slice(1, 4).map((g, i) => (
            <div key={i} className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border-2 border-background bg-secondary shadow-lift">
              <Image src={g} alt="" fill sizes="160px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="container mt-8 grid gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 shadow-field">
            <Rating value={c.memberRating} count={c.memberReviewCount} source="member" className="text-base" />
            <span className="h-4 w-px bg-border" />
            <Rating value={c.googleRating} source="google" className="text-base" />
            <span className="h-4 w-px bg-border" />
            <span className="font-display text-xl text-ember">{formatPrice(c.priceMin)}<span className="text-sm text-muted-foreground"> /คืน</span></span>
          </div>

          {c.description && <Section title="เกี่ยวกับลานนี้"><p className="leading-relaxed text-foreground/90">{c.description}</p></Section>}

          {c.tags.length > 0 && (
            <Section title="สิ่งอำนวยความสะดวก">
              <div className="flex flex-wrap gap-2">
                {c.tags.map((t) => (
                  <span key={t.key} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm text-foreground/80">
                    <AmenityIcon keyName={t.key} className="size-3.5 text-ember" />{t.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section title="กฎของลาน">
            <div className="rounded-xl border border-ember/30 bg-ember/5 p-4 text-sm text-foreground/90">
              <p className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-ember" />งดส่งเสียงดังหลัง 22:00 น. · แยกขยะก่อนทิ้ง · ห้ามก่อไฟนอกจุดที่กำหนด · เก็บขยะกลับทุกครั้ง</p>
            </div>
          </Section>

          <Section title="ตำแหน่งบนแผนที่">
            <div className="h-72 overflow-hidden rounded-2xl border"><DetailMap campsite={c as any} /></div>
            <div className="mt-3 flex gap-2">
              <Button asChild variant="outline" size="sm"><a href={gmaps} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> เปิดใน Google Maps</a></Button>
              <Button asChild variant="ember" size="sm"><a href={directions} target="_blank" rel="noreferrer"><Navigation className="size-4" /> ขอเส้นทาง</a></Button>
            </div>
          </Section>

          <Section title="รีวิวจาก Google">
            <p className="mb-3 text-xs text-muted-foreground">ข้อมูลรีวิวจาก Google Maps · แสดงตาม attribution ของ Google</p>
            {c.googleReviews.length ? (
              <div className="space-y-3">
                {c.googleReviews.map((r, i) => (
                  <ReviewItem key={i} name={r.authorName ?? "Google user"} rating={r.rating ?? 0} time={r.relativeTimeDescription ?? ""} text={r.text ?? ""} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed py-6 text-center text-sm text-muted-foreground">ยังไม่มีรีวิว Google ที่ sync ไว้</p>
            )}
          </Section>

          <Section title="รีวิวจากสมาชิก Larn kang tent">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.memberReviewCount} รีวิวจากนักแคมป์</p>
              <Button asChild variant="ember" size="sm"><Link href="/login">เขียนรีวิว</Link></Button>
            </div>
            <p className="rounded-xl border border-dashed py-6 text-center text-sm text-muted-foreground">เข้าสู่ระบบเพื่ออ่านและเขียนรีวิวสมาชิก</p>
          </Section>
        </div>

        {/* sidebar */}
        <aside className="space-y-4">
          <div className="sticky top-20 space-y-4">
            <TripActions campId={c.id} campName={c.name} />
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
  return <section><h2 className="mb-3 font-display text-xl text-primary">{title}</h2>{children}</section>;
}

function ReviewItem({ name, rating, time, text }: { name: string; rating: number; time: string; text: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">{name[0]}</span>
          <div><p className="text-sm font-semibold text-primary">{name}</p><p className="text-xs text-muted-foreground">{time}</p></div>
        </div>
        <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < rating ? "size-3.5 fill-ember text-ember" : "size-3.5 text-muted"} />)}</div>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">{text}</p>
    </div>
  );
}
