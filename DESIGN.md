# DESIGN.md — ClickUp™ Style Reference

> Vibrant productivity hub: a dynamic workspace with energetic highlights.

**이 문서는 서천군청 정책관리 ERP의 UI/디자인 단일 기준(Single Source of Truth)이다.**
모든 화면·컴포넌트는 본 문서의 토큰·규칙을 준수한다. 구현은 **shadcn/ui + Tailwind CSS v4**
기반이며, 아래 토큰은 `src/app/globals.css`의 `@theme`에 그대로 매핑한다.

- Theme: **light**
- 기본 폰트: 헤딩 = Plus Jakarta Sans, 본문 = Inter, 코드/타임스탬프 = Sometype Mono
- 밀도(density): **compact** (base unit 4px)

ClickUp's interface channels a vibrant productivity hub atmosphere: an inviting white canvas
contrasts with deep charcoal text, punctuated by vivid accents of violet and electric blue.
Its visual identity relies on dynamic, lightweight UI elements, thin borders, and soft shadows,
creating a sense of clarity and speed. Typography is confident and modern, leveraging condensed
sans-serifs for headings and a highly legible sans-serif for body text, maintaining a tight
visual rhythm. Gradients are strategically used for subtle flair and to highlight interactive
states, reinforcing an energetic, forward-looking aesthetic.

---

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Canvas White | `#ffffff` | `--color-canvas-white` | Page backgrounds, card surfaces, ghost button backgrounds, default component fills. |
| Midnight Charcoal | `#292d34` | `--color-midnight-charcoal` | Primary body text, active state indicators, strong borders. |
| Dark Onyx | `#202023` / `linear-gradient(97deg, rgb(32,32,32) 43.17%, rgb(143,143,143) 110.86%)` | `--color-dark-onyx` / `--gradient-dark-onyx` | Backgrounds for prominent (filled) buttons, card borders, primary interactive elements. |
| Ash Gray | `#e8e8e8` | `--color-ash-gray` | Subtle borders, dividers, disabled states, ghost button borders. |
| Smoke Gray | `#b3b3b3` | `--color-smoke-gray` | Muted text, secondary icons, subtle outlines. |
| Hint of Sky | `#e9ebf0` | `--color-hint-of-sky` | Subtle background tint for alternating content sections. |
| Shadow Tint Blue | `#edf6fd` | `--color-shadow-tint-blue` | Light background for interactive/focus states. |
| Deep Violet | `#7b68ee` | `--color-deep-violet` | Interactive link text, image accents, decorative strokes — core brand color. |
| Electric Blue | `#0091ff` / `conic-gradient(...)` | `--color-electric-blue` / `--gradient-electric-blue` | Outlined action borders, linked labels, lightweight emphasis. **Do not promote to primary CTA.** |
| Rich Plum | `#514b81` | `--color-rich-plum` | Background details, subtle decorative elements. |
| Vivid Purple | `#6647f0` | `--color-vivid-purple` | Violet outline accent for tags, dividers, focused edges. **Do not promote to primary CTA.** |
| Deep Space Charcoal | `#090c1d` | `--color-deep-space-charcoal` | Main headings, high-contrast text. |
| Warm Fade Gradient | `linear-gradient(rgba(246,233,232,0), rgba(255,91,54,0.23))` | `--gradient-warm-fade-gradient` | Subtle accent / background texture. |

---

## Tokens — Typography

### Plus Jakarta Sans · `--font-plus-jakarta-sans`
Headings and prominent UI elements. Slightly condensed; impactful with subtle negative
letter-spacing at larger sizes. Substitute: `system-ui, sans-serif`.
- Weights: 400, 500, 650, 700, 800
- Sizes: 14, 16, 26, 34, 40, 42, 48, 52, 60, 76 (px)
- Line height: 1.05–1.50 · Letter spacing: −0.05em@76 / −0.04em@60 / −0.035em@52 / −0.011em@48
- OpenType: `"calt" 0`

