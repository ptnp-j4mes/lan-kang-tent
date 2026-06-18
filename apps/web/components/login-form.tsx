"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/oauth-buttons";
import { login, mergeGuestFavorites, homeForRole, clearToken } from "@/lib/client";
import { guestFavs } from "@/lib/guest-fav";
import { toast } from "@/lib/toast";

// shared login form. expectRole gates a portal (e.g. admin) — wrong role is rejected.
export function LoginForm({
  heading,
  subtitle,
  oauth = true,
  expectRole,
  footer,
}: {
  heading: string;
  subtitle: string;
  oauth?: boolean;
  expectRole?: string[];
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
      const user = await login(String(f.get("email")), String(f.get("password")));
      if (expectRole && !expectRole.includes(user.role)) {
        clearToken();
        setErr("บัญชีนี้ไม่มีสิทธิ์เข้าส่วนนี้");
        return;
      }
      if (guestFavs().length && confirm("ต้องการย้ายรายการโปรดเข้าสู่บัญชีของคุณไหม?")) {
        const r = await mergeGuestFavorites();
        if (r) toast(`ย้ายรายการโปรด ${r.mergedCount} แห่งเข้าบัญชีแล้ว`);
      }
      router.push(homeForRole(user.role));
    } catch (e: any) {
      setErr(e.message ?? "เข้าสู่ระบบไม่สำเร็จ");
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
          <Input name="email" type="email" placeholder="อีเมล" required />
          <Input name="password" type="password" placeholder="รหัสผ่าน" required />
          <Button type="submit" variant="ember" className="w-full" disabled={busy}>
            {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </Button>
        </form>

        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
