# DriveClear — Live Co-Creation Context

Reference this file (or `@LIVE-STUDY-CONTEXT.md`) with every live study prompt.

## Study setup

Participant describes how they want AI during used-car buying. A designer prompts Cursor while the session runs; **prototype updates are shown live** to the participant.

- Do **not** suggest facilitator or follow-up questions.
- Build **visible UI** the participant can react to.
- **One idea per update** — smallest change they can see on refresh.

## Live prompt template

```
@LIVE-STUDY-CONTEXT.md

They said: "[quote or paraphrase]"
Update prototype: [specific change]
Show on: [page]
Constraints: match DriveClear, fake data, no backend, fast
```

Optional append lines:

- `Journey stage: Prepared | Reassured | In control | Satisfied`
- `Assigned credit: poor | fair | good | great`
- `Budget band: under $25k | $26–50k | $51–75k | over $76k`
- `AI format: in-flow popover | global chat widget | static insight card`

## Brand

- **Product:** DriveClear — transparent used-car shopping, no dealer fees, one-price
- **Voice:** reassuring, plain language, not salesy
- **Visual:** teal `#00BFB3`, navy `#1a2640`, Inter, `css/styles.css` tokens
- **Reuse classes:** `.info-card`, `.form-card`, `.fin-path-card`, `.vp-item`, `.btn`, `.pa-*`

## Journey stages → pages

| Stage | Meaning | Primary pages |
|-------|---------|---------------|
| **Prepared** | Budget, browse, narrow options | `index.html`, `srp.html`, `financing.html` |
| **Reassured** | Fair price, history, payments, trust | `vdp.html`, payment calc, Carfax/history |
| **In control** | Trade, rate, dealer, next steps | `sell-trade.html`, `financing.html`, new static panels OK |
| **Satisfied** | Post-purchase, handoff | Not built — add simple static section if needed |

## AI formats in prototype

Pick **one** per update:

1. **In-flow / contextual** — VDP `#pa-popover` (payment area); extend `vdp.html` + `initPaymentAssistant()` in `js/app.js`
2. **Global chat widget** — Lens `widget.iife.js` (commented out in HTML); uncomment on target page if participant wants persistent chat
3. **Static AI insight** — teal callout/card near a number (rate, trade, price); fastest for live sessions

## Fake data rules

- Never use participant real PII
- Credit is **assigned** (not theirs): poor / fair / good / great
- **APR guide:** great 4.9%, good 6.9%, fair 9.9%, poor ~12%+
- **Trade-in:** invented values; use conflict when script needs it (e.g. research $14,200 vs dealer $12,500)
- Vehicles/VINs from `js/inventory.js` only

## Vehicles by budget (`vdp.html?id=X`)

| Budget | Example vehicles |
|--------|------------------|
| Under $25k | id 11 ($19,988), id 9 ($21,988), id 5 ($22,490) |
| $26–50k | id 1 ($24,988), id 4 ($25,488), id 6 ($27,988), id 2 ($29,488) |
| $51–75k | id 3 ($39,990), id 7 ($32,490) |
| Over $76k | No inventory — use closest or note gap |

## Live build rules

- **Participant context:** update `js/profile.js` only when changing what the participant "told us" (intent, homepage picks, appointment). Participant refreshes to see it — no on-screen controls.
- Static HTML/CSS first; touch `js/app.js` only if needed
- No backend, APIs, auth, or real credit checks
- No multi-page flows in one prompt
- Extend current page before creating new pages
- Match existing layout; don’t redesign nav/footer unless asked
- Forms: labels/content OK; avoid new submit flows unless requested

## Key files

| Purpose | Path |
|---------|------|
| **Participant profile (SSOT)** | `js/profile.js` — intent, homepage picks, appointment, compare metrics |
| Blank profile (between sessions) | `js/profile.blank.js` — copy into `profile.js` to reset |
| Pages | `index.html`, `srp.html`, `vdp.html`, `compare.html`, `test-drive-confirmation.html`, `sell-trade.html`, `financing.html` |
| Logic | `js/app.js`, `js/inventory.js`, `js/compare.js` |
| Styles | `css/styles.css` |

## Participant profile (`js/profile.js`)

Single source of truth for live sessions. Facilitator updates via Cursor; participant **refreshes** to see changes.

| Profile block | Drives |
|---------------|--------|
| Intent (`maxPrice`, `body`, `makes`, `drivetrain`, …) | SRP defaults, nav search, finance calc, compare priorities |
| `homepage.picks` | Index AI rec cards + drawer (name, price, copy); optional VDP via `year`/`make`/`model` |
| `homepage.appointment`, `titleAccent`, `dealerAddress` | Test drive confirmation prep |
| `homepage.compare` + `pick.compareMetrics` | Compare page table + chat re-ranking |
| `creditTier` | APR across VDP, financing, greetings |
| `market.label` + `market.lotCities` | **All inventory** lot locations (SRP, VDP, featured, test drive Location row) |
| `homepage.titleAccent`, `dealerAddress`, `appointment` | Visit dealer name/address/time (banner, test drive Where) |
| `homepage.picks` | Index AI rec cards + drawer; `location: null` auto-fills from market |

**Fast live prompt (profile-only):**

```
Update js/profile.js only for this participant:
- Intent fields + homepage block (picks with name, price, copy;
  year/make/model for VDP link; appointment + dealerAddress)
- market.label + market.lotCities (rewrites every car's lot city on refresh)
Don't edit HTML or app.js.
```

**Between sessions:** replace `PARTICIPANT` in `profile.js` with `js/profile.blank.js`, then fill for the next participant.

## VDP assistant (in-flow AI)

| Element | ID / location |
|---------|---------------|
| Trigger | `#pa-trigger` on monthly payment line |
| Popover | `#pa-popover` |
| Messages | `#pa-body` |
| Suggested questions | `#pa-chips` |
| Logic | `initPaymentAssistant()` in `js/app.js` |

## Financing page

- Pre-qual vs finance cards: `#prequal`, `#finance`
- Calculator: `#fin-calc-root`, `#fin-price`, `#fin-down`, `#fin-rate`, `#fin-term`
- Sidebar comparison: `#fin-compare-sidebar`

## Sell / trade

- `sell-trade.html` — sell/trade tabs, offer form (prefer static AI content unless participant asks for form flow)

## Not built yet (static placeholder OK)

- Dealership visit
- Trade inspection / offer conflict
- Rate mismatch negotiation
- Extended warranty upsell
- Post-purchase handoff

## Response format (after each build)

Reply with:

1. **What changed** (1–2 sentences)
2. **URL to refresh** (e.g. `http://localhost:8000/vdp.html?id=1`)
3. **What to point out** to the participant (1 sentence)
