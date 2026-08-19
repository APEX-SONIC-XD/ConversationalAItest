---
name: check-inventory
description: Automatically validates DriveClear SRP inventory after js/profile.js edits via postToolUse hook. Validates homepage picks and participant intent match inventory. Always include hook output in facilitator replies after profile changes.
---

# Check inventory (automatic)

A **Cursor hook** runs `scripts/check-inventory.mjs` whenever `js/profile.js` is edited. The agent receives PASS/FAIL + SRP count as injected context.

## Agent obligations (every profile edit)

1. **Do not skip** — the hook runs automatically; still **include the inventory check in your reply**
2. If hook output says **FAIL**, fix `profile.js` or inventory links **before** telling the facilitator to refresh
3. Always give the SRP refresh URL: `http://127.0.0.1:8000/srp.html` (with query string when filtered)

Manual re-run if needed:

```bash
node scripts/check-inventory.mjs
```

## What it validates

| Surface | Logic mirrored from |
|---------|---------------------|
| SRP grid | `initSRP()` profile seed + filter in `js/app.js` |
| Homepage AI rec cards | `findVehicleForPick()` in `js/inventory.js` |
| Lot cities | `Profile.applyToInventory()` in `js/profile.js` |

## Reply template for facilitator

```
Inventory check: PASS | FAIL
SRP: N vehicles match [brief intent summary]
Samples: [1–3 vehicles]
Refresh: http://127.0.0.1:8000/srp.html?...
```

## Common failures

| Symptom | Likely fix |
|---------|------------|
| SRP count 0 | Loosen `maxPrice`, `maxMiles`, or `minYear`; widen `makes`; check `body` |
| Pick card empty | Set `vdpId` on pick or ensure year/make/model exists in `js/inventory.js` |
| Too few results (< 3) | Warn facilitator; consider relaxing one constraint |

See also: `LIVE-STUDY-CONTEXT.md`, `.cursor/hooks.json`
