import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <RegisterForm
      heading="สมัครสมาชิก"
      subtitle="เข้าร่วมชุมชนนักแคมป์ Larn kang tent"
      footer={
        <>
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-semibold text-ember hover:underline">เข้าสู่ระบบ</Link>
          {" · "}
          <Link href="/owner/register" className="text-ember hover:underline">สมัครเจ้าของลาน</Link>
        </>
      }
    />
  );
}
