"use client";

import { useState } from "react";
import Link from "next/link";
import { Map, Menu, Tent, User, X } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { useMe, homeForRole } from "@/lib/client";
import { CategoryMenu } from "./category-menu";

const NAV = [
  { href: "/map", label: "แผนที่ลานกางเต็นท์" },
  { href: "/campsites", label: "ลานทั้งหมด" },
  { href: "/reviews", label: "รีวิวนักแคมป์" },
  { href: "/articles", label: "บทความ" },
  { href: "/owners", label: "สำหรับเจ้าของลาน" },
  { href: "/favorites", label: "ลานโปรด" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const me = useMe();
  const accountHref = me ? homeForRole(me.role) : "/login";
  const accountLabel = me ? (me.role === "owner" || me.role === "camp_staff" ? "จัดการลาน" : "บัญชี") : "เข้าสู่ระบบ";
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          <CategoryMenu />
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="link-underline rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ember" size="sm" className="hidden sm:inline-flex">
            <Link href="/map">
              <Map className="size-4" /> เปิดแผนที่
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href={accountHref}>
              <User className="size-4" /> {accountLabel}
            </Link>
          </Button>
          <button
            className="grid size-10 place-items-center rounded-full border border-border lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="เมนู"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background lg:hidden",
          open ? "max-h-96" : "max-h-0",
          "transition-[max-height] duration-300",
        )}
      >
        <nav className="container flex flex-col gap-1 py-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent/60"
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            <Button asChild variant="ember" className="flex-1">
              <Link href="/map">
                <Tent className="size-4" /> เปิดแผนที่
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href={accountHref}>{accountLabel}</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
