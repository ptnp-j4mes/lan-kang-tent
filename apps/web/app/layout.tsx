import type { Metadata } from "next";
import Script from "next/script";
import { Prompt } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/toaster";
import { getSiteSettings } from "@/lib/api";

const SITE_URL = "https://campthai.app";

const display = Prompt({
  weight: ["600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Prompt({
  weight: ["400", "500", "600"],
  subsets: ["thai", "latin"],
  variable: "--font-body",
  display: "swap",
});

// site-wide SEO defaults from admin-managed settings (fallback baked-in)
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s?.metaTitle || "Larn kang tent — ค้นหาลานกางเต็นท์ทั่วไทย บนแผนที่";
  const description =
    s?.metaDescription ||
    "แพลตฟอร์มค้นหาและรีวิวลานกางเต็นท์ในประเทศไทย เปิดแผนที่ ดูจุดกางเต็นท์ทั่วประเทศ กรองตามจังหวัด ราคา สิ่งอำนวยความสะดวก";
  const siteName = s?.siteName || "Larn kang tent";
  const ogImage = s?.ogImage || `${SITE_URL}/og.jpg`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${siteName}` },
    description,
    keywords: s?.keywords?.length ? s.keywords : ["ลานกางเต็นท์", "จุดกางเต็นท์", "campsite", "แคมป์ปิ้ง", "ที่กางเต็นท์", "camping thailand"],
    applicationName: siteName,
    alternates: { canonical: "/" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    openGraph: { type: "website", locale: "th_TH", siteName, title, description, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage], site: s?.twitterHandle || undefined },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s?.organizationName || s?.siteName || "Larn kang tent",
    url: SITE_URL,
    logo: s?.ogImage || undefined,
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: s?.siteName || "Larn kang tent",
    url: SITE_URL,
    potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/campsites?keyword={q}`, "query-input": "required name=q" },
  };

  return (
    <html lang="th" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([org, website]) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
          ข้ามไปเนื้อหา
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <Toaster />
        {/* GA4 — loads only when admin sets ga4Id */}
        {s?.ga4Id && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.ga4Id}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.ga4Id}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
