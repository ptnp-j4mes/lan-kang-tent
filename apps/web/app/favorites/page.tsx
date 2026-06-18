"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Loader2 } from "lucide-react";
import { getAllCampsites } from "@/lib/api";
import { getToken } from "@/lib/client";
import { guestFavs } from "@/lib/guest-fav";
import type { CampsiteLight } from "@/lib/types";
import { CampsiteCard } from "@/components/campsite-card";
import { Button } from "@/components/ui/button";

export default function GuestFavorites() {
  const [items, setItems] = useState<CampsiteLight[] | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [prov, setProv] = useState("");
  const [kw, setKw] = useState("");

  useEffect(() => {
    setLoggedIn(!!getToken());
    const ids = new Set(guestFavs());
    getAllCampsites().then((all) => setItems(all.filter((c) => ids.has(c.id)))).catch(() => setItems([]));
  }, []);

  if (items === null) return <div className="grid h-[50vh] place-items-center"><Loader2 className="animate-spin" /></div>;

  const provinces = [...new Set(items.map((c) => c.province))].sort();
  const filtered = items.filter(
    (c) => (!prov || c.province === prov) && (!kw || c.name.toLowerCase().includes(kw.toLowerCase())),
  );

  return (
    <div className="container py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">รายการโปรด</p>
      <h1 className="font-display text-3xl text-primary sm:text-4xl">ลานที่บันทึกไว้</h1>

      {loggedIn ? (
        <p className="mt-2 text-sm text-muted-foreground">ดูลานโปรดในบัญชีได้ที่ <Link href="/dashboard" className="text-ember hover:underline">แดชบอร์ด</Link></p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-ember/30 bg-ember/5 p-4">
          <Bookmark className="size-5 text-ember" />
          <p className="flex-1 text-sm">บันทึกไว้ในเครื่องนี้ — สมัครสมาชิกเพื่อเก็บข้ามอุปกรณ์</p>
          <Button asChild variant="ember" size="sm"><Link href="/register">สมัครสมาชิก</Link></Button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">ยังไม่มีลานโปรด — กดรูปบุ๊กมาร์กบนการ์ดลานเพื่อบันทึก</p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="ค้นในรายการโปรด"
              className="h-9 w-48 rounded-full border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ember"
            />
            <select value={prov} onChange={(e) => setProv(e.target.value)} className="h-9 rounded-full border border-input bg-card px-3 text-sm">
              <option value="">ทุกจังหวัด</option>
              {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="text-xs text-muted-foreground">{filtered.length}/{items.length}</span>
            {(kw || prov) && <button onClick={() => { setKw(""); setProv(""); }} className="text-xs text-ember hover:underline">ล้าง</button>}
          </div>
          {filtered.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">ไม่พบในตัวกรอง</p>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => <CampsiteCard key={c.id} c={c} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
