# BUILD_STATUS

## Current Phase

**Phase 7 - Location Additions and Demo Gap Closure (active)**

Phase 6 - AI Integration: complete as of 2026-05-19 (UTC-7)

Phase 5 - Multiple Caregiver Support: complete as of 2026-05-18 (UTC-7)
Phase 4 - Supabase Backend Integration: complete as of 2026-05-18 (UTC-7)
Phase 3 - Demo Readiness: complete as of 2026-05-14 (UTC-7)

## Completed Tasks

- Created `PROJECT_PLAN.md`
- Created `BUILD_STATUS.md`
- Created `DECISIONS.md`
- Created `FUTURE_IDEAS.md`
- Created `AGENT_INSTRUCTIONS.md`
- Replaced `README.md` with setup and operating guidance
- Added Next.js App Router static scaffold with TypeScript and Tailwind configuration
- Built static landing page at `/`
- Built static Today Window page at `/app`
- Built static Caregiver Dashboard page at `/caregiver`
- Built static Scenario Demo Simulator page at `/demo`
- Created reusable components:
  - `TodayCard`
  - `ResponseCard`
  - `CheckInCard`
  - `ScenarioSelector`
  - `CaregiverSummary`
  - `EventLogList`
- Added shared static demo data source in `data/demoData.ts`
- Implemented Phase 1 brand + UI design system (static only):
  - warm grounded palette (rust/amber feeling) with calm, non-emergency emphasis
  - branded header with `MA` compass-dot placeholder logo + wordmark
  - icon library + consistent icon-with-label hierarchy
  - responsive layout improvements (single-column mobile, 2-column tablet where appropriate)
  - refined Today screen:
    - main actions separated from support actions
    - "Call caregiver" separated from "Show helper card"
  - added "Show Helper Card" modal pattern (no backend, static content)
- Phase 1 UI refinements (calm + less repetition + better grid clarity):
  - removed repeated per-question checkmark symbols from `CheckInCard`
  - added a left accent border to check-in question buttons instead
  - added vertical `md:divide-x` separators between grid sides in:
    - `Today` main/support action grids
    - `CaregiverDashboard` grid
- Started Phase 2 interactive MVP implementation:
  - Added shared route-synced demo state (`localStorage`) for `/app`, `/caregiver`, and `/demo`
  - Added shared demo user name for greeting/helper copy consistency
  - Implemented `/app` reorientation trigger + structured grounding card flow
  - Implemented `/app` check-in submission state + follow-up status copy
  - Implemented fallback copy behavior tied to low/medium/high uncertainty scenarios
  - Implemented `/demo` scenario activation and active scenario visibility
  - Implemented `/caregiver` simulated status updates from shared mock state
  - Implemented in-memory event logging with required Phase 2 event names
  - Updated event log UI to show event type/source/scenario details
  - Added `data/demoState.ts` for lightweight event schema + state model
  - Added onboarding/profile personalization editor in `/demo` (preferred name, pronouns, caregiver name/label)
  - Wired personalized copy across `/app`, `/caregiver`, and helper card
  - Made event log collapsible to reduce UI clutter
  - Simplified reorientation UI: guidance visible by default + clearer "Help me now" refresh action
  - Added non-interactive lint setup (`.eslintrc.json`, `eslint`, `eslint-config-next` aligned to Next 15)
  - Phase 3 kickoff polish in `/app`:
    - Added explicit prototype data note for demo expectation-setting
    - Clarified "Help me now" helper text (refreshes guidance + logs support moment)
    - Added persistent urgent-support sticky panel with caregiver and emergency call actions
- Phase 3 caregiver log enhancement:
    - `checkin_submitted` events in the event log now display the specific question the user selected (from `metadata.question`), visible on both `/app` and `/caregiver`
