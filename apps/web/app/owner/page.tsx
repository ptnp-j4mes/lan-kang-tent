"use client";

// Owner console — manage only your own camps (profile/price, calendar status tags, bookings).
// ponytail: reconstructed after the original untracked file was lost; mirrors the owner API in
// apps/api/src/routes/owner.ts + phase2.ts and the site's dashboard styling.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays, Inbox, Loader2, LogOut, MapPin, Tent, Trash2,
} from "lucide-react";
import { api, clearToken, useMe } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CampSections } from "@/components/detail/owner-manage";

const inputCls =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ember";
const Spin = () => <div className="grid place-items-center py-12"><Loader2 className="animate-spin" /></div>;
const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">{children}</p>
);

const TABS = [
  { id: "camps", label: "ลานของฉัน", icon: Tent },
  { id: "calendar", label: "ปฏิทิน / ป้ายสถานะ", icon: CalendarDays },
  { id: "bookings", label: "คำขอจอง", icon: Inbox },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function OwnerConsolePage() {
  const me = useMe();
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("camps");

  useEffect(() => {
    if (me === null) router.replace("/owner/login");
    else if (me && me.role !== "owner" && me.role !== "camp_staff" && me.role !== "admin")
      router.replace("/dashboard");
  }, [me, router]);

  if (me === undefined || me === null)
    return <div className="grid h-[60vh] place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">เจ้าของลาน</p>
          <h1 className="font-display text-3xl text-primary">สวัสดี, {me.name}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => { clearToken(); router.push("/"); }}>
          <LogOut className="size-4" /> ออกจากระบบ
        </Button>
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition",
              tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-accent/60",
            )}
          >
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </nav>

      {tab === "camps" && <CampsTab />}
      {tab === "calendar" && <CalendarTab />}
      {tab === "bookings" && <BookingsTab />}
    </div>
  );
}

// ---------- ลานของฉัน ----------
function CampsTab() {
  const [camps, setCamps] = useState<any[] | null>(null);
  function load() { api<any[]>("/api/owner/campsites").then(setCamps).catch(() => setCamps([])); }
  useEffect(load, []);
  if (!camps) return <Spin />;
  if (!camps.length) return <Empty>ยังไม่มีลานที่คุณดูแล — <Link href="/owners" className="text-ember underline">claim ลานของคุณ</Link></Empty>;
  return (
    <div className="space-y-8">
      {camps.map((c) => (
        <div key={c.id}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <Link href={`/campsites/${c.slug}`} className="font-display text-lg text-primary hover:text-ember">{c.name}</Link>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" /> {c.province}{c.district ? ` · ${c.district}` : ""}</p>
            </div>
            {c.isVerified && <span className="rounded-full bg-[hsl(142_55%_42%/0.16)] px-2 py-0.5 text-[11px] font-medium text-[hsl(142_45%_30%)]">ยืนยันแล้ว</span>}
          </div>
          <CampSections camp={c} onSaved={load} wide />
        </div>
      ))}
    </div>
  );
}

// ---------- ปฏิทิน / ป้ายสถานะ ----------
const EVENT_TYPES = [
  { value: "open", label: "เปิดรับ" },
  { value: "fully_booked", label: "เต็มแล้ว" },
  { value: "closed", label: "ปิด" },
  { value: "maintenance", label: "ปิดปรับปรุง" },
  { value: "special_event", label: "อีเวนต์พิเศษ" },
  { value: "weather_notice", label: "แจ้งสภาพอากาศ" },
];
const typeLabel = (v: string) => EVENT_TYPES.find((t) => t.value === v)?.label ?? v;
const fmtDay = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });

