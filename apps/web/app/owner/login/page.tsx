import Link from "next/link";
import { LoginForm } from "@/components/login-form";

// owner portal login — same auth; members can sign in here too then claim a camp.
export default function OwnerLoginPage() {
  return (
    <LoginForm
      heading="เข้าสู่ระบบเจ้าของลาน"
      subtitle="จัดการโปรไฟล์แคมป์ ปฏิทิน และคำขอจอง"
      footer={
        <>
          ยังไม่มีบัญชี?{" "}
          <Link href="/owner/register" className="font-semibold text-ember hover:underline">สมัครเจ้าของลาน</Link>
          {" · "}
          <Link href="/login" className="text-ember hover:underline">เข้าสู่ระบบสมาชิก</Link>
        </>
      }
    />
  );
}
