---
name: 10ms-design
description: Use when designing, prototyping, auditing, or generating assets for 10 Minute School — enforces DESIGN.md tokens, logo variants, component rules, and bilingual type. Also use when exporting the design system to external platforms (Stitch, Figma tokens, Tailwind config).
---

# 10MS Design System Skill

## Source of Truth

**DESIGN.md:** bundled in this skill at `~/.claude/skills/10ms-design/DESIGN.md`
**Logo assets:** `~/.claude/skills/10ms-design/branding/`
**CSS tokens:** `~/.claude/skills/10ms-design/tokens.css`
**Stitch JSON:** `~/.claude/skills/10ms-design/stitch-tokens.json`

Read DESIGN.md before any design work. All tokens, named rules, and component specs live there. Do not invent values.

---

## Task Routing

| User says | Action |
|-----------|--------|
| "audit", "check violations" | Load `audit-checklist.md` → scan file → report |
| "generate [screen]", "prototype" | Read snippets + compose using tokens.css vars |
| "fix logo", "wrong logo" | Use logo matrix below → inline correct SVG |
| "desktop [screen]" | Use `snippets/nav-desktop.html` + 2-col layout from DESIGN.md §5 |
| "what token", "which color" | Read DESIGN.md §2 Colors |
| "export for Stitch" | Deliver `stitch-tokens.json` |
| "export tokens", "tailwind config" | Generate from DESIGN.md frontmatter YAML |
| "add component [name]" | Read DESIGN.md §5 Components → generate to spec |

---

## Logo Matrix

**Always inline SVG. Never `<img>`, never badge pill, never recolored.**

| Surface | Variant | File |
|---------|---------|------|
| Light (desktop nav, mobile light topbar) | Black+Red, full lockup | `branding/10ms-full-logo-color.svg` |
| `header-dark` (#050B14) | White+Red, icon mark | `branding/10ms-icon-logo-white-red..svg` |
| Green fill (#1CAB55) | Pure White, icon mark | `branding/10ms-icon-logo-white.svg` |
| Print / single-color | Pure Black, icon mark | `branding/10ms-icon-logo-black.svg` |

**Size:** Desktop nav full lockup → `height="30"` (≈109px wide). Mobile icon mark → `width="32" height="32"`.
**Desktop always full lockup. Mobile topbar always icon mark only.**

---

## Critical Named Rules

Quick ref — full specs in DESIGN.md. Violations listed in `audit-checklist.md`.

**One Voice:** Green ≤15% of any screen.

**Three-Green** — never swap roles:
- `#1CAB55` active states / focus rings only
- `#149353` text links / nav labels only
- `#37C25C` filled CTA button surfaces only

**Two-Red** — never swap:
- `#E8001D` marketing/landing only — never app UI
- `#DC2626` in-app errors / alerts / badges only

**Flat-by-Default:** No `box-shadow` on resting cards. Border (`1px solid #E5E7EB`) separates. Shadow only on hover.

**Two-Font:** `Inter` for all English. `Anek Bangla` for all Bengali. No others.

**Regular-Default:** Icons Regular at rest. Fill + color shift together on active.

---

## Snippet Index

| File | Use for |
|------|---------|
| `snippets/_base.html` | HTML head: fonts + CSS vars + reset |
| `snippets/nav-desktop.html` | Light topnav (64px, logo + tabs + search) |
| `snippets/nav-mobile-dark.html` | Dark header (#050B14), White+Red icon |
| `snippets/nav-mobile-light.html` | Light topbar (56px), Black+Red icon |
| `snippets/bottom-nav.html` | Mobile bottom nav (max 5 tabs) |
| `snippets/wizard-bar.html` | Step progress (mobile + desktop) |
| `snippets/btn.html` | All button variants |
| `snippets/card.html` | Cards + hover + selection states |
| `snippets/chips.html` | Chips / filter pills |
| `snippets/input.html` | Input states |

---

## Platform Export

### Google Stitch
Use `stitch-tokens.json` — ready to import. Contains all color/type/radius/spacing/shadow tokens + logo file references.

### Tailwind
Read DESIGN.md frontmatter YAML → generate `tailwind.config.js` theme extend block.

### CSS
Copy `tokens.css` — all `:root` vars ready to paste into any project.

---

## Common Violations

| Violation | Fix |
|-----------|-----|
| `box-shadow` on resting card | Remove. Use `border:1px solid #E5E7EB` |
| Green badge pill as logo | Inline SVG from `branding/` |
| `#E8001D` in app UI | Replace with `#DC2626` |
| Hardcoded hex | Replace with CSS var from `tokens.css` |
| Inter used for Bengali | Switch to `Anek Bangla` |
| Icon Fill at rest | Switch to Regular. Fill only on active |
| Card-inside-card | Inner = colored surface, not bordered card |
| >5 tabs in bottom nav | Remove excess tab(s) |
| Shadow on resting + hover stacked | Remove resting shadow |
