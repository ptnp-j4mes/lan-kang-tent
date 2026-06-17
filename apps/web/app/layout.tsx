import type { Metadata } from "next";
import { Chonburi, Anuphan } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const display = Chonburi({
  weight: "400",
  subsets: ["thai", "latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Anuphan({
  subsets: ["thai", "latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://campthai.app"),
  title: {
    default: "CampThai Map — ค้นหาลานกางเต็นท์ทั่วไทย บนแผนที่",
    template: "%s · CampThai Map",
  },
  description:
    "แพลตฟอร์มค้นหาและรีวิวลานกางเต็นท์ในประเทศไทย เปิดแผนที่ interactive ดูจุดกางเต็นท์ทั่วประเทศ กรองตามจังหวัด ราคา สิ่งอำนวยความสะดวก อ่านรีวิวจาก Google และนักแคมป์",
  keywords: ["ลานกางเต็นท์", "จุดกางเต็นท์", "campsite", "แคมป์ปิ้ง", "ที่กางเต็นท์", "camping thailand"],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "CampThai Map",
    title: "CampThai Map — ค้นหาลานกางเต็นท์ทั่วไทย",
    description: "เปิดแผนที่ เลือกพื้นที่ ดูลานกางเต็นท์ อ่านรีวิว ตัดสินใจเดินทาง",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
