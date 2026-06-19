"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Tent } from "lucide-react";
import type { CampsiteLight } from "@/lib/types";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

export function DetailMap({ campsite }: { campsite: CampsiteLight }) {
  const pos = { lat: campsite.latitude, lng: campsite.longitude };

  if (!KEY) {
    return (
      <div className="relative grid size-full place-items-center bg-[hsl(var(--accent)/0.4)]">
        <svg className="absolute inset-0 size-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[20, 35, 50, 65, 80].map((cy, i) => (
            <ellipse key={i} cx="50" cy={cy} rx={30 - i * 3} ry={12 - i} fill="none" stroke="hsl(var(--moss))" strokeOpacity="0.2" strokeWidth="0.4" />
          ))}
        </svg>
        <div className="relative flex flex-col items-center gap-2">
          <span className="grid size-10 place-items-center rounded-full border-2 border-card bg-ember text-ember-foreground shadow-lift">
            <Tent className="size-5" />
          </span>
          <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-primary shadow">
            {campsite.latitude.toFixed(4)}, {campsite.longitude.toFixed(4)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={KEY}>
      <Map mapId={MAP_ID} defaultCenter={pos} defaultZoom={12} gestureHandling="cooperative" className="size-full">
        <AdvancedMarker position={pos}>
          <span className="grid size-9 place-items-center rounded-full border-2 border-card bg-ember text-ember-foreground shadow-lift">
            <Tent className="size-4" />
          </span>
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}
