"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Circle,
  MapPin, Plus, Trash2, Users, X,
} from "lucide-react";
import { api } from "@/lib/client";
import { getAllCampsites } from "@/lib/api";
import type { CampsiteLight } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Spin, inputCls, useTab } from "../_shared";

const STATUS: Record<string, { label: string; dot: string; chip: string }> = {
  interested: { label: "สนใจ", dot: "bg-muted-foreground", chip: "bg-muted text-muted-foreground" },
  planning: { label: "กำลังวางแผน", dot: "bg-[hsl(28_80%_52%)]", chip: "bg-[hsl(28_80%_52%/0.16)] text-[hsl(28_70%_38%)]" },
  contacted: { label: "ติดต่อแล้ว", dot: "bg-[hsl(210_70%_52%)]", chip: "bg-[hsl(210_70%_52%/0.16)] text-[hsl(210_60%_42%)]" },
  owner_replied: { label: "เจ้าของตอบแล้ว", dot: "bg-[hsl(210_70%_52%)]", chip: "bg-[hsl(210_70%_52%/0.16)] text-[hsl(210_60%_42%)]" },
  confirmed_by_user: { label: "ยืนยันแล้ว", dot: "bg-[hsl(142_55%_42%)]", chip: "bg-[hsl(142_55%_42%/0.16)] text-[hsl(142_45%_30%)]" },
  visited: { label: "ไปมาแล้ว", dot: "bg-[hsl(142_55%_42%)]", chip: "bg-[hsl(142_55%_42%/0.16)] text-[hsl(142_45%_30%)]" },
  cancelled: { label: "ยกเลิก", dot: "bg-destructive", chip: "bg-destructive/12 text-destructive line-through" },
};
const meta = (s: string) => STATUS[s] ?? STATUS.interested;
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const dkey = (s: string) => s.slice(0, 10);
const WD = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export default function CalendarPlanPage() {
  const { data, loading, setData } = useTab<any[]>("/api/me/camping-plans");
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); });
  const [selId, setSelId] = useState<string | null>(null);

  const plans = data ?? [];
  const [camps, setCamps] = useState<CampsiteLight[]>([]);
  const [draft, setDraft] = useState<{ start: string; end: string } | null>(null);
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const [drag, setDrag] = useState<{ a: string; b: string } | null>(null);
  useEffect(() => { getAllCampsites().then(setCamps).catch(() => setCamps([])); }, []);

  // drag-select a date range across cells → just selects it (highlight + detail). pointer events: mouse + touch.
  const sorted = (a: string, b: string) => (a < b ? [a, b] : [b, a]) as [string, string];
  const between = (k: string, a: string, b: string) => { const [lo, hi] = sorted(a, b); return k >= lo && k <= hi; };
  const inDrag = (k: string) => drag && between(k, drag.a, drag.b);
  const inRange = (k: string) => range && between(k, range.start, range.end);
  const dayAt = (x: number, y: number) => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>("[data-k]")?.dataset.k;
  function endDrag() {
    if (!drag) return;
    const [start, end] = sorted(drag.a, drag.b);
    setDrag(null);
    setSelId(null);
    setRange({ start, end });
  }
  // commit on pointer-up anywhere (handles release outside the grid)
  useEffect(() => {
    if (!drag) return;
    const up = () => endDrag();
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = plans.find((p) => p.id === selId)
    ?? plans.find((p) => dkey(p.endDate) >= ymd(new Date()) && p.status !== "cancelled")
    ?? plans[0];

  const year = cursor.getUTCFullYear();
  const month = cursor.getUTCMonth();
  const cells = useMemo(() => {
    const first = new Date(Date.UTC(year, month, 1));
    const pad = first.getUTCDay();
    const n = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return [...Array(pad).fill(null), ...Array.from({ length: n }, (_, i) => new Date(Date.UTC(year, month, i + 1)))];
  }, [year, month]);
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString("th-TH", { month: "long", year: "numeric", timeZone: "UTC" });
  const today = ymd(new Date());

  if (loading) return <Spin />;

  const plansOn = (k: string) => plans.filter((p) => dkey(p.startDate) <= k && k <= dkey(p.endDate));

  async function createPlan(form: { campsiteId: string; startDate: string; endDate: string; partySize?: number; note?: string }) {
    const created = await api<any>("/api/me/camping-plans", { method: "POST", body: JSON.stringify(form) });
    const c = camps.find((x) => x.id === form.campsiteId);
    const withCamp = {
      ...created,
      campsite: { name: c?.name ?? "ลานกางเต็นท์", slug: c?.slug ?? "", province: c?.province ?? "", district: c?.district ?? null, photos: c?.coverImageUrl ? [{ imageUrl: c.coverImageUrl }] : [] },
    };
    setData((d: any) => [...(d ?? []), withCamp]);
    setSelId(created.id);
    setDraft(null);
  }

  async function exportPlan(id: string) {
    const r = await api<{ ics: string; filename: string; googleCalendarUrl: string }>(`/api/me/camping-plans/${id}/calendar-export`);
    const url = URL.createObjectURL(new Blob([r.ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url; a.download = r.filename; a.click();
    URL.revokeObjectURL(url);
    window.open(r.googleCalendarUrl, "_blank");
  }
  async function removePlan(id: string) {
    setData((d: any) => d.filter((x: any) => x.id !== id));
    setSelId(null);
    await api(`/api/me/camping-plans/${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      {/* calendar */}
      <div className="rounded-2xl border bg-card p-4 shadow-field">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button onClick={() => setCursor(new Date(Date.UTC(year, month - 1, 1)))} className="grid size-8 place-items-center rounded-full hover:bg-accent/60"><ChevronLeft className="size-4" /></button>
            <h2 className="min-w-[8rem] text-center font-display text-lg text-primary">{monthLabel}</h2>
            <button onClick={() => setCursor(new Date(Date.UTC(year, month + 1, 1)))} className="grid size-8 place-items-center rounded-full hover:bg-accent/60"><ChevronRight className="size-4" /></button>
          </div>
          <Button size="sm" variant="ember" onClick={() => setDraft(range ?? { start: today, end: today })}>
            <Plus className="size-4" /> เพิ่มแผน{range && range.start !== range.end ? ` (${range.start.slice(8)}–${range.end.slice(8)})` : range ? ` (${range.start.slice(8)})` : ""}
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
          {WD.map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div
          className="grid touch-none select-none grid-cols-7 gap-1"
          onPointerMove={(e) => { if (drag) { const k = dayAt(e.clientX, e.clientY); if (k && k !== drag.b) setDrag({ ...drag, b: k }); } }}
        >
          {cells.map((day: Date | null, i) => {
            if (!day) return <div key={i} />;
            const k = ymd(day);
            const dayPlans = plansOn(k);
            return (
              <div
                key={i}
                data-k={k}
                role="button"
                tabIndex={0}
                onPointerDown={(e) => { e.preventDefault(); setDrag({ a: k, b: k }); }}
                title="คลิกหรือลากเพื่อเลือกช่วงวันแล้ววางแผน"
                className={cn(
                  "group min-h-[64px] cursor-pointer rounded-lg border border-transparent p-1 text-left align-top transition hover:border-ember/40 hover:bg-accent/40",
                  k === today && "border-ember/40 bg-ember/5",
                  (inDrag(k) || inRange(k)) && "border-ember bg-ember/15",
                )}
              >
                <span className={cn("ml-0.5 flex items-center justify-between text-xs", k === today ? "font-bold text-ember" : "text-muted-foreground")}>
                  {day.getUTCDate()}
                  <Plus className="size-3 opacity-0 transition group-hover:opacity-60" />
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayPlans.slice(0, 2).map((p) => {
                    const isStart = dkey(p.startDate) === k;
                    return (
                      <span
                        key={p.id}
                        role="button"
                        tabIndex={0}
                        onPointerDown={(e) => { e.stopPropagation(); }}
                        onClick={(e) => { e.stopPropagation(); setSelId(p.id); setRange(null); }}
                        title={p.campsite.name}
                        className={cn("block w-full cursor-pointer truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight transition", meta(p.status).chip, selId === p.id && "ring-1 ring-ember")}
                      >
                        {isStart ? p.campsite.name : "›"}
                      </span>
                    );
                  })}
                  {dayPlans.length > 2 && <span className="block px-1 text-[9px] text-muted-foreground">+{dayPlans.length - 2}</span>}
                </div>
              </div>
            );
          })}
        </div>
        {/* legend */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t pt-3 text-[10px] text-muted-foreground">
          {["planning", "contacted", "confirmed_by_user", "visited", "cancelled"].map((s) => (
            <span key={s} className="inline-flex items-center gap-1"><span className={cn("size-2 rounded-full", meta(s).dot)} /> {meta(s).label}</span>
          ))}
        </div>
      </div>

      {/* detail panel */}
      {range ? (
        <RangeDetail
          range={range}
          plans={plans.filter((p) => dkey(p.startDate) <= range.end && dkey(p.endDate) >= range.start)}
          onAdd={() => setDraft(range)}
          onPick={(id) => { setSelId(id); setRange(null); }}
          onClear={() => setRange(null)}
        />
      ) : selected ? (
        <PlanDetail p={selected} onExport={exportPlan} onRemove={removePlan} />
      ) : (
        <div className="grid place-items-center rounded-2xl border border-dashed p-8 text-center lg:sticky lg:top-4 lg:self-start">
          <CalendarDays className="size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">เลือกวันบนปฏิทิน (คลิกหรือลาก) เพื่อดูรายละเอียด<br />แล้วกด “เพิ่มแผน” เพื่อวางแผนทริป</p>
        </div>
      )}

      {draft && (
        <NewPlanModal
          camps={camps}
          start={draft.start}
          end={draft.end}
          onClose={() => setDraft(null)}
          onSubmit={createPlan}
        />
      )}
    </div>
  );
}

function RangeDetail({
  range, plans, onAdd, onPick, onClear,
}: {
  range: { start: string; end: string };
  plans: any[];
  onAdd: () => void;
  onPick: (id: string) => void;
  onClear: () => void;
}) {
  const fmt = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const nights = Math.max(0, Math.round((+new Date(range.end) - +new Date(range.start)) / 864e5));
  const single = range.start === range.end;

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-field lg:sticky lg:top-4 lg:self-start">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ember">วันที่เลือก</p>
          <p className="font-display text-lg text-primary">{fmt(range.start)}{!single && ` – ${fmt(range.end)}`}</p>
          {!single && <p className="text-xs text-muted-foreground">{nights} คืน</p>}
        </div>
        <button onClick={onClear} className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-accent/60"><X className="size-4" /></button>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted-foreground">แผนในช่วงนี้ ({plans.length})</p>
        {plans.length ? (
          <ul className="space-y-1.5">
            {plans.map((p) => (
              <li key={p.id}>
                <button onClick={() => onPick(p.id)} className="flex w-full items-center gap-2 rounded-xl border bg-background/40 p-2 text-left transition hover:border-ember/40">
                  <span className={cn("size-2 shrink-0 rounded-full", meta(p.status).dot)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-primary">{p.campsite.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{meta(p.status).label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed py-6 text-center text-xs text-muted-foreground">ยังไม่มีแผนในช่วงวันนี้</p>
        )}
      </div>

      <Button variant="ember" className="w-full" onClick={onAdd}>
        <Plus className="size-4" /> เพิ่มแผนช่วงวันนี้
      </Button>
    </div>
  );
}

function NewPlanModal({
  camps, start, end, onClose, onSubmit,
}: {
  camps: CampsiteLight[];
  start: string;
  end: string;
  onClose: () => void;
  onSubmit: (f: { campsiteId: string; startDate: string; endDate: string; partySize?: number; note?: string }) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const campsiteId = String(f.get("campsiteId") || "");
    if (!campsiteId) return;
    setBusy(true);
    try {
      await onSubmit({
        campsiteId,
        startDate: String(f.get("startDate")),
        endDate: String(f.get("endDate") || f.get("startDate")),
        partySize: f.get("partySize") ? Number(f.get("partySize")) : undefined,
        note: String(f.get("note") || "") || undefined,
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-5 shadow-lift">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-primary">วางแผนไปแคมป์</h3>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-accent/60"><X className="size-4" /></button>
        </div>
        <Field label="ลานกางเต็นท์">
          <select name="campsiteId" required defaultValue="" className={inputCls}>
            <option value="" disabled>เลือกลาน…</option>
            {camps.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.province}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="วันเริ่ม"><input type="date" name="startDate" required defaultValue={start} className={inputCls} /></Field>
          <Field label="วันสิ้นสุด"><input type="date" name="endDate" defaultValue={end} className={inputCls} /></Field>
        </div>
        <Field label="จำนวนคน"><input type="number" name="partySize" min={1} placeholder="เช่น 4" className={inputCls} /></Field>
        <Field label="โน้ต"><textarea name="note" rows={2} placeholder="เตรียมอะไร / ไปกับใคร" className={inputCls} /></Field>
        <Button type="submit" variant="ember" className="w-full" disabled={busy}>{busy ? "กำลังบันทึก…" : "บันทึกแผน"}</Button>
      </form>
    </div>
  );
}

function PlanDetail({ p, onExport, onRemove }: { p: any; onExport: (id: string) => void; onRemove: (id: string) => void }) {
  const m = meta(p.status);
  const checklist: { t: string; done: boolean }[] = Array.isArray(p.checklistJson) ? p.checklistJson : [];
  const nights = Math.max(1, Math.round((+new Date(p.endDate) - +new Date(p.startDate)) / 864e5));
  const fmt = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-field lg:sticky lg:top-4 lg:self-start">
      {p.campsite.photos?.[0]?.imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
          <Image src={p.campsite.photos[0].imageUrl} alt={p.campsite.name} fill sizes="340px" className="object-cover" />
          <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-medium", m.chip)}>{m.label}</span>
        </div>
      )}
      <div>
        <Link href={`/campsites/${p.campsite.slug}`} className="font-display text-lg text-primary hover:text-ember">{p.campsite.name}</Link>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" /> {p.campsite.district ? `${p.campsite.district}, ` : ""}{p.campsite.province}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <Info icon={CalendarDays} label="วันที่">{fmt(p.startDate)} – {fmt(p.endDate)} · {nights} คืน</Info>
        <Info icon={Users} label="จำนวนคน">{p.partySize ?? "-"} คน</Info>
      </div>

      {p.note && <p className="rounded-xl bg-accent/40 p-3 text-sm">{p.note}</p>}

      {checklist.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">เช็กลิสต์ ({checklist.filter((c) => c.done).length}/{checklist.length})</p>
          <ul className="space-y-1">
            {checklist.map((c, i) => (
              <li key={i} className={cn("flex items-center gap-2 text-sm", c.done && "text-muted-foreground line-through")}>
                {c.done ? <CheckCircle2 className="size-4 text-[hsl(142_55%_42%)]" /> : <Circle className="size-4 text-muted-foreground" />}
                {c.t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t pt-3">
        <Button size="sm" variant="ember" onClick={() => onExport(p.id)}><CalendarDays className="size-4" /> เพิ่มลงปฏิทิน (.ics / Google)</Button>
        <button onClick={() => onRemove(p.id)} className="inline-flex items-center justify-center gap-1 text-xs text-destructive hover:underline"><Trash2 className="size-3.5" /> ลบแผนนี้</button>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background/40 p-2.5">
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><Icon className="size-3.5" /> {label}</p>
      <p className="mt-0.5 font-medium text-primary">{children}</p>
    </div>
  );
}
