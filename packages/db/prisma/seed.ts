import { PrismaClient, CampsiteStatus, LocationAccuracy } from "@prisma/client";

const prisma = new PrismaClient();

const AMENITIES = [
  { key: "toilet", name: "ห้องน้ำ", icon: "toilet" },
  { key: "shower", name: "ห้องอาบน้ำ", icon: "shower" },
  { key: "electricity", name: "ไฟฟ้า", icon: "zap" },
  { key: "power_outlet", name: "จุดต่อปลั๊ก", icon: "plug" },
  { key: "phone_signal", name: "สัญญาณโทรศัพท์", icon: "signal" },
  { key: "car_access", name: "รถเก๋งเข้าได้", icon: "car" },
  { key: "pet_friendly", name: "พาสัตว์เลี้ยงได้", icon: "paw" },
  { key: "beginner_friendly", name: "เหมาะกับมือใหม่", icon: "sparkles" },
  { key: "family_friendly", name: "เหมาะกับครอบครัว", icon: "users" },
  { key: "riverside", name: "ริมน้ำ", icon: "waves" },
  { key: "mountain_view", name: "วิวภูเขา", icon: "mountain" },
  { key: "cabin", name: "มีบ้านพัก", icon: "home" },
];

type Seed = {
  name: string;
  slug: string;
  province: string;
  district: string;
  region: string;
  lat: number;
  lng: number;
  priceMin: number;
  priceMax: number;
  googleRating: number;
  googleCount: number;
  memberRating: number;
  memberCount: number;
  verified: boolean;
  cover: string;
  amenities: string[];
  description: string;
};

