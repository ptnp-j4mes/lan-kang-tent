import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "สำหรับเจ้าของลาน",
  description: "claim ลานกางเต็นท์ของคุณ อัปเดตข้อมูล ราคา รูปภาพ และตอบกลับรีวิว",
};

const STEPS = [
  { icon: FileText, title: "สมัครสมาชิก & กด claim", text: "ค้นหาลานของคุณ แล้วกด “เป็นเจ้าของลานนี้?”" },
  { icon: ShieldCheck, title: "ส่งหลักฐาน", text: "แนบเอกสาร/รูปยืนยันความเป็นเจ้าของ" },
  { icon: CheckCircle2, title: "รออนุมัติ", text: "แอดมินตรวจสอบและอนุมัติภายใน 1–3 วัน" },
  { icon: MessageSquare, title: "จัดการลาน", text: "อัปเดตราคา รูป สิ่งอำนวยความสะดวก ตอบรีวิว" },
];

export default function OwnersPage() {
  return (
    <div>
      <section className="grain relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container py-16 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">สำหรับเจ้าของลาน</p>
          <h1 className="mt-2 max-w-2xl font-display text-3xl sm:text-5xl">
            ลานของคุณ ให้คนแคมป์เจอง่ายขึ้น
          </h1>
          <p className="mt-4 max-w-xl text-primary-foreground/80">
            claim ลานกางเต็นท์ของคุณบน CampThai เพื่ออัปเดตข้อมูลให้ถูกต้อง ใส่รูปสวยๆ
            ตอบกลับรีวิว และเข้าถึงนักแคมป์ทั่วประเทศ — ฟรี
          </p>
          <Button asChild variant="ember" className="mt-6">
            <Link href="/register">เริ่มต้น claim ลาน</Link>
          </Button>
        </div>
      </section>

      <section className="container py-14">
        <div className="grid gap-5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border bg-card p-5 shadow-field">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                  <s.icon className="size-5" />
                </span>
                <span className="font-display text-2xl text-ember/40">{i + 1}</span>
              </div>
              <h3 className="mt-3 font-display text-lg text-primary">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
