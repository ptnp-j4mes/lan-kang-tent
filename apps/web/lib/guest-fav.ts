"use client";

// Guest favorites in localStorage. No backend until signup → merge.
const KEY = "ckt_guest_favs";

export const guestFavs = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

export const isGuestFav = (id: string) => guestFavs().includes(id);

export function toggleGuestFav(id: string): boolean {
  const cur = guestFavs();
  const has = cur.includes(id);
  const next = has ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  return !has; // new state: true=now favorited
}

export const clearGuestFavs = () => localStorage.removeItem(KEY);
