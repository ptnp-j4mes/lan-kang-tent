"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { api, getToken } from "@/lib/client";
import { isGuestFav, toggleGuestFav } from "@/lib/guest-fav";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  campId,
  initialFav = false,
  className,
}: {
  campId: string;
  initialFav?: boolean;
  className?: string;
}) {
  const [fav, setFav] = useState(initialFav);

  useEffect(() => {
    if (!getToken()) setFav(isGuestFav(campId));
  }, [campId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (getToken()) {
      const next = !fav;
      setFav(next); // optimistic
      try {
        await api(`/api/me/favorites/${campId}`, { method: next ? "POST" : "DELETE" });
      } catch {
        setFav(!next);
      }
    } else {
      const now = toggleGuestFav(campId);
      setFav(now);
      if (now) toast("บันทึกไว้แล้ว สมัครสมาชิกเพื่อเก็บข้ามอุปกรณ์", { label: "สมัคร", href: "/register" });
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="บันทึกไว้"
      aria-pressed={fav}
      className={cn(
        "grid place-items-center rounded-full transition",
        fav ? "text-ember" : "text-primary hover:text-ember",
        className,
      )}
    >
      <Bookmark className={cn("size-4", fav && "fill-ember")} />
    </button>
  );
}
