#!/usr/bin/env bash
# acp-visualizer install script
# Installs to ~/.acp/visualizer/ and links globally
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/ssucipto/ACPEnhanced-Visual/main/scripts/install.sh | bash

set -e

INSTALL_DIR="${HOME}/.acp/visualizer"
REPO_URL="https://github.com/ssucipto/ACPEnhanced-Visual.git"
NPM_PREFIX="${HOME}/.local"

echo "📥 ACP Progress Visualizer Installer"
echo ""

# Clone if not already installed
if [ -d "$INSTALL_DIR" ]; then
  echo "  ✓ Visualizer already installed at $INSTALL_DIR"
  echo "  → Updating..."
  cd "$INSTALL_DIR"
  git pull --ff-only
else
  echo "  → Cloning to $INSTALL_DIR..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  echo "  ✓ Cloned"
fi

# Install dependencies
echo "  → Installing dependencies..."
cd "$INSTALL_DIR"
npm install
echo "  ✓ Dependencies installed"

# Configure npm to use user-owned prefix (avoids EACCES on /usr/local)
echo "  → Linking acp-visualizer command..."
mkdir -p "$NPM_PREFIX/bin"
npm config set prefix "$NPM_PREFIX" 2>/dev/null || true

# Check if ~/.local/bin is in PATH, warn if not
if ! echo "$PATH" | tr ':' '\n' | grep -q "$NPM_PREFIX/bin"; then
  echo ""
  echo "  ⚠️  Add this to your shell profile (~/.zshrc or ~/.bashrc):"
  echo "     export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo ""
fi

npm link
echo "  ✓ Linked to $NPM_PREFIX/bin/acp-visualizer"

echo ""
echo "✅ ACP Progress Visualizer installed!"
echo ""
echo "  Usage:"
echo "    acp-visualizer                           # auto-detect from CWD"
echo "    acp-visualizer --path /path/to/progress.yaml"
echo "    acp-visualizer --repo owner/repo"
echo ""
echo "  Or via npx (zero-install):"
echo "    npx acp-visualizer"
