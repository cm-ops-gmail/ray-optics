---
name: 10 Minute School
description: Bangladesh's most trusted student learning platform — warm, structured, performance-first.
colors:
  primary: "#1CAB55"
  primary-deep: "#17994B"
  primary-container: "#D0FAD0"
  on-primary: "#FFFFFF"
  on-primary-container: "#086347"
  green-link: "#149353"
  green-cta: "#37C25C"
  brand-red: "#E8001D"
  error-red: "#DC2626"
  alert-surface: "#FEF2F2"
  header-dark: "#050B14"
  surface: "#FFFFFF"
  surface-subtle: "#F3F4F6"
  surface-tinted: "#EAFEF2"
  surface-blue-tint: "#EFF6FF"
  nav-active-tint: "#EAFEF2"
  inverse-surface: "#111827"
  text-primary: "#111827"
  text-secondary: "#374151"
  text-tertiary: "#6B7280"
  text-disabled: "#D1D5DB"
  icon-inactive: "#CDD1D7"
  outline: "#E5E7EB"
  outline-variant: "#D1D5DB"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2.5rem, 8vw, 5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  sm2: "14px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "16px 28px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "16px 28px"
  button-secondary:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-disabled:
    backgroundColor: "{colors.outline}"
    textColor: "{colors.text-disabled}"
    rounded: "{rounded.full}"
    padding: "16px 28px"
  chip-selected:
    backgroundColor: "{colors.inverse-surface}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  chip-unselected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "14px 16px"
  input-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "14px 16px"
---

# Design System: 10 Minute School

## 1. Overview

**Creative North Star: "The Trusted Study Room"**

The design evokes a well-lit study table at dusk — personal, structured, calm. Not a classroom with 40 students, not a stadium screen. Every screen should feel designed by someone who sat in a Bangladeshi student's seat at 9pm, phone in hand, needing to understand a chapter before tomorrow's exam.

Green is the only extrovert in the palette. Everything else is white, careful grey, and measured space. The interface earns attention for content, not for itself. Density is deliberate — each screen holds exactly what the student needs at that moment, nothing more.

Celebration is designed in, not designed out — but it is earned, not ambient. A badge unlock or a point reward should feel like a moment because the surrounding experience is calm enough to make it one. This system rejects constant gamification: no streaks as guilt loops, no countdown-timer urgency, no confetti for opening an app. It also rejects Western SaaS gloss — glassy cards on dark gradients, hero metrics with gradient number fills. What it builds instead is institutional trust: the quiet confidence of a platform that has nothing to prove day-to-day, and genuine delight held in reserve for the moments students earn it.

**Key Characteristics:**
- White surfaces, green as the single confident accent
- Bengali-English bilingual by design: Inter for all English, Anek Bangla for all Bengali
- Performance-first: animations are feedback, not decoration
- Cards carry a resting micro-shadow; hover lifts them further
- Type hierarchy does the structural work, not borders or cards
- Celebration moments (toasts, badges, confetti) scoped to achievement triggers only
- Mobile-first by default; desktop adapts layout and navigation — never inverts the mobile design

**Responsive philosophy:** Mobile and desktop are the same product, not two different sites. Content, hierarchy, and token values stay consistent. What changes on desktop is spatial — wider columns, horizontal navigation, and breathing room. The same green is still the only extrovert. The same cards still carry their resting shadow.


## 2. Colors: The Study Room Palette

A restrained palette anchored in white and a confident green. Three green values serve distinct roles: `primary` for actions, `green-link` for navigation and labels, `green-cta` for filled CTA buttons. Red is split into brand (marketing) and error (product) — they are never interchangeable.

### Primary
- **10MS Green** (`#1CAB55`): Active nav icon, progress indicators, focus states, selected states. The action color at rest.
- **Deep Green** (`#17994B`): Hover and pressed state for `primary`. Never used at rest.
- **Green Link** (`#149353`): Darker green. "See all" links, tab labels, inline navigation text. More anchored than `primary`.
- **Green CTA** (`#37C25C`): Lighter green. Filled CTA button surfaces where the button needs warmth. Used when `primary` reads too saturated at large fill areas.
- **Green Container** (`#D0FAD0`): Light tinted surface for selected states, success fills, tag backgrounds.
- **On Green Container** (`#086347`): Text and icons on `#D0FAD0`. Maintains WCAG AA.
- **On Primary** (`#FFFFFF`): Text and icons on `#1CAB55` or `#37C25C` fills.
- **Nav Active Tint** (`#EAFEF2`): Active tab pill background in bottom navigation.