const CAMPSITES: Seed[] = [
  {
    name: "ลานกางเต็นท์ผาชะนะได", slug: "pha-chana-dai", province: "อุบลราชธานี", district: "โขงเจียม",
    region: "northeast", lat: 15.6042, lng: 105.5031, priceMin: 30, priceMax: 90,
    googleRating: 4.6, googleCount: 1280, memberRating: 4.7, memberCount: 42, verified: true,
    cover: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
    amenities: ["toilet", "mountain_view", "car_access", "beginner_friendly"],
    description: "จุดชมพระอาทิตย์ขึ้นแห่งแรกของสยาม ลานกว้างริมหน้าผา อากาศเย็นสบายตลอดปี",
  },
  {
    name: "ดอยเสมอดาว", slug: "doi-samer-dao", province: "น่าน", district: "นาน้อย",
    region: "north", lat: 18.3167, lng: 100.7333, priceMin: 30, priceMax: 60,
    googleRating: 4.7, googleCount: 3400, memberRating: 4.8, memberCount: 87, verified: true,
    cover: "https://images.unsplash.com/photo-1537565266759-34bbc16b62af?w=800",
    amenities: ["toilet", "shower", "mountain_view", "car_access", "family_friendly"],
    description: "ทะเลหมอกระดับตำนาน นอนดูดาวเต็มฟ้า วิว 360 องศา",
  },
  {
    name: "ลานกางเต็นท์เขาแหลม", slug: "khao-laem-camp", province: "กาญจนบุรี", district: "ทองผาภูมิ",
    region: "west", lat: 14.7833, lng: 98.55, priceMin: 50, priceMax: 150,
    googleRating: 4.4, googleCount: 920, memberRating: 4.5, memberCount: 31, verified: false,
    cover: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800",
    amenities: ["toilet", "riverside", "car_access", "pet_friendly", "electricity"],
    description: "กางเต็นท์ริมอ่างเก็บน้ำเขาแหลม วิวน้ำกว้างสุดลูกหูลูกตา เล่นน้ำได้",
  },
  {
    name: "จุดกางเต็นท์ภูกระดึง", slug: "phu-kradueng", province: "เลย", district: "ภูกระดึง",
    region: "northeast", lat: 16.8667, lng: 101.85, priceMin: 30, priceMax: 80,
    googleRating: 4.8, googleCount: 5600, memberRating: 4.6, memberCount: 120, verified: true,
    cover: "https://images.unsplash.com/photo-1496545672447-f699b503d270?w=800",
    amenities: ["toilet", "shower", "mountain_view", "phone_signal"],
    description: "หลังคาแห่งอีสาน เดินขึ้นเขาสู่ลานสนกว้าง อากาศหนาวจัดในฤดูหนาว",
  },
  {
    name: "ลานกางเต็นท์ปางอุ๋ง", slug: "pang-ung", province: "แม่ฮ่องสอน", district: "เมือง",
    region: "north", lat: 18.9167, lng: 97.8833, priceMin: 60, priceMax: 200,
    googleRating: 4.5, googleCount: 2100, memberRating: 4.6, memberCount: 64, verified: true,
    cover: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800",
    amenities: ["toilet", "shower", "riverside", "car_access", "cabin", "family_friendly"],
    description: "สวิตเซอร์แลนด์เมืองไทย ทะเลสาบล้อมด้วยป่าสน หมอกลอยยามเช้า",
  },
  {
    name: "วังจันทร์แคมป์", slug: "wang-chan-camp", province: "นครราชสีมา", district: "วังน้ำเขียว",
    region: "northeast", lat: 14.4167, lng: 101.85, priceMin: 100, priceMax: 350,
    googleRating: 4.3, googleCount: 640, memberRating: 4.4, memberCount: 28, verified: false,
    cover: "https://images.unsplash.com/photo-1444090542259-0af8fa96557e?w=800",
    amenities: ["toilet", "shower", "electricity", "power_outlet", "car_access", "pet_friendly", "beginner_friendly", "phone_signal"],
    description: "ใกล้กรุงเทพ ขับ 2 ชม. ถึง สิ่งอำนวยความสะดวกครบ เหมาะมือใหม่",
  },
  {
    name: "ลานกางเต็นท์เขาค้อ", slug: "khao-kho-camp", province: "เพชรบูรณ์", district: "เขาค้อ",
    region: "north", lat: 16.6667, lng: 100.9833, priceMin: 80, priceMax: 250,
    googleRating: 4.5, googleCount: 1800, memberRating: 4.5, memberCount: 55, verified: true,
    cover: "https://images.unsplash.com/photo-1525811902-f2342640856e?w=800",
    amenities: ["toilet", "shower", "electricity", "mountain_view", "car_access", "cabin", "family_friendly", "phone_signal"],
    description: "ทะเลหมอกเขาค้อ ลานกว้างวิวภูเขาสลับซับซ้อน ขับรถเก๋งถึงได้สบาย",
  },
  {
    name: "หาดเจ้าหลาว แคมป์ปิ้ง", slug: "chao-lao-beach-camp", province: "จันทบุรี", district: "ท่าใหม่",
    region: "east", lat: 12.55, lng: 101.95, priceMin: 100, priceMax: 300,
    googleRating: 4.2, googleCount: 410, memberRating: 4.3, memberCount: 19, verified: false,
    cover: "https://images.unsplash.com/photo-1471115853179-bb1d604434e0?w=800",
    amenities: ["toilet", "shower", "electricity", "power_outlet", "car_access", "pet_friendly", "beginner_friendly"],
    description: "กางเต็นท์ริมทะเลฟังเสียงคลื่น พระอาทิตย์ขึ้นเหนืออ่าว",
  },
  {
    name: "ลานกางเต็นท์ผากลั้นใจ", slug: "pha-klan-jai", province: "บุรีรัมย์", district: "เฉลิมพระเกียรติ",
    region: "northeast", lat: 14.5167, lng: 102.95, priceMin: 30, priceMax: 60,
    googleRating: 4.4, googleCount: 350, memberRating: 4.5, memberCount: 14, verified: false,
    cover: "https://images.unsplash.com/photo-1455496231601-e3f0e3a13d09?w=800",
    amenities: ["toilet", "mountain_view", "car_access"],
    description: "หน้าผาชมวิวเขาพระวิหาร เงียบสงบ เหมาะสายธรรมชาติ",
  },
  {
    name: "สวนผึ้ง ริเวอร์ แคมป์", slug: "suan-phueng-river-camp", province: "ราชบุรี", district: "สวนผึ้ง",
    region: "west", lat: 13.55, lng: 99.3333, priceMin: 150, priceMax: 500,
    googleRating: 4.6, googleCount: 1120, memberRating: 4.7, memberCount: 73, verified: true,
    cover: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800",
    amenities: ["toilet", "shower", "electricity", "power_outlet", "riverside", "car_access", "pet_friendly", "beginner_friendly", "family_friendly", "cabin", "phone_signal"],
    description: "แคมป์ริมธารน้ำ ใกล้กรุงเทพ บรรยากาศชิล สิ่งอำนวยความสะดวกครบครัน",
  },
  {
    name: "ลานกางเต็นท์ดอยอินทนนท์", slug: "doi-inthanon-camp", province: "เชียงใหม่", district: "จอมทอง",
    region: "north", lat: 18.5887, lng: 98.4867, priceMin: 60, priceMax: 90,
    googleRating: 4.7, googleCount: 4200, memberRating: 4.7, memberCount: 96, verified: true,
    cover: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=800",
    amenities: ["toilet", "shower", "mountain_view", "car_access", "family_friendly", "phone_signal"],
    description: "ยอดดอยสูงสุดในไทย หนาวสุดขั้ว ลานสนใกล้ยอดดอย",
  },
  {
    name: "เกาะช้าง ฮิลล์ไซด์ แคมป์", slug: "koh-chang-hillside-camp", province: "ตราด", district: "เกาะช้าง",
    region: "east", lat: 12.05, lng: 102.3333, priceMin: 200, priceMax: 600,
    googleRating: 4.4, googleCount: 530, memberRating: 4.5, memberCount: 22, verified: false,
    cover: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800",
    amenities: ["toilet", "shower", "electricity", "riverside", "pet_friendly", "cabin"],
    description: "แคมป์บนเนินวิวทะเลเกาะช้าง พระอาทิตย์ตกสุดอลังการ",
  },
];