function CalendarTab() {
  const [camps, setCamps] = useState<any[] | null>(null);
  const [campId, setCampId] = useState("");
  const [events, setEvents] = useState<any[] | null>(null);
  const [form, setForm] = useState({ eventType: "open", title: "", startDate: "", endDate: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<any[]>("/api/owner/campsites").then((c) => { setCamps(c); if (c[0]) setCampId(c[0].id); }).catch(() => setCamps([]));
  }, []);
  function loadEvents(id: string) {
    setEvents(null);
    api<any[]>(`/api/campsites/${id}/calendar`).then(setEvents).catch(() => setEvents([]));
  }
  useEffect(() => { if (campId) loadEvents(campId); }, [campId]);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      await api(`/api/owner/campsites/${campId}/calendar-events`, { method: "POST", body: JSON.stringify(form) });
      setForm({ eventType: "open", title: "", startDate: "", endDate: "", note: "" });
      loadEvents(campId);
    } catch (e: any) { setErr(e.message ?? "เพิ่มไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    await api(`/api/owner/calendar-events/${id}`, { method: "DELETE" }).catch(() => {});
    loadEvents(campId);
  }

  if (!camps) return <Spin />;
  if (!camps.length) return <Empty>ยังไม่มีลานที่คุณดูแล</Empty>;

  return (
    <div>
      <div className="mb-4">
        <select className={cn(inputCls, "max-w-xs")} value={campId} onChange={(e) => setCampId(e.target.value)}>
          {camps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <form onSubmit={add} className="space-y-3 rounded-2xl border bg-card p-5 shadow-field">
          <h3 className="font-display text-base text-primary">เพิ่มป้ายสถานะ</h3>
          {err && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">ประเภท</span>
            <select className={inputCls} value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
              {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">หัวข้อ (ไม่บังคับ)</span><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">เริ่ม</span><input type="date" className={inputCls} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></label>
            <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">ถึง</span><input type="date" className={inputCls} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></label>
          </div>
          <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">หมายเหตุ</span><input className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
          <Button variant="ember" size="sm" className="w-full" type="submit" disabled={busy}>{busy ? "กำลังเพิ่ม…" : "เพิ่ม"}</Button>
        </form>

        <div className="space-y-2">
          {!events ? <Spin /> : !events.length ? <Empty>ยังไม่มีป้ายสถานะ</Empty> : events.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{typeLabel(ev.eventType)}</span>
              <div className="min-w-0 flex-1">
                {ev.title && <p className="truncate text-sm font-medium text-primary">{ev.title}</p>}
                <p className="text-xs text-muted-foreground">{fmtDay(ev.startDate)} – {fmtDay(ev.endDate)}{ev.note ? ` · ${ev.note}` : ""}</p>
              </div>
              <button onClick={() => remove(ev.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- คำขอจอง ----------
const fmtDate = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });

function BookingsTab() {
  const [list, setList] = useState<any[] | null>(null);
  function load() { api<any[]>("/api/owner/inquiries").then(setList).catch(() => setList([])); }
  useEffect(load, []);
  if (!list) return <Spin />;
  if (!list.length) return <Empty>ยังไม่มีคำขอจอง</Empty>;
  return <div className="space-y-4">{list.map((q) => <BookingRow key={q.id} q={q} onChange={load} />)}</div>;
}

function BookingRow({ q, onChange }: { q: any; onChange: () => void }) {
  const [reply, setReply] = useState(q.ownerReply ?? "");
  const [busy, setBusy] = useState(false);
  const replied = q.status === "owner_replied" || q.status === "user_confirmed";

  async function send() {
    if (!reply.trim()) return;
    setBusy(true);
    try { await api(`/api/owner/inquiries/${q.id}/reply`, { method: "PATCH", body: JSON.stringify({ reply }) }); onChange(); }
    finally { setBusy(false); }
  }

  const details = [
    `${fmtDate(q.startDate)} – ${fmtDate(q.endDate)}`,
    q.partySize && `${q.partySize} คน`,
    q.tentCount && `${q.tentCount} เต็นท์`,
    q.carCount && `${q.carCount} คัน`,
    q.hasPet && "พาสัตว์เลี้ยง",
    q.contactPhone && `📞 ${q.contactPhone}`,
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-field">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-primary">{q.campsite?.name} · <span className="text-muted-foreground">{q.user?.name}</span></p>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", replied ? "bg-[hsl(142_55%_42%/0.16)] text-[hsl(142_45%_30%)]" : "bg-secondary text-secondary-foreground")}>
          {replied ? "ตอบแล้ว" : "รอตอบ"}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {details.map((d, i) => <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">{d}</span>)}
      </div>
      {q.message && <p className="mb-3 rounded-xl bg-accent/40 px-3 py-2 text-sm">{q.message}</p>}
      <textarea rows={2} className={inputCls} placeholder="พิมพ์คำตอบถึงลูกค้า…" value={reply} onChange={(e) => setReply(e.target.value)} />
      <div className="mt-2">
        <Button variant="ember" size="sm" onClick={send} disabled={busy || !reply.trim()}>
          {busy ? "กำลังส่ง…" : q.ownerReply ? "อัปเดตคำตอบ" : "ส่งคำตอบ"}
        </Button>
      </div>
    </div>
  );
}
