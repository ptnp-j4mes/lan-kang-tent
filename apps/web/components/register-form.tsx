"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/oauth-buttons";
import { register, mergeGuestFavorites, homeForRole } from "@/lib/client";
import { guestFavs } from "@/lib/guest-fav";
import { toast } from "@/lib/toast";

// shared register form. next=path to send to after signup (e.g. /owners to claim).
export function RegisterForm({
  heading,
  subtitle,
  oauth = true,
  next,
  footer,
}: {
  heading: string;
  subtitle: string;
  oauth?: boolean;
  next?: string;
  footer?: React.ReactNode;
}) {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const user = await register(String(f.get("name")), String(f.get("email")), String(f.get("password")));
      if (guestFavs().length && confirm("ต้องการย้ายรายการโปรดเข้าสู่บัญชีของคุณไหม?")) {
        const r = await mergeGuestFavorites();
        if (r) toast(`ย้ายรายการโปรด ${r.mergedCount} แห่งเข้าบัญชีแล้ว`);
      }
      router.push(next ?? homeForRole(user.role));
    } catch (e: any) {
      setErr(e.message ?? "สมัครไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-lift">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-full bg-ember text-ember-foreground">
            <Tent className="size-6" />
          </span>
          <h1 className="mt-3 font-display text-2xl text-primary">{heading}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {err && <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

        {oauth && (
          <>
            <OAuthButtons />
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> หรือ <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form className="space-y-3" onSubmit={onSubmit}>
          <Input name="name" placeholder="ชื่อที่แสดง" required minLength={2} />
          <Input name="email" type="email" placeholder="อีเมล" required />
          <Input name="password" type="password" placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)" required minLength={8} />
          <Button type="submit" variant="ember" className="w-full" disabled={busy}>
            {busy ? "กำลังสร้างบัญชี…" : "สร้างบัญชี"}
          </Button>
        </form>

        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