async function main() {
  console.log("🌲 Seeding CampThai...");

  // admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@campthai.app" },
    update: {},
    create: {
      name: "CampThai Admin",
      email: "admin@campthai.app",
      // bcrypt hash of "campthai123" — replace in real env
      passwordHash: "$2a$10$abcdefghijklmnopqrstuv",
      role: "admin",
    },
  });

  // amenities
  const amenityMap = new Map<string, string>();
  for (const a of AMENITIES) {
    const rec = await prisma.amenity.upsert({
      where: { key: a.key },
      update: { name: a.name, icon: a.icon },
      create: a,
    });
    amenityMap.set(a.key, rec.id);
  }

  for (const c of CAMPSITES) {
    const site = await prisma.campsite.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        province: c.province,
        district: c.district,
        region: c.region,
        latitude: c.lat,
        longitude: c.lng,
        priceMin: c.priceMin,
        priceMax: c.priceMax,
        googleRating: c.googleRating,
        googleUserRatingCount: c.googleCount,
        memberRating: c.memberRating,
        memberReviewCount: c.memberCount,
        status: CampsiteStatus.published,
        isVerified: c.verified,
        locationAccuracyStatus: c.verified
          ? LocationAccuracy.admin_verified
          : LocationAccuracy.google_verified,
        createdBy: admin.id,
        photos: {
          create: [{ imageUrl: c.cover, caption: c.name, sortOrder: 0, source: "admin" }],
        },
        amenities: {
          create: c.amenities.map((key) => ({ amenityId: amenityMap.get(key)! })),
        },
      },
    });
    console.log(`  ✓ ${site.name}`);
  }

  console.log("✅ Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
