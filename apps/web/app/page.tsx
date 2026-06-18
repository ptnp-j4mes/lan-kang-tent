import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map, Quote, Star } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { SectionRail } from "@/components/section-rail";
import { Button } from "@/components/ui/button";
import { getActiveBanner, getArticles, popular, topRated } from "@/lib/api";
import { Reveal } from "@/components/reveal";

const RECENT_REVIEWS = [
  { name: "พิมพ์ชนก", site: "ดอยเสมอดาว", rating: 5, text: "ทะเลหมอกสวยมาก ตื่นมาเจอวิวแบบนี้คุ้มเกินราคา เจ้าหน้าที่ดูแลดี", trip: "คู่รัก" },
  { name: "ก้องภพ", site: "สวนผึ้ง ริเวอร์ แคมป์", rating: 5, text: "พาครอบครัวมา เด็กๆ เล่นน้ำได้ ห้องน้ำสะอาด รถเก๋งเข้าสบาย", trip: "ครอบครัว" },
  { name: "Natcha", site: "เขาค้อ", rating: 4, text: "วิวดี อากาศเย็น แต่คนเยอะหน่อยช่วงวันหยุด แนะนำมาวันธรรมดา", trip: "กลุ่มเพื่อน" },
];

export default async function HomePage() {
  const [banner, articles] = await Promise.all([getActiveBanner(), getArticles(3)]);
  const pop = popular(8);
  const top = topRated(8);

  return (
    <>
      <Hero banner={banner} />

      <SectionRail eyebrow="มาแรง" title="ลานกางเต็นท์ยอดนิยม" href="/campsites?sort=popular" items={pop} />

      <SectionRail eyebrow="คะแนนสูง" title="ลานกางเต็นท์คะแนนสูง" href="/campsites?sort=rating" items={top} />

      {/* map teaser */}
      <section className="container py-6">
        <Reveal>
        <div className="grain relative overflow-hidden rounded-3xl border border-primary/20 bg-primary text-primary-foreground shadow-lift">
          <div className="absolute inset-0 opacity-25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1400&q=70"
              alt=""
              className="size-full object-cover"
            />
          </div>
          <div className="relative grid gap-6 p-8 md:grid-cols-2 md:items-center md:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">แผนที่ทั่วไทย</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                ลานกางเต็นท์ทั้งประเทศ ในแผนที่เดียว
              </h2>
              <p className="mt-3 max-w-md text-primary-foreground/80">
                ซูม เลื่อน คลิกหมุดเต็นท์ เปิดการ์ดดูราคาและรีวิวทันที กรองตามสิ่งที่คุณต้องการ
                หรือใช้โหมด “ใกล้ฉัน” หาลานใกล้ตัว
              </p>
              <Button asChild variant="ember" size="lg" className="mt-6">
                <Link href="/map">
                  <Map className="size-5" /> เปิดแผนที่ลานกางเต็นท์
                </Link>
              </Button>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=900&q=75"
                alt="แผนที่ลานกางเต็นท์"
                className="size-full object-cover"
              />
              <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 animate-sway place-items-center rounded-full bg-ember text-ember-foreground shadow-lift">
                <Map className="size-6" />
              </span>
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      {/* articles / news */}
      {articles.length > 0 && (
        <section className="container py-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">บทความ & ข่าว</p>
              <h2 className="mt-1 font-display text-2xl text-primary sm:text-3xl">เรื่องน่ารู้ก่อนออกแคมป์</h2>
            </Reveal>
            <Link href="/articles" className="group inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-ember">
              ดูทั้งหมด <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal key={a.id} delay={i * 90}>
                <Link href={`/articles/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-field transition hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative aspect-[16/9] bg-secondary">
                    {a.coverImageUrl && <Image src={a.coverImageUrl} alt={a.title} fill sizes="(max-width:768px) 100vw, 360px" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex flex-wrap gap-1.5">
                      {a.tags.slice(0, 2).map((t) => (
                        <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">{t}</span>
                      ))}
                    </div>
                    <h3 className="font-display text-lg leading-snug text-primary group-hover:text-ember">{a.title}</h3>
                    {a.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>}
                    <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-semibold text-ember">
                      อ่านต่อ <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* recent reviews */}
      <section className="container py-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">เสียงจริงจากสนาม</p>
            <h2 className="mt-1 font-display text-2xl text-primary sm:text-3xl">รีวิวล่าสุดจากนักแคมป์</h2>
          </div>
          <Link href="/reviews" className="group inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-ember">
            ดูทั้งหมด <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {RECENT_REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 90}>
            <figure className="relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-field">
              <Quote className="size-7 text-ember/30" />
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground/90">{r.text}</blockquote>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < r.rating ? "size-4 fill-ember text-ember" : "size-4 text-muted"} />
                ))}
              </div>
              <figcaption className="mt-3 border-t pt-3 text-sm">
                <span className="font-semibold text-primary">{r.name}</span>
                <span className="text-muted-foreground"> · {r.trip}</span>
                <span className="block text-xs text-muted-foreground">รีวิว {r.site}</span>
              </figcaption>
            </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
