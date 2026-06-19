import type { Amenity, CampsiteLight } from "./types";

// Standalone mock data so the web app runs without the API/DB.
// Mirrors packages/db/prisma/seed.ts.

export const MOCK_AMENITIES: Amenity[] = [
  { id: "1", key: "toilet", name: "ห้องน้ำ", icon: "toilet" },
  { id: "2", key: "shower", name: "ห้องอาบน้ำ", icon: "shower" },
  { id: "3", key: "electricity", name: "ไฟฟ้า", icon: "zap" },
  { id: "4", key: "power_outlet", name: "จุดต่อปลั๊ก", icon: "plug" },
  { id: "5", key: "phone_signal", name: "สัญญาณโทรศัพท์", icon: "signal" },
  { id: "6", key: "car_access", name: "รถเก๋งเข้าได้", icon: "car" },
  { id: "7", key: "pet_friendly", name: "พาสัตว์เลี้ยงได้", icon: "paw" },
  { id: "8", key: "beginner_friendly", name: "เหมาะกับมือใหม่", icon: "sparkles" },
  { id: "9", key: "family_friendly", name: "เหมาะกับครอบครัว", icon: "users" },
  { id: "10", key: "riverside", name: "ริมน้ำ", icon: "waves" },
  { id: "11", key: "mountain_view", name: "วิวภูเขา", icon: "mountain" },
  { id: "12", key: "cabin", name: "มีบ้านพัก", icon: "home" },
];

const A = Object.fromEntries(MOCK_AMENITIES.map((a) => [a.key, a]));
const tag = (...keys: string[]) => keys.map((k) => ({ key: k, name: A[k].name }));

type Raw = Omit<CampsiteLight, "tags"> & { region: string; amenities: string[]; description: string };