- Phase 3 caregiver dashboard redesign:
    - Top grid: renamed event log panel to "{preferredName}'s Activity", filtered to `source === "app"` events, visible by default
    - Added full-width "Event Log" section below the grid showing all events, collapsed by default
    - `reorientation_started` events highlighted with rust left border and colored label to signal distress moments to caregiver
    - `EventLogList` now accepts `title` and `emptyText` props for reuse flexibility
- Phase 3 caregiver activity panel filter refinement:
    - "{preferredName}'s Activity" now filters by event type allowlist (`reorientation_started`, `checkin_submitted`, `fallback_shown`, `demo_scenario_selected`) rather than by source
    - `reorientation_card_viewed` and `caregiver_view_opened` appear only in the full Event Log section
- Phase 3 helper card event logging:
    - Tapping "Show helper card" in `/app` now logs a `helper_card_shown` event
    - `helper_card_shown` events render with a light yellow background and amber label in the event log
    - `helper_card_shown` added to the caregiver Activity panel allowlist
- Phase 3 caregiver dashboard list fixes:
    - Alex's Activity panel shows 6 most recent events by default; "Show more" expands to a scrollable 500px container
    - Event Log panel now shows only system/navigation events (inverse of activity allowlist); displays in plain style with no highlights
    - `EventLogList` accepts `initialLimit` and `plain` props
- Phase 3 Activity panel show more/less fix:
    - Default limit changed from 6 to 5
    - "Show more" now toggles to "Show less" to collapse back to 5; scroll container only active when expanded
- Phase 3 event state refactor: split single `events` array into `activityEvents` (cap 50) and `systemEvents` (cap 20)
    - `activityEvents`: `reorientation_started`, `checkin_submitted`, `fallback_shown`, `helper_card_shown`
    - `systemEvents`: `reorientation_card_viewed`, `caregiver_view_opened`, `demo_scenario_selected`
    - `normalizeDemoState` migrates legacy localStorage state by splitting old `events` array on event type
    - `/caregiver` reads arrays directly — no runtime filter logic needed
    - Changed files: `data/demoState.ts`, `app/app/page.tsx`, `app/demo/page.tsx`, `app/caregiver/page.tsx`
- Phase 3 Activity panel scroll fix:
    - Expanded view with ≤10 items sizes naturally (no scroll, no max-height)
    - Expanded view with >10 items uses `max-h-[800px] overflow-y-auto`
    - Collapsed view always sizes naturally to first 5 items
- Phase 3 check-in selection reset: `setSelectedQuestion("")` called on submit so options return to default state
- Phase 3 check-in UI fixes:
    - Removed duplicate "Do a quick check-in" heading from inside `CheckInCard` (section title above is sufficient)
    - Check-in section icon changed to `text-green-500`
    - Selected check-in option now shows `bg-green-50` background for clear selection feedback
    - Removed unused `title` prop and `MemoryIcon` import from `CheckInCard`
- Phase 3 emergency services feature:
    - "Urgent: call emergency services" button restyled red; intercepts click, logs `emergency_called`, shows "Calling 911…" demo modal
    - Same button added to HelperModal via `onCallEmergency` prop
    - `emergency_called` added to activityEventTypes in `demoState.ts`
    - Activity panel: `emergency_called` events shown with bright red background and bold yellow "Called Emergency Services" label
    - Caregiver Snapshot: "Emergency calls" counter (red-600, white text) shown above "Missed calls", only when count > 0
- Phase 3 Call Maria — helper card fix:
    - "Call [caregiver]" inside HelperModal now uses `onCallCaregiver` callback instead of `tel:` link
    - Logs `caregiver_called` and shows the same calling modal as the main buttons
- Phase 3 Call Maria feature:
    - "Call caregiver" buttons in `/app` (support card + sticky footer) now intercept clicks: log `caregiver_called` to activityEvents and show a demo modal ("Calling [name]… Cancel")
    - `caregiver_called` added to activity event type set in `demoState.ts`
    - Activity panel in `/caregiver`: `caregiver_called` events shown with blue background and blue label
    - Caregiver Snapshot: shows a red "Missed calls" row when `caregiver_called` count > 0
