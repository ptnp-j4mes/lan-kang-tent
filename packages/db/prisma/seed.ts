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

  const SEED_HASH = "$2b$10$4lxj3.gXRf0XJW4V..82JOh3uLwClMH0c007vWrt0MnhB9Euriuca"; // bcrypt "campthai123"

  // admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@campthai.app" },
    update: { passwordHash: SEED_HASH },
    create: {
      name: "CampThai Admin",
      email: "admin@campthai.app",
      passwordHash: SEED_HASH,
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

  // ---- home banner (default) ----
  if ((await prisma.homeBanner.count()) === 0) {
    await prisma.homeBanner.create({
      data: {
        title: "กางเต็นท์ที่ไหนดี? เปิดแผนที่ แล้วออกเดินทาง",
        subtitle: "ค้นหาลานกางเต็นท์จากทุกภาคของไทย กรองตามวิว ราคา สิ่งอำนวยความสะดวก อ่านรีวิวจริงจากนักแคมป์",
        imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80",
        ctaLabel: "เปิดแผนที่ลานกางเต็นท์",
        ctaHref: "/map",
        isActive: true,
      },
    });
    console.log("  ✓ default home banner");
  }

  // ---- sample articles (SEO) ----
  if ((await prisma.article.count()) === 0) {
    await prisma.article.createMany({
      data: [
        {
          slug: "beginner-camping-checklist",
          title: "เช็กลิสต์มือใหม่หัดกางเต็นท์ ครั้งแรกต้องเตรียมอะไรบ้าง",
          excerpt: "รวมของจำเป็นสำหรับทริปแคมป์ครั้งแรก ตั้งแต่เต็นท์ ถุงนอน ไปจนถึงของกินและความปลอดภัย",
          content: "การไปแคมป์ครั้งแรกอาจดูน่ากังวล แต่ถ้าเตรียมตัวดีก็สนุกได้ไม่ยาก\n\n1. เต็นท์และอุปกรณ์นอน — เลือกเต็นท์ตามจำนวนคน เผื่อพื้นที่เก็บของ ถุงนอนเลือกตามอุณหภูมิปลายทาง\n\n2. แสงสว่าง — ไฟฉายคาดหัวสะดวกที่สุด พกแบตสำรอง\n\n3. อาหารและน้ำ — เตรียมน้ำให้พอ อาหารทำง่าย เก็บขยะกลับทุกครั้ง\n\n4. ความปลอดภัย — เช็กพยากรณ์อากาศ บอกคนที่บ้านว่าไปไหน",
          coverImageUrl: "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=1000&q=75",
          status: "published",
          tags: ["มือใหม่", "เช็กลิสต์"],
          metaTitle: "เช็กลิสต์มือใหม่หัดกางเต็นท์ — เตรียมอะไรบ้างก่อนไปแคมป์",
          metaDescription: "คู่มือเตรียมตัวไปแคมป์ครั้งแรกสำหรับมือใหม่ ครบทั้งเต็นท์ ถุงนอน อาหาร และความปลอดภัย",
          publishedAt: new Date(),
        },
        {
          slug: "best-camping-near-bangkok",
          title: "5 ลานกางเต็นท์ใกล้กรุงเทพ ขับรถไม่ไกล ไปเช้าเย็นกลับได้",
          excerpt: "รวมลานกางเต็นท์ที่ขับจากกรุงเทพไม่เกิน 3 ชั่วโมง เหมาะกับทริปสุดสัปดาห์",
          content: "ไม่มีเวลาเยอะแต่อยากไปแคมป์? นี่คือลานใกล้กรุงเทพที่ไปง่าย\n\nหลายแห่งในภาคตะวันตกและอีสานตอนล่างขับถึงได้ในไม่กี่ชั่วโมง รถเก๋งเข้าได้ สิ่งอำนวยความสะดวกครบ เหมาะกับมือใหม่และครอบครัว\n\nเปิดแผนที่ในเว็บเพื่อกรองตามระยะทางจากตำแหน่งของคุณได้เลย",
          coverImageUrl: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1000&q=75",
          status: "published",
          tags: ["ใกล้กรุงเทพ", "สุดสัปดาห์"],
          metaTitle: "5 ลานกางเต็นท์ใกล้กรุงเทพ ขับรถไม่ไกล",
          metaDescription: "แนะนำลานกางเต็นท์ใกล้กรุงเทพ ขับไม่เกิน 3 ชม. เหมาะทริปสุดสัปดาห์ รถเก๋งเข้าได้",
          publishedAt: new Date(),
        },
      ],
    });
    console.log("  ✓ sample articles");
  }

  const allCamps = await prisma.campsite.findMany({ select: { id: true, slug: true } });
  const bySlug = new Map(allCamps.map((c) => [c.slug, c.id]));

  // ---- owner users + camp profiles ----
  const OWNERS = [
    {
      email: "somchai@campthai.app",
      name: "สมชาย ลานเย็น",
      phone: "081-111-2233",
      line: "@somchai_camp",
      facebook: "https://facebook.com/somchaicamp",
      bio: "เปิดลานมา 5 ปี รักการแคมป์ตั้งแต่เด็ก ยินดีต้อนรับทุกคนครับ",
      campsiteSlugs: ["pha-chana-dai", "doi-samer-dao"],
    },
    {
      email: "pannee@campthai.app",
      name: "พรรณี แคมป์ไทย",
      phone: "089-222-3344",
      line: "@pannee_camp",
      facebook: "https://facebook.com/panneecamp",
      bio: "ดูแลลานกางเต็นท์ภาคเหนือ บรรยากาศดี อากาศเย็น ยินดีต้อนรับค่ะ",
      campsiteSlugs: ["pang-ung", "doi-inthanon-camp"],
    },
    {
      email: "wichai@campthai.app",
      name: "วิชัย แคมป์กลาง",
      phone: "083-333-4455",
      line: "@wichai_camp",
      facebook: "https://facebook.com/wichaicamp",
      bio: "ลานใกล้กรุง สะดวกสบาย พร้อมทุกสิ่งอำนวยความสะดวก ยินดีตอบทุกคำถามครับ",
      campsiteSlugs: ["suan-phueng-river-camp", "wang-chan-camp"],
    },
  ];

  for (const o of OWNERS) {
    const ownerUser = await prisma.user.upsert({
      where: { email: o.email },
      update: { passwordHash: SEED_HASH },
      create: {
        name: o.name,
        email: o.email,
        passwordHash: SEED_HASH,
        role: "owner",
      },
    });

    for (const slug of o.campsiteSlugs) {
      const campId = bySlug.get(slug);
      if (!campId) continue;

      // link owner to campsite
      await prisma.campsite.update({
        where: { id: campId },
        data: { ownerUserId: ownerUser.id },
      });

      // camp profile (owner-managed layer)
      await prisma.campProfile.upsert({
        where: { campsiteId: campId },
        update: {},
        create: {
          campsiteId: campId,
          ownerUserId: ownerUser.id,
          displayName: o.name,
          bio: o.bio,
          contactPhone: o.phone,
          contactLine: o.line,
          contactFacebook: o.facebook,
          profileStatus: "published",
          completenessScore: 80,
          verifiedAt: new Date(),
        },
      });

      // camp owner member record
      await prisma.campOwnerMember.upsert({
        where: { campsiteId_userId: { campsiteId: campId, userId: ownerUser.id } },
        update: {},
        create: {
          campsiteId: campId,
          userId: ownerUser.id,
          role: "owner",
          status: "active",
        },
      });

      // calendar events (upcoming open + one closed)
      const existing = await prisma.campCalendarEvent.count({ where: { campsiteId: campId } });
      if (existing === 0) {
        await prisma.campCalendarEvent.createMany({
          data: [
            {
              campsiteId: campId,
              eventType: "open",
              startDate: day(1),
              endDate: day(30),
              title: "เปิดรับนักแคมป์",
              note: "ว่างทุกวัน สามารถสอบถามได้ก่อนมาเสมอ",
              isPublic: true,
              createdBy: ownerUser.id,
            },
            {
              campsiteId: campId,
              eventType: "fully_booked",
              startDate: day(14),
              endDate: day(15),
              title: "เต็มแล้ว — วันหยุดยาว",
              note: "กรุณาจองล่วงหน้าช่วงวันหยุด",
              isPublic: true,
              createdBy: ownerUser.id,
            },
          ],
        });
      }
    }
    console.log(`  ✓ owner: ${ownerUser.email} (${o.campsiteSlugs.join(", ")})`);
  }

  // ---- demo member + dashboard data ----
  const demoMember = await prisma.user.upsert({
    where: { email: "member@campthai.app" },
    update: { passwordHash: SEED_HASH },
    create: {
      name: "นักแคมป์ตัวอย่าง",
      email: "member@campthai.app",
      passwordHash: SEED_HASH,
      role: "member",
    },
  });

  // seed dashboard data for the demo member + any member who has none yet (e.g. self-registered)
  const members = await prisma.user.findMany({ where: { role: "member" }, select: { id: true } });
  for (const m of members) {
    const has = await prisma.favoriteCampsite.count({ where: { userId: m.id } });
    if (has === 0) await seedDashboard(m.id, bySlug);
  }
  console.log(`  ✓ dashboard demo data (${members.length} member(s), demo: ${demoMember.email})`);

  console.log("✅ Done.");
}

