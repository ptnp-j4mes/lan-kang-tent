import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticle } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: "ไม่พบบทความ" };
  return {
    title: a.metaTitle || a.title,
    description: a.metaDescription || a.excerpt || undefined,
    openGraph: {
      type: "article",
      title: a.metaTitle || a.title,
      description: a.metaDescription || a.excerpt || undefined,
      images: a.coverImageUrl ? [a.coverImageUrl] : [],
      publishedTime: a.publishedAt ?? undefined,
    },
    alternates: { canonical: `/articles/${a.slug}` },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();

  const paragraphs: string[] = (a.content ?? "").split(/\n{2,}/).filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.metaDescription || a.excerpt || undefined,
    image: a.coverImageUrl || undefined,
    datePublished: a.publishedAt || undefined,
    dateModified: a.updatedAt || undefined,
    keywords: (a.tags ?? []).join(", "),
    mainEntityOfPage: `https://campthai.app/articles/${a.slug}`,
  };

  return (
    <article className="pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* cover */}
      <div className="relative h-[38vh] min-h-[280px] w-full overflow-hidden bg-primary">
        {a.coverImageUrl && <Image src={a.coverImageUrl} alt={a.title} fill sizes="100vw" className="object-cover" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/20" />
        <div className="container relative flex h-full flex-col justify-end pb-7">
          <nav className="text-xs text-primary-foreground/80">
            <Link href="/articles" className="hover:text-ember">บทความ</Link>
          </nav>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(a.tags ?? []).map((t: string) => (
              <span key={t} className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] text-primary-foreground backdrop-blur">{t}</span>
            ))}
          </div>
          <h1 className="mt-2 max-w-3xl font-display text-3xl text-primary-foreground drop-shadow-lg sm:text-4xl">{a.title}</h1>
          {a.publishedAt && (
            <p className="mt-2 text-sm text-primary-foreground/80">
              {new Date(a.publishedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* body */}
      <div className="container mt-8 max-w-2xl">
        {a.excerpt && <p className="mb-6 border-l-4 border-ember pl-4 text-lg leading-relaxed text-foreground/90">{a.excerpt}</p>}
        <div className="space-y-4 leading-relaxed text-foreground/90">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border bg-card p-6 text-center shadow-field">
          <p className="font-display text-lg text-primary">พร้อมออกเดินทางแล้ว?</p>
          <Link href="/map" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-ember-foreground">
            เปิดแผนที่ลานกางเต็นท์
          </Link>
        </div>
      </div>
    </article>
  );
}
