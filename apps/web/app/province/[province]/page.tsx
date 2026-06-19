import Link from "next/link";
import type { Metadata } from "next";
import { Map } from "lucide-react";
import { filterCampsites } from "@/lib/api";
import { CampsiteCard } from "@/components/campsite-card";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ province: string }>;
}): Promise<Metadata> {
  const { province } = await params;
  const name = decodeURIComponent(province);
  return {
    title: `ลานกางเต็นท์${name}`,
    description: `รวมลานกางเต็นท์ใน${name} พร้อมราคา รีวิว และสิ่งอำนวยความสะดวก`,
  };
}

export default async function ProvinceLanding({
  params,
}: {
  params: Promise<{ province: string }>;
}) {
  const { province } = await params;
  const name = decodeURIComponent(province);
  const list = filterCampsites({ province: name, amenities: [] });

  return (
    <div className="container py-10">
      <div className="grain relative mb-8 overflow-hidden rounded-3xl border bg-primary p-8 text-primary-foreground md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">SEO landing</p>
        <h1 className="mt-2 font-display text-3xl sm:text-5xl">ลานกางเต็นท์{name}</h1>
        <p className="mt-3 max-w-xl text-primary-foreground/80">
          รวม {list.length} ลานกางเต็นท์ในจังหวัด{name} ดูราคา รีวิวจริง สิ่งอำนวยความสะดวก
          แล้วเลือกที่ที่ใช่สำหรับทริปต่อไป
        </p>
        <Button asChild variant="ember" className="mt-5">
          <Link href={`/map?province=${encodeURIComponent(name)}`}>
            <Map className="size-4" /> ดูบนแผนที่
          </Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">ยังไม่มีข้อมูลลานกางเต็นท์ใน{name}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <CampsiteCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
