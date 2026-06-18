"use client";

import { api } from "@/lib/client";
import { Empty, Spin, useTab } from "../_shared";

export default function NotificationsPage() {
  const { data, loading, setData } = useTab<{ unread: number; items: any[] }>("/api/me/notifications");
  if (loading) return <Spin />;
  if (!data?.items.length) return <Empty>ยังไม่มีการแจ้งเตือน</Empty>;

  async function readAll() {
    await api("/api/me/notifications/read-all", { method: "PATCH" });
    setData((d: any) => ({ unread: 0, items: d.items.map((i: any) => ({ ...i, readAt: new Date().toISOString() })) }));
  }

  return (
    <div className="space-y-2">
      {data.unread > 0 && <button onClick={readAll} className="text-xs font-medium text-ember hover:underline">ทำเครื่องหมายอ่านทั้งหมด ({data.unread})</button>}
      {data.items.map((n) => (
        <div key={n.id} className={`rounded-xl border p-3 text-sm ${n.readAt ? "bg-card" : "border-ember/30 bg-ember/5"}`}>
          <p className="font-medium text-primary">{n.title}</p>
          {n.message && <p className="text-muted-foreground">{n.message}</p>}
          <p className="mt-0.5 text-[11px] text-muted-foreground">{new Date(n.createdAt).toLocaleString("th-TH")}</p>
        </div>
      ))}
    </div>
  );
}
