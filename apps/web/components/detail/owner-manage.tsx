"use client";

// Owner inline management for a campsite detail page. Renders a floating
// "จัดการลานนี้" button only when the signed-in user owns (or admin/staff-manages)
// this camp; opens a drawer covering every editable section. Uses /api/owner/*.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ImagePlus, Loader2, MapPin, Settings2, Tags, Trash2, X } from "lucide-react";
import { api, useMe } from "@/lib/client";
import { Button } from "@/components/ui/button";

const inputCls = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ember";
const lbl = "text-xs font-semibold text-muted-foreground";

const EVENT_TYPES = [
  { value: "open", label: "เปิดรับ" },
  { value: "fully_booked", label: "เต็มแล้ว" },
  { value: "closed", label: "ปิด" },
  { value: "maintenance", label: "ปิดปรับปรุง" },
  { value: "special_event", label: "อีเวนต์พิเศษ" },
  { value: "weather_notice", label: "แจ้งสภาพอากาศ" },
];

export function OwnerManage({ campId }: { campId: string }) {
  const me = useMe();
  const router = useRouter();
  const [camp, setCamp] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!me) return;
    api<any[]>("/api/owner/campsites")
      .then((camps) => setCamp(camps.find((c) => c.id === campId) ?? null))
      .catch(() => setCamp(null));
  }, [me, campId]);

  if (!camp) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ember px-5 py-3 text-sm font-semibold text-ember-foreground shadow-lift hover:brightness-105"
      >
        <Settings2 className="size-4" /> จัดการลานนี้
      </button>
      {open && <Drawer camp={camp} onClose={() => setOpen(false)} onSaved={() => { router.refresh(); }} />}
    </>
  );
}

function Drawer({ camp, onClose, onSaved }: { camp: any; onClose: () => void; onSaved: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-5 py-3 backdrop-blur">
          <h2 className="font-display text-lg text-primary">จัดการ: {camp.name}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent"><X className="size-5" /></button>
        </div>
        <div className="space-y-6 p-5">
          <BasicSection camp={camp} onSaved={onSaved} />
          <AmenitySection camp={camp} onSaved={onSaved} />
          <PhotoSection camp={camp} onSaved={onSaved} />
          <LocationSection camp={camp} onSaved={onSaved} />
          <CalendarSection camp={camp} />
        </div>
      </div>
    </div>
  );
}

function SectionBox({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 font-display text-base text-primary"><Icon className="size-4 text-ember" /> {title}</h3>
      {children}
    </section>
  );
}

