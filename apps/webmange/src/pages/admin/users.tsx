import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Card, CardBody, Badge, Table, Th, Td } from "@/components/ui";
import { PageHeader, Loading, ErrorBox, Empty } from "@/components/page";

type User = { id: string; name: string; email: string; role: string; status: string; createdAt: string };

const ROLES = ["member", "owner", "camp_staff", "admin"];
const roleColor: Record<string, any> = { admin: "red", owner: "blue", camp_staff: "blue", member: "slate" };

export function UsersPage() {
  const { data, loading, error, reload } = useFetch<User[]>("/api/admin/users");

  async function setRole(id: string, role: string) {
    await api(`/api/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
    reload();
  }

  return (
    <div>
      <PageHeader title="ผู้ใช้" />
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
              <Empty>ไม่มีผู้ใช้</Empty>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>ชื่อ</Th>
                  <Th>อีเมล</Th>
                  <Th>บทบาท</Th>
                  <Th>เปลี่ยนบทบาท</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((u) => (
                  <tr key={u.id}>
                    <Td className="font-medium text-slate-800">{u.name}</Td>
                    <Td className="text-slate-600">{u.email}</Td>
                    <Td>
                      <Badge color={roleColor[u.role]}>{u.role}</Badge>
                    </Td>
                    <Td>
                      <select
                        className="h-8 rounded-md border border-slate-300 bg-white px-2 text-sm"
                        value={u.role}
                        onChange={(e) => setRole(u.id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
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
