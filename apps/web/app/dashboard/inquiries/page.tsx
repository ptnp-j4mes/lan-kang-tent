"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check, CheckCheck, Clock, Dog, MapPin, MessageCircle,
  Phone, Tent, Users, X,
} from "lucide-react";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Empty, Spin, useTab } from "../_shared";

const STATUS: Record<string, { label: string; cls: string }> = {
  sent: { label: "ส่งแล้ว · รอตอบ", cls: "bg-muted text-muted-foreground" },
  owner_seen: { label: "เจ้าของเห็นแล้ว", cls: "bg-[hsl(210_70%_52%/0.16)] text-[hsl(210_60%_42%)]" },
  owner_replied: { label: "ตอบกลับแล้ว", cls: "bg-[hsl(28_80%_52%/0.16)] text-[hsl(28_70%_38%)]" },
  user_confirmed: { label: "ยืนยันแล้ว", cls: "bg-[hsl(142_55%_42%/0.16)] text-[hsl(142_45%_30%)]" },
  cancelled: { label: "ยกเลิก", cls: "bg-destructive/12 text-destructive" },
  expired: { label: "หมดอายุ", cls: "bg-muted text-muted-foreground" },
};
const meta = (s: string) => STATUS[s] ?? STATUS.sent;
const time = (s: string) => new Date(s).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtDate = (s: string) => new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });

