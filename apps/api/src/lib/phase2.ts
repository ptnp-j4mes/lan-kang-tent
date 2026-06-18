// Phase 2 pure logic — no DB, no deps. The parts that break at 3am live here.
// Run self-check: `bun run apps/api/src/lib/phase2.ts`

// ---------- dates (UTC, string-keyed to dodge TZ) ----------

type DateInput = Date | string;
const toUTC = (d: DateInput): Date => {
  if (d instanceof Date) return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
};
const key = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

// inclusive day list, capped so a bad range can't spin forever
function dayList(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  for (let d = start; d <= end && out.length < 400; d = addDays(d, 1)) out.push(d);
  return out;
}

const WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// ---------- calendar connection ----------

export type CalEvent = {
  eventType: string;
  startDate: DateInput;
  endDate: DateInput;
  note?: string | null;
  recurrenceRule?: string | null; // "weekly:MON" (lite)
};

const BLOCKING = new Set(["closed", "fully_booked"]);
const WARNING = new Set(["maintenance"]);
const SEVERITY: Record<string, number> = { closed: 3, fully_booked: 3, maintenance: 2 };

function eventHitsRange(ev: CalEvent, days: Date[]): boolean {
  const s = toUTC(ev.startDate);
  const e = toUTC(ev.endDate);
  if (ev.recurrenceRule?.startsWith("weekly:")) {
    const dow = WD.indexOf(ev.recurrenceRule.slice(7).toUpperCase());
    if (dow < 0) return false;
    return days.some((d) => d.getUTCDay() === dow && d >= s && d <= e);
  }
  // plain overlap
  return days.some((d) => d >= s && d <= e);
}

// Check a user's intended [start,end] against a camp's events.
// Returns blocking flag + the messages to show. Hidden/private filtering is the caller's job.
export function checkCalendar(events: CalEvent[], start: DateInput, end: DateInput) {
  const days = dayList(toUTC(start), toUTC(end));
  const hits = events.filter((ev) => eventHitsRange(ev, days));

  let blocking = false;
  let worst = 0;
  let status = "no_announcement";
  const messages: { type: string; note: string }[] = [];

  for (const ev of hits) {
    if (BLOCKING.has(ev.eventType)) blocking = true;
    const sev = SEVERITY[ev.eventType] ?? 1;
    if (sev > worst) {
      worst = sev;
      status = ev.eventType;
    }
    messages.push({ type: ev.eventType, note: ev.note ?? defaultMsg(ev.eventType) });
  }

  if (hits.length === 0) messages.push({ type: "none", note: "ไม่มีประกาศจากแคมป์ในช่วงวันที่เลือก" });
  return { blocking, status, messages };
}

function defaultMsg(type: string): string {
  return (
    {
      closed: "แคมป์ปิดในวันที่เลือก",
      fully_booked: "เต็มแล้วในวันที่เลือก",
      maintenance: "ปิดปรับปรุงบางส่วน",
      special_event: "มีงานพิเศษในช่วงนี้",
      private_event: "มีงานส่วนตัว",
      holiday_notice: "ประกาศวันหยุด",
      weather_notice: "ประกาศสภาพอากาศ",
      open: "เปิดปกติ",
    }[type] ?? "มีประกาศจากแคมป์"
  );
}

// ---------- calendar export ----------

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, "\\$&").replace(/\n/g, "\\n");
const ymd = (d: DateInput) => key(toUTC(d)).replace(/-/g, "");

export type PlanExport = {
  id: string;
  campName: string;
  startDate: DateInput;
  endDate: DateInput; // inclusive last night
  latitude?: number | null;
  longitude?: number | null;
  campPhone?: string | null;
  note?: string | null;
  detailUrl: string;
  reminders?: number[]; // days before, e.g. [7,1]
};

function description(p: PlanExport): string {
  const lines = [p.note ?? "", `รายละเอียดแคมป์: ${p.detailUrl}`];
  if (p.campPhone) lines.push(`โทร: ${p.campPhone}`);
  if (p.latitude != null && p.longitude != null)
    lines.push(`แผนที่: https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`);
  return lines.filter(Boolean).join("\n");
}