const RAW: Raw[] = [
  { id: "c1", name: "ลานกางเต็นท์ผาชะนะได", slug: "pha-chana-dai", province: "อุบลราชธานี", district: "โขงเจียม", region: "northeast", latitude: 15.6042, longitude: 105.5031, priceMin: 30, googleRating: 4.6, memberRating: 4.7, isVerified: true, coverImageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800", amenities: ["toilet", "mountain_view", "car_access", "beginner_friendly"], description: "จุดชมพระอาทิตย์ขึ้นแห่งแรกของสยาม ลานกว้างริมหน้าผา" },
  { id: "c2", name: "ดอยเสมอดาว", slug: "doi-samer-dao", province: "น่าน", district: "นาน้อย", region: "north", latitude: 18.3167, longitude: 100.7333, priceMin: 30, googleRating: 4.7, memberRating: 4.8, isVerified: true, coverImageUrl: "https://images.unsplash.com/photo-1537565266759-34bbc16b62af?w=800", amenities: ["toilet", "shower", "mountain_view", "car_access", "family_friendly"], description: "ทะเลหมอกระดับตำนาน นอนดูดาวเต็มฟ้า วิว 360 องศา" },
  { id: "c3", name: "ลานกางเต็นท์เขาแหลม", slug: "khao-laem-camp", province: "กาญจนบุรี", district: "ทองผาภูมิ", region: "west", latitude: 14.7833, longitude: 98.55, priceMin: 50, googleRating: 4.4, memberRating: 4.5, isVerified: false, coverImageUrl: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800", amenities: ["toilet", "riverside", "car_access", "pet_friendly", "electricity"], description: "กางเต็นท์ริมอ่างเก็บน้ำเขาแหลม เล่นน้ำได้" },
  { id: "c4", name: "จุดกางเต็นท์ภูกระดึง", slug: "phu-kradueng", province: "เลย", district: "ภูกระดึง", region: "northeast", latitude: 16.8667, longitude: 101.85, priceMin: 30, googleRating: 4.8, memberRating: 4.6, isVerified: true, coverImageUrl: "https://images.unsplash.com/photo-1496545672447-f699b503d270?w=800", amenities: ["toilet", "shower", "mountain_view", "phone_signal"], description: "หลังคาแห่งอีสาน ลานสนกว้าง อากาศหนาวจัด" },
  { id: "c5", name: "ลานกางเต็นท์ปางอุ๋ง", slug: "pang-ung", province: "แม่ฮ่องสอน", district: "เมือง", region: "north", latitude: 18.9167, longitude: 97.8833, priceMin: 60, googleRating: 4.5, memberRating: 4.6, isVerified: true, coverImageUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800", amenities: ["toilet", "shower", "riverside", "car_access", "cabin", "family_friendly"], description: "สวิตเซอร์แลนด์เมืองไทย ทะเลสาบล้อมป่าสน" },
  { id: "c6", name: "วังจันทร์แคมป์", slug: "wang-chan-camp", province: "นครราชสีมา", district: "วังน้ำเขียว", region: "northeast", latitude: 14.4167, longitude: 101.85, priceMin: 100, googleRating: 4.3, memberRating: 4.4, isVerified: false, coverImageUrl: "https://images.unsplash.com/photo-1444090542259-0af8fa96557e?w=800", amenities: ["toilet", "shower", "electricity", "power_outlet", "car_access", "pet_friendly", "beginner_friendly", "phone_signal"], description: "ใกล้กรุงเทพ ขับ 2 ชม. สิ่งอำนวยความสะดวกครบ" },
  { id: "c7", name: "ลานกางเต็นท์เขาค้อ", slug: "khao-kho-camp", province: "เพชรบูรณ์", district: "เขาค้อ", region: "north", latitude: 16.6667, longitude: 100.9833, priceMin: 80, googleRating: 4.5, memberRating: 4.5, isVerified: true, coverImageUrl: "https://images.unsplash.com/photo-1525811902-f2342640856e?w=800", amenities: ["toilet", "shower", "electricity", "mountain_view", "car_access", "cabin", "family_friendly", "phone_signal"], description: "ทะเลหมอกเขาค้อ วิวภูเขาสลับซับซ้อน" },
  { id: "c8", name: "หาดเจ้าหลาว แคมป์ปิ้ง", slug: "chao-lao-beach-camp", province: "จันทบุรี", district: "ท่าใหม่", region: "east", latitude: 12.55, longitude: 101.95, priceMin: 100, googleRating: 4.2, memberRating: 4.3, isVerified: false, coverImageUrl: "https://images.unsplash.com/photo-1471115853179-bb1d604434e0?w=800", amenities: ["toilet", "shower", "electricity", "power_outlet", "car_access", "pet_friendly", "beginner_friendly"], description: "กางเต็นท์ริมทะเล ฟังเสียงคลื่น" },
  { id: "c9", name: "ลานกางเต็นท์ผากลั้นใจ", slug: "pha-klan-jai", province: "บุรีรัมย์", district: "เฉลิมพระเกียรติ", region: "northeast", latitude: 14.5167, longitude: 102.95, priceMin: 30, googleRating: 4.4, memberRating: 4.5, isVerified: false, coverImageUrl: "https://images.unsplash.com/photo-1455496231601-e3f0e3a13d09?w=800", amenities: ["toilet", "mountain_view", "car_access"], description: "หน้าผาชมวิวเขาพระวิหาร เงียบสงบ" },
  { id: "c10", name: "สวนผึ้ง ริเวอร์ แคมป์", slug: "suan-phueng-river-camp", province: "ราชบุรี", district: "สวนผึ้ง", region: "west", latitude: 13.55, longitude: 99.3333, priceMin: 150, googleRating: 4.6, memberRating: 4.7, isVerified: true, coverImageUrl: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800", amenities: ["toilet", "shower", "electricity", "power_outlet", "riverside", "car_access", "pet_friendly", "beginner_friendly", "family_friendly", "cabin", "phone_signal"], description: "แคมป์ริมธารน้ำ ใกล้กรุงเทพ บรรยากาศชิล" },
  { id: "c11", name: "ลานกางเต็นท์ดอยอินทนนท์", slug: "doi-inthanon-camp", province: "เชียงใหม่", district: "จอมทอง", region: "north", latitude: 18.5887, longitude: 98.4867, priceMin: 60, googleRating: 4.7, memberRating: 4.7, isVerified: true, coverImageUrl: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=800", amenities: ["toilet", "shower", "mountain_view", "car_access", "family_friendly", "phone_signal"], description: "ยอดดอยสูงสุดในไทย หนาวสุดขั้ว" },
  { id: "c12", name: "เกาะช้าง ฮิลล์ไซด์ แคมป์", slug: "koh-chang-hillside-camp", province: "ตราด", district: "เกาะช้าง", region: "east", latitude: 12.05, longitude: 102.3333, priceMin: 200, googleRating: 4.4, memberRating: 4.5, isVerified: false, coverImageUrl: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800", amenities: ["toilet", "shower", "electricity", "riverside", "pet_friendly", "cabin"], description: "แคมป์บนเนินวิวทะเลเกาะช้าง พระอาทิตย์ตกอลังการ" },
];

export const MOCK_CAMPSITES: (CampsiteLight & { region: string; amenities: string[]; description: string })[] =
  RAW.map((r) => ({ ...r, tags: tag(...r.amenities) }));

export function mockProvinces() {
  const m = new Map<string, { province: string; region: string; count: number }>();
  for (const c of MOCK_CAMPSITES) {
    const cur = m.get(c.province) ?? { province: c.province, region: c.region, count: 0 };
    cur.count++;
    m.set(c.province, cur);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}
