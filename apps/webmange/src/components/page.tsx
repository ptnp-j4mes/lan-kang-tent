import type { ReactNode } from "react";
import { Spinner } from "./ui";

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      {action}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400">{children}</div>;
}
