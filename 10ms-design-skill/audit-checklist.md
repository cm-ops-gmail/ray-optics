# 10MS Design Audit — Run Checklist

Copy this per audit. Check each item against the file under review.

## Colors
- [ ] One Voice: green on ≤15% of screen area
- [ ] primary `#1CAB55` used only for active states / focus rings
- [ ] green-link `#149353` used only for text links and nav labels
- [ ] green-cta `#37C25C` used only for filled CTA button surfaces
- [ ] brand-red `#E8001D` absent from all app UI
- [ ] error-red `#DC2626` used only for errors / alerts / notification badges
- [ ] No hardcoded colors — all via CSS var
- [ ] No glassmorphism, neon, gradient text, dark navy backgrounds

## Typography
- [ ] Inter used for all English strings
- [ ] Anek Bangla used for all Bengali strings
- [ ] No third typeface present
- [ ] Minimum 1.25× ratio between adjacent type hierarchy steps
- [ ] Placeholder text minimum `#6B7280` (not `#CDD1D7`)

## Logo
- [ ] Logo is inlined SVG from `files/Branding/` (not badge pill, not `<img>`)
- [ ] Light surface → `10ms-full-logo-color.svg` (Black+Red)
- [ ] `header-dark` surface → `10ms-icon-logo-white-red..svg` (White+Red)
- [ ] Green surface → `10ms-icon-logo-white.svg` (Pure White)
- [ ] Desktop nav uses full lockup. Mobile topbar uses icon mark.
- [ ] Logo not recolored, stretched, rotated, or drop-shadowed

## Elevation / Cards
- [ ] No `box-shadow` on resting cards (use `1px border #E5E7EB`)
- [ ] Hover state has shadow `0 4px 16px rgba(0,0,0,0.10)` + `translateY(-2px)`
- [ ] No nested cards (card-inside-card)
- [ ] Modal/sheet shadow is `0 8px 40px rgba(0,0,0,0.14)`

## Navigation
- [ ] Desktop nav uses `surface` (#FFFFFF) background, not `header-dark`
- [ ] Mobile top bar uses `header-dark` (#050B14)
- [ ] Bottom nav max 5 tabs
- [ ] Active tab: Fill icon `#1CAB55` + label `#149353` + `#EAFEF2` pill bg
- [ ] Inactive tab: Regular icon `#CDD1D7` + label `#9799A1`

## Icons
- [ ] Default/inactive: Phosphor Regular
- [ ] Active/selected: Phosphor Fill + color shift (both must change)
- [ ] Sizes: 16 / 20 / 24 / 32px only
- [ ] On dark: `#FFFFFF` Regular

## Buttons
- [ ] One primary CTA max per view
- [ ] All buttons use pill radius (`999px`)
- [ ] Icon-only square buttons use `radius.xl` (12px)
- [ ] Disabled: bg `#E5E7EB`, text `#D1D5DB`

## Celebration / Gamification
- [ ] Toast notifications scoped to earned achievements only (no passive browsing)
- [ ] No countdown-timer urgency
- [ ] No streak guilt loops
- [ ] No upsell overlays mid-lesson

## Desktop Specific
- [ ] Content max-width 1200px (never full-bleed)
- [ ] Horizontal padding 40px at desktop
- [ ] Desktop nav is light (not `header-dark`)
- [ ] No new color tokens introduced at desktop breakpoints