function SaveRow({ busy, msg, onSave }: { busy: boolean; msg: string | null; onSave: () => void }) {
  return (
    <div className="mt-3 flex items-center gap-3">
      <Button variant="ember" size="sm" onClick={onSave} disabled={busy}>{busy ? "กำลังบันทึก…" : "บันทึก"}</Button>
      {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
    </div>
  );
}

// ---- ข้อมูล + ราคา + ติดต่อ (single PATCH) ----
function BasicSection({ camp, onSaved }: { camp: any; onSaved: () => void }) {
  const [f, setF] = useState({
    name: camp.name ?? "", description: camp.description ?? "",
    priceMin: camp.priceMin ?? "", priceMax: camp.priceMax ?? "",
    phone: camp.phone ?? "", lineId: camp.lineId ?? "", facebookUrl: camp.facebookUrl ?? "", websiteUrl: camp.websiteUrl ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function save() {
    setBusy(true); setMsg(null);
    try {
      await api(`/api/owner/campsites/${camp.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: f.name, description: f.description,
          priceMin: f.priceMin === "" ? undefined : Number(f.priceMin),
          priceMax: f.priceMax === "" ? undefined : Number(f.priceMax),
          phone: f.phone, lineId: f.lineId, facebookUrl: f.facebookUrl, websiteUrl: f.websiteUrl,
        }),
      });
      setMsg("บันทึกแล้ว"); onSaved();
    } catch (e: any) { setMsg(e.message ?? "ผิดพลาด"); }
    finally { setBusy(false); }
  }

  return (
    <SectionBox icon={Settings2} title="ข้อมูล · ราคา · ติดต่อ">
      <div className="space-y-2.5">
        <label className="block space-y-1"><span className={lbl}>ชื่อลาน</span><input className={inputCls} value={f.name} onChange={set("name")} /></label>
        <label className="block space-y-1"><span className={lbl}>เกี่ยวกับลานนี้</span><textarea rows={3} className={inputCls} value={f.description} onChange={set("description")} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block space-y-1"><span className={lbl}>ราคาต่ำสุด</span><input type="number" className={inputCls} value={f.priceMin} onChange={set("priceMin")} /></label>
          <label className="block space-y-1"><span className={lbl}>ราคาสูงสุด</span><input type="number" className={inputCls} value={f.priceMax} onChange={set("priceMax")} /></label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block space-y-1"><span className={lbl}>เบอร์โทร</span><input className={inputCls} value={f.phone} onChange={set("phone")} /></label>
          <label className="block space-y-1"><span className={lbl}>LINE ID</span><input className={inputCls} value={f.lineId} onChange={set("lineId")} /></label>
          <label className="block space-y-1"><span className={lbl}>Facebook</span><input className={inputCls} value={f.facebookUrl} onChange={set("facebookUrl")} /></label>
          <label className="block space-y-1"><span className={lbl}>เว็บไซต์</span><input className={inputCls} value={f.websiteUrl} onChange={set("websiteUrl")} /></label>
        </div>
      </div>
      <SaveRow busy={busy} msg={msg} onSave={save} />
    </SectionBox>
  );
}

// ---- สิ่งอำนวยความสะดวก ----
function AmenitySection({ camp, onSaved }: { camp: any; onSaved: () => void }) {
  const [all, setAll] = useState<any[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set((camp.amenities ?? []).map((a: any) => a.amenity.key)));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { api<any[]>("/api/amenities").then(setAll).catch(() => setAll([])); }, []);
  const toggle = (key: string) => setSel((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });

  async function save() {
    setBusy(true); setMsg(null);
    try {
      await api(`/api/owner/campsites/${camp.id}/amenities`, { method: "PATCH", body: JSON.stringify({ keys: [...sel] }) });
      setMsg("บันทึกแล้ว"); onSaved();
    } catch (e: any) { setMsg(e.message ?? "ผิดพลาด"); }
    finally { setBusy(false); }
  }

  return (
    <SectionBox icon={Tags} title="สิ่งอำนวยความสะดวก">
      <div className="flex flex-wrap gap-1.5">
        {all.map((a) => (
          <button
            key={a.key}
            onClick={() => toggle(a.key)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${sel.has(a.key) ? "border-ember bg-ember/10 text-ember" : "bg-card text-foreground/70 hover:border-ember/40"}`}
          >
            {a.name}
          </button>
        ))}
      </div>
      <SaveRow busy={busy} msg={msg} onSave={save} />
    </SectionBox>
  );
}

// ---- รูปภาพ ----
function PhotoSection({ camp, onSaved }: { camp: any; onSaved: () => void }) {
  const [photos, setPhotos] = useState<any[]>(camp.photos ?? []);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!url.trim()) return;
    setBusy(true);
    try {
      const p = await api<any>(`/api/owner/campsites/${camp.id}/photos`, { method: "POST", body: JSON.stringify({ imageUrl: url }) });
      setPhotos((ps) => [...ps, p]); setUrl(""); onSaved();
    } finally { setBusy(false); }
  }
  async function remove(id: string) {
    await api(`/api/owner/photos/${id}`, { method: "DELETE" }).catch(() => {});
    setPhotos((ps) => ps.filter((p) => p.id !== id)); onSaved();
  }

  return (
    <SectionBox icon={ImagePlus} title="รูปภาพ">
      <div className="mb-3 grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-secondary">
            <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
            <button onClick={() => remove(p.id)} className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"><Trash2 className="size-3.5" /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className={inputCls} placeholder="วาง URL รูปภาพ" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button variant="outline" size="sm" onClick={add} disabled={busy || !url.trim()}>เพิ่ม</Button>
      </div>
    </SectionBox>
  );
}

