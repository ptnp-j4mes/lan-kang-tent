---
tags: [area/product, status/mvp]
---

# Acceptance Criteria

Definition of done for MVP. ✅ = met in current build (on mock data; ⚙️ where real-API/UI wiring remains).

- [x] เปิด `/map` เห็นแผนที่ไทย + marker ลานกางเต็นท์ → [[Map Feature]]
- [x] marker = ลานกางเต็นท์เท่านั้น (single type)
- [x] marker cluster เมื่อ zoom out (Google mode) / pins in fallback → [[ADR-002 Map Fallback]]
- [x] filter เปลี่ยน → marker + list update พร้อมกัน → [[Data Flow]]
- [x] คลิก marker → preview card → [[Components|PreviewCard]]
- [x] คลิก preview → ไปหน้า detail
- [x] detail มี single map marker + ปุ่มเปิด Google Maps
- [x] แยก Google review กับ member review ชัดเจน → [[Google Places Integration]]
- [x] ทุก campsite published มี lat/lng (enforced 422) → [[Schema]]
- [x] mobile-first → [[Pages & Routes]]
- [⚙️] ผู้ใช้สมัคร + เขียนรีวิวได้ — API ✅, web form wiring pending
- [⚙️] Admin เพิ่มลาน + กำหนดพิกัดผ่าน map picker — API ✅, UI pending
- [⚙️] Admin ผูก Google Place ID + sync rating/review — API ✅, UI pending

See remaining work in [[MVP Scope#Next to close MVP]].

## Related
[[MVP Scope]] · [[Roadmap]]
