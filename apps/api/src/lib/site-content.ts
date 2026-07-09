// Canonical registry of admin-editable page text. Single source of truth for
// the backoffice content editor (field labels + defaults). The public web keeps
// its own inline copy of these defaults as an offline fallback — keep keys in
// sync with apps/web/app/page.tsx (and other wired pages).
//
// ponytail: flat string fields per page, edited as a JSON blob. Enough for copy.
// Upgrade to a block CMS only if pages need repeatable/structured content.

export type ContentField = { key: string; label: string; default: string; multiline?: boolean };
export type ContentPage = { key: string; label: string; fields: ContentField[] };

export const CONTENT_PAGES: ContentPage[] = [
  {
    key: "home",
    label: "หน้าแรก",
    fields: [
      { key: "popularEyebrow", label: "ป้ายหมวด — ยอดนิยม", default: "มาแรง" },
      { key: "popularTitle", label: "หัวข้อ — ยอดนิยม", default: "ลานกางเต็นท์ยอดนิยม" },
      { key: "topRatedEyebrow", label: "ป้ายหมวด — คะแนนสูง", default: "คะแนนสูง" },
      { key: "topRatedTitle", label: "หัวข้อ — คะแนนสูง", default: "ลานกางเต็นท์คะแนนสูง" },
      { key: "mapEyebrow", label: "แผนที่ — ป้ายหมวด", default: "แผนที่ทั่วไทย" },
      { key: "mapTitle", label: "แผนที่ — หัวข้อ", default: "ลานกางเต็นท์ทั้งประเทศ ในแผนที่เดียว" },
      {
        key: "mapBody",
        label: "แผนที่ — คำอธิบาย",
        default:
          "ซูม เลื่อน คลิกหมุดเต็นท์ เปิดการ์ดดูราคาและรีวิวทันที กรองตามสิ่งที่คุณต้องการ หรือใช้โหมด “ใกล้ฉัน” หาลานใกล้ตัว",
        multiline: true,
      },
      { key: "mapCta", label: "แผนที่ — ปุ่ม", default: "เปิดแผนที่ลานกางเต็นท์" },
      { key: "articlesEyebrow", label: "บทความ — ป้ายหมวด", default: "บทความ & ข่าว" },
      { key: "articlesTitle", label: "บทความ — หัวข้อ", default: "เรื่องน่ารู้ก่อนออกแคมป์" },
      { key: "reviewsEyebrow", label: "รีวิว — ป้ายหมวด", default: "เสียงจริงจากสนาม" },
      { key: "reviewsTitle", label: "รีวิว — หัวข้อ", default: "รีวิวล่าสุดจากนักแคมป์" },
    ],
  },
];

export const pageDefaults = (page: ContentPage): Record<string, string> =>
  Object.fromEntries(page.fields.map((f) => [f.key, f.default]));

export const findPage = (key: string) => CONTENT_PAGES.find((p) => p.key === key);
