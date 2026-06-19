import Link from "next/link";
import type { Metadata } from "next";
import { Tent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-lift">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-full bg-ember text-ember-foreground">
            <Tent className="size-6" />
          </span>
          <h1 className="mt-3 font-display text-2xl text-primary">เข้าสู่ระบบ CampThai</h1>
          <p className="text-sm text-muted-foreground">เขียนรีวิว บันทึกลานโปรด และอื่นๆ</p>
        </div>

        <Button variant="outline" className="w-full">
          <svg viewBox="0 0 24 24" className="size-4"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.1 14.6 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.5 12 20.5c5.9 0 9.8-4.1 9.8-9.9 0-.7-.1-1.2-.2-1.7H12z"/></svg>
          เข้าสู่ระบบด้วย Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> หรือ <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3">
          <Input type="email" placeholder="อีเมล" />
          <Input type="password" placeholder="รหัสผ่าน" />
          <Button variant="ember" className="w-full">เข้าสู่ระบบ</Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-semibold text-ember hover:underline">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}
