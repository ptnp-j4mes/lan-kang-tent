"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, ExternalLink, MapPin, X } from "lucide-react";
import type { CampsiteLight } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/rating";
import { AmenityIcon } from "@/components/amenity-icon";
import { formatKm, formatPrice } from "@/lib/utils";

export function PreviewCard({ c, onClose }: { c: CampsiteLight; onClose: () => void }) {
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`;
  return (
    <div className="animate-scale-in overflow-hidden rounded-2xl border bg-card shadow-lift">
      <div className="relative aspect-[16/9]">
        {c.coverImageUrl && (
          <Image src={c.coverImageUrl} alt={c.name} fill sizes="360px" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={onClose}
          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-card/90 text-foreground backdrop-blur hover:bg-card"
        >
          <X className="size-4" />
        </button>
        <span className="absolute bottom-2 left-3 rounded-full bg-card/90 px-2.5 py-0.5 text-sm font-bold text-ember backdrop-blur">
          {formatPrice(c.priceMin)}
        </span>
        {c.distanceKm != null && (
          <span className="absolute bottom-2 right-3 rounded-full bg-primary/90 px-2 py-0.5 text-[11px] text-primary-foreground backdrop-blur">
            {formatKm(c.distanceKm)}
          </span>
        )}
      </div>

      <div className="space-y-2.5 p-4">
        <h3 className="font-display text-lg leading-snug text-primary">{c.name}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {c.district ? `${c.district}, ` : ""}
          {c.province}
        </p>
        <div className="flex items-center gap-3">
          <Rating value={c.memberRating} source="member" />
          <span className="h-3 w-px bg-border" />
          <Rating value={c.googleRating} source="google" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {c.tags.slice(0, 4).map((t) => (
            <span key={t.key} className="inline-flex items-center gap-1 rounded-md bg-secondary/70 px-2 py-0.5 text-[11px]">
              <AmenityIcon keyName={t.key} className="size-3" />
              {t.name}
            </span>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <Button asChild variant="ember" size="sm" className="flex-1">
            <Link href={`/campsites/${c.slug}`}>ดูรายละเอียด</Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="size-9">
            <a href={gmaps} target="_blank" rel="noreferrer" aria-label="เปิดใน Google Maps">
              <ExternalLink className="size-4" />
            </a>
          </Button>
          <Button variant="outline" size="icon" className="size-9" aria-label="บันทึกไว้">
            <Bookmark className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
