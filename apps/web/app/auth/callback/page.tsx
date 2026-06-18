"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api, setToken, mergeGuestFavorites, homeForRole } from "@/lib/client";
import { guestFavs } from "@/lib/guest-fav";
import { toast } from "@/lib/toast";

export default function Page() {
  return (
    <Suspense fallback={<Center>กำลังเข้าสู่ระบบ…</Center>}>
      <Callback />
    </Suspense>
  );
}

function Callback() {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");
    if (error) {
      toast(`เข้าสู่ระบบไม่สำเร็จ: ${error}`);
      router.replace("/login");
      return;
    }
    if (token) {
      setToken(token);
      (async () => {
        if (guestFavs().length && confirm("ต้องการย้ายรายการโปรดเข้าสู่บัญชีของคุณไหม?")) {
          const r = await mergeGuestFavorites().catch(() => null);
          if (r) toast(`ย้ายรายการโปรด ${r.mergedCount} แห่งแล้ว`);
        }
        const me = await api<{ role: string }>("/api/me").catch(() => null);
        router.replace(homeForRole(me?.role));
      })();
    } else {
      router.replace("/login");
    }
  }, [params, router]);
  return <Center>กำลังเข้าสู่ระบบ…</Center>;
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-[60vh] place-items-center gap-3 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
      <p>{children}</p>
    </div>
  );
}
