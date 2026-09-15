#!/bin/bash
INSTALL_DIR="$HOME/.claude/skills/10ms-design"
if [ -d "$INSTALL_DIR" ]; then
  rm -rf "$INSTALL_DIR"
  echo "✓ Removed $INSTALL_DIR"
else
  echo "Not installed at $INSTALL_DIR"
fi
