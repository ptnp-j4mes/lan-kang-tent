"use client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

function go(provider: "google" | "facebook") {
  window.location.href = `${API}/api/auth/oauth/${provider}`;
}

export function OAuthButtons() {
  return (
    <div className="space-y-2">
      <button
        onClick={() => go("google")}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-input bg-card py-2.5 text-sm font-semibold transition hover:bg-accent/60"
      >
        <svg viewBox="0 0 24 24" className="size-4"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.1 14.6 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.5 12 20.5c5.9 0 9.8-4.1 9.8-9.9 0-.7-.1-1.2-.2-1.7H12z" /></svg>
        เข้าสู่ระบบด้วย Google
      </button>
      <button
        onClick={() => go("facebook")}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1877F2] py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
      >
        <svg viewBox="0 0 24 24" className="size-4 fill-white"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" /></svg>
        เข้าสู่ระบบด้วย Facebook
      </button>
    </div>
  );
}
