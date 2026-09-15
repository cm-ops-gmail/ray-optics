# 10MS Design Skill

Enforces the 10 Minute School design system across AI coding tools — tokens, logo variants, component rules, bilingual type. Works with Claude Code, Cursor, Windsurf, and other AI tools.

---

## Setup by Tool

### Claude Code (full skill support)

```bash
chmod +x install.sh && ./install.sh
```

Restart Claude Code. Claude auto-loads the skill and enforces all rules.

Trigger examples:

- `"audit this HTML against 10MS design rules"`
- `"generate a desktop landing page using 10MS tokens"`
- `"fix the logo — it's wrong for this dark header"`
- `"export the design tokens for Google Stitch"`

---

### Cursor

1. Copy `adapters/cursor-rules.md` content into `.cursorrules` in your project root
2. Copy `branding/` folder into your project (for logo SVG access)
3. Copy `DESIGN.md` into your project root (if not already there)
4. Optionally copy `tokens.css` into your project

Cursor reads `.cursorrules` automatically on every request. No restart needed.

**Cursor v0.43+ (MDC format):**
Create `cursor/rules/10ms-design.mdc` instead of `.cursorrules`:

```markdown
---
description: 10MS design system rules
globs: ["**/*.html", "**/*.css", "**/*.tsx", "**/*.jsx"]
---
[paste adapters/cursor-rules.md content here]
```

---

### Windsurf

1. Copy `adapters/windsurf-rules.md` content into `.windsurfrules` in your project root
2. Copy `branding/` folder into your project
3. Copy `DESIGN.md` into your project root

Windsurf reads `.windsurfrules` automatically. No restart needed.

---

### Kiro (Amazon)

1. Create `.kiro/steering/10ms-design.md` in your project
2. Paste content from `adapters/generic-system-prompt.md`
3. Copy `branding/` and `DESIGN.md` into your project

---

### GitHub Copilot

1. Create `.github/copilot-instructions.md` in your project
2. Paste content from `adapters/generic-system-prompt.md`
3. Copy `branding/` and `DESIGN.md` into your project

---

### Gemini Code Assist / Other tools

Use `adapters/generic-system-prompt.md` as the custom instructions / system prompt in whatever field your tool provides. Copy `branding/` and `DESIGN.md` into your project so the AI can reference them.

---

## What's included

| File | Purpose |
| --- | --- |
| `SKILL.md` | Claude Code skill entrypoint |
| `DESIGN.md` | Full design system — source of truth |
| `tokens.css` | CSS variables, paste into any prototype |
| `stitch-tokens.json` | Ready for Google Stitch / Tailwind import |
| `audit-checklist.md` | All named rules as a per-run checklist |
| `branding/` | All 8 logo SVGs (4 variants × full/icon) |
| `snippets/` | Copy-paste HTML for nav, buttons, cards, chips, inputs |
| `adapters/cursor-rules.md` | Cursor `.cursorrules` content |
| `adapters/windsurf-rules.md` | Windsurf `.windsurfrules` content |
| `adapters/generic-system-prompt.md` | Kiro / Copilot / Gemini / any tool |

---

## Logo quick reference

| Where | File |
| --- | --- |
| Light surface (desktop nav, light topbar) | `branding/10ms-full-logo-color.svg` |
| Dark header (#050B14) | `branding/10ms-icon-logo-white-red..svg` |
| Green fill | `branding/10ms-icon-logo-white.svg` |
| Print / emboss | `branding/10ms-icon-logo-black.svg` |

Always inline SVG. Never `<img>`. Never a badge pill substitute.

---

## Google Stitch

`stitch-tokens.json` is ready to import — contains all color, type, radius, spacing, shadow tokens plus logo file references.

---

## Updating

When `DESIGN.md` changes:

- **Claude Code:** re-run `install.sh`
- **Cursor/Windsurf/other:** update `DESIGN.md` in your project root. The adapter rules file stays the same.
