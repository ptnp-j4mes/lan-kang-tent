"use client";

import { useEffect, useState } from "react";
import { guestFavs, clearGuestFavs } from "./guest-fav";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_KEY = "ckt_token";

export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// thin fetch wrapper: base URL + Bearer + JSON. throws {status,message} on error.
export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { status: res.status, message: body.message ?? res.statusText };
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export type Me = { id: string; name: string; email: string; role: string } | null;

// current user from token. null while loading vs {user:null} when logged out — keep simple: undefined=loading.
export function useMe() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  useEffect(() => {
    if (!getToken()) return setMe(null);
    api<Me>("/api/me")
      .then(setMe)
      .catch(() => {
        clearToken();
        setMe(null);
      });
  }, []);
  return me;
}

// landing per role after login. admin is fully separate — they sign in at the
// webmange backoffice (own URL/login), never routed there from the public web.
export function homeForRole(role?: string) {
  if (role === "owner" || role === "camp_staff") return "/owner";
  return "/dashboard";
}

export async function login(email: string, password: string) {
  const { token, user } = await api<{ token: string; user: any }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(token);
  return user;
}

export async function register(name: string, email: string, password: string) {
  const { token, user } = await api<{ token: string; user: any }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  setToken(token);
  return user;
}

// merge localStorage guest favorites into the account. returns {mergedCount,duplicateCount} or null.
export async function mergeGuestFavorites() {
  const ids = guestFavs();
  if (!ids.length) return null;
  const r = await api<{ mergedCount: number; duplicateCount: number }>("/api/me/favorites/merge-guest", {
    method: "POST",
    body: JSON.stringify({ campsiteIds: ids }),
  });
  clearGuestFavs();
  return r;
}