// relative day at UTC midnight (DateOnly columns)
const day = (offset: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

async function seedDashboard(userId: string, bySlug: Map<string, string>) {
  const id = (slug: string) => bySlug.get(slug);

  // favorites
  const favSlugs = ["doi-samer-dao", "phu-kradueng", "doi-inthanon-camp", "suan-phueng-river-camp"];
  await prisma.favoriteCampsite.createMany({
    data: favSlugs.filter((s) => id(s)).map((s, i) => ({ userId, campsiteId: id(s)!, source: i % 2 ? "card" : "map_marker" })),
    skipDuplicates: true,
  });

  // camping plans (varied status + dates → calendar)
  const plan1 = await prisma.userCampingPlan.create({
    data: {
      userId, campsiteId: id("doi-inthanon-camp")!,
      startDate: day(7), endDate: day(9), status: "planning", partySize: 4,
      note: "ไปดูทะเลหมอกกับเพื่อน เตรียมถุงนอน -5°C",
      checklistJson: [
        { t: "เต็นท์ 3-4 คน", done: true },
        { t: "ถุงนอนกันหนาว", done: true },
        { t: "เตาแก๊ส + หม้อ", done: false },
        { t: "ไฟฉายคาดหัว", done: false },
      ],
    },
  });
  await prisma.userCampingPlan.create({
    data: {
      userId, campsiteId: id("phu-kradueng")!,
      startDate: day(21), endDate: day(23), status: "interested", partySize: 2,
      note: "ทริปสองคน ลองเดินขึ้นเขา",
    },
  });
  await prisma.userCampingPlan.create({
    data: {
      userId, campsiteId: id("suan-phueng-river-camp")!,
      startDate: day(35), endDate: day(36), status: "contacted", partySize: 6,
      note: "ปาร์ตี้ริมน้ำกับเพื่อนๆ",
    },
  });
  await prisma.userCampingPlan.create({
    data: {
      userId, campsiteId: id("doi-samer-dao")!,
      startDate: day(-21), endDate: day(-19), status: "visited", partySize: 3,
      note: "ทริปครอบครัว จบสวย ทะเลหมอกเป๊ะ",
    },
  });

  // booking inquiries (chat threads)
  await prisma.bookingInquiry.create({
    data: {
      userId, campsiteId: id("doi-inthanon-camp")!, campingPlanId: plan1.id,
      startDate: day(7), endDate: day(9), partySize: 4, tentCount: 2, carCount: 1, hasPet: false,
      contactPhone: "081-234-5678",
      message: "สอบถามวันที่ 7-9 ว่างไหมครับ มากัน 4 คน 2 เต็นท์ ขับรถเก๋งเข้าได้ไหม",
      status: "owner_replied",
      ownerReply: "ว่างครับ มีลานริมธารให้เลือก รถเก๋งเข้าถึงลานเลย แนะนำมาก่อนบ่ายจะได้จุดสวยๆ มีค่าบริการ 60 บาท/คน",
      repliedAt: day(-1),
    },
  });
  await prisma.bookingInquiry.create({
    data: {
      userId, campsiteId: id("suan-phueng-river-camp")!,
      startDate: day(35), endDate: day(36), partySize: 6, tentCount: 3, hasPet: true,
      message: "พาน้องหมามาด้วยได้ไหมครับ มากัน 6 คน 3 เต็นท์",
      status: "sent",
    },
  });

  // notifications
  await prisma.notification.createMany({
    data: [
      { userId, type: "inquiry_replied", title: "เจ้าของลานตอบคำขอแล้ว", message: "ลานกางเต็นท์ดอยอินทนนท์ ยืนยันวันว่างของคุณ", targetType: "inquiry", createdAt: day(-1) },
      { userId, type: "price_drop", title: "ลานโปรดลดราคา", message: "ดอยเสมอดาว ลดเหลือ ฿20/คืน ช่วงวันธรรมดา", createdAt: day(-2) },
      { userId, type: "review_approved", title: "รีวิวของคุณได้รับการอนุมัติ", message: "ขอบคุณที่แบ่งปันประสบการณ์ที่ดอยเสมอดาว", readAt: day(-3), createdAt: day(-4) },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