// All-day VEVENT. DTEND is exclusive per RFC 5545, so +1 day on the last night.
export function buildIcs(p: PlanExport): string {
  const dtEnd = ymd(addDays(toUTC(p.endDate), 1));
  const alarms = (p.reminders ?? [7, 1]).map(
    (d) => `BEGIN:VALARM\nTRIGGER:-P${d}D\nACTION:DISPLAY\nDESCRIPTION:${esc(`เตรียมตัวไปแคมป์ ${p.campName}`)}\nEND:VALARM`,
  );
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CampThai//Camping Plan//TH",
    "BEGIN:VEVENT",
    `UID:plan-${p.id}@campthai.app`,
    `DTSTAMP:${ymd(new Date())}T000000Z`,
    `DTSTART;VALUE=DATE:${ymd(p.startDate)}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${esc(`Camping at ${p.campName}`)}`,
    p.latitude != null && p.longitude != null ? `GEO:${p.latitude};${p.longitude}` : "",
    `LOCATION:${esc(p.campName)}`,
    `DESCRIPTION:${esc(description(p))}`,
    `URL:${p.detailUrl}`,
    ...alarms,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

// "Add to Google Calendar" link — native URL, no OAuth. ponytail: covers 1-way add.
export function googleCalUrl(p: PlanExport): string {
  const dates = `${ymd(p.startDate)}/${ymd(addDays(toUTC(p.endDate), 1))}`;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `Camping at ${p.campName}`,
    dates,
    details: description(p),
    location: p.campName,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

// ---------- profile completeness ----------

export type CompletenessInput = {
  coverImage?: boolean;
  galleryCount?: number;
  hasCoords?: boolean;
  hasPrice?: boolean;
  hasPhone?: boolean;
  amenityCount?: number;
  hasDescription?: boolean;
  hasRules?: boolean;
  hasGooglePlaceId?: boolean;
  hasCalendarStatus?: boolean;
};

const CHECKS: { key: keyof CompletenessInput; label: string; ok: (i: CompletenessInput) => boolean }[] = [
  { key: "coverImage", label: "เพิ่มรูปปก", ok: (i) => !!i.coverImage },
  { key: "galleryCount", label: "เพิ่มรูปแกลเลอรีอย่างน้อย 5 รูป", ok: (i) => (i.galleryCount ?? 0) >= 5 },
  { key: "hasCoords", label: "ปักหมุดพิกัด", ok: (i) => !!i.hasCoords },
  { key: "hasPrice", label: "ใส่ราคา", ok: (i) => !!i.hasPrice },
  { key: "hasPhone", label: "ใส่เบอร์โทร", ok: (i) => !!i.hasPhone },
  { key: "amenityCount", label: "เลือกสิ่งอำนวยความสะดวก", ok: (i) => (i.amenityCount ?? 0) > 0 },
  { key: "hasDescription", label: "เขียนคำอธิบาย", ok: (i) => !!i.hasDescription },
  { key: "hasRules", label: "ใส่กฎของแคมป์", ok: (i) => !!i.hasRules },
  { key: "hasGooglePlaceId", label: "ผูก Google Place ID", ok: (i) => !!i.hasGooglePlaceId },
  { key: "hasCalendarStatus", label: "ตั้งสถานะปฏิทินอย่างน้อย 1 วัน", ok: (i) => !!i.hasCalendarStatus },
];

export function completenessScore(input: CompletenessInput) {
  const passed = CHECKS.filter((c) => c.ok(input));
  const score = Math.round((passed.length / CHECKS.length) * 100);
  const missing = CHECKS.filter((c) => !c.ok(input)).map((c) => c.label);
  return { score, missing };
}

// ---------- guest favorite merge ----------

export function mergeFavorites(existing: string[], guest: string[]) {
  const have = new Set(existing);
  const seen = new Set<string>();
  const toAdd: string[] = [];
  let duplicateCount = 0;
  for (const id of guest) {
    if (have.has(id) || seen.has(id)) duplicateCount++;
    else {
      toAdd.push(id);
      seen.add(id);
    }
  }
  return { toAdd, mergedCount: toAdd.length, duplicateCount };
}

// ---------- self-check ----------

if (import.meta.main) {
  const assert = (c: boolean, m: string) => {
    if (!c) throw new Error("FAIL: " + m);
  };

  // calendar: blocking on closed within range
  let r = checkCalendar([{ eventType: "closed", startDate: "2026-07-10", endDate: "2026-07-12" }], "2026-07-11", "2026-07-13");
  assert(r.blocking && r.status === "closed", "closed should block");

  // no overlap → no announcement
  r = checkCalendar([{ eventType: "closed", startDate: "2026-07-01", endDate: "2026-07-02" }], "2026-07-10", "2026-07-11");
  assert(!r.blocking && r.status === "no_announcement", "non-overlap = clear");

  // maintenance warns but not blocks; severity picks worst
  r = checkCalendar(
    [
      { eventType: "maintenance", startDate: "2026-07-11", endDate: "2026-07-11" },
      { eventType: "special_event", startDate: "2026-07-11", endDate: "2026-07-11" },
    ],
    "2026-07-11",
    "2026-07-11",
  );
  assert(!r.blocking && r.status === "maintenance", "maintenance outranks special_event, no block");

  // weekly recurrence: Mondays closed. 2026-07-13 is a Monday.
  r = checkCalendar(
    [{ eventType: "closed", startDate: "2026-01-01", endDate: "2026-12-31", recurrenceRule: "weekly:MON" }],
    "2026-07-13",
    "2026-07-13",
  );
  assert(r.blocking, "weekly:MON should hit a Monday");
  r = checkCalendar(
    [{ eventType: "closed", startDate: "2026-01-01", endDate: "2026-12-31", recurrenceRule: "weekly:MON" }],
    "2026-07-14",
    "2026-07-14",
  );
  assert(!r.blocking, "weekly:MON should miss a Tuesday");

  // ics: all-day end is exclusive (+1)
  const ics = buildIcs({ id: "x", campName: "ดอยเสมอดาว", startDate: "2026-07-11", endDate: "2026-07-12", detailUrl: "https://campthai.app/c/x", latitude: 18.3, longitude: 100.7 });
  assert(ics.includes("DTSTART;VALUE=DATE:20260711"), "dtstart");
  assert(ics.includes("DTEND;VALUE=DATE:20260713"), "dtend exclusive +1");
  assert(ics.includes("BEGIN:VALARM"), "has alarm");

  // google url: end exclusive, encoded
  const gurl = googleCalUrl({ id: "x", campName: "Khao Kho", startDate: "2026-07-11", endDate: "2026-07-12", detailUrl: "https://x" });
  assert(gurl.includes("dates=20260711%2F20260713"), "gcal dates");

  // completeness
  const c = completenessScore({ coverImage: true, galleryCount: 5, hasCoords: true, hasPrice: true, hasPhone: true });
  assert(c.score === 50 && c.missing.length === 5, "5/10 = 50%");

  // merge dedupe
  const m = mergeFavorites(["a", "b"], ["b", "c", "c", "d"]);
  assert(m.mergedCount === 2 && m.duplicateCount === 2, "merge: add c,d; dup b,c");

  console.log("✅ phase2 self-check passed");
}
