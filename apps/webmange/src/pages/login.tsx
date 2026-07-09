import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tent } from "lucide-react";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button, Card, Input, Label } from "@/components/ui";

export function LoginPage() {
  const { setMe } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const me = await login(email, password);
      setMe(me);
      nav("/");
    } catch (e: any) {
      setErr(e.message ?? "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-sm p-7">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Tent className="h-9 w-9 text-brand" />
          <h1 className="text-lg font-bold text-slate-800">ระบบจัดการ Larn kang tent</h1>
          <p className="text-xs text-slate-400">สำหรับผู้ดูแลระบบ</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {err && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          <div>
            <Label>อีเมล</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <Label>รหัสผ่าน</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
