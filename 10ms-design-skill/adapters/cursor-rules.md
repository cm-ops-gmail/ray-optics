# 10MS Design System — Cursor Rules
# Copy this content into .cursorrules (project root) or cursor/rules/10ms-design.mdc

You are working on 10 Minute School's product UI. Follow the design system strictly.

## Design System Source
DESIGN.md is at the project root. Read it for full token values, component specs, and named rules.
Token CSS vars are in `tokens.css` (if present in project) or `~/.claude/skills/10ms-design/tokens.css`.

## Logo — Never invent. Always inline SVG.
- Light surface (desktop nav, light topbar): `branding/10ms-full-logo-color.svg` — Black+Red, full lockup
- Dark header (#050B14): `branding/10ms-icon-logo-white-red..svg` — White+Red, icon mark only
- Green surface: `branding/10ms-icon-logo-white.svg`
- Print: `branding/10ms-icon-logo-black.svg`
- Desktop nav = full lockup always. Mobile topbar = icon mark only.

## Color Rules
- Primary #1CAB55: active states, focus rings, progress only
- Green-link #149353: text links, nav labels only
- Green-cta #37C25C: filled CTA button surfaces only
- Error-red #DC2626: in-app errors/alerts/badges only — never for branding
- Brand-red #E8001D: marketing/landing ONLY — never in app UI
- Green must cover ≤15% of any screen

## Typography
- Inter for ALL English strings
- Anek Bangla for ALL Bengali strings
- No other typefaces

## Cards & Elevation
- Cards are flat at rest: 1px border #E5E7EB, NO box-shadow
- Hover only: box-shadow 0 4px 16px rgba(0,0,0,0.10) + translateY(-2px)
- No nested cards

## Buttons
- All buttons: pill radius (999px)
- Icon-only square buttons: border-radius 12px
- One primary CTA max per view

## Icons (Phosphor)
- Regular at rest, Fill + color shift when active — both must change together
- Sizes: 16/20/24/32px only

## Never do
- Glassmorphism, gradient text, neon, dark navy dashboards
- box-shadow on resting card
- >5 tabs in bottom nav
- Brand-red in app UI
- Third font
- Card inside card
