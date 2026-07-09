"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bookmark, CalendarDays, Loader2, LogOut, MessageSquare, User } from "lucide-react";
import { clearToken, useMe } from "@/lib/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard/profile", label: "โปรไฟล์", icon: User },
  { href: "/dashboard/favorite-camp", label: "ลานโปรด", icon: Bookmark },
  { href: "/dashboard/calendar-plan", label: "แผนไปแคมป์", icon: CalendarDays },
  { href: "/dashboard/inquiries", label: "คำขอของฉัน", icon: MessageSquare },
  { href: "/dashboard/notifications", label: "การแจ้งเตือน", icon: Bell },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = useMe();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (me === null) router.replace("/login");
  }, [me, router]);

  if (me === undefined || me === null)
    return <div className="grid h-[60vh] place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">บัญชีของฉัน</p>
          <h1 className="font-display text-3xl text-primary">สวัสดี, {me.name}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => { clearToken(); router.push("/"); }}>
          <LogOut className="size-4" /> ออกจากระบบ
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {NAV.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-accent/60"
                  }`}
                >
                  <t.icon className="size-4" /> {t.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
