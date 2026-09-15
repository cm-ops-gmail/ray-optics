#!/bin/bash
# 10MS Design Skill — Installer
# Installs the skill into Claude Code's skill directory.

set -e

SKILL_NAME="10ms-design"
INSTALL_DIR="$HOME/.claude/skills/$SKILL_NAME"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing $SKILL_NAME skill..."

# Warn if already installed
if [ -d "$INSTALL_DIR" ]; then
  echo "  Found existing install at $INSTALL_DIR"
  echo "  Updating..."
  rm -rf "$INSTALL_DIR"
fi

# Copy skill to Claude's skill directory
mkdir -p "$INSTALL_DIR"
cp -r "$SCRIPT_DIR"/. "$INSTALL_DIR/"

# Remove the installer scripts from the install target (not needed there)
rm -f "$INSTALL_DIR/install.sh" "$INSTALL_DIR/uninstall.sh"

echo ""
echo "✓ Installed: $INSTALL_DIR"
echo ""
echo "Files:"
find "$INSTALL_DIR" -type f | sed "s|$INSTALL_DIR/|  |" | sort
echo ""
echo "Restart Claude Code (or start a new session) to activate."
echo "Then try: 'audit this HTML against 10MS design rules'"
