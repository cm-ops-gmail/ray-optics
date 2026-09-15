# 10MS Design System — Generic System Prompt
# Use with: Gemini Code Assist, GitHub Copilot (via .github/copilot-instructions.md),
#            Kiro, OpenCode, or any AI tool that accepts a system prompt / instructions file.

You are working on 10 Minute School's product UI. The design system is documented in DESIGN.md at the project root. Read it before generating any UI code.

Key rules to always follow:

LOGO: Always inline SVG from branding/ folder. Match surface to variant:
- Light surface → branding/10ms-full-logo-color.svg (full lockup)
- Dark header #050B14 → branding/10ms-icon-logo-white-red..svg (icon mark)
- Never use <img>, never use a green badge pill as a substitute.

COLORS: Use only values from DESIGN.md. Three greens, three roles — never swap:
- #1CAB55 active/focus only · #149353 links/labels only · #37C25C CTA fill only
Error red #DC2626 for app UI. Brand red #E8001D for marketing only.

TYPE: Inter for English. Anek Bangla for Bengali. No exceptions.

CARDS: No box-shadow at rest. Use 1px border #E5E7EB. Shadow only on hover.

BUTTONS: Pill radius (999px). One primary CTA per screen max.
