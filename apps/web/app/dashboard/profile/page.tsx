"use client";

import { useState } from "react";
import {
  AtSign, Facebook, Globe, Instagram, MapPin, MessageCircle,
  Pencil, Phone, ShieldCheck, Tag, User, X,
} from "lucide-react";
import { api, useMe } from "@/lib/client";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Spin, inputCls, useTab } from "../_shared";

const roleLabel = (r?: string) => (r === "owner" ? "เจ้าของลาน" : r === "admin" ? "ผู้ดูแลระบบ" : "นักแคมป์");

export default function ProfilePage() {
  const me = useMe();
  const { data, loading, setData } = useTab<any>("/api/me/profile");
  const [editing, setEditing] = useState(false);
  if (loading || me === undefined) return <Spin />;

  const p = data ?? {};
  const name = p.displayName || me?.name || "";
  const initials = name.trim().slice(0, 2).toUpperCase() || "?";
  const styles: string[] = p.campingStyle ?? [];

  return (
    <div className="space-y-6">
      {/* identity header */}
      <div className="grain relative overflow-hidden rounded-3xl border border-primary/20 bg-primary p-6 text-primary-foreground shadow-lift sm:p-8">
        <Button
          variant="outline" size="sm"
          onClick={() => setEditing(true)}
          className="absolute right-4 top-4 border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
        >
          <Pencil className="size-4" /> แก้ไข
        </Button>
        <div className="relative flex flex-col items-center gap-5 sm:flex-row">
          <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-ember/20 ring-4 ring-white/15">
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="font-display text-3xl text-ember-foreground">{initials}</span>
            )}
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="font-display text-2xl">{name}</h2>
            <p className="text-sm text-primary-foreground/70">{me?.email}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <ShieldCheck className="size-3.5" /> {roleLabel(me?.role)}
            </span>
          </div>
        </div>
        {p.bio && <p className="relative mt-5 max-w-2xl text-sm text-primary-foreground/85">{p.bio}</p>}
      </div>

      {/* about */}
      <Card icon={User} title="ข้อมูลส่วนตัว">
        <Row icon={MapPin} label="จังหวัด" value={p.homeProvince} />
        <Row icon={Phone} label="เบอร์โทร" value={p.phone} />
        <div className="flex items-start gap-3 py-2.5">
          <Tag className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">สไตล์แคมป์</p>
            {styles.length ? (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {styles.map((s) => <span key={s} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{s}</span>)}
              </div>
            ) : <p className="text-sm text-muted-foreground/60">ยังไม่ได้ระบุ</p>}
          </div>
        </div>
      </Card>

      {/* social */}
      <Card icon={Globe} title="โซเชียล & ลิงก์">
        <LinkRow icon={Globe} label="เว็บไซต์" value={p.website} href={p.website} />
        <LinkRow icon={Facebook} label="Facebook" value={p.socialFacebook} href={p.socialFacebook} />
        <LinkRow icon={Instagram} label="Instagram" value={p.socialInstagram} href={p.socialInstagram?.startsWith("http") ? p.socialInstagram : p.socialInstagram ? `https://instagram.com/${p.socialInstagram.replace(/^@/, "")}` : undefined} />
        <Row icon={MessageCircle} label="LINE ID" value={p.socialLine} />
      </Card>

      {editing && <EditModal data={p} fallbackName={me?.name ?? ""} onClose={() => setEditing(false)} onSaved={(updated) => { setData(updated); setEditing(false); }} />}
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-field sm:p-6">
      <div className="mb-1 flex items-center gap-2 border-b pb-3">
        <span className="grid size-8 place-items-center rounded-lg bg-ember/10 text-ember"><Icon className="size-4" /></span>
        <p className="font-display text-lg text-primary">{title}</p>
      </div>
      <div className="divide-y">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className={value ? "text-sm text-foreground" : "text-sm text-muted-foreground/60"}>{value || "ยังไม่ได้ระบุ"}</span>
    </div>
  );
}

function LinkRow({ icon: Icon, label, value, href }: { icon: any; label: string; value?: string | null; href?: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      {value ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-ember hover:underline">{value}</a>
      ) : <span className="text-sm text-muted-foreground/60">ยังไม่ได้ระบุ</span>}
    </div>
  );
}

const STYLE_PRESETS = [
  { v: "beginner", l: "มือใหม่" },
  { v: "family", l: "ครอบครัว" },
  { v: "mountain", l: "สายภูเขา" },
  { v: "riverside", l: "ริมน้ำ" },
  { v: "pet_friendly", l: "พาสัตว์เลี้ยง" },
  { v: "solo", l: "เที่ยวคนเดียว" },
  { v: "hammock", l: "สายเปลญวน" },
  { v: "stargazing", l: "ดูดาว" },
];

