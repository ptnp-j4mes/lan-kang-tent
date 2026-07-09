import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <LoginForm
      heading="เข้าสู่ระบบ Larn kang tent"
      subtitle="เขียนรีวิว บันทึกลานโปรด และวางแผนไปแคมป์"
      footer={
        <>
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-semibold text-ember hover:underline">สมัครสมาชิก</Link>
          {" · "}
          <Link href="/owner/login" className="text-ember hover:underline">เจ้าของลาน</Link>
        </>
      }
    />
  );
}
