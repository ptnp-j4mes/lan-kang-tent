import { NavLink, Outlet } from "react-router-dom";
import { LogOut, Tent } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { adminNav } from "@/nav";
import { cn } from "@/lib/utils";

export function Layout() {
  const { me, logout } = useAuth();
  const nav = adminNav;
  const roleLabel = "ผู้ดูแลระบบ";

  return (
    <div className="flex h-full">
      {/* sidebar — AdminLTE-lite */}
      <aside className="flex w-60 shrink-0 flex-col bg-sidebar text-slate-100">
        <div className="flex items-center gap-2 px-5 py-4 text-lg font-bold">
          <Tent className="h-6 w-6 text-brand" />
          <div className="leading-tight">
            Larn kang tent
            <div className="text-[11px] font-normal text-slate-400">ระบบจัดการ</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-sidebar-active text-white" : "text-slate-300 hover:bg-sidebar-hover hover:text-white",
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm text-slate-500">
            สวัสดี, <span className="font-medium text-slate-800">{me?.name}</span>
            <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs">{roleLabel}</span>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600">
            <LogOut className="h-4 w-4" /> ออกจากระบบ
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
