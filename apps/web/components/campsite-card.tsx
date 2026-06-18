"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import type { CampsiteLight } from "@/lib/types";
import { cn, formatKm, formatPrice } from "@/lib/utils";
import { AmenityIcon } from "./amenity-icon";
import { Rating } from "./rating";
import { FavoriteButton } from "./favorite-button";

export function CampsiteCard({
  c,
  className,
  compact = false,
  onHover,
  active = false,
}: {
  c: CampsiteLight;
  className?: string;
  compact?: boolean;
  onHover?: (id: string | null) => void;
  active?: boolean;
}) {
  return (
    <Link
      href={`/campsites/${c.slug}`}
      onMouseEnter={() => onHover?.(c.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-field transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        active && "ring-2 ring-ember",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden", compact ? "aspect-[16/10]" : "aspect-[4/3]")}>
        {c.coverImageUrl ? (
          <Image
            src={c.coverImageUrl}
            alt={c.name}
            fill
            sizes="(max-width:768px) 100vw, 360px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex gap-1.5">
          {c.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground backdrop-blur">
              <BadgeCheck className="size-3" /> ยืนยันแล้ว
            </span>
          )}
        </div>

        <FavoriteButton
          campId={c.id}
          className="absolute right-3 top-3 size-8 bg-card/85 backdrop-blur hover:bg-card"
        />

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="rounded-full bg-card/90 px-2.5 py-1 text-sm font-bold text-ember backdrop-blur">
            {formatPrice(c.priceMin)}
          </span>
          {c.distanceKm != null && (
            <span className="rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-medium text-primary-foreground backdrop-blur">
              {formatKm(c.distanceKm)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg leading-snug text-primary group-hover:text-ember">
          {c.name}
        </h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {c.district ? `${c.district}, ` : ""}
          {c.province}
        </p>

        <div className="flex items-center gap-3 pt-0.5">
          <Rating value={c.memberRating} source="member" />
          <span className="h-3 w-px bg-border" />
          <Rating value={c.googleRating} source="google" />
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {c.tags.slice(0, compact ? 3 : 4).map((t) => (
            <span
              key={t.key}
              className="inline-flex items-center gap-1 rounded-md bg-secondary/70 px-2 py-0.5 text-[11px] text-secondary-foreground"
            >
              <AmenityIcon keyName={t.key} className="size-3" />
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
