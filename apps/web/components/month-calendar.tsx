"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalEvent = {
  id?: string;
  eventType: string;
  startDate: string;
  endDate: string;
  recurrenceRule?: string | null;
  note?: string | null;
};

const TYPE_STYLE: Record<string, string> = {
  open: "bg-[hsl(142_55%_42%/0.18)] text-[hsl(142_45%_30%)]",
  closed: "bg-destructive/15 text-destructive",
  fully_booked: "bg-destructive/15 text-destructive",
  maintenance: "bg-[hsl(28_80%_52%/0.18)] text-[hsl(28_70%_40%)]",
  special_event: "bg-[hsl(270_50%_55%/0.18)] text-[hsl(270_45%_45%)]",
  private_event: "bg-muted text-muted-foreground",
  holiday_notice: "bg-[hsl(270_50%_55%/0.14)] text-[hsl(270_45%_45%)]",
  weather_notice: "bg-[hsl(28_80%_52%/0.14)] text-[hsl(28_70%_40%)]",
};
const SEV: Record<string, number> = { closed: 5, fully_booked: 5, maintenance: 4, special_event: 3, private_event: 2, holiday_notice: 2, weather_notice: 2, open: 1 };
const WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const ymd = (d: Date) => d.toISOString().slice(0, 10);

function dayType(events: CalEvent[], day: Date): { type: string; note?: string | null } | null {
  let best: { type: string; note?: string | null } | null = null;
  let worst = 0;
  const k = ymd(day);
  for (const e of events) {
    let hit = false;
    if (e.recurrenceRule?.startsWith("weekly:")) {
      const dow = WD.indexOf(e.recurrenceRule.slice(7).toUpperCase());
      hit = day.getUTCDay() === dow && k >= e.startDate.slice(0, 10) && k <= e.endDate.slice(0, 10);
    } else {
      hit = k >= e.startDate.slice(0, 10) && k <= e.endDate.slice(0, 10);
    }
    if (hit && (SEV[e.eventType] ?? 0) > worst) {
      worst = SEV[e.eventType] ?? 0;
      best = { type: e.eventType, note: e.note };
    }
  }
  return best;
}

export function MonthCalendar({
  events,
  selected = [],
  onPickDay,
  initialMonth,
}: {
  events: CalEvent[];
  selected?: string[]; // ymd strings to highlight (e.g. user's chosen range)
  onPickDay?: (ymd: string) => void;
  initialMonth?: Date;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = initialMonth ?? new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  });

  const year = cursor.getUTCFullYear();
  const month = cursor.getUTCMonth();
  const first = new Date(Date.UTC(year, month, 1));
  const startPad = first.getUTCDay(); // 0=Sun
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(Date.UTC(year, month, i + 1))),
  ];

  const monthLabel = first.toLocaleDateString("th-TH", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div className="rounded-2xl border bg-card p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <button onClick={() => setCursor(new Date(Date.UTC(year, month - 1, 1)))} className="grid size-7 place-items-center rounded-full hover:bg-accent/60" aria-label="เดือนก่อน">
          <ChevronLeft className="size-4" />
        </button>
        <span className="font-display text-base text-primary">{monthLabel}</span>
        <button onClick={() => setCursor(new Date(Date.UTC(year, month + 1, 1)))} className="grid size-7 place-items-center rounded-full hover:bg-accent/60" aria-label="เดือนถัดไป">
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
        {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const k = ymd(day);
          const dt = dayType(events, day);
          const isSel = selected.includes(k);
          return (
            <button
              key={i}
              onClick={() => onPickDay?.(k)}
              title={dt?.note ?? dt?.type ?? ""}
              className={cn(
                "aspect-square rounded-lg text-sm transition",
                dt ? TYPE_STYLE[dt.type] ?? "bg-muted" : "hover:bg-accent/60",
                isSel && "ring-2 ring-ember",
              )}
            >
              {day.getUTCDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 px-1 text-[10px] text-muted-foreground">
        <Legend cls="bg-[hsl(142_55%_42%/0.18)]" label="เปิด" />
        <Legend cls="bg-destructive/15" label="ปิด/เต็ม" />
        <Legend cls="bg-[hsl(28_80%_52%/0.18)]" label="ปรับปรุง" />
        <Legend cls="bg-[hsl(270_50%_55%/0.18)]" label="อีเวนต์" />
      </div>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("size-2.5 rounded-sm", cls)} /> {label}
    </span>
  );
}
