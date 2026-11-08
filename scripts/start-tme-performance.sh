#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
url='http://127.0.0.1:4351/experiments/through-my-eyes-live/'
if curl -fsS "$url" 2>/dev/null | rg -q 'Through My Eyes'; then
  printf 'Local development preview is already running: %s?perf=1\n' "$url"
  exit 0
fi
runtime="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
if ! command -v node >/dev/null 2>&1 && [ -x "$runtime/node/bin/node" ]; then
  PATH="$runtime/node/bin:$PATH"; export PATH
fi
if ! command -v pnpm >/dev/null 2>&1 && [ -x "$runtime/bin/fallback/pnpm" ]; then
  PATH="$runtime/bin/fallback:$PATH"; export PATH
fi
exec pnpm dev --host 127.0.0.1 --port 4351 --ignore-lock