- Phase 3 Activity panel allowlist fix:
    - Removed `demo_scenario_selected` from Alex's Activity panel — it fires from `/demo` (facilitator action, source: "demo"), not from Alex's interactions
- Phase 3 Activity panel show more/less final fix:
    - Expanded state shows ALL events; scroll container (max-h 500px) applied only when more than 10 events exist
    - Removed `expandedLimit` prop (no longer needed)
- Safari/iOS compatibility fix:
    - Replaced `crypto.randomUUID()` in `createEvent` (`data/demoState.ts`) with a `generateId()` fallback using `Math.random()`
    - `crypto.randomUUID()` throws on Safari/iPhone; the fallback works across all browsers
- Trusted location iteration kickoff:
    - Added trusted-place IDs, seeded coordinates, and deterministic scenario definitions in `data/demoState.ts`
    - Reworked `data/demoData.ts` to build context from trusted-place matching rather than hardcoded location strings
    - Added `lib/places.ts` matching helpers for trusted-place radius checks and "Other" fallback classification
    - Aligned `supabase/migrations/20260518_initial_schema.sql` with the trusted-slot and caregiver fields already assumed by the app
    - Updated `lib/seedData.ts` so seeded places, scheduled events, and activity events map to stable trusted-place IDs

## Active / Next Task

- Phase 7 - Location Additions and Demo Gap Closure (active as of 2026-05-25, UTC-7):
  - [x] Add "I'm okay", "Call [caregiver]", and "Show this screen" buttons to the streaming response panel in app/app/page.tsx. Log okay_confirmed event. Surface confirmed-okay status on caregiver dashboard.
  - [x] Fix HelperModal hardcoded location and time strings. Pass activeLocationSummary and contextPacket into HelperModal as props and use them for the location and time lines.
  - [x] Add who_is_expected from contextPacket to the Today card in app/app/page.tsx
  - [x] Store AI response text in reorientation_card_viewed event metadata and display it in the caregiver activity panel

- Trusted location handling (in progress as of 2026-05-23, UTC-7):
  - [x] Supabase schema updated to support trusted locations and `profiles.active_caregiver_id`
  - [x] `.env.local` updated with Supabase URL, Supabase anon key, and `ANTHROPIC_API_KEY`
  - [x] `data/demoState.ts` updated with shared trusted-location state
  - [x] `data/demoData.ts` updated to build context dynamically from trusted places and "Other"
  - [x] Shared trusted-place matching helper added in `lib/places.ts`
  - [x] Four demo scenarios refreshed so each one maps cleanly to Home, Pharmacy, Home + Doctor Appointment, or Other
  - [x] Seeded trusted-place IDs, coordinates, and doctor appointment mappings added for demo consistency
  - [x] Checked-in SQL migration updated to reflect trusted-location and caregiver fields already used by the app
  - [x] `/app` now uses trusted-place-aware scenario context for passive grounding, Help Me Now packets, and unknown-location fallback copy
  - [x] Caregiver and demo summaries now surface trusted-place context, scenario mapping, and unrecognized-location support cues
  - [ ] Start writing `place_id` into activity events when a scenario maps to a trusted place
  - [x] Switch Anthropic model calls from Claude Sonnet to Claude Haiku
  - [x] Verify end-to-end runtime after dependency/env refresh
