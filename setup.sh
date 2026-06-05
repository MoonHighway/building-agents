#!/usr/bin/env bash
#
# setup.sh — point Claude Code at the Vercel AI Gateway (Coding with Claude, Day 1)
# --------------------------------------------------------------------------------
# What this does:
#   1. Checks you have Node 20+ and Claude Code installed (installs Claude Code if not).
#   2. Writes the three env vars that route Claude Code through the AI Gateway into
#      your shell profile, inside a clearly-marked block that's trivial to remove.
#   3. Verifies the key + route actually work by hitting the Gateway (no charge).
#
# Usage:
#   ./setup.sh                 # prompts for your AI Gateway key
#   ./setup.sh vck_your_key    # pass the key as an argument
#   AI_GATEWAY_API_KEY=vck_... ./setup.sh   # or via env var
#   ./setup.sh --uninstall     # remove the block this script added
#
# The key is your Vercel AI Gateway API key (starts with "vck_"). Get one at:
#   https://vercel.com/dashboard  →  AI Gateway  →  API Keys

set -euo pipefail

GATEWAY_URL="https://ai-gateway.vercel.sh"
MODEL="anthropic/claude-sonnet-4.6"   # known-good Gateway slug; swap with /model anytime
BLOCK_START="# >>> cascadia coding-with-claude (AI Gateway) >>>"
BLOCK_END="# <<< cascadia coding-with-claude (AI Gateway) <<<"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
ok()   { printf "  \033[32m✓\033[0m %s\n" "$1"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$1"; }
die()  { printf "  \033[31m✗ %s\033[0m\n" "$1" >&2; exit 1; }

# --- Pick the shell profile to write to --------------------------------------
detect_profile() {
  case "${SHELL:-}" in
    *zsh)  echo "${ZDOTDIR:-$HOME}/.zshrc" ;;
    *bash) [ -f "$HOME/.bashrc" ] && echo "$HOME/.bashrc" || echo "$HOME/.bash_profile" ;;
    *)     echo "$HOME/.profile" ;;
  esac
}
PROFILE="$(detect_profile)"

# --- Uninstall path ----------------------------------------------------------
if [ "${1:-}" = "--uninstall" ]; then
  if [ -f "$PROFILE" ] && grep -qF "$BLOCK_START" "$PROFILE"; then
    # Delete everything between the markers, inclusive.
    sed -i.bak "/$(printf '%s' "$BLOCK_START" | sed 's/[][\/.*^$]/\\&/g')/,/$(printf '%s' "$BLOCK_END" | sed 's/[][\/.*^$]/\\&/g')/d" "$PROFILE"
    ok "Removed the AI Gateway block from $PROFILE (backup at $PROFILE.bak)."
    bold "Open a new terminal (or 'unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN ANTHROPIC_API_KEY ANTHROPIC_MODEL') to finish."
  else
    warn "No AI Gateway block found in $PROFILE. Nothing to remove."
  fi
  exit 0
fi

bold "🌲 Coding with Claude — AI Gateway setup"
echo

# --- 1. Node 20+ -------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  die "Node isn't installed. Install Node 20+ from https://nodejs.org and re-run."
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  die "Node $(node -v) found, but we need v20+. Upgrade and re-run."
fi
ok "Node $(node -v)"

# --- 2. Claude Code ----------------------------------------------------------
if command -v claude >/dev/null 2>&1; then
  ok "Claude Code $(claude --version 2>/dev/null || echo 'installed')"
else
  warn "Claude Code not found — installing it globally with npm..."
  npm install -g @anthropic-ai/claude-code >/dev/null 2>&1 \
    && ok "Installed Claude Code" \
    || die "Could not install Claude Code. Try: npm install -g @anthropic-ai/claude-code"
fi

# --- 3. Get the key ----------------------------------------------------------
KEY="${1:-${AI_GATEWAY_API_KEY:-}}"
if [ -z "$KEY" ]; then
  printf "\nPaste your Vercel AI Gateway API key (starts with vck_): "
  read -r KEY
fi
[ -n "$KEY" ] || die "No key provided."
case "$KEY" in
  vck_*) ok "Key format looks right" ;;
  *)     warn "Key doesn't start with 'vck_'. Continuing, but double-check it's an AI Gateway key." ;;
esac

# --- 4. Verify the key + route BEFORE we touch any profile -------------------
# We use the count_tokens endpoint: it validates auth + routing with no generation cost.
bold "Checking the Gateway route..."
HTTP="$(curl -sS -o /tmp/aig_check.json -w '%{http_code}' \
  "$GATEWAY_URL/v1/messages/count_tokens" \
  -H "authorization: Bearer $KEY" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d "{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"ping\"}]}" \
  || echo "000")"

case "$HTTP" in
  200) ok "Gateway responded 200 — key works and routing is good." ;;
  401|403) die "Gateway rejected the key (HTTP $HTTP). Check it's valid and has credit." ;;
  000) die "Couldn't reach $GATEWAY_URL. Check your network and try again." ;;
  *)   warn "Unexpected response (HTTP $HTTP). Response body:"; cat /tmp/aig_check.json; echo ;;
esac

# --- 5. Write the env block (idempotent) -------------------------------------
# Remove any previous block first, then append a fresh one.
if [ -f "$PROFILE" ] && grep -qF "$BLOCK_START" "$PROFILE"; then
  sed -i.bak "/$(printf '%s' "$BLOCK_START" | sed 's/[][\/.*^$]/\\&/g')/,/$(printf '%s' "$BLOCK_END" | sed 's/[][\/.*^$]/\\&/g')/d" "$PROFILE"
  warn "Replaced an existing AI Gateway block (backup at $PROFILE.bak)."
fi

{
  echo ""
  echo "$BLOCK_START"
  echo "# Routes Claude Code through Vercel AI Gateway. Remove with: ./setup.sh --uninstall"
  echo "export ANTHROPIC_BASE_URL=\"$GATEWAY_URL\""
  echo "export ANTHROPIC_AUTH_TOKEN=\"$KEY\""
  echo "export ANTHROPIC_API_KEY=\"\"   # MUST be empty — Claude Code checks this first"
  echo "export ANTHROPIC_MODEL=\"$MODEL\""
  echo "$BLOCK_END"
} >> "$PROFILE"
ok "Wrote AI Gateway config to $PROFILE"

# --- 6. Done -----------------------------------------------------------------
echo
bold "✅ All set!"
echo "  Open a NEW terminal (or run:  source \"$PROFILE\"  ) so the vars load, then:"
echo "    claude"
echo
echo "  Claude Code now routes through the Gateway. Verify inside Claude Code with /model,"
echo "  and watch usage live at https://vercel.com/dashboard → AI Gateway → Observability."
echo
warn "Heads up: this writes your key in plaintext to $PROFILE."
warn "On macOS, store it in Keychain instead — see the README 'Secure storage' note."