### Inter · `--font-inter`
Body text, UI labels, captions. High legibility, variable font. Substitute: `system-ui, sans-serif`.
- Weights: 400, 500, 600, 650, 700
- Sizes: 8, 9, 12, 13, 14, 15, 16, 17, 18, 19 (px)
- Line height: 1.00–1.50 · Letter spacing: −0.04em@19 … −0.011em@14
- OpenType: `"calt" 0, "clig" 0, "liga" 0`

### Sometype Mono · `--font-sometype-mono`
Used **sparingly** for code snippets, timestamps, specific badge content. Substitute: `monospace`.
- Weights: 400, 500 · Sizes: 12, 14, 16, 24, 40 (px) · Letter spacing: 0.06em

### Type Scale
| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 12px | 1.43 | −0.14px | `--text-caption` |
| body-sm | 14px | 1.43 | −0.15px | `--text-body-sm` |
| body | 16px | 1.5 | −0.26px | `--text-body` |
| subheading | 26px | 1.25 | −0.91px | `--text-subheading` |
| heading-sm | 34px | 1.18 | −1.19px | `--text-heading-sm` |
| heading | 40px | 1.14 | −1.6px | `--text-heading` |
| heading-lg | 52px | 1.12 | −1.82px | `--text-heading-lg` |
| display | 76px | 1.05 | −3.8px | `--text-display` |

---

## Tokens — Spacing & Shapes

- Base unit: **4px** · Density: **compact**

### Spacing Scale
`4, 8, 12, 16, 20, 24, 32, 40, 48, 52, 56, 60, 80, 100, 128` (px) → `--spacing-*`

### Border Radius
| Element | Value |
|---------|-------|
| buttons / default | 9px |
| cards | 12px |
| largeCards | 24px |
| pills | 54px |
| circularElements | 653px |

### Shadows
| Name | Token | Value |
|------|-------|-------|
| subtle | `--shadow-subtle` | `rgba(0,0,0,0.1) 0 1px 3px 0, rgba(0,0,0,0.1) 0 1px 2px -1px` |
| sm | `--shadow-sm` | `rgba(13,21,48,0.04) 0 4px 4px 0` |
| subtle-2 | `--shadow-subtle-2` | `rgba(18,43,165,0.04) 0 1px 1px -0.5px, … 0 12px 12px -6px` |
| xl | `--shadow-xl` | `rgba(255,255,255,0.08) 0 -32px 64px 0 inset` |

> **Don't** introduce new shadow styles — reuse the defined subtle shadows only.

### Layout
- Content max-width: **~1200px** (centered)
- Section gap: 24px · Card padding: 12px · Element gap: 9px

---

## Components

