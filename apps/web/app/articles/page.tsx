import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getArticles } from "@/lib/api";

export const metadata: Metadata = {
  title: "บทความ & ข่าวแคมป์ปิ้ง",
  description: "รวมบทความ เคล็ดลับ และข่าวสารสำหรับนักแคมป์ — เตรียมตัว เลือกลาน และเที่ยวอย่างปลอดภัย",
};

export default async function ArticlesPage() {
  const articles = await getArticles(50);
  return (
    <div className="container py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">บทความ & ข่าว</p>
      <h1 className="font-display text-3xl text-primary sm:text-4xl">เรื่องน่ารู้สำหรับนักแคมป์</h1>
      <p className="mt-1 text-sm text-muted-foreground">เคล็ดลับ รีวิว และข่าวสารแคมป์ปิ้งทั่วไทย</p>

      {articles.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">ยังไม่มีบทความ</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-field transition hover:-translate-y-1 hover:shadow-lift">
              <div className="relative aspect-[16/9] bg-secondary">
                {a.coverImageUrl && <Image src={a.coverImageUrl} alt={a.title} fill sizes="(max-width:768px) 100vw, 360px" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.slice(0, 2).map((t) => (
                    <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">{t}</span>
                  ))}
                </div>
                <h2 className="font-display text-lg leading-snug text-primary group-hover:text-ember">{a.title}</h2>
                {a.excerpt && <p className="line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>}
                <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-semibold text-ember">
                  อ่านต่อ <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
