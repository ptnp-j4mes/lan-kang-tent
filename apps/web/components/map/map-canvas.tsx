"use client";

import { useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { Tent } from "lucide-react";
import type { CampsiteLight } from "@/lib/types";
import { cn } from "@/lib/utils";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
const TH_CENTER = { lat: 13.5, lng: 101 };

type Props = {
  campsites: CampsiteLight[];
  selectedId: string | null;
  hoverId: string | null;
  onSelect: (id: string) => void;
};

export function MapCanvas(props: Props) {
  if (!KEY) return <FallbackMap {...props} />;
  return (
    <APIProvider apiKey={KEY}>
      <Map
        mapId={MAP_ID}
        defaultCenter={TH_CENTER}
        defaultZoom={6}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="size-full"
      >
        <ClusteredMarkers {...props} />
      </Map>
    </APIProvider>
  );
}

function ClusteredMarkers({ campsites, selectedId, onSelect }: Props) {
  const map = useMap();
  const clusterer = useRef<MarkerClusterer | null>(null);
  const markers = useRef<Record<string, google.maps.marker.AdvancedMarkerElement>>({});

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) clusterer.current = new MarkerClusterer({ map });
  }, [map]);

  // markers added imperatively via AdvancedMarker children below would not cluster;
  // we render AdvancedMarker components and let clusterer manage them.
  useEffect(() => {
    const c = clusterer.current;
    if (!c) return;
    c.clearMarkers();
    c.addMarkers(Object.values(markers.current));
  }, [campsites]);

  return (
    <>
      {campsites.map((c) => (
        <AdvancedMarker
          key={c.id}
          position={{ lat: c.latitude, lng: c.longitude }}
          onClick={() => onSelect(c.id)}
          ref={(m) => {
            if (m) markers.current[c.id] = m as any;
            else delete markers.current[c.id];
          }}
        >
          <TentPin active={c.id === selectedId} verified={c.isVerified} rating={c.memberRating} />
        </AdvancedMarker>
      ))}
    </>
  );
}

function TentPin({
  active,
  verified,
  rating,
}: {
  active?: boolean;
  verified?: boolean;
  rating?: number | null;
}) {
  return (
    <div className={cn("group relative -translate-y-1/2", active && "z-50")}>
      <div
        className={cn(
          "grid size-9 place-items-center rounded-full border-2 shadow-lift transition-all",
          active
            ? "scale-125 border-ember bg-ember text-ember-foreground"
            : "border-card bg-primary text-primary-foreground group-hover:scale-110",
        )}
      >
        <Tent className="size-4" />
      </div>
      {verified && (
        <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-card bg-[hsl(var(--moss))]" />
      )}
      {rating != null && rating >= 4.5 && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-card px-1 text-[9px] font-bold text-ember shadow">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/* ---------- Fallback: projected static Thailand map (no API key) ---------- */

const BOUNDS = { minLat: 5.6, maxLat: 20.5, minLng: 97.3, maxLng: 105.7 };

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x, y };
}

function FallbackMap({ campsites, selectedId, onSelect }: Props) {
  return (
    <div className="relative size-full overflow-hidden bg-[hsl(var(--accent)/0.4)]">
      {/* contour backdrop */}
      <svg className="absolute inset-0 size-full opacity-60" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0H0V6" fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.06" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        {[18, 30, 44, 58, 72].map((cy, i) => (
          <ellipse
            key={i}
            cx={45 + i * 2}
            cy={cy}
            rx={22 - i * 2}
            ry={14 - i}
            fill="none"
            stroke="hsl(var(--moss))"
            strokeOpacity="0.18"
            strokeWidth="0.4"
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border bg-card/85 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
        แผนที่ตัวอย่าง · ใส่ <code className="text-ember">NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY</code> เพื่อใช้ Google Maps จริง
      </div>

      {campsites.map((c) => {
        const { x, y } = project(c.latitude, c.longitude);
        const active = c.id === selectedId;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{ left: `${x}%`, top: `${y}%` }}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 transition-all",
              active ? "z-30 scale-125" : "z-10 hover:scale-110",
            )}
            aria-label={c.name}
          >
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full border-2 shadow-lift",
                active ? "border-ember bg-ember text-ember-foreground" : "border-card bg-primary text-primary-foreground",
              )}
            >
              <Tent className="size-4" />
            </span>
            {c.isVerified && (
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border border-card bg-[hsl(var(--moss))]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