### Primary Filled Button — Call to action
Filled **Dark Onyx (#202023)**, text **Canvas White (#ffffff)**, radius **9px**, padding **4px / 12px** (v/h). Solid, high-priority.

### Ghost Button — Secondary action
Transparent bg, text **Midnight Charcoal (#292d34)**, radius 4px, spacing from layout.

### Pill Button — Tertiary / Tag
Transparent bg, text Charcoal Gray, radius **54px** (fully rounded), padding 4px / 12px. Compact, tag-like.

### Outline Button — Bordered / Nav
Transparent bg, text Midnight Charcoal, border **Ash Gray (#e8e8e8)**, radius 8px, padding 4px / 10px.

### Feature Card — Content container
**#ffffff** bg, radius **12px**, shadow `--shadow-subtle`, padding 12px. Clear, separated block.

### Ghost Content Card
Transparent bg, radius 20px, no shadow/padding. Integrates into background.

### Pill Badge — Compact tag
Bg `rgba(0,0,0,0.1)`, text Midnight Charcoal, radius 12px, padding 10px / 12px. e.g. status labels.

### Subtle Badge — Informational tag
Transparent bg, text Midnight Charcoal, no radius/padding. Discreet category indicators.

---

## Surfaces & Elevation

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Canvas White | `#ffffff` | Primary page background / default container |
| 1 | Hint of Sky | `#e9ebf0` | Alternating sections, soft depth shift |
| 2 | Feature Card | `#ffffff` + `--shadow-subtle` | Elevated cards |
| 3 | Shadow Tint Blue | `#edf6fd` | Interactive / focus background |

- **Feature Card**: `rgba(0,0,0,0.1) 0 1px 3px 0, rgba(0,0,0,0.1) 0 1px 2px -1px`
- **Hover/Interactive**: `--shadow-subtle-2` (layered `rgba(18,43,165,0.04)`)
- **Button (subtle)**: `rgba(13,21,48,0.04) 0 4px 4px 0`

---

## Do's & Don'ts

**Do**
- Plus Jakarta Sans for all headings; leverage negative letter-spacing at large sizes.
- Canvas White (#ffffff) as primary background for bright, open aesthetic.
- Midnight Charcoal (#292d34) for primary body text.
- Electric Blue (#0091ff) / Deep Violet (#7b68ee) as accents for links & interactive emphasis.
- 9px radius for buttons, 12px for cards, 54px for pills/tags.
- Hierarchy via thin Ash Gray (#e8e8e8) / Dark Onyx borders, not heavy fills.
- Compact density: 12px card padding, 9px element gaps.

**Don't**
- Don't use pure `#000000` for body text — always Midnight Charcoal (#292d34).
- Don't use opaque color fills for action buttons unless a defined Brand/Accent; prefer Dark Onyx filled + white text for primary.
- Don't introduce new shadow styles — keep the defined subtle shadows.
- Don't use heavy gradients as primary backgrounds; reserve for illustrative/atmospheric accents.
- Don't use Sometype Mono beyond code/technical labels.
- Don't create large unpadded sections; honor 9px element gap & 12px card padding.
- Don't over-apply bold weights; condensed letter-spacing already conveys weight.

---

## Imagery
Bright, clean product screenshots inside card-like structures; abstract organic illustrations
with fluid shapes and soft gradients as atmosphere; **outlined icons** with consistent stroke
weight (lightweight feel). Balanced density — images punctuate text without overwhelming.

---

## Layout System
Centered, max-width ~1200px. Hero full-bleed with prominent headline over product UI. Sections
alternate white / subtle gray for rhythm. Two-column (text + visual) or centered stacks. Prominent
multi-column **card grids** for feature/data display. **Sticky top nav** for persistent navigation.

---

## Agent Prompt Guide — Quick Reference
```
text: #292d34   background: #ffffff   border: #e8e8e8
accent: #7b68ee   primary action: #202023 (filled)
```
- **Primary Button**: #202023 bg, #ffffff text, 9px radius, compact padding. Main CTA.
- **Feature Card**: #ffffff, 12px radius, `--shadow-subtle`, 12px padding; heading 26px Plus Jakarta Sans/700 #090c1d (−0.91px); body 16px Inter/400 #292d34 (−0.26px).
- **Pill Tag**: transparent bg, #292d34 text, 14px Inter/500 (−0.15px), 12px radius, 10px/12px padding, Ash Gray border.
- **Nav Link**: #292d34, 16px Inter/500 (−0.26px); hover → Deep Violet (#7b68ee) + underline.

## Similar Brands
Notion · Asana · Linear · Figma — white canvas, modular blocks, subtle elevation, precise typography.

---

## Implementation Notes (shadcn / Tailwind v4)
- Tailwind v4 `@theme` 토큰은 본 문서의 `--color-*`, `--text-*`, `--spacing-*`, `--radius-*`,
  `--shadow-*` 값을 그대로 사용한다. (`src/app/globals.css`)
- shadcn 컴포넌트의 기본 변수(`--background`, `--foreground`, `--primary`, `--border`, `--ring`
  등)를 위 토큰에 매핑한다:
  - `--background` → Canvas White, `--foreground` → Midnight Charcoal
  - `--primary` → Dark Onyx (#202023), `--primary-foreground` → #ffffff
  - `--border` / `--input` → Ash Gray (#e8e8e8), `--ring` → Deep Violet (#7b68ee)
  - `--muted` → Hint of Sky (#e9ebf0), `--accent` → Shadow Tint Blue (#edf6fd)
- 폰트는 `next/font/google`로 Plus Jakarta Sans·Inter, `next/font`로 Sometype Mono 로드.
- 라운드/섀도/간격은 임의값 대신 토큰 클래스(`rounded-[--radius-cards]` 등)로 사용.