// ---- พิกัด ----
function LocationSection({ camp, onSaved }: { camp: any; onSaved: () => void }) {
  const [lat, setLat] = useState(camp.latitude ?? "");
  const [lng, setLng] = useState(camp.longitude ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setBusy(true); setMsg(null);
    try {
      await api(`/api/owner/campsites/${camp.id}/location`, { method: "PATCH", body: JSON.stringify({ latitude: Number(lat), longitude: Number(lng) }) });
      setMsg("บันทึกแล้ว"); onSaved();
    } catch (e: any) { setMsg(e.message ?? "ผิดพลาด"); }
    finally { setBusy(false); }
  }

  return (
    <SectionBox icon={MapPin} title="ตำแหน่งบนแผนที่">
      <p className="mb-2 text-xs text-muted-foreground">วางพิกัดจาก Google Maps (lat, lng)</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1"><span className={lbl}>Latitude</span><input className={inputCls} value={lat} onChange={(e) => setLat(e.target.value)} /></label>
        <label className="block space-y-1"><span className={lbl}>Longitude</span><input className={inputCls} value={lng} onChange={(e) => setLng(e.target.value)} /></label>
      </div>
      <SaveRow busy={busy} msg={msg} onSave={save} />
    </SectionBox>
  );
}

// ---- ปฏิทิน / ป้ายสถานะ ----
function CalendarSection({ camp }: { camp: any }) {
  const [events, setEvents] = useState<any[] | null>(null);
  const [form, setForm] = useState({ eventType: "open", startDate: "", endDate: "", note: "" });
  const [busy, setBusy] = useState(false);

  function load() { api<any[]>(`/api/campsites/${camp.id}/calendar`).then(setEvents).catch(() => setEvents([])); }
  useEffect(load, [camp.id]);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      await api(`/api/owner/campsites/${camp.id}/calendar-events`, { method: "POST", body: JSON.stringify(form) });
      setForm({ eventType: "open", startDate: "", endDate: "", note: "" }); load();
    } finally { setBusy(false); }
  }
  async function remove(id: string) { await api(`/api/owner/calendar-events/${id}`, { method: "DELETE" }).catch(() => {}); load(); }

  return (
    <SectionBox icon={CalendarDays} title="ปฏิทิน / ป้ายสถานะ">
      <form onSubmit={add} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <select className={inputCls} value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
            {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input className={inputCls} placeholder="หมายเหตุ" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <input type="date" className={inputCls} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          <input type="date" className={inputCls} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
        </div>
        <Button variant="outline" size="sm" type="submit" disabled={busy}>{busy ? "กำลังเพิ่ม…" : "เพิ่มป้ายสถานะ"}</Button>
      </form>
      <div className="mt-3 space-y-1.5">
        {events === null ? <Loader2 className="size-4 animate-spin" /> : events.length === 0 ? (
          <p className="text-xs text-muted-foreground">ยังไม่มีป้ายสถานะ</p>
        ) : events.map((ev) => (
          <div key={ev.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs">
            <span className="font-medium text-primary">{EVENT_TYPES.find((t) => t.value === ev.eventType)?.label ?? ev.eventType}</span>
            <span className="text-muted-foreground">{ev.startDate.slice(0, 10)} – {ev.endDate.slice(0, 10)}</span>
            <button onClick={() => remove(ev.id)} className="ml-auto text-destructive"><Trash2 className="size-3.5" /></button>
          </div>
        ))}
      </div>
    </SectionBox>
  );
}
