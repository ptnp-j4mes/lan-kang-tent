import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, clearToken, getToken, type Me } from "./api";

type AuthState = { me: Me | null | undefined; setMe: (m: Me | null) => void; logout: () => void };
const Ctx = createContext<AuthState>({ me: undefined, setMe: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    if (!getToken()) return setMe(null);
    api<Me>("/api/me")
      .then((u) => {
        if (u.role !== "admin") {
          clearToken();
          setMe(null);
        } else setMe(u);
      })
      .catch(() => {
        clearToken();
        setMe(null);
      });
  }, []);

  const logout = () => {
    clearToken();
    setMe(null);
  };

  return <Ctx.Provider value={{ me, setMe, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
