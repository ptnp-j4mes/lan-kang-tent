import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Button, Card, CardBody, Table, Th, Td } from "@/components/ui";
import { PageHeader, Loading, ErrorBox, Empty } from "@/components/page";

type Review = {
  id: string;
  ratingOverall: number;
  comment?: string;
  createdAt: string;
  user: { name: string };
  campsite: { name: string };
};

export function ReviewsPage() {
  const { data, loading, error, reload } = useFetch<Review[]>("/api/admin/reviews?status=pending");

  async function act(id: string, action: "approve" | "reject") {
    await api(`/api/admin/reviews/${id}/${action}`, { method: "PATCH" });
    reload();
  }

  return (
    <div>
      <PageHeader title="รีวิวรออนุมัติ" />
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
              <Empty>ไม่มีรีวิวที่รออนุมัติ</Empty>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>ลาน</Th>
                  <Th>ผู้รีวิว</Th>
                  <Th>คะแนน</Th>
                  <Th>ความเห็น</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <Td className="font-medium text-slate-800">{r.campsite.name}</Td>
                    <Td className="text-slate-600">{r.user.name}</Td>
                    <Td>⭐ {r.ratingOverall}</Td>
                    <Td className="max-w-md text-slate-600">{r.comment}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => act(r.id, "approve")}>
                          อนุมัติ
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => act(r.id, "reject")}>
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