### Accent
- **Brand Red** (`#E8001D`): 10MS logo color. Landing page heroes, campaign CTAs. Does not appear in app UI.
- **Error Red** (`#DC2626`): In-app error states, alert cards, destructive action confirmations, notification badges. This is the only red used in product UI — `brand-red` is never a substitute.
- **Alert Surface** (`#FEF2F2`): Background for error/warning cards. Paired with `error-red` text.

### Structure
- **Header Dark** (`#050B14`): App top navigation bar, status bar area. Deep blue-black — distinct from `inverse-surface`. Used only for the persistent header shell.
- **Surface** (`#FFFFFF`): All card and section backgrounds. Page-level background. The design uses pure white throughout, not warm white.
- **Surface Subtle** (`#F3F4F6`): Secondary card backgrounds, inactive tab containers, filter chip group backgrounds. Slightly grey to distinguish from pure white cards.
- **Surface Tinted / Nav Active Tint** (`#EAFEF2`): Active states within cards, selected rows. Green-tinted.
- **Surface Blue Tint** (`#EFF6FF`): Feature card headers (e.g. SuperPrep). Blue-tinted for product-tier surfaces.
- **Near-Black** (`#111827`): Primary text, inverse chip backgrounds.
- **Ink** (`#374151`): Secondary text, subheadings, supporting body copy.
- **Ash** (`#6B7280`): Tertiary text, timestamps, captions, placeholder text.
- **Mist** (`#D1D5DB`): Disabled text, secondary borders.
- **Icon Inactive** (`#CDD1D7`): Navigation icons in inactive state. Lighter than Ash — intentionally recessed.
- **Hairline** (`#E5E7EB`): Dividers, card borders, input borders at rest.

### Named Rules
**The One Voice Rule.** Green appears on no more than 15% of any product screen. Its scarcity is what makes it trustworthy — if everything is green, nothing is a call to action.

