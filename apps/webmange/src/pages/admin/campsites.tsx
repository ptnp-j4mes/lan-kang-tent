import { useState } from "react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Button, Card, CardBody, Input, Badge, Table, Th, Td } from "@/components/ui";
import { PageHeader, Loading, ErrorBox, Empty } from "@/components/page";

type Camp = { id: string; name: string; slug: string; province: string; status: string; isVerified: boolean; latitude?: number; longitude?: number };

const STATUS_COLOR: Record<string, any> = { published: "green", draft: "amber", hidden: "slate" };
const NEXT_STATUS: Record<string, string> = { published: "hidden", hidden: "published", draft: "published" };

export function CampsitesPage() {
  const [q, setQ] = useState("");
  const { data, loading, error, reload } = useFetch<{ total: number; campsites: Camp[] }>(
    `/api/admin/campsites${q ? `?q=${encodeURIComponent(q)}` : ""}`,
  );

  async function toggle(c: Camp) {
    const next = NEXT_STATUS[c.status];
    if (next === "published" && (c.latitude == null || c.longitude == null)) {
      alert("ลานที่ publish ต้องมีพิกัด latitude/longitude ก่อน");
      return;
    }
    await api(`/api/admin/campsites/${c.id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
    reload();
  }

  return (
    <div>
      <PageHeader
        title="ลานกางเต็นท์"
        action={
          <Input
            placeholder="ค้นหาชื่อลาน…"
            className="w-56"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        }
      />
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="p-5">
              <ErrorBox message={error} />
            </div>
          ) : !data?.campsites.length ? (
            <div className="p-5">
              <Empty>ไม่พบลาน</Empty>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>ชื่อ</Th>
                  <Th>จังหวัด</Th>
                  <Th>สถานะ</Th>
                  <Th>ยืนยัน</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {data.campsites.map((c) => (
                  <tr key={c.id}>
                    <Td>
                      <div className="font-medium text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-400">/{c.slug}</div>
                    </Td>
                    <Td className="text-slate-600">{c.province}</Td>
                    <Td>
                      <Badge color={STATUS_COLOR[c.status]}>{c.status}</Badge>
                    </Td>
                    <Td>{c.isVerified ? <Badge color="green">✓</Badge> : <span className="text-slate-300">—</span>}</Td>
                    <Td>
                      <Button variant="outline" size="sm" onClick={() => toggle(c)}>
                        {c.status === "published" ? "ซ่อน" : "เผยแพร่"}
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
      {data && <p className="mt-3 text-xs text-slate-400">ทั้งหมด {data.total} ลาน</p>}
    </div>
  );
}
