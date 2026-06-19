---
tags: [area/frontend, area/design]
---

# Design System

Aesthetic direction: **"Field Guide"** — a national-park field journal meets a modern map app. Warm, analog, topographic. Deliberately *not* generic SaaS. Defined in `app/globals.css` + `tailwind.config.ts`.

## Palette (CSS vars → Tailwind tokens)
| Token | Role | Vibe |
|---|---|---|
| `background` | page | kraft paper (warm off-white) |
| `foreground` | text | dark ink |
| `primary` | brand base | deep pine green |
| `ember` | **CTA accent** | sunset orange |
| `secondary` | surfaces | sand |
| `moss` | success/verified dot | muted green |
| `clay` | tertiary | terracotta |
| `card`, `muted`, `border` | structure | |

Dark mode tokens defined (`.dark`) but light is primary. **Never hardcode hex** — use `bg-ember`, `text-primary`, `border-border`.

## Typography
- **Display** `font-display` = **Chonburi** (characterful Thai serif-ish) — headings.
- **Body** `font-sans` = **Anuphan** (modern Thai geometric sans).
- Both via `next/font/google` with `thai` + `latin` subsets. Thai-first product. See [[Positioning]].

## Texture & depth
- `.grain` — SVG fractal-noise overlay for hero/panels.
- `.topo-divider` — contour-line section break.
- Body background = layered radial washes + faint topographic contour SVG (fixed).
- `.link-underline` — animated ember underline on hover.

## Shape & motion
- Radius: `rounded-xl` / `2xl` / `full`. Shadows: `shadow-field` (resting), `shadow-lift` (raised/hover).
- Load reveals: `animate-fade-up` with staggered inline `animationDelay`. Decorative `animate-sway`.

## Reuse
Buttons: variants `default` (pine), `ember` (CTA), `outline`, `ghost`, `secondary`, `link`. See [[Components]].

## Related
[[Components]] · [[Map Feature]] · [[ADR-002 Map Fallback]]