- Phase 6 - AI Integration (complete as of 2026-05-19, UTC-7):
  - [x] Installed `@anthropic-ai/sdk`
  - [x] `data/demoData.ts` — `ContextPacket` model and server prompt context generation for scenario-based guidance
  - [x] `app/api/reorient/route.ts` — server-side POST route; accepts `{ question, context, userName }`; per-question system prompt rules (location only / time+activity only / next step only); streams via `ReadableStream`; model `claude-sonnet-4-5`; silent fallback; API key server-side only
  - [x] `app/api/checkin/route.ts` (new) — dual-mode POST: "questions" (non-streaming JSON array of 3 AI check-in questions, generated on demand); "response" (streaming supportive reply ending with "In a full version, I would…"); markdown fence stripping before JSON.parse; silent fallbacks
  - [x] `app/app/page.tsx` — Help Me Now flow: passive today card (date, location, next event from context packet); large button with home icon; tapping opens question-selection modal; selected question streams response into slide-up panel; "Recent guidance" link shows last 5 responses; `reorientation_started` and `reorientation_card_viewed` events logged
  - [x] `app/app/page.tsx` — check-in redesign: on-demand fetch (no auto-load on mount); green-700 full-width trigger button with checkCircle icon (mutes while open); questions slide in via max-height 300ms transition; tap-once-to-select (lime-100/lime-500 highlight, others opacity-60); tap-again-to-confirm; streams supportive response; "Do another check-in" after completion; `checkInDoneThisSession` prevents stale localStorage from blocking questions
  - [x] `app/app/page.tsx` — emergency tab: permanent 48×80px dark-red toggle tab (left-0, bottom-8) + 320px bright-red slide-out action (overflow-hidden, 200ms transition); auto-collapse 4s; click-outside backdrop; tap action triggers callEmergency()
  - [x] `app/app/page.tsx` — UI polish: "Today Window"→"Today" (text-4xl centered); time-aware greeting with emoji; removed subtitle and active-scenario line; removed "Main actions" and "Help me understand" headings; check-in column first; Call caregiver and Show helper card replaced with full-width teal buttons (phone/compass icons) with muted hint text; My Insights navy (bg-blue-900); check-in saved box lime-50/lime-200
  - [x] `app/caregiver/page.tsx` — activity panel excludes `reorientation_started`; includes `reorientation_card_viewed` from systemEvents, sorted by timestamp
  - [x] `components/EventLogList.tsx` — `reorientation_card_viewed` events now display question from metadata (formatted from underscore key)
  - Remaining: add `ANTHROPIC_API_KEY` setup instructions to `README.md`; merge to main

## Blocked Tasks

- None currently.

## Known Issues

- `BUILD_STATUS.md` previously drifted from repo reality; this section now reflects the current codebase as of 2026-05-21 (UTC-7)
- The app has partial Supabase integration (`lib/supabaseClient.ts`, migration, profile/event helpers), but runtime state is still primarily local/demo-driven rather than fully database-backed
- Anthropic AI routes are implemented in `app/api/reorient/route.ts` and `app/api/checkin/route.ts`; setup/docs should refer to Anthropic rather than OpenAI
- Vercel project may still be unlinked or unverified for deployment; this repo status file should not assume deployment readiness without a fresh check
- Phone number links and demo text are placeholders (replace later when real contact/routing is defined)
- `next lint` command is functional and clean, but the tool itself is deprecated by Next.js and should later migrate to ESLint CLI.
- Full runtime verification still needs a completed `npm run build` pass; an earlier build attempt was interrupted manually before completion

## Demo Access Note

- Demo password gate is enabled for whole site.
- Current password: `memory2026`
- Use `/demo` -> **Reset demo state** to clear local data and require password again after refresh.

## End-of-Night QA Log (2026-05-08, UTC-7)

- Final checks run:
  - `npm run lint` -> pass (no ESLint warnings/errors)
  - `npx tsc --noEmit` -> pass
- Runtime crash from missing `profile` in legacy localStorage state was fixed via state normalization/migration.
- No blocking errors remain for MVP demo flow.

### Potential User Challenges Observed

- Reorientation refresh action ("Help me now") may not clearly indicate that guidance cards are already visible by default.
- Emergency/caregiver instructions appear in multiple places; users in distress may benefit from one persistent, high-visibility emergency action.
- Caregiver call target is still a placeholder phone number (`tel:+15551234567`), which could confuse a live demo if clicked.
- Local-only state in `localStorage` can create cross-device/session inconsistency (acceptable for MVP, but worth calling out in demo script).

