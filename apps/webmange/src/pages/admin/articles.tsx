import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Trash2 } from "lucide-react";
import { Button, Card, CardBody, Badge, Table, Th, Td } from "@/components/ui";
import { PageHeader, Loading, ErrorBox, Empty } from "@/components/page";

type Article = { id: string; slug: string; title: string; status: string; updatedAt: string };

export function ArticlesPage() {
  const { data, loading, error, reload } = useFetch<Article[]>("/api/admin/articles");

  async function togglePublish(a: Article) {
    const status = a.status === "published" ? "draft" : "published";
    await api(`/api/admin/articles/${a.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    reload();
  }
  async function remove(id: string) {
    if (!confirm("ลบบทความนี้?")) return;
    await api(`/api/admin/articles/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div>
      <PageHeader title="บทความ" />
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="p-5">
              <ErrorBox message={error} />
            </div>
          ) : !data?.length ? (
            <div className="p-5">
              <Empty>ยังไม่มีบทความ</Empty>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>หัวข้อ</Th>
                  <Th>สถานะ</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.id}>
                    <Td>
                      <div className="font-medium text-slate-800">{a.title}</div>
                      <div className="text-xs text-slate-400">/{a.slug}</div>
                    </Td>
                    <Td>
                      <Badge color={a.status === "published" ? "green" : "amber"}>{a.status}</Badge>
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => togglePublish(a)}>
                          {a.status === "published" ? "ถอนเผยแพร่" : "เผยแพร่"}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
      <p className="mt-3 text-xs text-slate-400">
        ponytail: หน้านี้จัดการสถานะ/ลบ การเขียนเนื้อหาเต็มรูปแบบเพิ่มทีหลังได้
      </p>
    </div>
  );
}
