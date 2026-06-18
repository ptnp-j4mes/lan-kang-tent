"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Toast = { id: number; message: string; action?: { label: string; href: string } };

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, action } = (e as CustomEvent).detail;
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, action }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    };
    window.addEventListener("ckt-toast", handler);
    return () => window.removeEventListener("ckt-toast", handler);
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-up flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary px-4 py-3 text-sm text-primary-foreground shadow-lift"
        >
          <span>{t.message}</span>
          {t.action && (
            <Link href={t.action.href} className="shrink-0 font-semibold text-ember underline">
              {t.action.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
