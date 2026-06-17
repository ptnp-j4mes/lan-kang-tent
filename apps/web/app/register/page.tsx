import Link from "next/link";
import type { Metadata } from "next";
import { Tent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "สมัครสมาชิก" };

export default function RegisterPage() {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-lift">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-full bg-ember text-ember-foreground">
            <Tent className="size-6" />
          </span>
          <h1 className="mt-3 font-display text-2xl text-primary">สมัครสมาชิก</h1>
          <p className="text-sm text-muted-foreground">เข้าร่วมชุมชนนักแคมป์ CampThai</p>
        </div>

        <form className="space-y-3">
          <Input placeholder="ชื่อที่แสดง" />
          <Input type="email" placeholder="อีเมล" />
          <Input type="password" placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)" />
          <Button variant="ember" className="w-full">สร้างบัญชี</Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-semibold text-ember hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}
