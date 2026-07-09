import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Button, Card, CardBody, CardHeader, CardTitle, Input, Label, Badge } from "@/components/ui";
import { PageHeader, Loading, ErrorBox, Empty } from "@/components/page";

type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  isActive: boolean;
  sortOrder: number;
};

const blank = { title: "", subtitle: "", imageUrl: "", ctaLabel: "", ctaHref: "", isActive: true, sortOrder: 0 };

function BannerForm({ onCreated }: { onCreated: () => void }) {
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof blank) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api("/api/admin/banners", { method: "POST", body: JSON.stringify({ ...f, sortOrder: Number(f.sortOrder) }) });
      setF(blank);
      onCreated();
    } catch (e: any) {
      setErr(e.message ?? "เพิ่มไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>เพิ่มแบนเนอร์</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={create} className="space-y-3">
          {err && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          <div>
            <Label>หัวข้อ *</Label>
            <Input value={f.title} onChange={set("title")} required />
          </div>
          <div>
            <Label>คำโปรย</Label>
            <Input value={f.subtitle} onChange={set("subtitle")} />
          </div>
          <div>
            <Label>URL รูปภาพ *</Label>
            <Input value={f.imageUrl} onChange={set("imageUrl")} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>ปุ่ม (label)</Label>
              <Input value={f.ctaLabel} onChange={set("ctaLabel")} />
            </div>
            <div>
              <Label>ปุ่ม (ลิงก์)</Label>
              <Input value={f.ctaHref} onChange={set("ctaHref")} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            <Plus className="h-4 w-4" /> {busy ? "กำลังเพิ่ม…" : "เพิ่มแบนเนอร์"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

export function BannersPage() {
  const { data, loading, error, reload } = useFetch<Banner[]>("/api/admin/banners");

  async function toggle(b: Banner) {
    await api(`/api/admin/banners/${b.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !b.isActive }) });
    reload();
  }
  async function remove(id: string) {
    if (!confirm("ลบแบนเนอร์นี้?")) return;
    await api(`/api/admin/banners/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div>
      <PageHeader title="แบนเนอร์หน้าแรก" />
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <BannerForm onCreated={reload} />
        <div className="space-y-3">
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorBox message={error} />
          ) : !data?.length ? (
            <Empty>ยังไม่มีแบนเนอร์</Empty>
          ) : (
            data.map((b) => (
              <Card key={b.id}>
                <CardBody className="flex items-center gap-4">
                  <img src={b.imageUrl} alt="" className="h-16 w-28 shrink-0 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-slate-800">{b.title}</span>
                      <Badge color={b.isActive ? "green" : "slate"}>{b.isActive ? "แสดง" : "ซ่อน"}</Badge>
                    </div>
                    <div className="truncate text-sm text-slate-500">{b.subtitle}</div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggle(b)}>
                      {b.isActive ? "ซ่อน" : "แสดง"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(b.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