export default function InquiriesPage() {
  const { data, loading, setData } = useTab<any[]>("/api/me/inquiries");
  const [selId, setSelId] = useState<string | null>(null);

  if (loading) return <Spin />;
  if (!data?.length) return <Empty>ยังไม่มีคำขอ — กด “สอบถามวันว่าง” บนหน้าลาน</Empty>;

  const sel = data.find((q) => q.id === selId) ?? data[0];

  async function act(id: string, action: "confirm" | "cancel") {
    const status = action === "confirm" ? "user_confirmed" : "cancelled";
    setData((d: any) => d.map((q: any) => (q.id === id ? { ...q, status } : q)));
    await api(`/api/me/inquiries/${id}/${action}`, { method: "PATCH" }).catch(() => {});
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* thread list */}
      <div className="space-y-1.5 lg:max-h-[70vh] lg:overflow-y-auto">
        {data.map((q) => (
          <button
            key={q.id}
            onClick={() => setSelId(q.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition hover:border-ember/40",
              sel.id === q.id ? "border-ember/50 bg-ember/5" : "bg-card",
            )}
          >
            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {q.campsite.photos?.[0]?.imageUrl && <Image src={q.campsite.photos[0].imageUrl} alt="" fill sizes="44px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-primary">{q.campsite.name}</p>
              <p className="truncate text-xs text-muted-foreground">{q.ownerReply ?? q.message ?? "—"}</p>
            </div>
            <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[10px]", meta(q.status).cls)}>{meta(q.status).label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* chat pane */}
      <Thread key={sel.id} q={sel} onAct={act} />
    </div>
  );
}

function Thread({ q, onAct }: { q: any; onAct: (id: string, a: "confirm" | "cancel") => void }) {
  const c = q.campsite;
  const details = [
    `${fmtDate(q.startDate)} – ${fmtDate(q.endDate)}`,
    q.partySize && `${q.partySize} คน`,
    q.tentCount && `${q.tentCount} เต็นท์`,
    q.carCount && `${q.carCount} คัน`,
    q.hasPet && "พาสัตว์เลี้ยง",
  ].filter(Boolean);

  return (
    <div className="flex flex-col rounded-2xl border bg-card shadow-field">
      {/* header */}
      <div className="flex items-center gap-3 border-b p-3">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-secondary">
          {c.photos?.[0]?.imageUrl && <Image src={c.photos[0].imageUrl} alt="" fill sizes="40px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/campsites/${c.slug}`} className="block truncate font-display text-base text-primary hover:text-ember">{c.name}</Link>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" /> {c.province}</p>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", meta(q.status).cls)}>{meta(q.status).label}</span>
      </div>

      {/* messages */}
      <div className="flex-1 space-y-4 p-4">
        {/* trip detail chips */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {details.map((d, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground">
              {i === 0 ? <Clock className="size-3" /> : i === 1 ? <Users className="size-3" /> : i === 2 ? <Tent className="size-3" /> : d === "พาสัตว์เลี้ยง" ? <Dog className="size-3" /> : null}
              {d}
            </span>
          ))}
        </div>

        {/* user bubble */}
        <Bubble side="right" time={q.createdAt} read={q.status !== "sent"}>
          {q.message || "สอบถามวันว่างครับ"}
        </Bubble>

        {/* owner bubble or pending */}
        {q.ownerReply ? (
          <Bubble side="left" time={q.repliedAt} avatar={c.photos?.[0]?.imageUrl} name={c.name}>
            {q.ownerReply}
          </Bubble>
        ) : q.status !== "cancelled" ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex gap-0.5">
              <Dot /> <Dot /> <Dot />
            </span>
            รอเจ้าของลานตอบกลับ…
          </div>
        ) : null}
      </div>

      {/* action bar */}
      <div className="border-t p-3">
        {q.status === "owner_replied" ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ember" className="flex-1" onClick={() => onAct(q.id, "confirm")}><Check className="size-4" /> ยืนยันการไป</Button>
            <Button size="sm" variant="outline" onClick={() => onAct(q.id, "cancel")}><X className="size-4" /> ยกเลิก</Button>
          </div>
        ) : q.status === "user_confirmed" ? (
          <p className="flex items-center justify-center gap-1 py-1 text-sm font-medium text-[hsl(142_45%_30%)]"><CheckCheck className="size-4" /> ยืนยันแล้ว — แล้วเจอกันที่ลาน!</p>
        ) : q.status === "cancelled" ? (
          <p className="py-1 text-center text-sm text-muted-foreground">คำขอนี้ถูกยกเลิกแล้ว</p>
        ) : (
          <div className="flex items-center gap-2">
            {(c.phone || c.lineId) && (
              <p className="flex-1 text-xs text-muted-foreground">ติดต่อเจ้าของลานโดยตรงเพื่อตอบเร็วขึ้น</p>
            )}
            {c.phone && <Button asChild size="sm" variant="outline"><a href={`tel:${c.phone}`}><Phone className="size-4" /> โทร</a></Button>}
            {c.lineId && <Button asChild size="sm" variant="outline"><a href={`https://line.me/ti/p/~${c.lineId}`} target="_blank"><MessageCircle className="size-4" /> LINE</a></Button>}
            <Button size="sm" variant="ghost" onClick={() => onAct(q.id, "cancel")}>ยกเลิกคำขอ</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Bubble({ side, time: t, read, avatar, name, children }: { side: "left" | "right"; time?: string; read?: boolean; avatar?: string; name?: string; children: React.ReactNode }) {
  const right = side === "right";
  return (
    <div className={cn("flex items-end gap-2", right ? "flex-row-reverse" : "flex-row")}>
      {!right && (
        <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-secondary">
          {avatar && <Image src={avatar} alt="" fill sizes="28px" className="object-cover" />}
        </div>
      )}
      <div className={cn("max-w-[78%]")}>
        {!right && name && <p className="mb-0.5 ml-1 text-[11px] text-muted-foreground">{name}</p>}
        <div className={cn("rounded-2xl px-3.5 py-2 text-sm leading-relaxed", right ? "rounded-br-sm bg-ember text-ember-foreground" : "rounded-bl-sm bg-secondary text-foreground")}>
          {children}
        </div>
        {t && (
          <p className={cn("mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground", right ? "justify-end mr-1" : "ml-1")}>
            {time(t)} {right && (read ? <CheckCheck className="size-3 text-ember" /> : <Check className="size-3" />)}
          </p>
        )}
      </div>
    </div>
  );
}

const Dot = () => <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />;
