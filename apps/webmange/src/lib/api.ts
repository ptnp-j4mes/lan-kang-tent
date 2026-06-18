// Shared backend (Elysia API) — same one the public web uses.
const API = import.meta.env.VITE_API_URL ?? "http://localhost:4100";
const TOKEN_KEY = "ckt_admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export type ApiError = { status: number; message: string };

// fetch wrapper: base URL + Bearer + JSON. throws {status,message} on error.
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
    throw { status: res.status, message: body.message ?? res.statusText } as ApiError;
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export type Me = { id: string; name: string; email: string; role: string };

// admin-only backoffice. owners manage their camps in the public web (/owner).
export async function login(email: string, password: string): Promise<Me> {
  const { token, user } = await api<{ token: string; user: Me }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (user.role !== "admin") {
    throw { status: 403, message: "ระบบนี้สำหรับผู้ดูแลระบบเท่านั้น" } as ApiError;
  }
  setToken(token);
  return user;
}

export const isAdmin = (role?: string) => role === "admin";
