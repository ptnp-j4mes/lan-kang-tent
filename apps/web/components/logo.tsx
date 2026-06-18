import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center">
        <svg viewBox="0 0 40 40" className="size-9" aria-hidden>
          <circle cx="20" cy="20" r="19" className="fill-ember" />
          {/* tent */}
          <path d="M20 9 L31 30 H9 Z" className="fill-[hsl(var(--ember-foreground))]" />
          <path d="M20 9 L20 30" className="stroke-ember" strokeWidth="2.4" />
          <path d="M20 30 L24.5 30 L20 22 Z" className="fill-ember" />
        </svg>
      </span>
      <span className={cn("flex flex-col leading-none", light ? "text-primary-foreground" : "text-primary")}>
        <span className="font-display text-lg tracking-tight">Larn kang tent</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          ลานกางเต็นท์
        </span>
      </span>
    </Link>
  );
}
