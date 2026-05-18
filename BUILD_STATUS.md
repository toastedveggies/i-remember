# BUILD_STATUS

## Current Phase

**Phase 4 - Supabase Backend Integration (starting)**

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

## Active / Next Task

- Phase 4 - Supabase backend integration (in progress):
  - [x] Initial schema defined and saved to `supabase/migrations/20260518_initial_schema.sql`
  - [x] Supabase client initialized at `lib/supabaseClient.ts`
  - [x] Event logging helpers created at `lib/logEvent.ts` (`logActivityEvent`, `logSystemEvent`)
  - [x] `appendActivityEvent` and `appendSystemEvent` added to `data/demoState.ts`; call Supabase logger fire-and-forget alongside local state update
  - [x] All three page components migrated to use `appendActivityEvent`/`appendSystemEvent` from `demoState.ts`; local duplicates removed
  - [x] Profile persistence helpers created at `lib/profile.ts` (`saveProfile`, `loadProfile`, `saveCaregiverName`); fixed demo UUIDs used until auth is added
  - Set up Supabase project and configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - Apply schema migration in Supabase dashboard (SQL editor)
  - Migrate state from localStorage (`demoState.ts`) to Supabase persistence
  - Verify reads/writes work end-to-end across `/app`, `/caregiver`, and `/demo`

## Blocked Tasks

- None currently.

## Known Issues

- No backend persistence or API integration yet (intentional)
- Supabase not configured yet (intentional)
- OpenAI not configured yet (intentional)
- Vercel project not connected yet (intentional)
- Phone number links and demo text are placeholders (replace later when real contact/routing is defined)
- `next lint` command is functional and clean, but the tool itself is deprecated by Next.js and should later migrate to ESLint CLI.

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
- `data/demoData.ts`
- `data/demoState.ts`

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
- This is Phase 4: Supabase backend integration.
- Set up the Supabase project and confirm environment variables are in `.env.local` before writing any integration code.
- Define and apply the database schema for events, profile, and check-in data.
- Migrate `data/demoState.ts` (currently localStorage-backed) to read/write from Supabase.
- Verify end-to-end reads and writes work across `/app`, `/caregiver`, and `/demo` before marking Phase 4 complete.
- Do not add OpenAI or push notifications yet.
- After making changes, update this file (status, files, timestamp, and next task).

## Last Updated

2026-05-18 (UTC-7) — Profile persistence helpers created at lib/profile.ts
