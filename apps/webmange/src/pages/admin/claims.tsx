import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Button, Card, CardBody, Table, Th, Td } from "@/components/ui";
import { PageHeader, Loading, ErrorBox, Empty } from "@/components/page";

type Claim = {
  id: string;
  evidenceText?: string;
  createdAt: string;
  user: { name: string; email: string };
  campsite: { name: string };
};

export function ClaimsPage() {
  const { data, loading, error, reload } = useFetch<Claim[]>("/api/admin/owner-claims");

  async function act(id: string, action: "approve" | "reject") {
    await api(`/api/admin/owner-claims/${id}/${action}`, { method: "PATCH" });
    reload();
  }

  return (
    <div>
      <PageHeader title="คำขอเป็นเจ้าของลาน" />
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
              <Empty>ไม่มีคำขอที่รออนุมัติ</Empty>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>ลาน</Th>
                  <Th>ผู้ขอ</Th>
                  <Th>หลักฐาน</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id}>
                    <Td className="font-medium text-slate-800">{c.campsite.name}</Td>
                    <Td className="text-slate-600">
                      {c.user.name}
                      <div className="text-xs text-slate-400">{c.user.email}</div>
                    </Td>
                    <Td className="max-w-md text-slate-600">{c.evidenceText}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => act(c.id, "approve")}>
                          อนุมัติ
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => act(c.id, "reject")}>
                          ปฏิเสธ
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
    </div>
  );
}
