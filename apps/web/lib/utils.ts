import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(min?: number | null, max?: number | null) {
  if (min == null) return "สอบถามราคา";
  if (max && max !== min) return `฿${min}–${max}`;
  return `฿${min}`;
}

export function formatKm(km?: number | null) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} ม.` : `${km.toFixed(1)} กม.`;
}

export const REGIONS: Record<string, string> = {
  north: "ภาคเหนือ",
  northeast: "ภาคอีสาน",
  central: "ภาคกลาง",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
  south: "ภาคใต้",
};
