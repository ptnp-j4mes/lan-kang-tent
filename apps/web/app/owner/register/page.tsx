import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

// owner signup — creates a normal account, then sends them to claim a camp
// (role becomes owner only after admin approves the claim).
export default function OwnerRegisterPage() {
  return (
    <RegisterForm
      heading="สมัครเจ้าของลาน"
      subtitle="สมัครบัญชี แล้ว claim ลานของคุณเพื่อเริ่มจัดการ"
      next="/owners"
      footer={
        <>
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/owner/login" className="font-semibold text-ember hover:underline">เข้าสู่ระบบเจ้าของลาน</Link>
        </>
      }
    />
  );
}
