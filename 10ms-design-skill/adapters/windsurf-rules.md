# 10MS Design System — Windsurf Rules
# Copy this content into .windsurfrules (project root)

You are working on 10 Minute School's product UI. Follow the design system strictly.

## Design System Source
DESIGN.md is at the project root. Read it for full token values, component specs, and named rules.
CSS tokens: tokens.css (copy from 10ms-design-skill package if not in project).

## Logo — always inline SVG, never <img> or badge substitute
| Surface | File |
|---------|------|
| Light (desktop nav / mobile light topbar) | branding/10ms-full-logo-color.svg |
| Dark header #050B14 | branding/10ms-icon-logo-white-red..svg |
| Green fill | branding/10ms-icon-logo-white.svg |
| Print | branding/10ms-icon-logo-black.svg |
Desktop nav = full lockup. Mobile topbar = icon mark only.

## Critical Color Rules
- #1CAB55 → active states, focus rings only
- #149353 → text links, nav labels only
- #37C25C → CTA button fill only
- #DC2626 → in-app errors only
- #E8001D → marketing ONLY, never app UI
- Green ≤ 15% of any screen

## Typography
Inter (English) + Anek Bangla (Bengali). Nothing else.

## Cards
Flat at rest (1px border #E5E7EB, no shadow). Shadow on hover only.

## Buttons
Pill radius (999px). One primary CTA per view max.

## Icons (Phosphor)
Regular at rest. Fill + color shift on active. Always both change together.

## Prohibited
Glassmorphism · gradient text · neon · box-shadow on resting card · >5 bottom nav tabs · brand-red in app · third font · nested cards
