import {
  LayoutDashboard,
  Tent,
  Star,
  ShieldCheck,
  Image,
  Newspaper,
  FileText,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon };

// admin-only backoffice: full website management.
export const adminNav: NavItem[] = [
  { to: "/", label: "ภาพรวม", icon: LayoutDashboard },
  { to: "/campsites", label: "ลานกางเต็นท์", icon: Tent },
  { to: "/reviews", label: "รีวิว (รออนุมัติ)", icon: Star },
  { to: "/claims", label: "คำขอเป็นเจ้าของ", icon: ShieldCheck },
  { to: "/banners", label: "แบนเนอร์หน้าแรก", icon: Image },
  { to: "/articles", label: "บทความ", icon: Newspaper },
  { to: "/content", label: "เนื้อหาหน้าเว็บ", icon: FileText },
  { to: "/users", label: "ผู้ใช้", icon: Users },
  { to: "/settings", label: "ตั้งค่าเว็บไซต์", icon: Settings },
];
