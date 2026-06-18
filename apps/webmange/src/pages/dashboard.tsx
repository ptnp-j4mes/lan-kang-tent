import { Tent, Star, ShieldCheck, Users } from "lucide-react";
import { useFetch } from "@/lib/use-fetch";
import { Card } from "@/components/ui";
import { PageHeader, Loading, ErrorBox } from "@/components/page";

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="rounded-lg bg-brand/10 p-3 text-brand">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { data, loading, error } = useFetch<{ campsites: number; pendingReviews: number; openClaims: number; users: number }>(
    "/api/admin/dashboard",
  );
  return (
    <div>
      <PageHeader title="ภาพรวม" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat icon={Tent} label="ลานทั้งหมด" value={data!.campsites} />
          <Stat icon={Star} label="รีวิวรออนุมัติ" value={data!.pendingReviews} />
          <Stat icon={ShieldCheck} label="คำขอเป็นเจ้าของ" value={data!.openClaims} />
          <Stat icon={Users} label="ผู้ใช้" value={data!.users} />
        </div>
      )}
    </div>
  );
}
