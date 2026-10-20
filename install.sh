#!/usr/bin/env bash
set -euo pipefail
APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHER="$APP_ROOT/bin/virizuals"
BIN_DIR="$HOME/.local/bin"
TARGET="$BIN_DIR/virizuals"

if ! command -v pnpm >/dev/null 2>&1; then
  printf 'error: pnpm not found on PATH. Install pnpm and retry.\n' >&2; exit 1
fi
EXISTING="$(command -v virizuals || true)"
if [[ -n "$EXISTING" && "$EXISTING" != "$TARGET" && "$EXISTING" != "$LAUNCHER" ]]; then
  printf 'error: virizuals already resolves to %s; not replacing it.\n' "$EXISTING" >&2; exit 1
fi
if [[ -e "$TARGET" || -L "$TARGET" ]]; then
  if [[ ! -L "$TARGET" || "$(readlink "$TARGET")" != "$LAUNCHER" ]]; then
    printf 'error: %s already exists; not replacing it.\n' "$TARGET" >&2; exit 1
  fi
fi
(cd "$APP_ROOT" && pnpm install --frozen-lockfile)
chmod +x "$LAUNCHER"
mkdir -p "$BIN_DIR"
if [[ ! -L "$TARGET" ]]; then ln -s "$LAUNCHER" "$TARGET"; fi
case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *) printf 'Add this to your shell configuration: export PATH="$HOME/.local/bin:$PATH"\n' ;;
esac
printf 'Installed %s. Run virizuals (or virizuals --headless).\n' "$TARGET"
