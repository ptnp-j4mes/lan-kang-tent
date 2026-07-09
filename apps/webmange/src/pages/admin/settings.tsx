import { useEffect, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Button, Card, CardBody, CardHeader, CardTitle, Input, Label, Textarea, Badge } from "@/components/ui";
import { PageHeader, Loading, ErrorBox } from "@/components/page";

type Settings = {
  siteName?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[] | string;
  ogImage?: string;
  ga4Id?: string;
  gtmId?: string;
  organizationName?: string;
  twitterHandle?: string;
  aioSummary?: string;
  ga4PropertyId?: string;
};

type Suggestion = { metaTitle: string; metaDescription: string; keywords: string[]; aioSummary: string };
type GenResult = {
  suggestion: Suggestion;
  source: { topPages: { path: string; title: string; views: number }[]; topSearchTerms: { term: string; views: number }[]; days: number };
};

export function SettingsPage() {
  const { data, loading, error } = useFetch<Settings>("/api/admin/site-settings");
  const ga4 = useFetch<{ credentialsConfigured: boolean; propertyId: string | null }>("/api/admin/seo/ga4-status");
  const [f, setF] = useState<Settings>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  // GA4 generation state
  const [gen, setGen] = useState<GenResult | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);

  useEffect(() => { if (data) setF(data); }, [data]);
  const set = (k: keyof Settings) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const body: any = { ...f };
      if (typeof body.keywords === "string")
        body.keywords = body.keywords.split(",").map((s: string) => s.trim()).filter(Boolean);
      delete body.id; delete body.updatedAt; delete body.seoGeneratedAt;
      await api("/api/admin/site-settings", { method: "PATCH", body: JSON.stringify(body) });
      setMsg("บันทึกแล้ว");
    } catch (e: any) { setMsg(e.message ?? "บันทึกไม่สำเร็จ"); }
    finally { setBusy(false); }
  }

  async function generate() {
    setGenBusy(true); setGenErr(null); setGen(null);
    try {
      const r = await api<GenResult>("/api/admin/seo/generate", { method: "POST", body: JSON.stringify({ days: 28 }) });
      setGen(r);
    } catch (e: any) { setGenErr(e.message ?? "สร้างไม่สำเร็จ"); }
    finally { setGenBusy(false); }
  }

  function applySuggestion(s: Suggestion) {
    setF((prev) => ({ ...prev, metaTitle: s.metaTitle, metaDescription: s.metaDescription, keywords: s.keywords, aioSummary: s.aioSummary }));
    setMsg("ใส่ค่าที่สร้างแล้ว — กดบันทึกเพื่อยืนยัน");
  }

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const keywordsStr = Array.isArray(f.keywords) ? f.keywords.join(", ") : (f.keywords ?? "");
  const ga4Ready = ga4.data?.credentialsConfigured && f.ga4PropertyId;

  return (
    <div className="max-w-3xl">
      <PageHeader title="SEO / AIO" />
      <div className="space-y-4">
        {/* ---- GA4 auto-generate ---- */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>สร้าง SEO อัตโนมัติจาก GA4</CardTitle>
            <Badge color={ga4.data?.credentialsConfigured ? "green" : "amber"}>
              {ga4.data?.credentialsConfigured ? "เชื่อม GA4 แล้ว" : "ยังไม่ตั้งค่า service account"}
            </Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <Label>GA4 Property ID (ตัวเลข — สำหรับ Data API)</Label>
              <Input value={f.ga4PropertyId ?? ""} onChange={set("ga4PropertyId")} placeholder="เช่น 412345678" />
              <p className="mt-1 text-xs text-slate-400">บันทึกก่อนกดสร้าง · service account creds อยู่ใน env ฝั่ง server</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={generate} disabled={genBusy || !ga4Ready}>
                <Wand2 className="h-4 w-4" /> {genBusy ? "กำลังดึง GA4…" : "ดึง GA4 + สร้าง SEO"}
              </Button>
              {!ga4Ready && <span className="text-xs text-slate-400">ต้องเชื่อม GA4 + กรอก Property ID (บันทึกก่อน)</span>}
            </div>
            {genErr && <ErrorBox message={genErr} />}
            {gen && (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Sparkles className="h-4 w-4 text-brand" /> ข้อเสนอจากข้อมูล {gen.source.days} วันล่าสุด
                  </span>
                  <Button size="sm" onClick={() => applySuggestion(gen.suggestion)}>ใช้ค่านี้</Button>
                </div>
                <Field label="Meta Title">{gen.suggestion.metaTitle}</Field>
                <Field label="Meta Description">{gen.suggestion.metaDescription}</Field>
                <Field label="Keywords">{gen.suggestion.keywords.join(", ")}</Field>
                <Field label="AIO Summary">{gen.suggestion.aioSummary}</Field>
                {gen.source.topPages.length > 0 && (
                  <details className="text-xs text-slate-500">
                    <summary className="cursor-pointer">หน้ายอดนิยม ({gen.source.topPages.length})</summary>
                    <ul className="mt-1 space-y-0.5">
                      {gen.source.topPages.map((p, i) => (
                        <li key={i}>{p.title || p.path} · {p.views} views</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* ---- SEO ---- */}
        <Card>
          <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <div><Label>ชื่อเว็บไซต์</Label><Input value={f.siteName ?? ""} onChange={set("siteName")} /></div>
            <div><Label>Meta Title</Label><Input value={f.metaTitle ?? ""} onChange={set("metaTitle")} /></div>
            <div><Label>Meta Description</Label><Textarea rows={3} value={f.metaDescription ?? ""} onChange={set("metaDescription")} /></div>
            <div><Label>Keywords (คั่นด้วย ,)</Label><Input value={keywordsStr} onChange={(e) => setF({ ...f, keywords: e.target.value })} /></div>
            <div><Label>OG Image URL</Label><Input value={f.ogImage ?? ""} onChange={set("ogImage")} /></div>
          </CardBody>
        </Card>

        {/* ---- AIO ---- */}
        <Card>
          <CardHeader><CardTitle>AIO (Answer-Engine Optimization)</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <div>
              <Label>AIO Summary (คำอธิบายเว็บสำหรับ AI / llms.txt)</Label>
              <Textarea rows={3} value={f.aioSummary ?? ""} onChange={set("aioSummary")} />
            </div>
          </CardBody>
        </Card>

        {/* ---- Analytics ---- */}
        <Card>
          <CardHeader><CardTitle>Analytics</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>GA4 Measurement ID</Label><Input value={f.ga4Id ?? ""} onChange={set("ga4Id")} placeholder="G-XXXX" /></div>
              <div><Label>GTM ID</Label><Input value={f.gtmId ?? ""} onChange={set("gtmId")} placeholder="GTM-XXXX" /></div>
            </div>
            <div><Label>Organization Name</Label><Input value={f.organizationName ?? ""} onChange={set("organizationName")} /></div>
            <div><Label>Twitter Handle</Label><Input value={f.twitterHandle ?? ""} onChange={set("twitterHandle")} placeholder="@example" /></div>
          </CardBody>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={busy}>{busy ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}</Button>
          {msg && <span className="text-sm text-slate-500">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  );
}
