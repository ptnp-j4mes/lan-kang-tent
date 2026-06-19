import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  source,
  className,
}: {
  value?: number | null;
  count?: number | null;
  source?: "google" | "member";
  className?: string;
}) {
  if (value == null) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="size-3.5 fill-ember text-ember" />
      <span className="font-semibold tabular-nums">{value.toFixed(1)}</span>
      {count != null && <span className="text-muted-foreground">({count})</span>}
      {source && (
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {source === "google" ? "Google" : "สมาชิก"}
        </span>
      )}
    </span>
  );
}
