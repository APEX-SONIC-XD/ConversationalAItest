#!/usr/bin/env bash
# Auto-run inventory check when js/profile.js is edited during live sessions.
set -euo pipefail

input=$(cat)

# Resolve repo root (hook lives at driveclear/.cursor/hooks/)
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HOOK_DIR/../.." && pwd)"

file=""
if command -v jq >/dev/null 2>&1; then
  file=$(echo "$input" | jq -r '
    .file_path //
    .path //
    .file //
    .tool_input.path //
    .tool_input.file_path //
    .tool_input.target_notebook //
    empty
  ' 2>/dev/null || true)
fi

# Fallback: grep profile.js from raw input
if [[ -z "$file" ]] && echo "$input" | grep -q 'profile\.js'; then
  file="js/profile.js"
fi

[[ "$file" == *profile.js ]] || exit 0

cd "$ROOT"
if [[ ! -f scripts/check-inventory.mjs ]]; then
  exit 0
fi

result=""
exit_code=0
result=$(node scripts/check-inventory.mjs 2>&1) || exit_code=$?

status="PASS"
[[ "$exit_code" -eq 0 ]] || status="FAIL"

payload=$(printf '%s' "$result" | jq -Rs --arg status "$status" \
  '{additional_context: ("## Inventory check (automatic)\n\nStatus: " + $status + "\n\n" + . + "\n\nInclude this inventory check in your reply to the facilitator before asking them to refresh.")}' 2>/dev/null) \
  || payload=$(printf '{"additional_context":"Inventory check (automatic): %s — include PASS/FAIL and SRP count in your reply."}' "$(echo "$result" | tr '\n' ' ' | sed 's/"/\\"/g')")

echo "$payload"
exit 0
