import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-border/70 bg-primary text-primary-foreground">
      <div className="topo-divider absolute -top-[7px] left-0 right-0 opacity-40" />
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm text-primary-foreground/70">
            แพลตฟอร์มค้นหาและรีวิวลานกางเต็นท์ทั่วประเทศไทย เปิดแผนที่ เลือกพื้นที่ อ่านรีวิว
            แล้วออกเดินทาง
          </p>
        </div>
        {[
          { h: "สำรวจ", links: [["แผนที่", "/map"], ["ลานทั้งหมด", "/campsites"], ["ตามจังหวัด", "/province"]] },
          { h: "ชุมชน", links: [["รีวิวนักแคมป์", "/reviews"], ["เขียนรีวิว", "/login"], ["ลานโปรด", "/login"]] },
          { h: "เจ้าของลาน", links: [["ลงทะเบียนลาน", "/owners"], ["claim ลาน", "/owners"], ["เข้าสู่ระบบ", "/login"]] },
        ].map((col) => (
          <div key={col.h}>
            <h4 className="mb-3 font-display text-base">{col.h}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-ember">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Larn kang tent — ลานกางเต็นท์</p>
          <p>Built with Next.js · Elysia · Prisma</p>
        </div>
      </div>
    </footer>
  );
}