**The Three-Green Rule.** Three greens, three roles: `primary` (#1CAB55) for active states and focus rings, `green-link` (#149353) for text links and nav labels, `green-cta` (#37C25C) for filled button surfaces. Never swap them arbitrarily.

**The Two-Red Rule.** `brand-red` (#E8001D) is marketing-only — never in app UI. `error-red` (#DC2626) is product-only — alert cards, error states, notification badges. One red per context.


## 3. Typography

**Primary Font (English):** Inter (400, 500, 600, 700)
**Primary Font (Bengali):** Anek Bangla (400, 500, 600, 700)

Two fonts, two scripts, one consistent voice. Inter is the workhorse across all English UI. Anek Bangla carries Bengali strings at matching weights. No font switching mid-sentence without purpose.

### Hierarchy
- **Display** (Inter 700, clamp(40px–80px), lh 1, ls −0.02em): Hero sections, splash screens, marketing page headers.
- **Headline / Large** (Inter 600, 32px, lh 1.25): Major screen titles, section openers.
- **Headline / Medium** (Inter 600, 28px, lh 1.3): Sub-section headers, modal titles.
- **Headline / Small** (Inter 600, 24px, lh 1.33): Card headers, feature section titles.
- **Title / Large** (Inter 600, 22px, lh 1.27): Screen-level titles in the app shell.
- **Title / Section** (Inter 700, 16px, lh 1.4): Section labels within a screen ("Your Schedule", "Subjects"). Bold weight distinguishes from component titles.
- **Title / Medium** (Inter 600, 15px, lh 1.47): Card titles, course names, list item primaries.
- **Title / Small** (Inter 500, 14px, lh 1.43): Supporting titles, secondary list labels.
- **Body / Large** (Inter 400, 16px, lh 1.5): Primary reading content. Max line length 65–75ch.
- **Body / Medium** (Inter 400, 13px, lh 1.46): Standard UI body copy, card descriptions, notification text.
- **Body / Small** (Inter 400, 12px, lh 1.33): Captions, timestamps, metadata.
- **Label / Large** (Inter 600, 14px, ls 0.01em): Button labels, strong UI labels.
- **Label / Medium** (Inter 500, 12px): Tags, chips, tab labels, secondary UI labels.
- **Label / Small** (Inter 500, 11px, uppercase, ls 0.05em): Status indicators, overline text, nav bar labels.

Bengali strings use Anek Bangla at the equivalent weight and size of the matched English style.

### Named Rules
**The Two-Font Rule.** Inter for English, Anek Bangla for Bengali. No other typefaces in the product surface.

**The Scale Rule.** Minimum 1.25 ratio between adjacent hierarchy steps. No flat type scales.


## 4. Elevation

Surfaces are flat at rest. Depth is conveyed through the `outline` (`#E5E7EB`) card border against the `surface` white background — the border does the separation work, not a shadow. Shadow appears only on interaction (hover, focus) or floating context (modal, bottom sheet, nav bar).

### Shadow Vocabulary
- **Card hover** (`0 4px 16px rgba(0,0,0,0.10)`): Cards on pointer hover. Accompanied by `translateY(-2px)`, `0.2s ease-out`. Never present at rest.
- **Modal / sheet** (`0 8px 40px rgba(0,0,0,0.14)`): Bottom sheets, dialogs, dropdowns floating above page content.
- **Nav bar** (`0 1px 3px rgba(0,0,0,0.08)`): Top navigation bar on desktop, mobile header. Structural — separates persistent chrome from scrolling content. Not a card shadow.
- **Tab bar** (`0 -4px 20px rgba(0,0,0,0.05)` + `backdrop-filter: blur(50px)`): Mobile bottom navigation. Shadow rises upward, blur separates from scrolling content.

### Named Rules
**The Flat-by-Default Rule.** Cards are flat at rest — no `box-shadow` on any card, sidebar, or aside panel. The `outline` border provides depth. Shadow is earned only by hover state (`translateY(-2px)` + shadow) or modal elevation.

**The No-Stack Rule.** Shadow depth is a state, not decoration. A card is either resting (flat) or hovered (lifted). Never static-shadow + hover-shadow stacked on the same element.


## 5. Components

### App Header (Dark Bar)

The persistent app header uses `header-dark` (`#050B14`) as background — a deep blue-black distinct from the content surface. All text and icons on this surface use white or near-white.

- **Background:** `#050B14`
- **Logo:** White + Red variant (icon mark only)
- **Text (greeting, school name):** `#FFFFFF` primary, `rgba(255,255,255,0.55)` secondary/muted
- **Icons (search, bell):** Phosphor Regular 22px, `#FFFFFF`
- **Notification badge:** 8px circle `#DC2626` (error-red), 1.5px white border
- **Class selector chip:** pill, bg `rgba(255,255,255,0.10)`, text `#FFFFFF`
- **Height:** ~120px total (status bar + greeting row + selector row)

---

### Selection Indicator (Card Checkmark)

Cards that support selection use a **full circular checkmark** positioned at the top-right corner — never a rectangular badge, pill, or custom div with a check icon inside.

- **Unselected:** Phosphor `ph-circle` (outline), 24px, color `outline` (`#E5E7EB`). Signals the slot is selectable.
- **Selected:** Phosphor `ph-fill ph-check-circle`, 24px, color `primary` (`#1CAB55`). Animates in with `scale(0.7) → scale(1)`, 0.18s ease-out.
- The icon itself IS the circle — never wrap it in a `div` with `border-radius: 50%`. That approach renders as oval on some viewport/font combinations.
- Card border shifts to `primary`, background to `surface-tinted` simultaneously.

**Named Rule:** Use `ph-fill ph-check-circle` for all card selection states. The SVG circle is geometrically perfect; CSS border-radius circles are not.

---

### Logo

The 10MS mark is a geometric icon composed of the numeral "1" and a stylised "0" with a diagonal red accent stroke. The accent is never recolored.

**Icon mark variants (4):**
- **Black + Red** (`#111827` body, `#EB2026` accent): Default. Light surfaces.
- **White + Red** (`#F9FAFB` body, `#EB2026` accent): Dark surfaces, `header-dark` bg.
- **Pure White** (`#F9FAFB` all): On `primary` green surfaces only.
- **Pure Black** (`#111827` all): Single-color print, embossing.

**Full lockup** (mark + wordmark): Marketing pages, email headers, onboarding. Icon mark alone for app nav headers and favicons.

**Clear space:** Minimum = height of the "1" stroke on all sides.

**Prohibited:** Recoloring outside the four variants, stretching, rotating, adding drop shadows, animating the mark in product UI.

---

### Buttons

Pill radius (`999px`) as default. Square icon-only buttons use `rounded.xl` (12px).

- **Primary** (bg `#1CAB55`, text `#FFFFFF`, pill, `16px 28px`): One per view maximum.
- **Primary hover** (bg `#17994B`, `0 4px 16px rgba(0,0,0,0.12)`, `translateY(-1px)`, 0.18s ease-out)
- **CTA filled** (bg `#37C25C`, text `#FFFFFF`, pill): For prominent CTAs where `primary` reads too saturated. Same hover behavior as primary.
- **Secondary filled** (bg `#D0FAD0`, text `#086347`, 1.5px border `#1CAB55`, pill)
- **Secondary outlined** (transparent bg, text `#149353`, 1.5px border `#149353`, pill): Uses `green-link` not `primary`.
- **Ghost** (transparent bg, text `#374151`, 1.5px border `#E5E7EB`, pill)
- **Text / link** (transparent, text `#149353`, no border): Uses `green-link`.
- **Disabled** (bg `#E5E7EB`, text `#D1D5DB`, cursor `not-allowed`)

**Icon + Label / Label + Icon:** Icon 20px, gap 8px, Phosphor Regular, inherits button text color.

**Icon only — pill:** 44×44px, pill. Filled green for primary, outlined for secondary.

**Icon only — square:** 44×44px, `rounded.xl` (12px). Ghost or outlined. Filter, settings, utility.

---

### Chips / Filter Pills

- **Selected** (bg `#111827`, text `#FFFFFF`, no border, full pill, `8px 16px`)
- **Unselected** (bg `#FFFFFF`, text `#111827`, 1px border `#E5E7EB`, full pill, `8px 16px`). Hover: border and text shift to `#149353`.
- **Active indicator** (bg `#EAFEF2`, text `#086347`): Stateful chips like "Live Now".
- **Tab chip — active** (bg `#FFFFFF`, text `#149353`, `rounded.lg` 10px): Inside `surface-subtle` pill tab container.
- **Tab chip — inactive** (bg transparent, text `#6B7280`, `rounded.lg` 10px).

---

### Cards / Containers

Cards sit on the `surface` (`#FFFFFF`) page background. The micro-shadow separates them — no tonal page background needed.

- **Large card** (bg `#FFFFFF`, 1px border `#E5E7EB`, radius `16px`, padding `16px`, `0 1px 3px rgba(0,0,0,0.08)`): Course cards, live class cards.
- **Small card / list item** (bg `#FFFFFF`, 1px border `#E5E7EB`, radius `12px`, padding `12px`): Compact subject rows, activity items.
- **Hover state** (both sizes): shadow → `0 4px 16px rgba(0,0,0,0.10)`, `translateY(-2px)`, 0.2s ease-out.
- **Alert card** (bg `#FEF2F2`, 1px border `#FECACA`, radius `12px`): Error/warning states only.
- **Feature card header tint** (bg `#EFF6FF`): Product-tier feature sections (SuperPrep header).
- **No nested cards.** Content areas inside cards are colored surfaces, never bordered card-within-card.

---

### Input Fields

- **Default** (bg `#FFFFFF`, 1px border `#D1D5DB`, radius 12px, `14px 16px`, placeholder `#6B7280`)
- **Focus** (2px border `#1CAB55`, `box-shadow: 0 0 0 3px rgba(28,171,85,0.10)`)
- **Positive** (2px border `#1CAB55`, helper text `#1CAB55`)
- **Error** (2px border `#DC2626`, helper text `#DC2626`)
- **Disabled** (bg `#F3F4F6`, 1px border `#E5E7EB`, text `#D1D5DB`, cursor `not-allowed`)

---

### Navigation (Bottom Bar — Mobile)

- **Container** (bg `#FFFFFF`, 1px top border `#E5E7EB`, height 68px, backdrop-filter blur 50px, `0 -4px 20px rgba(0,0,0,0.05)`)
- **Active tab** (Phosphor Fill 24px, `#1CAB55`; label label/small `#149353`; `nav-active-tint` `#EAFEF2` pill background, radius 24px)
- **Inactive tab** (Phosphor Regular 24px, `#CDD1D7`; label label/small `#9799A1`)
- **Notification badge** (8px circle, bg `#DC2626`, 1.5px white border)
- **Maximum 5 tabs.**

---

### Desktop Navigation (Top Bar — ≥1280px)

On desktop the bottom navigation bar is replaced with a persistent top navigation bar. Desktop nav is **light mode** — `surface` (`#FFFFFF`) background, 1px `outline` bottom border. `header-dark` is mobile-only.

**Layout (left → right):**
- **Logo** — Black + Red variant (icon mark + wordmark). Left-aligned, 40px left padding.
- **Primary nav** — horizontal tab row, full height, stretch-aligned. Up to 5 items. Active: `green-link` (`#149353`) text + 2px bottom border `primary` (`#1CAB55`), flush to nav bottom. Inactive: `text-tertiary` (`#6B7280`). Hover: `surface-subtle` bg.
- **Actions** — right-aligned. Search bar (`surface-subtle` bg, 220px), notification bell, settings gear, avatar circle (34px).
- **Height:** 64px.
- **Box shadow:** `0 1px 3px rgba(0,0,0,0.08)` — same card resting shadow, lifts it off the page.

**Sub-navigation (breadcrumb / section tabs):**
Below the top bar on content pages: `surface-subtle` (`#F3F4F6`) background, horizontal tab row, 1px `outline` bottom border, `green-link` active underline. Height 44px.

---

### Desktop Layout System (≥1280px)

#### Breakpoints
| Name | Min width | Use |
|---|---|---|
| `mobile` | 0 | Default. All base styles. |
| `tablet` | 768px | 2-col content grids. Sidebar appears. |
| `desktop` | 1280px | Full layout. Top nav. 3-col grids. |
| `wide` | 1440px | Max-width container locks at 1200px. |

#### Page container
- Max content width: **1200px**, horizontally centered.
- Horizontal padding: **40px** at desktop, **24px** at tablet, **16px** at mobile.
- Never full-bleed content on desktop — always inside the max-width container.

#### Layout templates
**Dashboard (2-column):**
```
| flex-1 main | 320px aside |
```
- Main (left): primary feed — live class, continue learning, schedule, subjects. Full view, no scroll obstruction.
- Aside (right, 320px): overview widgets — streak, notifications, SuperPrep summary. Sticky.
- Column gap: 24px.
- Navigation handled by top bar + sub nav. No sidebar.

**Learning / Exam page (centered):**
```
| auto | max-width 800px content | auto |
```
- Single column, centered. Chapter lists, question screens, config screens.

**Landing / Marketing (full-width sections):**
- Hero: full viewport width.
- Content sections: constrained to 1200px max-width container.

#### Card grids
| Context | Mobile | Tablet | Desktop |
|---|---|---|---|
| Subject cards | 2 col | 3 col | 4 col |
| Course cards (horizontal scroll on mobile) | scroll | 2 col | 3 col |
| Chapter list | 1 col | 1 col | 2 col |
| Notification cards | 1 col | 1 col | 1 col (max 680px wide) |

Grid gap: `spacing.md` (12px) on mobile, `spacing.lg` (16px) on tablet/desktop.

#### Typography desktop scale
On desktop, body copy and section titles gain one step of breathing room:

| Role | Mobile | Desktop |
|---|---|---|
| Title / Section | 16px 700 | 18px 700 |
| Body / Medium | 13px 400 | 14px 400 |
| Body / Large | 16px 400 | 16px 400 (unchanged) |
| Label / Small | 11px 500 | 11px 500 (unchanged) |

Display and headline roles do not change — they use `clamp()` and already scale.

#### Spacing desktop scale
Cards gain more internal breathing room on desktop:

| Token | Mobile | Desktop |
|---|---|---|
| Card padding | 16px | 24px |
| Section top padding | 24px | 32px |
| Horizontal page padding | 16px | 40px |
| Card grid gap | 10–12px | 16px |

#### Sidebar (desktop only)
- Width: 240px fixed. Position: left, sticky.
- Background: `surface` (`#FFFFFF`), 1px right border `outline`.
- Nav items: 44px height, 16px horizontal padding. Icon 20px + label 14px 500.
- Active: `nav-active-tint` (`#EAFEF2`) background, `green-link` text, `primary` left 3px border strip.
- Inactive: `text-secondary` label, `icon-inactive` icon.
- Collapses to icon-only (64px) at tablet.

### Named Rules (Desktop)
**The Same-Token Rule.** Desktop never introduces new color tokens. `primary`, `green-link`, `error-red`, `surface`, `outline` — all the same hex values. Only spacing and layout properties change at breakpoints.

**The Sidebar-Not-Nav Rule.** On desktop, the bottom navigation becomes a top bar + optional sidebar. The sidebar is a secondary surface — it does not use `header-dark`. Only the top bar uses `header-dark`.

**The No-Full-Bleed-Content Rule.** Content (text, cards, forms) never spans full viewport width on desktop. Always constrained to max-width 1200px. Background washes (hero sections, full-width color bands) may extend to viewport edges.

---

### Toast Notifications (Gamification)

Scoped to earned achievement triggers only. Never shown for passive browsing, app opens, or marketing events.

- **Point reward toast — Phase 1** (bg `#111827`, radius 16px, `0 8px 32px rgba(0,0,0,0.18)`): 36px green circle icon container. Triggers: live class completion, exam submission. Auto-dismisses 3s.
- **Badge unlock toast — Phase 2** (bg `#FFFFFF`, 1px border `#E5E7EB`, radius 16px): 32px badge illustration. Triggers: streak milestones, batch completion, first exam.

---

### Icon System (Phosphor Icons)

**Library:** Phosphor Icons. Regular and Fill weights only.

**Sizes:**
- **16px** — Inline text, labels, badge icons.
- **20px** — Default. List items, button companions, form icons.
- **24px** — Navigation bar, header actions, prominent standalone.
- **32px** — Empty states, feature cards, onboarding.

**Color rules:**
- **Default / inactive** — `#CDD1D7` (Icon Inactive) for nav icons; `#6B7280` (Ash) for content icons. Regular style.
- **Hover / emphasis** — `#111827` (Near-Black), Regular.
- **Active / selected** — `#1CAB55` (primary), Fill. Both color and weight shift.
- **On dark header** — `#FFFFFF`, Regular.
- **Disabled** — `#D1D5DB` (Mist), Regular.
- **Semantic** — `#DC2626` error, `#EAB308` warning, `#1CAB55` success. Never decorative.

### Named Rules
**The Regular-Default Rule.** All icons render Regular at rest. Switch to Fill only when active or selected. Both color and weight must shift together.


## 6. Do's and Don'ts

### Do
- **Do** use `#1CAB55` (primary) for active states. Use `#149353` (green-link) for text links and nav labels. Use `#37C25C` (green-cta) for filled CTAs. Keep the three greens in their lanes.
- **Do** use `error-red` (`#DC2626`) for all in-product error/alert states. Never use `brand-red` (`#E8001D`) in the app.
- **Do** use `header-dark` (`#050B14`) for the app top navigation bar. This is a distinct surface — not a dark card, not `inverse-surface`.
- **Do** give all cards a resting shadow of `0 1px 3px rgba(0,0,0,0.08)`. This is required, not optional.
- **Do** use Anek Bangla for all Bengali strings at the equivalent weight to the matched Inter style.
- **Do** use Phosphor Regular for inactive icons and Phosphor Fill for active/selected — both color and weight must shift simultaneously.
- **Do** scope celebration (point toasts, badge unlocks, confetti) to genuine achievement triggers only.
- **Do** set placeholder text to minimum `#6B7280` (Ash) — never `#CDD1D7` for readable hint copy.
- **Do** use the bottom nav active pill background (`#EAFEF2`) with `#1CAB55` icon and `#149353` label.
- **Do** match logo variant to background: Black + Red on light, White + Red on `header-dark`, Pure White on green.

### Don't
- **Don't** use `brand-red` (`#E8001D`) anywhere in the app UI. Marketing-only.
- **Don't** use `error-red` (`#DC2626`) for emphasis, decoration, or branding. Error state only.
- **Don't** swap `primary`, `green-link`, and `green-cta` — they are different roles, not interchangeable shades.
- **Don't** remove the card resting shadow. Flat-looking cards on a flat background are ambiguous affordance.
- **Don't** use countdown-timer urgency, streak guilt-loops, or upsell overlays mid-lesson. Byju's-style dark patterns are prohibited.
- **Don't** use glassmorphism, gradient text (`background-clip: text`), neon palettes, or glowing dark dashboards.
- **Don't** use `inverse-surface` (`#111827`) for the app header — use `header-dark` (`#050B14`). They are distinct surfaces.
- **Don't** recolor the logo or place it on low-contrast backgrounds.
- **Don't** use any typeface other than Inter (English) and Anek Bangla (Bengali) in the product surface.
- **Don't** nest cards inside cards. Icon containers inside cards are colored surfaces only.
- **Don't** exceed 5 tabs in the bottom navigation bar.
- **Don't** use `#CDD1D7` (icon-inactive) for body text or readable copy — it is for nav icons only.
