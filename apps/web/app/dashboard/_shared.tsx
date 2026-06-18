"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/client";

export function useTab<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<T>(path).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [path]);
  return { data, loading, setData };
}

export const Spin = () => <div className="grid place-items-center py-12"><Loader2 className="animate-spin" /></div>;

export const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">{children}</p>
);

export const inputCls = "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ember";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
