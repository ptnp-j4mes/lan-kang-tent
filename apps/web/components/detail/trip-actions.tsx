"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CalendarPlus, CheckCircle2, MessageSquare } from "lucide-react";
import { api, getToken } from "@/lib/client";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { MonthCalendar, type CalEvent } from "@/components/month-calendar";

const inputCls = "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ember";

function rangeDays(start: string, end: string): string[] {
  if (!start) return [];
  const out: string[] = [];
  const s = new Date(start + "T00:00:00Z");
  const e = new Date((end || start) + "T00:00:00Z");
  for (let d = s; d <= e && out.length < 60; d = new Date(d.getTime() + 86400000)) out.push(d.toISOString().slice(0, 10));
  return out;
}

export function TripActions({ campId, campName }: { campId: string; campName: string }) {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [check, setCheck] = useState<{ blocking: boolean; messages: { type: string; note: string }[] } | null>(null);
  const [showInquiry, setShowInquiry] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<CalEvent[]>(`/api/campsites/${campId}/calendar`).then(setEvents).catch(() => {});
  }, [campId]);

  useEffect(() => {
    if (!start) return setCheck(null);
    api(`/api/campsites/${campId}/calendar/check?startDate=${start}&endDate=${end || start}`).then(setCheck).catch(() => setCheck(null));
  }, [campId, start, end]);

  function requireLogin() {
    if (getToken()) return true;
    toast("เข้าสู่ระบบเพื่อใช้ฟีเจอร์นี้", { label: "เข้าสู่ระบบ", href: "/login" });
    return false;
  }

  async function markTrip() {
    if (!requireLogin()) return;
    if (!start) return toast("เลือกวันก่อน");
    setBusy(true);
    try {
      await api("/api/me/camping-plans", {
        method: "POST",
        body: JSON.stringify({ campsiteId: campId, startDate: start, endDate: end || start, status: "planning" }),
      });
      toast("บันทึกแผนไปแคมป์แล้ว ดูที่แดชบอร์ด", { label: "แดชบอร์ด", href: "/dashboard" });
    } catch (e: any) {
      toast(e.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function sendInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!requireLogin()) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api(`/api/campsites/${campId}/inquiries`, {
        method: "POST",
        body: JSON.stringify({
          startDate: start || f.get("startDate"),
          endDate: end || start || f.get("startDate"),
          partySize: Number(f.get("partySize")) || undefined,
          tentCount: Number(f.get("tentCount")) || undefined,
          carCount: Number(f.get("carCount")) || undefined,
          hasPet: f.get("hasPet") === "on",
          contactPhone: f.get("contactPhone") || undefined,
          message: f.get("message") || undefined,
        }),
      });
      setShowInquiry(false);
      toast("ส่งคำขอไปยังเจ้าของลานแล้ว");
    } catch (e: any) {
      toast(e.message ?? "ส่งคำขอไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-field">
      <p className="font-display text-lg text-primary">วางแผนไปแคมป์</p>
      <MonthCalendar events={events} selected={rangeDays(start, end)} onPickDay={(d) => (!start || (end && end !== start) ? (setStart(d), setEnd("")) : d < start ? setStart(d) : setEnd(d))} />

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1"><span className="text-xs text-muted-foreground">วันเริ่ม</span><input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} /></label>
        <label className="space-y-1"><span className="text-xs text-muted-foreground">วันสิ้นสุด</span><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} /></label>
      </div>

      {check && start && (
        <div className={`flex items-start gap-2 rounded-lg p-2.5 text-sm ${check.blocking ? "bg-destructive/10 text-destructive" : "bg-accent/40 text-foreground/80"}`}>
          {check.blocking ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
          <span>{check.messages.map((m) => m.note).join(" · ")}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="ember" className="flex-1" onClick={markTrip} disabled={busy}><CalendarPlus className="size-4" /> Mark วันที่จะไป</Button>
        <Button variant="outline" onClick={() => setShowInquiry((v) => !v)}><MessageSquare className="size-4" /> สอบถาม</Button>
      </div>

      {showInquiry && (
        <form onSubmit={sendInquiry} className="space-y-2 rounded-xl border bg-background p-3">
          <p className="text-sm font-semibold text-primary">สอบถามวันว่าง — {campName}</p>
          {!start && <input name="startDate" type="date" required className={inputCls} />}
          <div className="grid grid-cols-3 gap-2">
            <input name="partySize" type="number" min={1} placeholder="คน" className={inputCls} />
            <input name="tentCount" type="number" min={0} placeholder="เต็นท์" className={inputCls} />
            <input name="carCount" type="number" min={0} placeholder="รถ" className={inputCls} />
          </div>
          <input name="contactPhone" placeholder="เบอร์ติดต่อ" className={inputCls} />
          <textarea name="message" rows={2} placeholder="ข้อความถึงเจ้าของลาน" className={inputCls} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="hasPet" className="size-4 accent-[hsl(var(--ember))]" /> พาสัตว์เลี้ยงไปด้วย</label>
          <Button type="submit" variant="ember" className="w-full" disabled={busy}>ส่งคำขอ</Button>
        </form>
      )}
    </div>
  );
}