### Recommended Next Mitigations (Phase 3 polish)

- Add short helper text under "Help me now" clarifying it refreshes guidance and logs a support moment.
- Add a persistent emergency/caregiver quick action in `/app` header or sticky footer for clearer escalation path.
- Replace placeholder caregiver phone with demo-safe label/action before presentation.
- Add a one-line demo note: "Data is local to this browser session for prototype purposes."

## Manual Test Checklist (Demo Readiness)

- [x] /app: Reorientation flow can be triggered and shows a structured grounding card (where/what/next step).
- [x] /app: Quick check-in state can be submitted and confirmation/status is shown.
- [x] /caregiver: Simulated caregiver status and recent check-ins are visible and coherent with current scenario.
- [x] /demo: Scenario can be selected and active scenario is clearly indicated.
- [x] Fallback copy appears when context is incomplete and uses calm, transparent wording.
- [x] Event log emits expected names:
  - `reorientation_started`
  - `reorientation_card_viewed`
  - `checkin_submitted`
  - `caregiver_view_opened`
  - `fallback_shown`
  - `demo_scenario_selected`
- [x] Markdown docs are readable with no encoding artifacts.
- [x] TypeScript check passes (`npx tsc --noEmit`).
- [x] Lint check passes (`npm run lint`) without interactive prompt.

## Changed Files

- `README.md`
- `PROJECT_PLAN.md`
- `BUILD_STATUS.md`
- `DECISIONS.md`
- `FUTURE_IDEAS.md`
- `AGENT_INSTRUCTIONS.md`
- `package.json`
- `tsconfig.json`
- `next-env.d.ts`
- `next.config.ts`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `.gitignore`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/app/page.tsx`
- `app/caregiver/page.tsx`
- `app/demo/page.tsx`
- `app/api/checkin/route.ts`
- `app/api/reorient/route.ts`
- `components/MemoryIcon.tsx`
- `components/BrandLogo.tsx`
- `components/SiteHeader.tsx`
- `components/ActionCard.tsx`
- `components/SupportActionCard.tsx`
- `components/HelperModal.tsx`
- `components/TodayCard.tsx`
- `components/ResponseCard.tsx`
- `components/CheckInCard.tsx`
- `components/ScenarioSelector.tsx`
- `components/CaregiverSummary.tsx`
- `components/EventLogList.tsx`
- `lib/places.ts`
- `data/demoData.ts`
- `data/demoState.ts`
- `.env.local`

## Manual Setup Steps (For Later)

### Supabase
- Create a Supabase project
- Copy project URL and anon key from **Project Settings -> API**
- Add to local `.env.local` as:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Later: define and apply schema/migrations once data model is approved

### Vercel
- Connect GitHub repo to Vercel
- Add environment variables in Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Enable preview + production environments
- Deploy from GitHub and verify build health

## Notes for the Next AI Agent

- Start from `PROJECT_PLAN.md` and preserve strict MVP boundaries.
- Phase 6 AI work is complete in-app and the trusted-location iteration has started.
- Supabase now supports the trusted-location schema needed for `places` and `profiles.active_caregiver_id`.
- The database already contains a `places` table plus `scheduled_events.place_id` and `activity_events.place_id`; continue extending that model rather than inventing a parallel location system.
- Current priority is finishing explicit `place_id` event logging verification, then completing the Haiku model update and a full runtime/build verification pass.
- Do not add push notifications yet.
- After making changes, update this file (status, files, timestamp, and next task).

## Last Updated

2026-05-25 (UTC-7) — timeGreeting now accepts scenarioHour and uses it instead of the real device hour when set, so the greeting matches the active scenario's time context. tsc and lint pass clean.