function EditModal({ data, fallbackName, onClose, onSaved }: { data: any; fallbackName: string; onClose: () => void; onSaved: (updated: any) => void }) {
  const [busy, setBusy] = useState(false);
  const [styles, setStyles] = useState<string[]>(data.campingStyle ?? []);
  const [custom, setCustom] = useState("");

  const toggle = (v: string) => setStyles((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  const addCustom = () => {
    const v = custom.trim();
    if (v && !styles.includes(v)) setStyles((s) => [...s, v]);
    setCustom("");
  };

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const updated = await api("/api/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: f.get("displayName"),
          avatarUrl: f.get("avatarUrl") || undefined,
          bio: f.get("bio"),
          homeProvince: f.get("homeProvince"),
          phone: f.get("phone") || undefined,
          website: f.get("website") || undefined,
          socialFacebook: f.get("socialFacebook") || undefined,
          socialInstagram: f.get("socialInstagram") || undefined,
          socialLine: f.get("socialLine") || undefined,
          campingStyle: styles,
        }),
      });
      toast("บันทึกโปรไฟล์แล้ว");
      onSaved(updated);
    } finally {
      setBusy(false);
    }
  }

  const customStyles = styles.filter((v) => !STYLE_PRESETS.some((p) => p.v === v));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-card shadow-lift">
        {/* compact header */}
        <header className="flex items-center gap-2.5 border-b px-5 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-ember/10 text-ember"><Pencil className="size-4" /></span>
          <h3 className="flex-1 font-display text-lg text-primary">แก้ไขโปรไฟล์</h3>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent/60"><X className="size-4" /></button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <SectionLabel icon={User}>ข้อมูลส่วนตัว</SectionLabel>
          <Field label="ชื่อที่แสดง"><input name="displayName" defaultValue={data.displayName ?? fallbackName} className={inputCls} /></Field>
          <Field label="รูปโปรไฟล์ (URL)"><input name="avatarUrl" defaultValue={data.avatarUrl ?? ""} placeholder="https://…" className={inputCls} /></Field>
          <Field label="แนะนำตัว"><textarea name="bio" defaultValue={data.bio ?? ""} rows={3} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="จังหวัด"><input name="homeProvince" defaultValue={data.homeProvince ?? ""} className={inputCls} /></Field>
            <Field label="เบอร์โทร"><input name="phone" defaultValue={data.phone ?? ""} className={inputCls} /></Field>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">สไตล์แคมป์</span>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_PRESETS.map((p) => {
                const on = styles.includes(p.v);
                return (
                  <button
                    key={p.v}
                    type="button"
                    onClick={() => toggle(p.v)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      on ? "border-ember bg-ember text-ember-foreground" : "border-input bg-card text-muted-foreground hover:border-ember/50",
                    )}
                  >
                    {p.l}
                  </button>
                );
              })}
              {customStyles.map((v) => (
                <span key={v} className="inline-flex items-center gap-1 rounded-full border border-ember bg-ember px-3 py-1 text-xs font-medium text-ember-foreground">
                  {v}
                  <button type="button" onClick={() => toggle(v)} aria-label={`ลบ ${v}`}><X className="size-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                placeholder="เพิ่มสไตล์เอง แล้วกด Enter"
                className={inputCls}
              />
              <Button type="button" variant="outline" onClick={addCustom}>เพิ่ม</Button>
            </div>
          </div>

          <div className="space-y-3 border-t pt-5">
            <SectionLabel icon={Globe}>โซเชียล & ลิงก์</SectionLabel>
            <Field label="เว็บไซต์"><input name="website" defaultValue={data.website ?? ""} placeholder="https://…" className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Facebook"><input name="socialFacebook" defaultValue={data.socialFacebook ?? ""} className={inputCls} /></Field>
              <Field label="Instagram"><input name="socialInstagram" defaultValue={data.socialInstagram ?? ""} className={inputCls} /></Field>
            </div>
            <Field label="LINE ID"><input name="socialLine" defaultValue={data.socialLine ?? ""} className={inputCls} /></Field>
          </div>
        </div>

        {/* footer */}
        <footer className="flex justify-end gap-2 border-t bg-muted/30 px-5 py-3">
          <Button type="button" variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button type="submit" variant="ember" disabled={busy}>{busy ? "กำลังบันทึก…" : "บันทึกโปรไฟล์"}</Button>
        </footer>
      </form>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ember">
      <Icon className="size-3.5" /> {children}
    </p>
  );
}
