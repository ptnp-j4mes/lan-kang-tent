import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Button, Card, CardBody, CardHeader, CardTitle, Input, Label, Textarea } from "@/components/ui";
import { PageHeader, Loading, ErrorBox } from "@/components/page";

type Settings = {
  siteName?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  ga4Id?: string;
  gtmId?: string;
  organizationName?: string;
  twitterHandle?: string;
  robotsExtra?: string;
};

export function SettingsPage() {
  const { data, loading, error } = useFetch<Settings>("/api/admin/site-settings");
  const [f, setF] = useState<Settings>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (data) setF(data);
  }, [data]);

  const set = (k: keyof Settings) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const body: any = { ...f };
      if (typeof body.keywords === "string")
        body.keywords = body.keywords.split(",").map((s: string) => s.trim()).filter(Boolean);
      delete body.id;
      delete body.updatedAt;
      await api("/api/admin/site-settings", { method: "PATCH", body: JSON.stringify(body) });
      setMsg("บันทึกแล้ว");
    } catch (e: any) {
      setMsg(e.message ?? "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const keywordsStr = Array.isArray(f.keywords) ? f.keywords.join(", ") : (f.keywords ?? "");

  return (
    <div className="max-w-2xl">
      <PageHeader title="ตั้งค่าเว็บไซต์" />
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>SEO / ข้อมูลเว็บ</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <Label>ชื่อเว็บไซต์</Label>
              <Input value={f.siteName ?? ""} onChange={set("siteName")} />
            </div>
            <div>
              <Label>Meta Title</Label>
              <Input value={f.metaTitle ?? ""} onChange={set("metaTitle")} />
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea rows={3} value={f.metaDescription ?? ""} onChange={set("metaDescription")} />
            </div>
            <div>
              <Label>Keywords (คั่นด้วย ,)</Label>
              <Input value={keywordsStr} onChange={(e) => setF({ ...f, keywords: e.target.value as any })} />
            </div>
            <div>
              <Label>OG Image URL</Label>
              <Input value={f.ogImage ?? ""} onChange={set("ogImage")} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>GA4 ID</Label>
                <Input value={f.ga4Id ?? ""} onChange={set("ga4Id")} placeholder="G-XXXX" />
              </div>
              <div>
                <Label>GTM ID</Label>
                <Input value={f.gtmId ?? ""} onChange={set("gtmId")} placeholder="GTM-XXXX" />
              </div>
            </div>
            <div>
              <Label>Organization Name</Label>
              <Input value={f.organizationName ?? ""} onChange={set("organizationName")} />
            </div>
            <div>
              <Label>Twitter Handle</Label>
              <Input value={f.twitterHandle ?? ""} onChange={set("twitterHandle")} placeholder="@example" />
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={busy}>
            {busy ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}
          </Button>
          {msg && <span className="text-sm text-slate-500">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
