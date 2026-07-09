import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Button, Card, CardBody, CardHeader, CardTitle, Input, Label, Textarea } from "@/components/ui";
import { PageHeader, Loading, ErrorBox } from "@/components/page";

type Field = { key: string; label: string; default: string; multiline?: boolean };
type Page = { key: string; label: string; fields: Field[]; values: Record<string, string> };

export function ContentPage() {
  const { data, loading, error } = useFetch<Page[]>("/api/admin/content");

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="เนื้อหาหน้าเว็บ" />
      <div className="space-y-4">
        {data?.map((p) => <PageEditor key={p.key} page={p} />)}
      </div>
    </div>
  );
}

function PageEditor({ page }: { page: Page }) {
  const [f, setF] = useState<Record<string, string>>(page.values);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { setF(page.values); }, [page]);

  async function save() {
    setBusy(true); setMsg(null);
    try {
      await api(`/api/admin/content/${page.key}`, { method: "PUT", body: JSON.stringify({ value: f }) });
      setMsg("บันทึกแล้ว");
    } catch (e: any) { setMsg(e.message ?? "บันทึกไม่สำเร็จ"); }
    finally { setBusy(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle>{page.label}</CardTitle></CardHeader>
      <CardBody className="space-y-3">
        {page.fields.map((field) => (
          <div key={field.key}>
            <Label>{field.label}</Label>
            {field.multiline
              ? <Textarea rows={3} value={f[field.key] ?? ""} onChange={(e) => setF({ ...f, [field.key]: e.target.value })} />
              : <Input value={f[field.key] ?? ""} onChange={(e) => setF({ ...f, [field.key]: e.target.value })} />}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={busy}>{busy ? "กำลังบันทึก…" : "บันทึก"}</Button>
          {msg && <span className="text-sm text-slate-500">{msg}</span>}
        </div>
      </CardBody>
    </Card>
  );
}
