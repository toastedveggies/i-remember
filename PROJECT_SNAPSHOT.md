// FILE: AGENT_INSTRUCTIONS.md

# AGENT_INSTRUCTIONS

These instructions are for AI coding agents and collaborators working on this repository.

## Required Reading Before Any Changes

Read all of the following first:
- `PROJECT_PLAN.md`
- `BUILD_STATUS.md`
- `DECISIONS.md`
- `FUTURE_IDEAS.md`
- `README.md`

## Execution Rules

1. Work only on the **current phase** or **active/next task** listed in `BUILD_STATUS.md`.
2. After meaningful changes, update `BUILD_STATUS.md` (status, changed files, notes, timestamp).
3. If you think of extra features, add them to `FUTURE_IDEAS.md` instead of implementing immediately.
4. Avoid scope creep; preserve bounded MVP focus.
5. Preserve product positioning: non-clinical, non-emergency, class prototype.
6. Never expose API keys, tokens, or secrets in code, logs, docs, or commits.
7. Keep setup instructions current as the project evolves:
   - Supabase setup
   - Vercel setup
   - Anthropic API setup (`ANTHROPIC_API_KEY` in `.env.local` and Vercel)

## Guardrails

- Phase 6 introduces Claude (Anthropic) AI integration via a server-side API route. The API key is stored in `.env.local` as `ANTHROPIC_API_KEY` and in Vercel environment variables. It must never be exposed to the browser or committed to version control.
- The AI integration uses streaming responses via the Anthropic SDK. The server-side route is at `app/api/reorient/route.ts`.
- Do not add real-time location integration or Fitbit integration until explicitly planned.
- Do not implement push notifications yet (stretch only, later).
- Prefer clear, small, reviewable changes.
- The app supports Independent Mode (no caregiver connected). This is intentional and not a bug.
- `/caregiver/insights` is accessible from both `/app` and `/caregiver`.
- The app now supports multiple caregivers via the `caregiver_user_relationships` table (columns: `user_id`, `caregiver_id`, `role`). The `/demo` page controls both the caregiver roster and the active "view as" role for the caregiver dashboard.
- The Anthropic model string is centralized in `lib/aiConfig.ts` as `CLAUDE_MODEL`. Always import from there when making Anthropic API calls. Never hardcode a model string in any route file. When updating the model, change only `lib/aiConfig.ts`.

## Handoff Expectations

When finishing a task:
- Update `BUILD_STATUS.md` with accurate details.
- Add notable trade-offs/decisions to `DECISIONS.md`.
- Keep next steps explicit for the next agent/human contributor.


// ---

// FILE: BUILD_STATUS.md

﻿# BUILD_STATUS

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

2026-05-25 (UTC-7) — EventLogList: added sourceLabel and locationModeLabel helpers; source and scenario ID now render as human-readable labels; location mode renders "Trusted place" / "Other" instead of raw strings. tsc and lint pass clean.


// ---

// FILE: DECISIONS.md

# DECISIONS

Tracks notable project decisions and rationale.

## Decision Log

### 2026-05-05 - Establish bounded MVP framing
- **Decision:** Keep Memory Assistant tightly scoped to reorientation support only.
- **Why:** Prevent scope creep and protect prototype clarity for class delivery.
- **Implication:** New ideas beyond MVP go to `FUTURE_IDEAS.md`, not immediate implementation.

### 2026-05-05 - Use Next.js App Router + TypeScript + Tailwind
- **Decision:** Standardize on these technologies for MVP development.
- **Why:** Fast iteration, strong ecosystem, and straightforward Vercel deployment.
- **Implication:** New code should align with this stack unless explicitly revisited.

### 2026-05-05 - Delay Supabase and AI integration
- **Decision:** Do not connect Supabase or OpenAI during planning phase.
- **Why:** First deliverable is project structure and operating docs.
- **Implication:** Setup instructions are documented now; implementation occurs in later phases.

### 2026-05-05 - Build Phase 1 with static demo data only
- **Decision:** Implement routes and UI components with hardcoded demo content.
- **Why:** Phase 1 requires static app foundation without backend dependencies.
- **Implication:** No Supabase/OpenAI wiring yet; data layer integration is a later phase task.

### 2026-05-07 - Define Phase 2 MVP event taxonomy and schema
- **Decision:** Use a lightweight, fixed Phase 2 event taxonomy:
  - `reorientation_started`
  - `reorientation_card_viewed`
  - `checkin_submitted`
  - `caregiver_view_opened`
  - `fallback_shown`
  - `demo_scenario_selected`
- **Decision:** Use this minimal event shape for Phase 2:

```ts
{
  id: string;
  eventType: string;
  timestamp: string;
  userId: string;
  scenarioId?: string;
  source: "app" | "caregiver" | "demo";
  metadata?: Record<string, unknown>;
}
```

- **Why:** The prototype needs observable behavior for demo validation without production telemetry complexity.
- **Implication:** Phase 2 logging may be mock/local/in-memory unless a persistence layer is already available; no new backend requirement is introduced.

### 2026-05-07 - Define assistant fallback policy for uncertainty
- **Decision:** Use three fallback levels in assistant responses.
- **Low uncertainty:** Basic context exists but some details are missing.
  - Behavior: State known facts, explicitly note missing details, avoid overclaiming.
  - Sample copy: "I can confirm it is Tuesday morning at home. I do not have the exact next appointment yet. Let us check your next routine step together."
- **Medium uncertainty:** Activity or person context is unclear.
  - Behavior: Be transparent about uncertainty and suggest a safe clarification step.
  - Sample copy: "I am not fully sure what is scheduled right now. Please check the next activity card, and if this still feels unclear, contact your caregiver."
- **High uncertainty:** Location unavailable, user reports feeling unsafe, or context is too incomplete.
  - Behavior: Pause task guidance and escalate to safety support.
  - Sample copy: "I do not have enough context to guide this safely. Please pause and contact your caregiver now. If this feels urgent or unsafe, call emergency services immediately."
- **Why:** Keeps assistant behavior bounded, calm, and implementable for MVP.
- **Implication:** Fallback behavior is a Phase 2 requirement for `/app` interactions and demo scenarios.

### 2026-05-07 - MVP role separation by interface, not production auth
- **Decision:** MVP separates user and caregiver experiences by route/UI state (`/app`, `/caregiver`, `/demo`), not by production authentication.
- **Why:** Full auth introduces role/account management, caregiver-user linking, password/account recovery, and privacy/security complexity that is out of MVP scope.
- **Implication:** Phase 2 validates reorientation and caregiver support concepts using simulated data and route-based framing.
- **Future consideration:** If the product moves beyond demo/prototype stage, caregiver/user authentication and permissions become a priority before real personal data use.

### 2026-05-07 - Onboarding profile personalization schema for respectful copy
- **Decision:** MVP onboarding/profile schema must include user preferred name and pronouns, plus caregiver display name/label used in helper/support copy.
- **Minimum profile shape (MVP):**

```ts
{
  userId: string;
  preferredName: string;
  pronouns: "he/him" | "she/her" | "they/them" | "custom";
  customPronouns?: string;
  caregiverName: string;
  caregiverRelationshipLabel?: string;
}
```

- **Why:** Consistent, respectful language is a core UX requirement for this prototype.
- **Implication:** Phase 2 can store this locally/mock/in-memory; production identity/auth and privacy infrastructure are still out of scope for MVP.

### 2026-05-18 - Independent Mode — no caregiver required to start
- **Decision:** The app supports an Independent Mode where a user has no caregiver connected yet. This is represented by zero rows in `caregiver_user_relationships` for that user. No schema changes are needed.
- **Behavior in Independent Mode:**
  - `/app` works as normal.
  - `/caregiver` shows a "No caregiver connected yet" state with an invite prompt.
  - `/insights` is accessible directly from `/app` as "My Insights" — Alex has full access to his own metrics and activity history.
- **When a caregiver is connected**, the caregiver dashboard unlocks based on role:
  - Primary caregivers see everything.
  - Family/secondary caregivers see summary only (missed calls, emergency events, stability score).
- **Why:** Lowers onboarding barrier, respects user agency for early-stage users, and maps to pricing tiers (solo free, caregiver access paid).
- **Implication:** Caregiver invite/onboarding flow is a future feature.

### 2026-05-18 - Phase 5 schema additions to caregiver_user_relationships
- **Decision:** Added `permissions` JSONB (NOT NULL, all-false default) and `is_primary_contact` BOOLEAN (NOT NULL, DEFAULT false) to `caregiver_user_relationships` during Phase 5 schema prep.
- **permissions JSONB:** Stores granular per-caregiver permission flags (e.g. `can_see_activity_log`, `can_see_insights`). The toggle UI for editing these flags is intentionally deferred to a future phase to avoid scope creep.
- **is_primary_contact:** Controls which caregiver the call button in `/app` targets, independent of dashboard role. Enforced unique per user via partial index `one_primary_contact_per_user`.
- **Role remains the Phase 5 visibility mechanism:** The `role` column (`primary` / `family` / `read_only`) drives the caregiver dashboard view split in Phase 5. Primary sees everything; family and read_only see a summary-only view.
- **Why:** Separating `is_primary_contact` from `role` allows a family member to be the emergency call contact without having full dashboard access.
- **Implication:** The fixed demo caregiver UUID `00000000-0000-0000-0000-000000000002` remains the original primary caregiver. New caregivers added via the roster UI receive fresh UUIDs generated client-side using the existing `generateId()` helper (not `crypto.randomUUID()`, which fails on Safari/iOS).

### 2026-05-18 - Use Claude (Anthropic) as the AI provider
- **Decision:** Phase 6 AI integration uses the Anthropic Claude API, not OpenAI.
- **Why:** The project already operates within the Anthropic ecosystem; using the same provider reduces integration friction and keeps the stack coherent.
- **Implication:** The API key is stored as `ANTHROPIC_API_KEY` in `.env.local` and Vercel environment variables. It must never be committed to version control or exposed to the browser.

### 2026-05-18 - Stream AI responses rather than waiting for full completion
- **Decision:** The server-side API route streams Claude's response back to the client using the Anthropic SDK's streaming interface.
- **Why:** Streaming dramatically improves perceived responsiveness and demo impact — the user sees words appearing rather than a blank screen followed by a full response.
- **Implication:** The client must handle a streaming response (e.g. via `ReadableStream` or `fetch` with incremental reads). The route is at `app/api/reorient/route.ts`.

### 2026-05-18 - Use claude-sonnet-4-5 instead of claude-sonnet-4-20250514
- **Decision:** The initial model string `claude-sonnet-4-20250514` was replaced with `claude-sonnet-4-5` in `app/api/reorient/route.ts`.
- **Why:** First live test returned a `404 not_found_error` — the dated model string was not recognized by the API. The `claude-sonnet-4-5` alias resolved correctly.
- **Implication:** Use the short alias (`claude-sonnet-4-5`) rather than a dated string for this model going forward.

### 2026-05-18 - Pre-written context packets per scenario for Phase 6 demo
- **Decision:** AI responses in Phase 6 use pre-written context packets keyed to the active demo scenario rather than dynamically assembled live data.
- **Why:** Demo reliability is more important than dynamic accuracy for a class prototype. Pre-written packets ensure consistent, safe responses during the presentation and avoid latency from data assembly.
- **Implication:** Each scenario (`morning`, `afternoon`, `evening`) has a corresponding context packet that describes location, time, and next steps. Dynamic context assembly from real data is a future enhancement.

### 2026-05-19 - Check-in questions generated on demand, not on page load
- **Decision:** The `/api/checkin` questions fetch fires only when the user explicitly taps "Do a quick check-in", not on page mount.
- **Why:** Auto-fetching on mount caused the questions to arrive silently and then be blocked from rendering by a stale `checkInStatus` value loaded from localStorage. On-demand fetch also avoids an unnecessary API call on every page load for users who may not want to check in.
- **Implication:** The check-in section shows a single trigger button in its default state. Questions are fetched fresh each time the button is tapped, using the current scenario context and most recent Help Me Now question for personalisation.

### 2026-05-19 - Double-tap interaction to commit check-in selection
- **Decision:** Tapping a check-in option once highlights it (and dims the others); tapping the same option a second time commits the selection, logs the event, and triggers the AI response.
- **Why:** A single tap was too easy to trigger accidentally on mobile. The double-tap pattern creates a deliberate two-step confirmation that is familiar from mobile accessibility interactions and reduces mis-fires in a high-stress context.
- **Implication:** Hint text updates dynamically: "Tap once to select, tap again to confirm." changes to "Tap the highlighted option again to confirm." once a selection is made.

### 2026-05-19 - Slide-down animation for check-in options
- **Decision:** Check-in question cards animate in with a `max-height` + `opacity` CSS transition (300ms ease) rather than appearing instantly or using a modal overlay.
- **Why:** The slide-down keeps the questions spatially connected to the trigger button, matching the directional metaphor of the emergency tab slide-out. It avoids modal fatigue (the page already has multiple modals for Help Me Now and AI responses) and feels grounded on mobile.
- **Implication:** The trigger button remains visible and muted (green-800, opacity-75) while questions are shown, providing clear visual feedback that the section is active. Dismissal is handled by the response modal's "Got it" action, which collapses the questions and resets selection state.

### 2026-05-23 - Keep trusted-place matching simple for the MVP
- **Decision:** Trusted-place matching uses the existing `places.latitude` and `places.longitude` fields plus an app-side radius value from seeded/demo configuration.
- **Why:** The current prototype needs deterministic location-aware scenarios without taking on PostGIS, external geocoding, reverse geocoding, or a new `radius_meters` schema dependency.
- **Implication:** Human-readable place text stays in `name` / `address`, coordinate matching stays simple and local, and unknown locations resolve to "Other" rather than being guessed or learned automatically.

## Open Decisions (To Resolve Later)

- Data model for routines/events/check-ins
- Demo data strategy for scenario simulation


// ---

// FILE: FUTURE_IDEAS.md

# FUTURE_IDEAS

Parking lot for ideas that are intentionally out of current MVP scope.

## Rules for This File

- Add ideas here instead of implementing them immediately.
- Keep each idea concise with a short rationale.
- Move ideas into active scope only when reflected in `PROJECT_PLAN.md` and `BUILD_STATUS.md`.

## Idea Backlog

- Full UI polish pass for `/app` - spacing refinement, typography hierarchy review, and mobile-specific layout testing (safe areas, button tap targets, scroll behavior on small screens)
- Dynamic question options based on active scenario - for example, "Who am I talking to?" at a clinic visit vs. "What is my morning routine?" at home; questions would be pulled from the scenario context packet rather than hardcoded
- Location-aware passive today card - pulls real GPS coordinates once location integration is added, replacing the current scenario-based location placeholder
- Privacy-sensitive location history + learned-place suggestions - a future version could keep a limited location history and periodically suggest possible recurring places for caregiver review, such as "You have been here several times. Should this be reviewed as a possible trusted location?" Any suggested place must require caregiver or trusted-supporter verification before becoming trusted, and the design must account for privacy, consent, retention, false positives, safety risk, and avoiding confusion during distress.
- Habitual area detection and out-of-range alerts - a future version would build a picture of where Alex normally travels based on persistent location history stored in Supabase, not just explicitly added trusted places. The system would cluster location history into a habitual zone (for example, the neighborhood between home, the pharmacy, and the park Alex passes daily) using a lightweight algorithm or an AI analysis call. If Alex is within that habitual zone the app treats the location as low-concern even if it is not a named trusted place and does not surface an alert. If Alex appears well outside the habitual zone the app proactively prompts him to check in rather than waiting for him to tap Help Me Now. This requires a persistent location history pipeline in Supabase with UUID-referenced place rows, a clustering or convex-hull approach to define the habitual area boundary, a caregiver review step before the habitual zone is activated, and careful consent and privacy design as described in the writeup. The Supabase schema already has the place_id foreign key structure needed to support this. Implementation should happen on a separate branch to avoid destabilizing the demo build.
- Narrative presets for seed data - allow facilitators to select from pre-defined story arcs (for example, "stable phase", "gradual progression", "crisis week") when seeding Supabase demo data, rather than always generating the same one-year pattern
- Caregiver invite flow - allow Alex to invite a caregiver by email from within the app, creating a `caregiver_user_relationships` row with a role assignment
- Role-based caregiver dashboard visibility - primary caregivers see full metrics; family/secondary caregivers see summary only (missed calls, emergency events, stability score)
- Push notification enhancements beyond basic demo
- Rich caregiver analytics and trends
- Multi-profile household support
- Voice-first reorientation flow
- Calendar integrations
- Wearable/device integrations (see Fitbit detail below)
- Advanced safety escalation workflows

---

## Fitbit Heart Rate Alert Integration (Weekend Prototype)

**Status:** Backlog - not in active scope

**Demo path:** Facilitator walks a lap during class presentation, heart rate spikes on their Fitbit, caregiver dashboard updates in real time showing elevated BPM.

### Implementation outline

- Use Fitbit Web API with OAuth 2.0 to pull real-time heart rate data from a paired Fitbit device
- Implement OAuth flow via Next.js API routes - no third-party auth library needed
- Register app at dev.fitbit.com to get client ID and secret; store in `.env.local`, never commit
- Poll heart rate endpoint every 30-60 seconds during an active demo session
- If BPM exceeds a configurable threshold (default 100), fire an `elevated_heart_rate` event to `activityEvents` with `source: "app"`
- Display `elevated_heart_rate` events in Alex's Activity panel with a distinct visual (orange background, heart icon, BPM value shown)
- Add a heart rate alert row to the Caregiver Snapshot when threshold is exceeded

### Key constraints

- Fitbit does NOT sync to Apple Health on iPhone - must use Fitbit Web API directly
- Scope is demo-only: single user account, no production auth hardening needed
- All Fitbit credentials must live in `.env.local` and be excluded from version control


// ---

// FILE: data/demoState.ts

import { logActivityEvent, logSystemEvent } from "@/lib/logEvent";

export type EventSource = "app" | "caregiver" | "demo";
export type UncertaintyLevel = "low" | "medium" | "high";
export type LocationSource = "scenario_seed" | "browser_geolocation";
export type LocationMode = "trusted_place" | "other";
export type ResponsePosture = "calm_grounding" | "public_place_support" | "transition_support" | "safety_fallback";

export type BrowserLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: string;
};

export type DemoEvent = {
  id: string;
  eventType: string;
  timestamp: string;
  userId: string;
  scenarioId?: string;
  source: EventSource;
  metadata?: Record<string, unknown>;
  placeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accuracyMeters?: number | null;
  locationSource?: LocationSource;
};

export type ScheduledEventSummary = {
  id: string;
  title: string;
  timeLabel: string;
  placeId?: string | null;
  bringItems?: string[];
};

export type DemoScenario = {
  id: string;
  label: string;
  guidance: string;
  where: string;
  happening: string;
  nextStep: string;
  uncertainty: UncertaintyLevel;
  responsePosture: ResponsePosture;
  seededCoordinates: {
    latitude: number;
    longitude: number;
  };
  expectedLocationMode: LocationMode;
  scenarioPlaceId?: string | null;
  currentActivity?: string;
  scenarioHour?: number | null;
  scheduledEvent?: ScheduledEventSummary;
};

export type DemoState = {
  activeScenarioId: string;
  checkInStatus: string;
  activityEvents: DemoEvent[];
  systemEvents: DemoEvent[];
  profile: DemoProfile;
  trustedLocations: TrustedLocation[];
  activeLocationSource: LocationSource;
  browserLocation: BrowserLocation | null;
};

export type PronounSet = "he/him" | "she/her" | "they/them" | "custom";

export type DemoProfile = {
  userId: string;
  preferredName: string;
  pronouns: PronounSet;
  customPronouns?: string;
  caregiverName: string;
  caregiverRelationshipLabel?: string;
  independentMode?: boolean;
  activeCaregiverId?: string | null;
};

export type TrustedLocation = {
  id?: string;
  trustedSlot: 1 | 2 | 3;
  name: string;
  address?: string;
  displayAddress?: string;
  instructions?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  placeType?: "home" | "pharmacy" | "clinic" | "trusted";
};

export const defaultDemoProfile: DemoProfile = {
  userId: "00000000-0000-0000-0000-000000000001",
  preferredName: "Alex",
  pronouns: "he/him",
  caregiverName: "Maria",
  caregiverRelationshipLabel: "daughter",
  independentMode: false,
  activeCaregiverId: "00000000-0000-0000-0000-000000000002"
};

export const PLACE_HOME_ID = "00000000-0000-4000-8000-000000000001";
export const PLACE_PHARMACY_ID = "00000000-0000-4000-8000-000000000002";
export const PLACE_DOCTOR_ID = "00000000-0000-4000-8000-000000000003";
export const SCHEDULED_EVENT_DOCTOR_ID = "00000000-0000-4000-8000-000000000010";

export const defaultTrustedLocations: TrustedLocation[] = [
  {
    id: PLACE_HOME_ID,
    trustedSlot: 1,
    name: "Home",
    address: "215 Cedar Street",
    displayAddress: "215 Cedar Street",
    instructions: "Take a slow breath, check the Today card, and continue your usual home routine.",
    latitude: 34.13672,
    longitude: -118.29434,
    radiusMeters: 80,
    placeType: "home"
  },
  {
    id: PLACE_PHARMACY_ID,
    trustedSlot: 2,
    name: "Pharmacy",
    address: "98 Maple Avenue",
    displayAddress: "Sunrise Pharmacy, 98 Maple Avenue",
    instructions: "Go to the counter and say you are here to pick up a prescription. Show your helper card if you want support.",
    latitude: 34.13758,
    longitude: -118.30084,
    radiusMeters: 65,
    placeType: "pharmacy"
  },
  {
    id: PLACE_DOCTOR_ID,
    trustedSlot: 3,
    name: "Doctor's Office",
    address: "410 Wellness Plaza",
    displayAddress: "Northside Clinic, 410 Wellness Plaza",
    instructions: "Check in at the front desk with your ID and insurance card.",
    latitude: 34.13158,
    longitude: -118.28942,
    radiusMeters: 90,
    placeType: "clinic"
  }
];

export const demoScenarios: DemoScenario[] = [
  {
    id: "home_reorientation",
    label: "Home reorientation",
    guidance: "Alex is at Home and needs calm grounding.",
    where: "You are at Home.",
    happening: "This looks like a normal time at home. The app should keep the explanation calm and simple.",
    nextStep: "Take a slow breath, check the Today card, continue your home routine, or call Maria if you want support.",
    uncertainty: "low",
    responsePosture: "calm_grounding",
    seededCoordinates: {
      latitude: 34.13675,
      longitude: -118.2943
    },
    expectedLocationMode: "trusted_place",
    scenarioPlaceId: PLACE_HOME_ID,
    scenarioHour: 9
  },
  {
    id: "pharmacy_confusion",
    label: "Pharmacy confusion",
    guidance: "Alex is at the Pharmacy and needs help remembering that he came to pick up a prescription.",
    where: "You are at the Pharmacy.",
    happening: "You planned to stop by the pharmacy to pick up a prescription.",
    nextStep: "Go to the pharmacy counter, ask about prescription pickup, show the helper card if needed, or call Maria if you are still unsure.",
    uncertainty: "medium",
    responsePosture: "public_place_support",
    seededCoordinates: {
      latitude: 34.13755,
      longitude: -118.30088
    },
    expectedLocationMode: "trusted_place",
    scenarioPlaceId: PLACE_PHARMACY_ID,
    currentActivity: "Picking up a prescription",
    scenarioHour: 14
  },
  {
    id: "doctor_appointment_prep",
    label: "Doctor appointment preparation",
    guidance: "Alex is at Home and needs help getting ready to leave for a doctor's appointment.",
    where: "You are at Home.",
    happening: "A doctor's appointment is coming up soon.",
    nextStep: "Bring your ID, insurance card, phone, keys, and medication list, then leave at the planned time.",
    uncertainty: "low",
    responsePosture: "transition_support",
    seededCoordinates: {
      latitude: 34.1367,
      longitude: -118.29438
    },
    expectedLocationMode: "trusted_place",
    scenarioPlaceId: PLACE_HOME_ID,
    scenarioHour: 12,
    scheduledEvent: {
      id: SCHEDULED_EVENT_DOCTOR_ID,
      title: "Doctor appointment",
      timeLabel: "Leave at 1:40 PM for a 2:00 PM appointment",
      placeId: PLACE_DOCTOR_ID,
      bringItems: ["ID", "Insurance card", "Phone", "Keys", "Medication list"]
    }
  },
  {
    id: "lost_unknown_location",
    label: "Lost / unknown location",
    guidance: "Alex is not at a recognized trusted place and needs safe fallback guidance without overclaiming.",
    where: "I do not recognize this as one of your saved trusted places.",
    happening: "The app does not have enough information to know why you are here.",
    nextStep: "Stay where you are if it feels safe, call Maria, show the helper card if needed, and call emergency services if this feels unsafe or urgent.",
    uncertainty: "high",
    responsePosture: "safety_fallback",
    seededCoordinates: {
      latitude: 34.14188,
      longitude: -118.31215
    },
    expectedLocationMode: "other",
    scenarioPlaceId: null,
    scenarioHour: null
  },
  {
    id: "evening_routine",
    label: "Evening routine",
    guidance: "Alex is at Home in the evening and needs calm grounding to settle into his night routine.",
    where: "You are at Home.",
    happening: "It is evening at home. This is a calm and familiar time for your usual evening routine.",
    nextStep: "Take a slow breath, have dinner or a snack if you are hungry, and settle into your evening routine. Call Maria if you need support.",
    uncertainty: "low",
    responsePosture: "calm_grounding",
    seededCoordinates: {
      latitude: 34.13672,
      longitude: -118.29434
    },
    expectedLocationMode: "trusted_place",
    scenarioPlaceId: PLACE_HOME_ID,
    currentActivity: "Evening home routine",
    scenarioHour: 19
  }
];

export const checkInQuestions = [
  "Would you like to sit down and take a slow breath?",
  "Do you want a quick reminder of your plan for today?",
  "Would calling your caregiver help right now?"
];

export const storageKey = "memory-assistant-mvp-state";

export const initialDemoState: DemoState = {
  activeScenarioId: demoScenarios[0].id,
  checkInStatus: "Not submitted yet",
  activityEvents: [],
  systemEvents: [],
  profile: defaultDemoProfile,
  trustedLocations: defaultTrustedLocations,
  activeLocationSource: "scenario_seed",
  browserLocation: null
};

const activityEventTypes = new Set([
  "reorientation_started",
  "checkin_submitted",
  "fallback_shown",
  "helper_card_shown",
  "caregiver_called",
  "emergency_called",
  "okay_confirmed"
]);

function normalizeTrustedLocation(location: TrustedLocation): TrustedLocation {
  const fallback = defaultTrustedLocations.find((entry) => entry.trustedSlot === location.trustedSlot);

  return {
    id: location.id ?? fallback?.id,
    trustedSlot: location.trustedSlot,
    name: typeof location.name === "string" && location.name.trim() ? location.name : fallback?.name ?? "",
    address: location.address ?? fallback?.address,
    displayAddress: location.displayAddress ?? location.address ?? fallback?.displayAddress ?? fallback?.address,
    instructions: location.instructions ?? fallback?.instructions,
    latitude: typeof location.latitude === "number" ? location.latitude : fallback?.latitude,
    longitude: typeof location.longitude === "number" ? location.longitude : fallback?.longitude,
    radiusMeters: typeof location.radiusMeters === "number" ? location.radiusMeters : fallback?.radiusMeters ?? 75,
    placeType: location.placeType ?? fallback?.placeType ?? "trusted"
  };
}

export function normalizeDemoState(raw: unknown): DemoState {
  if (!raw || typeof raw !== "object") {
    return initialDemoState;
  }

  const value = raw as Partial<DemoState> & {
    profile?: Partial<DemoProfile>;
    trustedLocations?: TrustedLocation[];
    browserLocation?: Partial<BrowserLocation> | null;
    events?: DemoEvent[];
  };
  const validScenario = demoScenarios.some((scenario) => scenario.id === value.activeScenarioId);

  let activityEvents: DemoEvent[] = [];
  let systemEvents: DemoEvent[] = [];

  if (Array.isArray(value.activityEvents)) {
    activityEvents = value.activityEvents;
  } else if (Array.isArray(value.events)) {
    activityEvents = value.events.filter((event) => activityEventTypes.has(event.eventType));
  }

  if (Array.isArray(value.systemEvents)) {
    systemEvents = value.systemEvents;
  } else if (Array.isArray(value.events)) {
    systemEvents = value.events.filter((event) => !activityEventTypes.has(event.eventType));
  }

  const browserLocation = value.browserLocation
    && typeof value.browserLocation.latitude === "number"
    && typeof value.browserLocation.longitude === "number"
    && typeof value.browserLocation.accuracyMeters === "number"
    && typeof value.browserLocation.timestamp === "string"
      ? {
          latitude: value.browserLocation.latitude,
          longitude: value.browserLocation.longitude,
          accuracyMeters: value.browserLocation.accuracyMeters,
          timestamp: value.browserLocation.timestamp
        }
      : null;

  return {
    activeScenarioId: validScenario ? (value.activeScenarioId as string) : initialDemoState.activeScenarioId,
    checkInStatus: typeof value.checkInStatus === "string" ? value.checkInStatus : initialDemoState.checkInStatus,
    activityEvents,
    systemEvents,
    profile: {
      userId: value.profile?.userId ?? defaultDemoProfile.userId,
      preferredName: value.profile?.preferredName ?? defaultDemoProfile.preferredName,
      pronouns: (value.profile?.pronouns as PronounSet | undefined) ?? defaultDemoProfile.pronouns,
      customPronouns: value.profile?.customPronouns ?? defaultDemoProfile.customPronouns,
      caregiverName: value.profile?.caregiverName ?? defaultDemoProfile.caregiverName,
      caregiverRelationshipLabel: value.profile?.caregiverRelationshipLabel ?? defaultDemoProfile.caregiverRelationshipLabel,
      independentMode: value.profile?.independentMode ?? false,
      activeCaregiverId: value.profile?.activeCaregiverId !== undefined
        ? value.profile.activeCaregiverId
        : defaultDemoProfile.activeCaregiverId
    },
    trustedLocations: Array.isArray(value.trustedLocations) && value.trustedLocations.length > 0
      ? value.trustedLocations
          .filter((location): location is TrustedLocation =>
            (location.trustedSlot === 1 || location.trustedSlot === 2 || location.trustedSlot === 3) &&
            typeof location.name === "string"
          )
          .map(normalizeTrustedLocation)
          .sort((a, b) => a.trustedSlot - b.trustedSlot)
      : defaultTrustedLocations,
    activeLocationSource: value.activeLocationSource === "browser_geolocation"
      ? "browser_geolocation"
      : "scenario_seed",
    browserLocation
  };
}

export function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function createEvent(
  eventType: string,
  source: EventSource,
  scenarioId?: string,
  metadata?: Record<string, unknown>,
  userId = defaultDemoProfile.userId,
  locationDetails?: Pick<DemoEvent, "placeId" | "latitude" | "longitude" | "accuracyMeters" | "locationSource">
): DemoEvent {
  return {
    id: generateId(),
    eventType,
    timestamp: new Date().toISOString(),
    userId,
    source,
    scenarioId,
    metadata,
    placeId: locationDetails?.placeId ?? null,
    latitude: locationDetails?.latitude ?? null,
    longitude: locationDetails?.longitude ?? null,
    accuracyMeters: locationDetails?.accuracyMeters ?? null,
    locationSource: locationDetails?.locationSource
  };
}

export function setActiveCaregiverId(id: string | null): DemoState {
  if (typeof window === "undefined") return initialDemoState;
  const raw = window.localStorage.getItem(storageKey);
  let current = initialDemoState;
  if (raw) {
    try { current = normalizeDemoState(JSON.parse(raw)); } catch { /* use initialDemoState */ }
  }
  const updated: DemoState = { ...current, profile: { ...current.profile, activeCaregiverId: id } };
  window.localStorage.setItem(storageKey, JSON.stringify(updated));
  return updated;
}

export function setIndependentMode(value: boolean): DemoState {
  if (typeof window === "undefined") return initialDemoState;
  const raw = window.localStorage.getItem(storageKey);
  let current = initialDemoState;
  if (raw) {
    try { current = normalizeDemoState(JSON.parse(raw)); } catch { /* use initialDemoState */ }
  }
  const updated: DemoState = { ...current, profile: { ...current.profile, independentMode: value } };
  window.localStorage.setItem(storageKey, JSON.stringify(updated));
  return updated;
}

export function appendActivityEvent(state: DemoState, event: DemoEvent): DemoState {
  logActivityEvent(event);
  return { ...state, activityEvents: [event, ...state.activityEvents].slice(0, 50) };
}

export function appendSystemEvent(state: DemoState, event: DemoEvent): DemoState {
  logSystemEvent(event);
  return { ...state, systemEvents: [event, ...state.systemEvents].slice(0, 20) };
}

export function findScenario(scenarioId: string): DemoScenario {
  return demoScenarios.find((scenario) => scenario.id === scenarioId) ?? demoScenarios[0];
}

export function findTrustedLocation(locations: TrustedLocation[], slot?: 1 | 2 | 3): TrustedLocation | null {
  if (!slot) return null;
  return locations.find((location) => location.trustedSlot === slot) ?? null;
}

export function findTrustedLocationById(locations: TrustedLocation[], placeId?: string | null): TrustedLocation | null {
  if (!placeId) return null;
  return locations.find((location) => location.id === placeId) ?? null;
}

export function pronounWords(pronouns: PronounSet, customPronouns?: string): { subject: string; object: string; possessive: string } {
  if (pronouns === "he/him") {
    return { subject: "he", object: "him", possessive: "his" };
  }

  if (pronouns === "she/her") {
    return { subject: "she", object: "her", possessive: "her" };
  }

  if (pronouns === "custom" && customPronouns) {
    return { subject: customPronouns, object: customPronouns, possessive: customPronouns };
  }

  return { subject: "they", object: "them", possessive: "their" };
}


// ---

// FILE: data/demoData.ts

import {
  findScenario,
  findTrustedLocationById,
  type DemoProfile,
  type DemoScenario,
  type LocationSource,
  type TrustedLocation
} from "@/data/demoState";
import { resolveActiveLocationContext } from "@/lib/places";

export type EventLogItem = {
  id: string;
  time: string;
  message: string;
};

export const todaySummary = {
  greeting: "You are safe and supported.",
  where: "Your current location is matched against your saved trusted places or shown as Other.",
  happening: "The active scenario and location context shape the grounding response.",
  nextStep: "Review the location summary, then take the next calm step."
};

export const checkInQuestions = [
  "Would you like to sit down and take a slow breath?",
  "Do you want a quick reminder of your plan for today?",
  "Would calling your caregiver help right now?"
];

export type ContextPacket = {
  location: string;
  location_mode: string;
  location_source: string;
  trusted_place: string;
  trusted_place_address: string;
  location_coordinates: string;
  time_of_day: string;
  next_event: string;
  current_activity: string;
  who_is_expected: string;
  caregiver_name: string;
  notes: string;
  safety_fallback: string;
};

export type ActiveLocationSummary = {
  label: string;
  detail: string;
  trustedPlaceName: string | null;
  trustedPlaceAddress: string | null;
  sourceLabel: string;
  locationModeLabel: string;
  fallbackMessage?: string;
  placeId: string | null;
};

function formatCoordinate(value: number): string {
  return value.toFixed(5);
}

function buildBringItemsText(items?: string[]): string {
  if (!items || items.length === 0) {
    return "No extra items listed.";
  }

  return items.join(", ");
}

function scenarioTimeOfDay(scenario: DemoScenario): string {
  const now = new Date();
  const hour = scenario.scenarioHour != null ? scenario.scenarioHour : now.getHours();
  const minutes = now.getMinutes();
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const date = now.getDate();
  return `${dayName}, ${monthName} ${date} at ${displayHour}:${displayMinutes} ${period}`;
}

function scenarioNextEvent(scenario: DemoScenario, trustedLocations: TrustedLocation[]): string {
  if (scenario.scheduledEvent) {
    const scheduledPlace = findTrustedLocationById(trustedLocations, scenario.scheduledEvent.placeId);
    const placeLabel = scheduledPlace?.name ? ` at ${scheduledPlace.name}` : "";
    return `${scenario.scheduledEvent.title}${placeLabel}. ${scenario.scheduledEvent.timeLabel}. Bring ${buildBringItemsText(scenario.scheduledEvent.bringItems)}.`;
  }

  if (scenario.id === "pharmacy_confusion") {
    return "Pick up the prescription, then head back home.";
  }

  if (scenario.id === "lost_unknown_location") {
    return "Focus on staying safe and contacting support.";
  }

  return "Continue the current home routine at an easy pace.";
}

function scenarioExpectedVisitor(scenario: DemoScenario, profile: DemoProfile): string {
  if (scenario.id === "doctor_appointment_prep") {
    return `${profile.caregiverName} can help if leaving feels confusing.`;
  }

  if (scenario.id === "lost_unknown_location") {
    return `${profile.caregiverName} is the best support contact if this still feels unclear.`;
  }

  return "No other people are required right now.";
}

export function describeScenarioLocation(
  scenario: DemoScenario,
  trustedLocations: TrustedLocation[]
): { label: string; notes: string; trustedLocation: TrustedLocation | null } {
  const trustedLocation = findTrustedLocationById(trustedLocations, scenario.scenarioPlaceId);

  if (scenario.expectedLocationMode === "trusted_place" && trustedLocation) {
    const suffix = scenario.scheduledEvent ? " + Doctor Appointment" : "";
    return {
      label: `${trustedLocation.name}${suffix}`,
      notes: trustedLocation.displayAddress ?? trustedLocation.address ?? trustedLocation.name,
      trustedLocation
    };
  }

  return {
    label: "Other",
    notes: "This scenario should fall back to unrecognized-location guidance.",
    trustedLocation: null
  };
}

export function buildActiveLocationSummary(params: {
  scenarioId: string;
  profile: DemoProfile;
  trustedLocations: TrustedLocation[];
  activeLocationSource: LocationSource;
  browserLocation: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    timestamp: string;
  } | null;
}): ActiveLocationSummary {
  const scenario = findScenario(params.scenarioId);
  const resolved = resolveActiveLocationContext({
    scenario,
    trustedLocations: params.trustedLocations,
    activeLocationSource: params.activeLocationSource,
    browserLocation: params.browserLocation
  });

  const sourceLabel = resolved.source === "browser_geolocation"
    ? "Browser geolocation"
    : "Seeded scenario coordinates";

  const fallbackMessage = resolved.fallbackReason === "browser_unavailable"
    ? "Live device location was not available, so the demo is using the scenario's seeded coordinates."
    : resolved.fallbackReason === "browser_inaccurate"
      ? "Live device location was too inaccurate for a safe demo match, so the demo is using the scenario's seeded coordinates."
      : undefined;

  if (resolved.matchedTrustedPlace) {
    return {
      label: resolved.matchedTrustedPlace.name,
      detail: resolved.matchedTrustedPlace.displayAddress ?? resolved.matchedTrustedPlace.address ?? "Saved trusted place",
      trustedPlaceName: resolved.matchedTrustedPlace.name,
      trustedPlaceAddress: resolved.matchedTrustedPlace.displayAddress ?? resolved.matchedTrustedPlace.address ?? null,
      sourceLabel,
      locationModeLabel: "Trusted place",
      fallbackMessage,
      placeId: resolved.matchedTrustedPlace.id ?? null
    };
  }

  return {
    label: "Other",
    detail: "I do not recognize this as one of your saved trusted places.",
    trustedPlaceName: null,
    trustedPlaceAddress: null,
    sourceLabel,
    locationModeLabel: "Other",
    fallbackMessage,
    placeId: null
  };
}

export function buildContextPacket(params: {
  scenarioId: string;
  profile: DemoProfile;
  trustedLocations: TrustedLocation[];
  activeLocationSource: LocationSource;
  browserLocation: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    timestamp: string;
  } | null;
}): ContextPacket {
  const scenario = findScenario(params.scenarioId);
  const resolved = resolveActiveLocationContext({
    scenario,
    trustedLocations: params.trustedLocations,
    activeLocationSource: params.activeLocationSource,
    browserLocation: params.browserLocation
  });

  const trustedPlace = resolved.matchedTrustedPlace;
  const location = trustedPlace
    ? trustedPlace.name
    : "I do not recognize this as one of your saved trusted places.";
  const trustedPlaceAddress = trustedPlace?.displayAddress ?? trustedPlace?.address ?? "No saved trusted-place address available.";

  const notes = trustedPlace
    ? [
        scenario.guidance,
        trustedPlace.instructions ?? "",
        scenario.currentActivity ? `Current activity: ${scenario.currentActivity}.` : "",
        scenario.scheduledEvent ? `Bring items: ${buildBringItemsText(scenario.scheduledEvent.bringItems)}.` : "",
        resolved.source === "browser_geolocation"
          ? "The current coordinates came from browser geolocation."
          : "The current coordinates came from seeded demo data."
      ].filter(Boolean).join(" ")
    : [
        "Do not guess a place name, address, reason for being here, or who is nearby.",
        "Say clearly that this is not a recognized trusted place.",
        "Offer calm support: stay where you are if safe, call the caregiver, show the helper card, or call emergency services if unsafe or urgent."
      ].join(" ");

  return {
    location,
    location_mode: resolved.locationMode,
    location_source: resolved.source,
    trusted_place: trustedPlace?.name ?? "Other",
    trusted_place_address: trustedPlaceAddress,
    location_coordinates: `${formatCoordinate(resolved.coordinates.latitude)}, ${formatCoordinate(resolved.coordinates.longitude)}`,
    time_of_day: scenarioTimeOfDay(scenario),
    next_event: scenarioNextEvent(scenario, params.trustedLocations),
    current_activity: scenario.currentActivity ?? "No specific current activity is confirmed.",
    who_is_expected: scenarioExpectedVisitor(scenario, params.profile),
    caregiver_name: params.profile.caregiverName,
    notes,
    safety_fallback: "If the user feels unsafe or urgently needs help, tell them to call their caregiver or emergency services right away."
  };
}

export const caregiverSummary = {
  personName: "Alex",
  lastCheckIn: "10 minutes ago",
  status: "Calm and oriented after reminder",
  todaysEvents: 4
};

export const eventLog: EventLogItem[] = [
  { id: "1", time: "6:05 PM", message: "Opened Today Window and reviewed trusted-place context." },
  { id: "2", time: "6:07 PM", message: "Completed quick check-in question set." },
  { id: "3", time: "6:10 PM", message: "Ran demo scenario with trusted-place matching." },
  { id: "4", time: "6:12 PM", message: "Caregiver dashboard reviewed current location summary." }
];


// ---

// FILE: lib/places.ts

import {
  defaultTrustedLocations,
  generateId,
  type BrowserLocation,
  type DemoScenario,
  type LocationMode,
  type LocationSource,
  type TrustedLocation
} from "@/data/demoState";
import { supabase } from "./supabaseClient";

const DEMO_PROFILE_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_PLACE_RADIUS_METERS = 75;
export const MAX_DEMO_BROWSER_ACCURACY_METERS = 250;

type PlaceRow = {
  id: string;
  name: string;
  address: string | null;
  instructions: string | null;
  trusted_slot: number | null;
  latitude: number | null;
  longitude: number | null;
  place_type: string | null;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type TrustedPlaceMatch = {
  place: TrustedLocation;
  distanceMeters: number;
  radiusMeters: number;
};

export type ResolvedLocationContext = {
  source: LocationSource;
  coordinates: Coordinates;
  accuracyMeters: number | null;
  matchedTrustedPlace: TrustedLocation | null;
  matchedPlaceId: string | null;
  scenarioPlace: TrustedLocation | null;
  locationMode: LocationMode;
  fallbackReason?: "browser_unavailable" | "browser_inaccurate";
};

function fallbackPlaceForSlot(slot: 1 | 2 | 3): TrustedLocation | undefined {
  return defaultTrustedLocations.find((location) => location.trustedSlot === slot);
}

export function haversineDistanceMeters(a: Coordinates, b: Coordinates): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const startLatitude = toRadians(a.latitude);
  const endLatitude = toRadians(b.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(startLatitude) * Math.cos(endLatitude) *
    Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function matchTrustedPlace(
  coordinates: Coordinates,
  locations: TrustedLocation[]
): TrustedPlaceMatch | null {
  let bestMatch: TrustedPlaceMatch | null = null;

  for (const location of locations) {
    if (typeof location.latitude !== "number" || typeof location.longitude !== "number") {
      continue;
    }

    const radiusMeters = location.radiusMeters ?? fallbackPlaceForSlot(location.trustedSlot)?.radiusMeters ?? DEFAULT_PLACE_RADIUS_METERS;
    const distanceMeters = haversineDistanceMeters(coordinates, {
      latitude: location.latitude,
      longitude: location.longitude
    });

    if (distanceMeters > radiusMeters) {
      continue;
    }

    if (!bestMatch || distanceMeters < bestMatch.distanceMeters) {
      bestMatch = { place: location, distanceMeters, radiusMeters };
    }
  }

  return bestMatch;
}

export function resolveActiveLocationContext(params: {
  scenario: DemoScenario;
  trustedLocations: TrustedLocation[];
  activeLocationSource: LocationSource;
  browserLocation: BrowserLocation | null;
}): ResolvedLocationContext {
  const { scenario, trustedLocations, activeLocationSource, browserLocation } = params;
  const scenarioPlace = scenario.scenarioPlaceId
    ? trustedLocations.find((location) => location.id === scenario.scenarioPlaceId) ?? null
    : null;

  let source: LocationSource = "scenario_seed";
  let coordinates: Coordinates = scenario.seededCoordinates;
  let accuracyMeters: number | null = null;
  let fallbackReason: ResolvedLocationContext["fallbackReason"];

  if (activeLocationSource === "browser_geolocation") {
    if (!browserLocation) {
      fallbackReason = "browser_unavailable";
    } else if (browserLocation.accuracyMeters > MAX_DEMO_BROWSER_ACCURACY_METERS) {
      fallbackReason = "browser_inaccurate";
    } else {
      source = "browser_geolocation";
      coordinates = {
        latitude: browserLocation.latitude,
        longitude: browserLocation.longitude
      };
      accuracyMeters = browserLocation.accuracyMeters;
    }
  }

  const match = matchTrustedPlace(coordinates, trustedLocations);

  return {
    source,
    coordinates,
    accuracyMeters,
    matchedTrustedPlace: match?.place ?? null,
    matchedPlaceId: match?.place.id ?? null,
    scenarioPlace,
    locationMode: match ? "trusted_place" : "other",
    fallbackReason
  };
}

export async function loadTrustedLocations(userId = DEMO_PROFILE_ID): Promise<TrustedLocation[]> {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("id, name, address, instructions, trusted_slot, latitude, longitude, place_type")
      .eq("user_id", userId)
      .eq("is_trusted", true)
      .order("trusted_slot", { ascending: true });

    if (error || !data) {
      return [];
    }

    return (data as PlaceRow[])
      .filter((row) => row.trusted_slot === 1 || row.trusted_slot === 2 || row.trusted_slot === 3)
      .map((row) => {
        const fallback = fallbackPlaceForSlot(row.trusted_slot as 1 | 2 | 3);
        return {
          id: row.id,
          trustedSlot: row.trusted_slot as 1 | 2 | 3,
          name: row.name,
          address: row.address ?? undefined,
          displayAddress: row.address ?? fallback?.displayAddress ?? undefined,
          instructions: row.instructions ?? fallback?.instructions ?? undefined,
          latitude: row.latitude ?? fallback?.latitude,
          longitude: row.longitude ?? fallback?.longitude,
          radiusMeters: fallback?.radiusMeters ?? DEFAULT_PLACE_RADIUS_METERS,
          placeType: (row.place_type as TrustedLocation["placeType"] | null) ?? fallback?.placeType ?? "trusted"
        };
      });
  } catch {
    return [];
  }
}

export async function saveTrustedLocation(location: TrustedLocation, userId = DEMO_PROFILE_ID): Promise<TrustedLocation> {
  const fallback = fallbackPlaceForSlot(location.trustedSlot);
  const payload = {
    id: location.id ?? fallback?.id ?? generateId(),
    user_id: userId,
    name: location.name.trim(),
    address: location.address?.trim() || null,
    instructions: location.instructions?.trim() || null,
    latitude: typeof location.latitude === "number" ? location.latitude : fallback?.latitude ?? null,
    longitude: typeof location.longitude === "number" ? location.longitude : fallback?.longitude ?? null,
    is_trusted: true,
    trusted_slot: location.trustedSlot,
    place_type: location.placeType ?? fallback?.placeType ?? "trusted"
  };

  await supabase.from("places").upsert(payload);

  return {
    id: payload.id,
    trustedSlot: location.trustedSlot,
    name: payload.name,
    address: payload.address ?? undefined,
    displayAddress: location.displayAddress ?? payload.address ?? fallback?.displayAddress ?? undefined,
    instructions: payload.instructions ?? undefined,
    latitude: payload.latitude ?? undefined,
    longitude: payload.longitude ?? undefined,
    radiusMeters: location.radiusMeters ?? fallback?.radiusMeters ?? DEFAULT_PLACE_RADIUS_METERS,
    placeType: payload.place_type as TrustedLocation["placeType"]
  };
}

export async function clearTrustedLocation(slot: 1 | 2 | 3, userId = DEMO_PROFILE_ID): Promise<void> {
  try {
    await supabase
      .from("places")
      .delete()
      .eq("user_id", userId)
      .eq("trusted_slot", slot)
      .eq("is_trusted", true);
  } catch {
    // non-fatal for demo mode
  }
}


// ---

// FILE: lib/logEvent.ts

import type { DemoEvent } from "@/data/demoState";
import { supabase } from "./supabaseClient";

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function logActivityEvent(event: DemoEvent): Promise<void> {
  try {
    await supabase.from("activity_events").upsert({
      id: event.id,
      user_id: event.userId,
      event_type: event.eventType,
      created_at: event.timestamp,
      source: event.source,
      scenario_id: event.scenarioId ?? null,
      place_id: event.placeId && isValidUuid(event.placeId) ? event.placeId : null,
      latitude: event.latitude ?? null,
      longitude: event.longitude ?? null,
      metadata: event.metadata ?? null,
    });
  } catch {
    // Non-fatal in demo mode.
  }
}

export async function logSystemEvent(event: DemoEvent): Promise<void> {
  try {
    await supabase.from("system_events").upsert({
      id: event.id,
      user_id: event.userId,
      event_type: event.eventType,
      created_at: event.timestamp,
      source: event.source,
      scenario_id: event.scenarioId ?? null,
      metadata: event.metadata ?? null,
    });
  } catch {
    // Non-fatal in demo mode.
  }
}


// ---

// FILE: lib/aiConfig.ts

export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";


// ---

// FILE: lib/seedData.ts

import { defaultTrustedLocations, demoScenarios, PLACE_HOME_ID, PLACE_DOCTOR_ID, SCHEDULED_EVENT_DOCTOR_ID } from "@/data/demoState";
import { supabase } from "./supabaseClient";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

// ── Types ────────────────────────────────────────────────────────────────────

type ActivityRow = {
  id: string;
  user_id: string;
  event_type: string;
  source: string;
  confidence_level?: string | null;
  scenario_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  place_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
};

type BiometricRow = {
  id: string;
  user_id: string;
  event_type: string;
  value: number;
  unit: string;
  threshold_exceeded: boolean;
  source: string;
  recorded_at: string;
  created_at: string;
};

type Phase = 1 | 2 | 3 | 4;

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isoTs(year: number, month: number, day: number, hour: number, minute: number): string {
  const d = new Date();
  d.setUTCFullYear(year, month - 1, day);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ── Static config ─────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number): number {
  // month is 1-indexed; day 0 of the next UTC month = last day of this month
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// Emergency event days keyed by rolling window index (0=oldest month, 11=current month)
// Indices 6-11 correspond to phases 3 and 4 per the narrative
const EMERGENCY_DAYS_BY_INDEX: Record<number, number[]> = {
  6:  [8, 22],
  7:  [5, 14, 25],
  8:  [10, 21],
  9:  [3, 15, 27],
  10: [7, 12, 19, 28],
  11: [4, 16, 23],
};

const CHECK_IN_QUESTIONS = [
  "Would you like to sit down and take a slow breath?",
  "Do you want a quick reminder of your plan for tonight?",
  "Would calling your caregiver help right now?",
];

function getPhaseByIndex(idx: number): Phase {
  if (idx <= 2) return 1;
  if (idx <= 5) return 2;
  if (idx <= 8) return 3;
  return 4;
}

// Time-of-day weights per phase
function randomHour(phase: Phase): number {
  const r = Math.random();
  if (phase === 1) {
    return r < 0.82 ? randInt(6, 11) : randInt(12, 17);
  }
  if (phase === 2) {
    if (r < 0.50) return randInt(6, 11);
    if (r < 0.88) return randInt(12, 17);
    return randInt(18, 21);
  }
  if (phase === 3) {
    if (r < 0.38) return randInt(6, 11);
    if (r < 0.72) return randInt(12, 17);
    return randInt(18, 21);
  }
  // Phase 4: spread across all hours
  if (r < 0.28) return randInt(6, 11);
  if (r < 0.52) return randInt(12, 17);
  if (r < 0.78) return randInt(18, 21);
  return r < 0.90 ? randInt(22, 23) : randInt(0, 5);
}

function randomConfidence(phase: Phase): string {
  const r = Math.random();
  if (phase === 1) return r < 0.72 ? "high" : r < 0.95 ? "medium" : "low";
  if (phase === 2) return r < 0.35 ? "high" : r < 0.85 ? "medium" : "low";
  if (phase === 3) return r < 0.15 ? "high" : r < 0.58 ? "medium" : "low";
  return r < 0.08 ? "high" : r < 0.38 ? "medium" : "low";
}

function scenarioForHour(hour: number): string {
  if (hour >= 6 && hour < 11) return "home_reorientation";
  if (hour >= 11 && hour < 14) return "doctor_appointment_prep";
  if (hour >= 14 && hour < 18) return "pharmacy_confusion";
  return "lost_unknown_location";
}

function scenarioDetails(scenarioId: string): { placeId: string | null; latitude: number | null; longitude: number | null } {
  const scenario = demoScenarios.find((entry) => entry.id === scenarioId);
  return {
    placeId: scenario?.scenarioPlaceId ?? null,
    latitude: scenario?.seededCoordinates.latitude ?? null,
    longitude: scenario?.seededCoordinates.longitude ?? null,
  };
}

// ── Per-day event generation ─────────────────────────────────────────────────

function generateDay(
  year: number,
  month: number,
  day: number,
  phase: Phase,
  isEmergencyDay: boolean
): { activity: ActivityRow[]; biometric: BiometricRow[] } {
  const activity: ActivityRow[] = [];
  const biometric: BiometricRow[] = [];

  // Reorientation event count
  let reorientCount: number;
  switch (phase) {
    case 1:  reorientCount = randInt(1, 2); break;
    case 2:  reorientCount = randInt(2, 3); break;
    case 3:  reorientCount = randInt(3, 5); break;
    default: reorientCount = randInt(4, 6); break;
  }
  // Emergency days always qualify as hard days
  if (isEmergencyDay && reorientCount < 4) reorientCount = 4;
  const isHardDay = reorientCount >= 4;

  // 1. Reorientation events
  for (let i = 0; i < reorientCount; i++) {
    const h = randomHour(phase);
    const confidence = randomConfidence(phase);
    const scenarioId = scenarioForHour(h);
    const location = scenarioDetails(scenarioId);
    activity.push({
      id: generateId(),
      user_id: DEMO_USER_ID,
      event_type: "reorientation_started",
      source: "app",
      confidence_level: confidence,
      scenario_id: scenarioId,
      latitude: location.latitude,
      longitude: location.longitude,
      place_id: location.placeId,
      metadata: { uncertainty: confidence },
      created_at: isoTs(year, month, day, h, randInt(0, 59)),
    });
  }

  // 2. Check-in (~60% of days)
  if (Math.random() < 0.60) {
    const hour = randomHour(phase);
    const scenarioId = scenarioForHour(hour);
    const location = scenarioDetails(scenarioId);
    activity.push({
      id: generateId(),
      user_id: DEMO_USER_ID,
      event_type: "checkin_submitted",
      source: "app",
      scenario_id: scenarioId,
      latitude: location.latitude,
      longitude: location.longitude,
      place_id: location.placeId,
      metadata: { question: pick(CHECK_IN_QUESTIONS) },
      created_at: isoTs(year, month, day, hour, randInt(0, 59)),
    });
  }

  // 3. Helper card events
  let helperCount: number;
  const hr = Math.random();
  switch (phase) {
    case 1:  helperCount = hr < 0.20 ? 1 : 0; break;
    case 2:  helperCount = hr < 0.50 ? 1 : 0; break;
    case 3:  helperCount = isHardDay ? randInt(1, 2) : (hr < 0.80 ? 1 : 0); break;
    default: helperCount = isHardDay ? randInt(2, 4) : randInt(1, 2); break;
  }
  for (let i = 0; i < helperCount; i++) {
    const hour = randomHour(phase);
    const scenarioId = scenarioForHour(hour);
    const location = scenarioDetails(scenarioId);
    activity.push({
      id: generateId(),
      user_id: DEMO_USER_ID,
      event_type: "helper_card_shown",
      source: "app",
      scenario_id: scenarioId,
      latitude: location.latitude,
      longitude: location.longitude,
      place_id: location.placeId,
      created_at: isoTs(year, month, day, hour, randInt(0, 59)),
    });
  }

  // 4. Caregiver calls (clustered on hard/emergency days)
  let caregiverCount: number;
  if (isEmergencyDay) {
    caregiverCount = phase <= 3 ? randInt(3, 4) : randInt(4, 5);
  } else {
    const cr = Math.random();
    switch (phase) {
      case 1:  caregiverCount = cr < 0.15 ? 1 : 0; break;
      case 2:  caregiverCount = cr < 0.60 ? 0 : cr < 0.90 ? 1 : 2; break;
      case 3:  caregiverCount = isHardDay ? randInt(2, 3) : (cr < 0.40 ? 1 : 0); break;
      default: caregiverCount = isHardDay ? randInt(4, 5) : randInt(1, 2); break;
    }
  }

  if (caregiverCount > 0) {
    const shouldCluster = (phase >= 3 && isHardDay) || isEmergencyDay;
    if (shouldCluster) {
      // All calls within a 90-minute panic window
      const panicHour = randomHour(phase);
      for (let i = 0; i < caregiverCount; i++) {
        const offsetMin = randInt(0, 89);
        const totalMin = panicHour * 60 + offsetMin;
        const scenarioId = scenarioForHour(panicHour);
        const location = scenarioDetails(scenarioId);
        activity.push({
          id: generateId(),
          user_id: DEMO_USER_ID,
          event_type: "caregiver_called",
          source: "app",
          scenario_id: scenarioId,
          latitude: location.latitude,
          longitude: location.longitude,
          place_id: location.placeId,
          created_at: isoTs(year, month, day, Math.min(Math.floor(totalMin / 60), 23), totalMin % 60),
        });
      }
    } else {
      for (let i = 0; i < caregiverCount; i++) {
        const hour = randomHour(phase);
        const scenarioId = scenarioForHour(hour);
        const location = scenarioDetails(scenarioId);
        activity.push({
          id: generateId(),
          user_id: DEMO_USER_ID,
          event_type: "caregiver_called",
          source: "app",
          scenario_id: scenarioId,
          latitude: location.latitude,
          longitude: location.longitude,
          place_id: location.placeId,
          created_at: isoTs(year, month, day, hour, randInt(0, 59)),
        });
      }
    }
  }

  // 5. Emergency event
  if (isEmergencyDay) {
    const hour = randInt(18, 21);
    const scenarioId = scenarioForHour(hour);
    const location = scenarioDetails(scenarioId);
    activity.push({
      id: generateId(),
      user_id: DEMO_USER_ID,
      event_type: "emergency_called",
      source: "app",
      scenario_id: scenarioId,
      latitude: location.latitude,
      longitude: location.longitude,
      place_id: location.placeId,
      created_at: isoTs(year, month, day, hour, randInt(0, 59)),
    });
  }

  // 6. Biometric events — elevated heart rate on hard days (4+ reorientation events)
  if (isHardDay) {
    const sampleCount = randInt(2, 3);
    const baseHour = randomHour(phase);
    for (let i = 0; i < sampleCount; i++) {
      const h = Math.min(baseHour + i, 23);
      const bpm = isEmergencyDay ? randInt(128, 152) : randInt(103, 128);
      const ts = isoTs(year, month, day, h, randInt(0, 59));
      biometric.push({
        id: generateId(),
        user_id: DEMO_USER_ID,
        event_type: "heart_rate",
        value: bpm,
        unit: "bpm",
        threshold_exceeded: true,
        source: "synthetic",
        recorded_at: ts,
        created_at: ts,
      });
    }
  }

  return { activity, biometric };
}

// ── Batch insert ──────────────────────────────────────────────────────────────

async function insertActivityBatch(rows: ActivityRow[]): Promise<void> {
  for (let i = 0; i < rows.length; i += 50) {

    const { error } = await (supabase.from("activity_events") as any).insert(rows.slice(i, i + 50));
    if (error) throw new Error(`activity_events: ${(error as { message: string }).message}`);
  }
}

async function seedCoreDemoRows(): Promise<void> {
  await (supabase.from("profiles") as any).upsert({
    id: DEMO_USER_ID,
    preferred_name: "Alex",
    pronouns: "he/him",
    active_caregiver_id: "00000000-0000-0000-0000-000000000002",
  });

  await (supabase.from("caregivers") as any).upsert({
    id: "00000000-0000-0000-0000-000000000002",
    name: "Maria",
    relationship_label: "daughter",
  });

  await (supabase.from("caregiver_user_relationships") as any).upsert({
    user_id: DEMO_USER_ID,
    caregiver_id: "00000000-0000-0000-0000-000000000002",
    role: "primary",
    is_primary_contact: true,
    permissions: {},
  });

  for (const location of defaultTrustedLocations) {
    await (supabase.from("places") as any).upsert({
      id: location.id,
      user_id: DEMO_USER_ID,
      name: location.name,
      address: location.address ?? null,
      latitude: location.latitude ?? null,
      longitude: location.longitude ?? null,
      place_type: location.placeType ?? "trusted",
      instructions: location.instructions ?? null,
      is_home: location.id === PLACE_HOME_ID,
      is_trusted: true,
      trusted_slot: location.trustedSlot,
    });
  }

  await (supabase.from("scheduled_events") as any).upsert({
    id: SCHEDULED_EVENT_DOCTOR_ID,
    user_id: DEMO_USER_ID,
    title: "Doctor appointment",
    description: "Routine follow-up visit",
    location: "Doctor's Office",
    place_id: PLACE_DOCTOR_ID,
    start_time: new Date().toISOString(),
    notes: "Bring ID, insurance card, phone, keys, and medication list.",
  });
}

async function insertBiometricBatch(rows: BiometricRow[]): Promise<void> {
  for (let i = 0; i < rows.length; i += 50) {

    const { error } = await (supabase.from("biometric_events") as any).insert(rows.slice(i, i + 50));
    if (error) throw new Error(`biometric_events: ${(error as { message: string }).message}`);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function seedDemoData(): Promise<{ success: boolean; message: string }> {
  try {
    await seedCoreDemoRows();

    const allActivity: ActivityRow[] = [];
    const allBiometric: BiometricRow[] = [];

    // Build rolling 12-month window ending at start of today
    const now = new Date();
    const rollingMonths: Array<{ year: number; month: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      rollingMonths.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
    }

    for (let idx = 0; idx < 12; idx++) {
      const { year, month } = rollingMonths[idx];
      const phase = getPhaseByIndex(idx);
      const emergencyDays = EMERGENCY_DAYS_BY_INDEX[idx] ?? [];
      const days = daysInMonth(year, month);

      for (let day = 1; day <= days; day++) {
        const { activity, biometric } = generateDay(year, month, day, phase, emergencyDays.includes(day));
        allActivity.push(...activity);
        allBiometric.push(...biometric);
      }
    }

    await insertActivityBatch(allActivity);
    await insertBiometricBatch(allBiometric);

    return {
      success: true,
      message: `Seeded ${allActivity.length} activity events and ${allBiometric.length} biometric events.`,
    };
  } catch (err) {
    return { success: false, message: `Seed failed: ${String(err)}` };
  }
}

export async function clearSeedData(): Promise<{ success: boolean; message: string }> {
  try {
    for (const table of ["activity_events", "system_events", "biometric_events"] as const) {
  
      const { error } = await (supabase.from(table) as any).delete().eq("user_id", DEMO_USER_ID);
      if (error) throw new Error(`${table}: ${(error as { message: string }).message}`);
    }
    return { success: true, message: "All seeded data cleared." };
  } catch (err) {
    return { success: false, message: `Clear failed: ${String(err)}` };
  }
}


// ---

// FILE: app/app/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EventLogList from "@/components/EventLogList";
import HelperModal from "@/components/HelperModal";
import MemoryIcon from "@/components/MemoryIcon";
import {
  appendActivityEvent,
  createEvent,
  findScenario,
  initialDemoState,
  normalizeDemoState,
  storageKey,
  type DemoState,
} from "@/data/demoState";
import { buildActiveLocationSummary, buildContextPacket } from "@/data/demoData";
import { resolveActiveLocationContext } from "@/lib/places";

const RECENT_GUIDANCE_KEY = "recentGuidance";

type QuestionKey = "where_am_i" | "what_is_happening" | "what_should_i_do_next";
type GuidanceEntry = { question: string; response: string; timestamp: string };

const questionLabels: Record<QuestionKey, string> = {
  where_am_i: "Where am I?",
  what_is_happening: "What is happening?",
  what_should_i_do_next: "What should I do next?",
};

function loadRecentGuidance(): GuidanceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_GUIDANCE_KEY) ?? "[]") as GuidanceEntry[];
  } catch {
    return [];
  }
}

function saveRecentGuidance(entry: GuidanceEntry): void {
  if (typeof window === "undefined") return;
  const existing = loadRecentGuidance();
  const updated = [entry, ...existing].slice(0, 10);
  window.localStorage.setItem(RECENT_GUIDANCE_KEY, JSON.stringify(updated));
}

function loadState(): DemoState {
  if (typeof window === "undefined") {
    return initialDemoState;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return initialDemoState;
  }

  try {
    return normalizeDemoState(JSON.parse(raw));
  } catch {
    return initialDemoState;
  }
}

function saveState(nextState: DemoState): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
  }
}

function recommendedNextAction(question: string, caregiverName: string): string {
  if (question.includes("slow breath")) {
    return "Take three slow breaths, then look at the next step card again.";
  }

  if (question.includes("plan")) {
    return "Review the next event and gather only the items you need right now.";
  }

  if (question.includes("calling your caregiver")) {
    return `Call ${caregiverName} for reassurance now.`;
  }

  return "Pause, read the next step slowly, and ask for support if you want it.";
}

function timeGreeting(name: string, scenarioHour: number | null = null): string {
  const hour = scenarioHour !== null ? scenarioHour : new Date().getHours();
  const preferredName = name || "Alex";
  if (hour >= 5 && hour < 12) return `Good morning, ${preferredName}.`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${preferredName}.`;
  if (hour >= 17 && hour < 21) return `Good evening, ${preferredName}.`;
  return `Good night, ${preferredName}.`;
}

export default function TodayWindowPage() {
  const [helperOpen, setHelperOpen] = useState(false);
  const [callingCaregiver, setCallingCaregiver] = useState(false);
  const [callingEmergency, setCallingEmergency] = useState(false);
  const [lastGuidanceUpdate, setLastGuidanceUpdate] = useState<string | null>(null);
  const [state, setState] = useState<DemoState>(initialDemoState);

  const [emergencyExpanded, setEmergencyExpanded] = useState(false);

  useEffect(() => {
    if (!emergencyExpanded) return;
    const timeout = setTimeout(() => setEmergencyExpanded(false), 4000);
    return () => clearTimeout(timeout);
  }, [emergencyExpanded]);

  const [helpMeNowOpen, setHelpMeNowOpen] = useState(false);
  const [streamingQuestion, setStreamingQuestion] = useState<QuestionKey | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [streamingLoading, setStreamingLoading] = useState(false);
  const [streamPanelOpen, setStreamPanelOpen] = useState(false);
  const [recentGuidanceOpen, setRecentGuidanceOpen] = useState(false);
  const [recentGuidance, setRecentGuidance] = useState<GuidanceEntry[]>([]);

  const [checkInDoneThisSession, setCheckInDoneThisSession] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInQuestionsLoading, setCheckInQuestionsLoading] = useState(false);
  const [aiCheckInQuestions, setAiCheckInQuestions] = useState<string[]>([]);
  const [checkInSelectedQuestion, setCheckInSelectedQuestion] = useState("");
  const [checkInResponseOpen, setCheckInResponseOpen] = useState(false);
  const [checkInResponseText, setCheckInResponseText] = useState("");
  const [checkInResponseLoading, setCheckInResponseLoading] = useState(false);
  const [checkInActiveQuestion, setCheckInActiveQuestion] = useState("");

  useEffect(() => {
    setState(loadState());
    setRecentGuidance(loadRecentGuidance());
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);

  const resolvedLocation = useMemo(
    () => resolveActiveLocationContext({
      scenario: activeScenario,
      trustedLocations: state.trustedLocations,
      activeLocationSource: state.activeLocationSource,
      browserLocation: state.browserLocation,
    }),
    [activeScenario, state.activeLocationSource, state.browserLocation, state.trustedLocations]
  );

  const activeLocationSummary = useMemo(
    () => buildActiveLocationSummary({
      scenarioId: state.activeScenarioId,
      profile: state.profile,
      trustedLocations: state.trustedLocations,
      activeLocationSource: state.activeLocationSource,
      browserLocation: state.browserLocation,
    }),
    [state.activeScenarioId, state.activeLocationSource, state.browserLocation, state.profile, state.trustedLocations]
  );

  const contextPacket = useMemo(
    () => buildContextPacket({
      scenarioId: state.activeScenarioId,
      profile: state.profile,
      trustedLocations: state.trustedLocations,
      activeLocationSource: state.activeLocationSource,
      browserLocation: state.browserLocation,
    }),
    [state.activeScenarioId, state.activeLocationSource, state.browserLocation, state.profile, state.trustedLocations]
  );

  const persist = (nextState: DemoState) => {
    setState(nextState);
    saveState(nextState);
  };

  const eventLocationDetails = useMemo(
    () => ({
      placeId: resolvedLocation.matchedPlaceId,
      latitude: resolvedLocation.coordinates.latitude,
      longitude: resolvedLocation.coordinates.longitude,
      accuracyMeters: resolvedLocation.accuracyMeters,
      locationSource: resolvedLocation.source,
    }),
    [resolvedLocation]
  );

  const createLocationEvent = (eventType: string, metadata?: Record<string, unknown>) =>
    createEvent(
      eventType,
      "app",
      activeScenario.id,
      metadata,
      state.profile.userId,
      eventLocationDetails
    );

  const handleHelpMeNow = () => {
    let nextState = appendActivityEvent(
      state,
      createLocationEvent("reorientation_started", {
        uncertainty: activeScenario.uncertainty,
        locationMode: resolvedLocation.locationMode,
        trustedPlace: activeLocationSummary.trustedPlaceName,
        trustedPlaceAddress: activeLocationSummary.trustedPlaceAddress,
      })
    );

    if (resolvedLocation.locationMode === "other") {
      nextState = appendActivityEvent(
        nextState,
        createLocationEvent("fallback_shown", {
          level: "high",
          reason: "unrecognized_location",
          message: "I do not recognize this as one of your saved trusted places.",
        })
      );
    }

    persist(nextState);
    setHelpMeNowOpen(true);
    setLastGuidanceUpdate(new Date().toLocaleTimeString());
  };

  const askQuestion = async (key: QuestionKey) => {
    setStreamingQuestion(key);
    setStreamedText("");
    setStreamingLoading(true);
    setStreamPanelOpen(true);

    try {
      const response = await fetch("/api/reorient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: key,
          context: contextPacket,
          userName: state.profile.preferredName,
        }),
      });

      if (!response.ok || !response.body) {
        setStreamedText("I am here with you. Please take a breath. If you need help, contact your caregiver.");
        setStreamingLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamedText(fullText);
      }

      setStreamingLoading(false);

      const entry: GuidanceEntry = {
        question: questionLabels[key],
        response: fullText,
        timestamp: new Date().toISOString(),
      };
      saveRecentGuidance(entry);
      setRecentGuidance(loadRecentGuidance());

      persist(
        appendActivityEvent(
          state,
          createLocationEvent("reorientation_card_viewed", {
            question: key,
            locationMode: resolvedLocation.locationMode,
            trustedPlace: activeLocationSummary.trustedPlaceName,
            trustedPlaceAddress: activeLocationSummary.trustedPlaceAddress,
            ai_response: fullText,
          })
        )
      );
    } catch {
      setStreamedText("I am here with you. Please take a breath. If you need help, contact your caregiver.");
      setStreamingLoading(false);
    }
  };

  const dismissStreamPanel = () => {
    setStreamPanelOpen(false);
    setStreamingQuestion(null);
    setStreamedText("");
  };

  const handleOpenCheckIn = () => {
    setCheckInOpen(true);
    setCheckInQuestionsLoading(true);
    setAiCheckInQuestions([]);
    setCheckInSelectedQuestion("");

    const recentQuestion = loadRecentGuidance()[0]?.question ?? null;

    fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "questions",
        context: {
          ...contextPacket,
          scenario: activeScenario.id,
          ...(recentQuestion ? { recentHelpMeNowQuestion: recentQuestion } : {}),
        },
        userName: state.profile.preferredName,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed");
        return response.json() as Promise<string[]>;
      })
      .then((questions) => {
        if (Array.isArray(questions) && questions.length > 0) {
          setAiCheckInQuestions(questions);
          return;
        }
        throw new Error("Invalid");
      })
      .catch(() => {
        setAiCheckInQuestions([
          "How are you feeling right now?",
          "Would you like a moment to sit and breathe?",
          "Is there anything you need help with?",
        ]);
      })
      .finally(() => setCheckInQuestionsLoading(false));
  };

  const handleCheckInTap = (question: string) => {
    if (question !== checkInSelectedQuestion) {
      setCheckInSelectedQuestion(question);
      return;
    }

    void commitCheckIn(question);
  };

  const commitCheckIn = async (question: string) => {
    const nextAction = recommendedNextAction(question, state.profile.caregiverName);
    const nextState = appendActivityEvent(
      { ...state, checkInStatus: `Check-in saved: ${question} Recommended next action: ${nextAction}` },
      createLocationEvent("checkin_submitted", {
        question,
        locationMode: resolvedLocation.locationMode,
        trustedPlace: activeLocationSummary.trustedPlaceName,
        trustedPlaceAddress: activeLocationSummary.trustedPlaceAddress,
      })
    );
    persist(nextState);

    setCheckInDoneThisSession(true);
    setCheckInActiveQuestion(question);
    setCheckInResponseText("");
    setCheckInResponseLoading(true);
    setCheckInResponseOpen(true);

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "response",
          context: contextPacket,
          selectedQuestion: question,
          userName: state.profile.preferredName,
        }),
      });

      if (!response.ok || !response.body) {
        setCheckInResponseText("I hear you. Take a gentle breath. You are doing well.");
        setCheckInResponseLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setCheckInResponseText(fullText);
      }

      setCheckInResponseLoading(false);
    } catch {
      setCheckInResponseText("I hear you. Take a gentle breath. You are doing well.");
      setCheckInResponseLoading(false);
    }
  };

  const callCaregiver = () => {
    persist(appendActivityEvent(state, createLocationEvent("caregiver_called")));
    setCallingCaregiver(true);
  };

  const callEmergency = () => {
    persist(appendActivityEvent(state, createLocationEvent("emergency_called")));
    setCallingEmergency(true);
  };

  const eventItems = [...state.activityEvents, ...state.systemEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const showUnknownLocationPrompt = resolvedLocation.locationMode === "other";

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1 text-center">
          <h1 className="text-4xl font-semibold text-brand-text">Today</h1>
          <p className="text-lg text-brand-muted">{timeGreeting(state.profile.preferredName, activeScenario.scenarioHour ?? null)}</p>
        </header>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <MemoryIcon name="clock" className="h-6 w-6 text-brand-primary" />
            <h2 className="text-lg font-semibold text-brand-text">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h2>
          </div>
          <p className="text-sm text-brand-muted">
            <span className="font-medium text-brand-text">Where:</span> {activeLocationSummary.label}
          </p>
          {activeLocationSummary.trustedPlaceAddress ? (
            <p className="text-xs text-brand-muted">
              Saved place: {activeLocationSummary.trustedPlaceAddress}
            </p>
          ) : null}
          {activeLocationSummary.fallbackMessage ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {activeLocationSummary.fallbackMessage}
            </p>
          ) : null}
          <p className="text-sm text-brand-muted">
            <span className="font-medium text-brand-text">Next:</span> {contextPacket.next_event}
          </p>
          {contextPacket.who_is_expected !== "No other people are required right now." ? (
            <p className="text-sm text-brand-muted">
              <span className="font-medium text-brand-text">Who:</span> {contextPacket.who_is_expected}
            </p>
          ) : null}
        </section>

        <section className="space-y-3">
          <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleOpenCheckIn}
                disabled={checkInOpen}
                className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-4 text-base font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  checkInOpen ? "bg-green-800 opacity-75" : "bg-green-700"
                }`}
              >
                <MemoryIcon name="checkCircle" className="h-6 w-6 shrink-0 text-white" />
                {checkInDoneThisSession ? "Do another check-in" : "Do a quick check-in"}
              </button>

              {checkInOpen && checkInQuestionsLoading ? (
                <p className="text-xs text-brand-muted">Preparing your check-in...</p>
              ) : null}

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  checkInOpen && !checkInQuestionsLoading && aiCheckInQuestions.length > 0
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-2 pt-1">
                  {aiCheckInQuestions.map((question, index) => {
                    const isSelected = question === checkInSelectedQuestion;
                    const isDeselected = checkInSelectedQuestion !== "" && !isSelected;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleCheckInTap(question)}
                        className={`w-full cursor-pointer rounded-xl border p-4 text-left text-sm font-medium transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                          isSelected
                            ? "border-lime-500 bg-lime-100 text-brand-text"
                            : isDeselected
                              ? "border-brand-border bg-white text-brand-text opacity-60"
                              : "border-brand-border bg-white text-brand-text hover:bg-lime-50"
                        }`}
                      >
                        {question}
                      </button>
                    );
                  })}
                  <p className="text-xs text-brand-muted">
                    {checkInSelectedQuestion
                      ? "Tap the highlighted option again to confirm."
                      : "Tap once to select, tap again to confirm."}
                  </p>
                </div>
              </div>

              {checkInDoneThisSession && !checkInOpen ? (
                <div className="rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3">
                  <p className="text-sm font-medium text-lime-800">Check-in saved.</p>
                  <p className="mt-1 text-xs text-brand-muted">{state.checkInStatus}</p>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleHelpMeNow}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-brand-primary px-4 py-4 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                <MemoryIcon name="home" className="h-6 w-6 shrink-0 text-white" />
                Help Me Now
              </button>
              {lastGuidanceUpdate ? (
                <p className="text-sm text-brand-muted">Last used at {lastGuidanceUpdate}.</p>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setRecentGuidanceOpen(true)}
                  className="text-sm text-brand-muted underline underline-offset-2"
                >
                  Recent guidance
                </button>
              </div>
            </div>
          </div>
        </section>

        {showUnknownLocationPrompt ? (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm space-y-2">
            <h2 className="text-lg font-semibold text-amber-900">Unrecognized location</h2>
            <p className="text-sm text-amber-900">
              I do not recognize this as one of your saved trusted places. Are you somewhere safe?
            </p>
            <p className="text-sm text-amber-800">
              Stay where you are if it feels safe. You can call {state.profile.caregiverName}, show your helper card, or call emergency services if this feels urgent.
            </p>
          </section>
        ) : null}

        <section className="space-y-3">
          <div className="space-y-3">
            <button
              type="button"
              onClick={callCaregiver}
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-brand-primary px-4 py-4 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
            >
              <MemoryIcon name="phone" className="h-6 w-6 shrink-0 text-white" />
              {`Call ${state.profile.caregiverName}`}
            </button>
            <p className="text-sm text-brand-muted">{`Call ${state.profile.caregiverName} for reassurance.`}</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                persist(appendActivityEvent(state, createLocationEvent("helper_card_shown")));
                setHelperOpen(true);
              }}
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-brand-primary px-4 py-4 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
            >
              <MemoryIcon name="compass" className="h-6 w-6 shrink-0 text-white" />
              Show helper card
            </button>
            <p className="text-sm text-brand-muted">A simple screen you can show to a nearby person.</p>
          </div>

          <Link
            href="/app/insights"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-blue-900 px-4 py-3 text-base font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            My Insights
          </Link>
        </section>

        <section className="space-y-3">
          <div className="rounded-2xl border border-brand-border bg-brand-surface px-4 py-3">
            <p className="text-sm font-medium text-brand-text">Current demo context</p>
            <p className="mt-1 text-sm text-brand-muted">{activeScenario.label}</p>
          </div>
          <h2 className="text-lg font-semibold text-brand-text">Recent demo events</h2>
          <EventLogList items={eventItems} defaultCollapsed />
        </section>
      </div>

      <p className="mt-3 text-center text-xs text-brand-muted">
        Prototype note: data is stored in this browser session for demo purposes.
      </p>

      {emergencyExpanded ? (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setEmergencyExpanded(false)}
          aria-hidden="true"
        />
      ) : null}
      <div className="fixed bottom-8 left-0 z-40 flex h-20 items-stretch overflow-hidden rounded-r-2xl shadow-lg">
        <button
          type="button"
          aria-label={emergencyExpanded ? "Collapse emergency" : "Emergency"}
          onClick={() => setEmergencyExpanded((value) => !value)}
          className="flex w-12 shrink-0 items-center justify-center bg-red-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-400"
        >
          <MemoryIcon name="shield" className="h-5 w-5 text-white" />
        </button>
        <button
          type="button"
          tabIndex={emergencyExpanded ? 0 : -1}
          onClick={() => { callEmergency(); setEmergencyExpanded(false); }}
          className={`flex items-center justify-center overflow-hidden bg-red-600 transition-all duration-200 focus:outline-none ${
            emergencyExpanded ? "w-[320px] px-4" : "w-0"
          }`}
        >
          <span className="whitespace-nowrap text-sm font-bold text-white">
            Urgent: Call Emergency Services
          </span>
        </button>
      </div>

      <HelperModal
        open={helperOpen}
        onClose={() => setHelperOpen(false)}
        profile={state.profile}
        activeLocationSummary={activeLocationSummary}
        contextPacket={contextPacket}
        onCallCaregiver={callCaregiver}
        onCallEmergency={callEmergency}
      />

      {helpMeNowOpen && !streamPanelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-semibold text-brand-text">What would you like to know?</h2>
            <div className="space-y-3">
              {(["where_am_i", "what_is_happening", "what_should_i_do_next"] as QuestionKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => askQuestion(key)}
                  disabled={streamingLoading}
                  className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-left text-base font-medium text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
                >
                  {questionLabels[key]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setHelpMeNowOpen(false)}
              className="text-sm text-brand-muted underline underline-offset-2"
            >
              Back
            </button>
          </div>
        </div>
      ) : null}

      {checkInResponseOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl border border-brand-border bg-brand-surface p-6 shadow-xl sm:rounded-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
              {checkInActiveQuestion}
            </p>
            <div className="min-h-24 text-base leading-relaxed text-brand-text">
              {checkInResponseLoading && !checkInResponseText ? (
                <span className="text-brand-muted">One moment...</span>
              ) : (
                checkInResponseText
              )}
              {checkInResponseLoading ? (
                <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-brand-primary" />
              ) : null}
            </div>
            {!checkInResponseLoading ? (
              <button
                type="button"
                onClick={() => {
                  setCheckInResponseOpen(false);
                  setCheckInResponseText("");
                  setCheckInOpen(false);
                  setCheckInSelectedQuestion("");
                }}
                className="mt-5 min-h-12 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                Got it
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {streamPanelOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl border border-brand-border bg-brand-surface p-6 shadow-xl sm:rounded-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
              {streamingQuestion ? questionLabels[streamingQuestion] : ""}
            </p>
            <div className="min-h-24 text-base leading-relaxed text-brand-text">
              {streamingLoading && !streamedText ? (
                <span className="text-brand-muted">One moment...</span>
              ) : (
                streamedText
              )}
              {streamingLoading ? <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-brand-primary" /> : null}
            </div>
            {!streamingLoading ? (
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    persist(appendActivityEvent(state, createLocationEvent("okay_confirmed", { question: streamingQuestion })));
                    setHelpMeNowOpen(false);
                    dismissStreamPanel();
                  }}
                  className="min-h-12 w-full rounded-2xl bg-green-700 px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  I&apos;m okay
                </button>
                <button
                  type="button"
                  onClick={() => { callCaregiver(); setHelpMeNowOpen(false); dismissStreamPanel(); }}
                  className="min-h-12 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
                >
                  {`Call ${state.profile.caregiverName}`}
                </button>
                <button
                  type="button"
                  onClick={() => { setHelperOpen(true); setHelpMeNowOpen(false); dismissStreamPanel(); }}
                  className="min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                >
                  Show this screen
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {recentGuidanceOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-brand-border bg-brand-surface p-6 shadow-xl sm:rounded-3xl">
            <h2 className="mb-4 text-lg font-semibold text-brand-text">Recent guidance</h2>
            {recentGuidance.length === 0 ? (
              <p className="text-sm text-brand-muted">No guidance yet. Tap Help Me Now to get started.</p>
            ) : (
              <ul className="space-y-4">
                {recentGuidance.slice(0, 5).map((entry, index) => (
                  <li key={index} className="rounded-2xl border border-brand-border bg-brand-bg p-4 space-y-1">
                    <p className="text-xs font-semibold text-brand-muted">
                      {entry.question} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-sm leading-relaxed text-brand-text">{entry.response}</p>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setRecentGuidanceOpen(false)}
              className="mt-5 min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {callingEmergency ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-lg">
            <p className="text-xl font-semibold text-brand-text">Calling 911...</p>
            <p className="mt-2 text-sm text-brand-muted">This is a demo. No real call is placed.</p>
            <button
              type="button"
              onClick={() => setCallingEmergency(false)}
              className="mt-4 min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {callingCaregiver ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-lg">
            <p className="text-xl font-semibold text-brand-text">Calling {state.profile.caregiverName}...</p>
            <p className="mt-2 text-sm text-brand-muted">This is a demo. No real call is placed.</p>
            <button
              type="button"
              onClick={() => setCallingCaregiver(false)}
              className="mt-4 min-h-12 w-full rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-base font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}


// ---

// FILE: app/caregiver/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CaregiverSummary from "@/components/CaregiverSummary";
import EventLogList from "@/components/EventLogList";
import { buildActiveLocationSummary } from "@/data/demoData";
import { appendSystemEvent, createEvent, findScenario, initialDemoState, normalizeDemoState, storageKey, type DemoState } from "@/data/demoState";
import { getMonthlyData } from "@/lib/insightsData";
import { supabase } from "@/lib/supabaseClient";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

function loadState(): DemoState {
  if (typeof window === "undefined") {
    return initialDemoState;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return initialDemoState;
  }

  try {
    return normalizeDemoState(JSON.parse(raw));
  } catch {
    return initialDemoState;
  }
}

export default function CaregiverPage() {
  const [state, setState] = useState<DemoState>(initialDemoState);
  const [caregiverRole, setCaregiverRole] = useState<"primary" | "family" | "read_only" | null | undefined>(undefined);
  const [caregiverDisplayName, setCaregiverDisplayName] = useState<string | null>(null);
  const [caregiverDisplayLabel, setCaregiverDisplayLabel] = useState<string | null>(null);
  const [stabilityScore, setStabilityScore] = useState<number | null>(null);
  const [activeIsPrimaryContact, setActiveIsPrimaryContact] = useState<boolean>(true);
  const [primaryContactName, setPrimaryContactName] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadState();
    const next = appendSystemEvent(
      loaded,
      createEvent("caregiver_view_opened", "caregiver", loaded.activeScenarioId, undefined, loaded.profile.userId)
    );
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));

    const caregiverId = loaded.profile.activeCaregiverId;
    if (caregiverId) {
      void (async () => {
        try {
          const { data: relationship } = await (supabase as any)
            .from("caregiver_user_relationships")
            .select("role, is_primary_contact")
            .eq("user_id", DEMO_USER_ID)
            .eq("caregiver_id", caregiverId)
            .maybeSingle();

          if (!relationship) {
            setCaregiverRole(null);
            return;
          }

          const relationshipRecord = relationship as Record<string, unknown>;
          setCaregiverRole(relationshipRecord.role as "primary" | "family" | "read_only");
          const isPrimaryContact = relationshipRecord.is_primary_contact as boolean;
          setActiveIsPrimaryContact(isPrimaryContact);

          if (!isPrimaryContact) {
            const { data: primaryRelationship } = await (supabase as any)
              .from("caregiver_user_relationships")
              .select("caregiver_id")
              .eq("user_id", DEMO_USER_ID)
              .eq("is_primary_contact", true)
              .maybeSingle();

            if (primaryRelationship) {
              const { data: primaryCaregiver } = await (supabase as any)
                .from("caregivers")
                .select("name")
                .eq("id", (primaryRelationship as Record<string, unknown>).caregiver_id)
                .is("deleted_at", null)
                .maybeSingle();

              if (primaryCaregiver) {
                setPrimaryContactName((primaryCaregiver as Record<string, unknown>).name as string);
              }
            }
          }

          const { data: caregiver } = await (supabase as any)
            .from("caregivers")
            .select("name, relationship_label")
            .eq("id", caregiverId)
            .is("deleted_at", null)
            .maybeSingle();

          if (caregiver) {
            const caregiverRecord = caregiver as Record<string, unknown>;
            setCaregiverDisplayName(caregiverRecord.name as string);
            setCaregiverDisplayLabel((caregiverRecord.relationship_label as string | null) ?? null);
          }
        } catch {
          setCaregiverRole(null);
        }
      })();
    } else {
      setCaregiverRole(null);
    }

    void getMonthlyData().then((data) => {
      if (data) {
        setStabilityScore(data.stabilityScore);
      }
    });
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);
  const activeLocationSummary = useMemo(
    () => buildActiveLocationSummary({
      scenarioId: state.activeScenarioId,
      profile: state.profile,
      trustedLocations: state.trustedLocations,
      activeLocationSource: state.activeLocationSource,
      browserLocation: state.browserLocation,
    }),
    [state.activeLocationSource, state.activeScenarioId, state.browserLocation, state.profile, state.trustedLocations]
  );

  const missedCalls = state.activityEvents.filter((event) => event.eventType === "caregiver_called").length;
  const emergencyCalls = state.activityEvents.filter((event) => event.eventType === "emergency_called").length;
  const okayConfirmations = state.activityEvents.filter((event) => event.eventType === "okay_confirmed").length;
  const hasDistressEvent = state.activityEvents.some((event) => event.eventType === "reorientation_started");

  const activityPanelItems = [
    ...state.activityEvents.filter((event) => event.eventType !== "reorientation_started"),
    ...state.systemEvents.filter((event) => event.eventType === "reorientation_card_viewed"),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const caregiverViewLabel = caregiverDisplayName
    ? caregiverDisplayLabel
      ? `${caregiverDisplayName} (${caregiverDisplayLabel})`
      : caregiverDisplayName
    : null;

  const missedCallsLabel = activeIsPrimaryContact
    ? "Missed calls"
    : primaryContactName
      ? `Calls to ${primaryContactName}`
      : "Caregiver calls";

  const locationStatusText = activeLocationSummary.placeId
    ? `${state.profile.preferredName} is currently matched to the trusted place "${activeLocationSummary.label}".`
    : `${state.profile.preferredName} is at an unrecognized location and may need direct support.`;

  const caregiverSituationText = activeLocationSummary.placeId
    ? `${activeScenario.happening} Next support should stay grounded in ${activeLocationSummary.label}.`
    : "The app did not recognize this location, so the safest caregiver response is calm clarification and direct support.";

  if (state.profile.independentMode) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-semibold text-brand-text">Your care space is ready</h1>
            <p className="text-base text-brand-muted">
              {state.profile.preferredName} is using Memory Assistant independently. No caregiver has been connected yet.
            </p>
          </header>

          <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-brand-text">What a connected caregiver can see</h2>
            <p className="text-sm text-brand-muted">When a caregiver is invited and connected, they will be able to view:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-brand-muted">
              <li>Activity summary and recent check-in status</li>
              <li>Trusted-place context and unrecognized-location support moments</li>
              <li>Support events, caregiver calls, and emergency actions</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-brand-text">Connect a caregiver</h2>
            <p className="text-sm text-brand-muted">
              You can invite a caregiver to view your care space. They will receive a link to set up access.
            </p>
            <button
              type="button"
              disabled
              className="min-h-12 cursor-not-allowed rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text opacity-60 focus:outline-none"
            >
              Invite a caregiver
            </button>
            <p className="text-xs text-brand-muted">Caregiver invite is coming in a future update.</p>
          </section>

          <Link
            href="/app"
            className="inline-flex items-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            ← Back to Today
          </Link>
        </div>
      </main>
    );
  }

  if (caregiverRole === undefined) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <p className="text-sm text-brand-muted">Loading caregiver view...</p>
      </main>
    );
  }

  if (caregiverRole === null) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-semibold text-brand-text">Your care space is ready</h1>
            <p className="text-base text-brand-muted">
              {state.profile.preferredName} is using Memory Assistant independently. No caregiver has been connected yet.
            </p>
          </header>
          <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-brand-text">What a connected caregiver can see</h2>
            <p className="text-sm text-brand-muted">When a caregiver is invited and connected, they will be able to view:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-brand-muted">
              <li>Activity summary and recent check-in status</li>
              <li>Trusted-place context and unrecognized-location support moments</li>
              <li>Support events, caregiver calls, and emergency actions</li>
            </ul>
          </section>
          <Link
            href="/app"
            className="inline-flex items-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            ← Back to Today
          </Link>
        </div>
      </main>
    );
  }

  if (caregiverRole === "family" || caregiverRole === "read_only") {
    const roleLabel = caregiverRole === "read_only" ? "read only" : "family";

    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
        <div className="space-y-6">
          <header className="space-y-1">
            <h1 className="text-3xl font-semibold text-brand-text">Care Summary</h1>
            {caregiverViewLabel ? (
              <p className="text-base text-brand-muted">
                Viewing as <span className="font-medium text-brand-text">{caregiverViewLabel}</span> · {roleLabel}
              </p>
            ) : null}
            <p className="text-sm text-brand-muted">Simulation route only. No production auth in MVP.</p>
          </header>

          {hasDistressEvent ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">
                {state.profile.preferredName} has requested reorientation support this session.
              </p>
            </div>
          ) : null}

          <section className={`rounded-2xl border px-4 py-3 ${activeLocationSummary.placeId ? "border-brand-border bg-brand-surface" : "border-amber-200 bg-amber-50"}`}>
            <p className="text-sm font-semibold text-brand-text">Location context</p>
            <p className="mt-1 text-sm text-brand-muted">{locationStatusText}</p>
            <p className="mt-1 text-sm text-brand-muted">{caregiverSituationText}</p>
            <p className="mt-1 text-xs text-brand-muted">Source: {activeLocationSummary.sourceLabel}</p>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className="text-3xl font-bold text-brand-text">{missedCalls}</p>
              <p className="mt-1 text-xs text-brand-muted">{missedCallsLabel}</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className={`text-3xl font-bold ${emergencyCalls > 0 ? "text-red-600" : "text-brand-text"}`}>
                {emergencyCalls}
              </p>
              <p className="mt-1 text-xs text-brand-muted">Emergency calls</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className="text-3xl font-bold text-brand-text">
                {stabilityScore !== null ? `${Math.round(stabilityScore)}%` : "—"}
              </p>
              <p className="mt-1 text-xs text-brand-muted">Stability score</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className="text-3xl font-bold text-brand-text">{state.activityEvents.length}</p>
              <p className="mt-1 text-xs text-brand-muted">Events today</p>
            </div>
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 text-center">
              <p className="text-3xl font-bold text-brand-text">{okayConfirmations}</p>
              <p className="mt-1 text-xs text-brand-muted">Felt okay</p>
            </div>
          </div>

          <p className="text-xs text-brand-muted">
            Full activity log is visible to primary caregivers only.
          </p>

          <Link
            href="/app"
            className="inline-flex items-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            ← Back to Today
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Caregiver Dashboard</h1>
          <p className="text-base text-brand-muted">A calm overview of recent activity and current status.</p>
          {caregiverViewLabel ? (
            <p className="text-sm text-brand-muted">
              Viewing as <span className="font-medium text-brand-text">{caregiverViewLabel}</span> · primary · Simulation route only.
            </p>
          ) : (
            <p className="text-sm text-brand-muted">Simulation route only. No production auth in MVP.</p>
          )}
        </header>

        <div className="space-y-3">
          <section className={`rounded-2xl border px-4 py-3 ${activeLocationSummary.placeId ? "border-brand-border bg-brand-surface" : "border-amber-200 bg-amber-50"}`}>
            <p className="text-sm font-semibold text-brand-text">Current location context</p>
            <p className="mt-1 text-sm text-brand-muted">{locationStatusText}</p>
            <p className="mt-1 text-sm text-brand-muted">Scenario: {activeScenario.label}</p>
            <p className="mt-1 text-sm text-brand-muted">{caregiverSituationText}</p>
            <p className="mt-1 text-xs text-brand-muted">Source: {activeLocationSummary.sourceLabel}</p>
            {activeLocationSummary.placeId ? (
              <p className="mt-1 text-xs text-brand-muted">Trusted place: {activeLocationSummary.detail}</p>
            ) : (
              <p className="mt-1 text-xs text-amber-900">The app did not recognize this location, so support guidance should stay transparent and safety-focused.</p>
            )}
          </section>

          <Link
            href="/caregiver/insights"
            className="inline-flex items-center rounded-2xl border border-brand-border bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            Insights →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-0 md:grid-cols-2 md:divide-x md:divide-brand-border">
          <CaregiverSummary
            personName={state.profile.preferredName}
            lastCheckIn={state.checkInStatus === "Not submitted yet" ? "No check-in yet" : "In current session"}
            status={locationStatusText}
            todaysEvents={state.activityEvents.length}
            missedCalls={missedCalls}
            emergencyCalls={emergencyCalls}
            missedCallsLabel={missedCallsLabel}
            locationLabel={activeLocationSummary.label}
            locationModeLabel={activeLocationSummary.locationModeLabel}
          />
          <EventLogList
            title={`${state.profile.preferredName}'s Activity`}
            items={activityPanelItems}
            defaultCollapsed={false}
            emptyText="No activity from the app yet."
            initialLimit={5}
          />
        </div>

        <section className="space-y-3">
          <EventLogList items={state.systemEvents} defaultCollapsed title="Event Log" plain emptyText="No system events yet." />
        </section>
      </div>
    </main>
  );
}


// ---

// FILE: app/demo/page.tsx

﻿"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ResponseCard from "@/components/ResponseCard";
import ScenarioSelector from "@/components/ScenarioSelector";
import { buildActiveLocationSummary, describeScenarioLocation } from "@/data/demoData";
import {
  appendSystemEvent,
  defaultTrustedLocations,
  createEvent,
  demoScenarios,
  findScenario,
  generateId,
  initialDemoState,
  normalizeDemoState,
  setActiveCaregiverId,
  setIndependentMode,
  storageKey,
  type BrowserLocation,
  type DemoState,
  type LocationSource,
  type PronounSet,
  type TrustedLocation
} from "@/data/demoState";
import { clearTrustedLocation, loadTrustedLocations, MAX_DEMO_BROWSER_ACCURACY_METERS, saveTrustedLocation } from "@/lib/places";
import { loadProfile, saveCaregiverName, saveProfile } from "@/lib/profile";
import { clearSeedData, seedDemoData } from "@/lib/seedData";
import { supabase } from "@/lib/supabaseClient";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

type RosterEntry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  relationship_label: string | null;
  role: "primary" | "family" | "read_only";
  is_primary_contact: boolean;
};

type FormValues = {
  name: string;
  email: string;
  phone: string;
  relationship_label: string;
  role: "primary" | "family" | "read_only";
  is_primary_contact: boolean;
};

function loadState(): DemoState {
  if (typeof window === "undefined") {
    return initialDemoState;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return initialDemoState;
  }

  try {
    return normalizeDemoState(JSON.parse(raw));
  } catch {
    return initialDemoState;
  }
}

export default function DemoPage() {
  const [state, setState] = useState<DemoState>(initialDemoState);
  const [resetMessage, setResetMessage] = useState("");
  const [activityCount, setActivityCount] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [seedStatus, setSeedStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [showRosterForm, setShowRosterForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "", email: "", phone: "", relationship_label: "", role: "family", is_primary_contact: false,
  });
  const [isSavingCaregiver, setIsSavingCaregiver] = useState(false);
  const [rosterMessage, setRosterMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [locationMessage, setLocationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [browserLocationMessage, setBrowserLocationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isCapturingBrowserLocation, setIsCapturingBrowserLocation] = useState(false);

  useEffect(() => {
    const hasLocalData = window.localStorage.getItem(storageKey) !== null;
    setState(loadState());
    if (!hasLocalData) {
      Promise.all([loadProfile(), loadTrustedLocations()]).then(([supabaseProfile, supabaseLocations]) => {
        setState((prev) => ({
          ...prev,
          profile: supabaseProfile ?? prev.profile,
          trustedLocations: supabaseLocations.length > 0 ? supabaseLocations : prev.trustedLocations
        }));
      });
    }
    supabase
      .from("activity_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", "00000000-0000-0000-0000-000000000001")
      .then(({ count }) => setActivityCount(count ?? 0));

    fetchRoster();
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);
  const scenarioLocationPreview = useMemo(
    () => describeScenarioLocation(activeScenario, state.trustedLocations),
    [activeScenario, state.trustedLocations]
  );
  const activeLocationSummary = useMemo(
    () => buildActiveLocationSummary({
      scenarioId: state.activeScenarioId,
      profile: state.profile,
      trustedLocations: state.trustedLocations,
      activeLocationSource: state.activeLocationSource,
      browserLocation: state.browserLocation,
    }),
    [state.activeLocationSource, state.activeScenarioId, state.browserLocation, state.profile, state.trustedLocations]
  );

  const persist = (next: DemoState) => {
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const setLocationSource = (source: LocationSource) => {
    persist({ ...state, activeLocationSource: source });
  };

  const selectScenario = (scenarioId: string) => {
    const next = appendSystemEvent(
      { ...state, activeScenarioId: scenarioId },
      createEvent("demo_scenario_selected", "demo", scenarioId, undefined, state.profile.userId)
    );
    persist(next);
  };

  const updateProfile = (field: "preferredName" | "caregiverName" | "caregiverRelationshipLabel" | "customPronouns", value: string) => {
    const newProfile = { ...state.profile, [field]: value };
    persist({ ...state, profile: newProfile });
    if (field === "caregiverName" || field === "caregiverRelationshipLabel") {
      saveCaregiverName(newProfile.caregiverName, newProfile.caregiverRelationshipLabel);
    } else {
      saveProfile(newProfile);
    }
  };

  const updatePronouns = (pronouns: PronounSet) => {
    const newProfile = { ...state.profile, pronouns };
    persist({ ...state, profile: newProfile });
    saveProfile(newProfile);
  };

  const trustedLocationForSlot = (slot: 1 | 2 | 3): TrustedLocation => {
    return state.trustedLocations.find((location) => location.trustedSlot === slot) ?? {
      ...defaultTrustedLocations.find((location) => location.trustedSlot === slot),
      trustedSlot: slot,
      name: "",
      address: "",
      instructions: ""
    };
  };

  const updateTrustedLocationDraft = (
    slot: 1 | 2 | 3,
    field: "name" | "address" | "instructions",
    value: string
  ) => {
    const current = trustedLocationForSlot(slot);
    const updatedLocation: TrustedLocation = { ...current, [field]: value };
    const nextLocations = [...state.trustedLocations.filter((location) => location.trustedSlot !== slot), updatedLocation]
      .sort((a, b) => a.trustedSlot - b.trustedSlot);
    persist({ ...state, trustedLocations: nextLocations });
    setLocationMessage(null);
  };

  const handleUseBrowserLocation = async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setBrowserLocationMessage({
        type: "error",
        text: "This browser could not provide a current location, so the demo is staying on seeded scenario coordinates.",
      });
      setLocationSource("scenario_seed");
      return;
    }

    setIsCapturingBrowserLocation(true);
    setBrowserLocationMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextBrowserLocation: BrowserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
        };

        if (position.coords.accuracy > MAX_DEMO_BROWSER_ACCURACY_METERS) {
          persist({
            ...state,
            browserLocation: nextBrowserLocation,
            activeLocationSource: "scenario_seed",
          });
          setBrowserLocationMessage({
            type: "error",
            text: `Live location accuracy was too broad (${Math.round(position.coords.accuracy)} meters), so the demo is continuing with seeded scenario coordinates.`,
          });
          setIsCapturingBrowserLocation(false);
          return;
        }

        persist({
          ...state,
          browserLocation: nextBrowserLocation,
          activeLocationSource: "browser_geolocation",
        });
        setBrowserLocationMessage({
          type: "success",
          text: `Using this device's current location for demo matching (accuracy ${Math.round(position.coords.accuracy)} meters).`,
        });
        setIsCapturingBrowserLocation(false);
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Location permission was denied, so the demo is continuing with seeded scenario coordinates."
          : "Current location was unavailable, so the demo is continuing with seeded scenario coordinates.";
        setBrowserLocationMessage({ type: "error", text: message });
        setLocationSource("scenario_seed");
        setIsCapturingBrowserLocation(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSaveTrustedLocation = async (slot: 1 | 2 | 3) => {
    const location = trustedLocationForSlot(slot);
    if (!location.name.trim()) {
      setLocationMessage({ type: "error", text: `Trusted location ${slot} needs a name before it can be saved.` });
      return;
    }

    try {
      const saved = await saveTrustedLocation({
        ...location,
        name: location.name.trim(),
        address: location.address?.trim(),
        instructions: location.instructions?.trim()
      }, state.profile.userId);

      const nextLocations = [...state.trustedLocations.filter((entry) => entry.trustedSlot !== slot), saved]
        .sort((a, b) => a.trustedSlot - b.trustedSlot);
      persist({ ...state, trustedLocations: nextLocations });
      setLocationMessage({ type: "success", text: `Trusted location ${slot} saved.` });
    } catch {
      setLocationMessage({ type: "error", text: `Trusted location ${slot} could not be saved to Supabase.` });
    }
  };

  const handleClearTrustedLocation = async (slot: 1 | 2 | 3) => {
    try {
      await clearTrustedLocation(slot, state.profile.userId);
    } catch {
      // non-fatal
    }

    const nextLocations = state.trustedLocations.filter((location) => location.trustedSlot !== slot);
    persist({ ...state, trustedLocations: nextLocations });
    setLocationMessage({ type: "success", text: `Trusted location ${slot} cleared.` });
  };

  const toggleIndependentMode = () => {
    const updated = setIndependentMode(!state.profile.independentMode);
    setState(updated);
  };

  const fetchRoster = async () => {
    setRosterLoading(true);
    try {
      const { data: rels } = await (supabase as any)
        .from("caregiver_user_relationships")
        .select("caregiver_id, role, is_primary_contact")
        .eq("user_id", DEMO_USER_ID);

      if (!rels || rels.length === 0) {
        setRoster([]);
        setRosterLoading(false);
        return;
      }

      const ids = (rels as Record<string, unknown>[]).map((r) => r.caregiver_id);
      const { data: caregivers } = await (supabase as any)
        .from("caregivers")
        .select("id, name, email, phone, relationship_label")
        .in("id", ids)
        .is("deleted_at", null);

      if (!caregivers) {
        setRoster([]);
        setRosterLoading(false);
        return;
      }

      const merged: RosterEntry[] = (caregivers as Record<string, unknown>[]).map((c) => {
        const rel = (rels as Record<string, unknown>[]).find((r) => r.caregiver_id === c.id) ?? {};
        return {
          id: c.id as string,
          name: c.name as string,
          email: (c.email as string | null) ?? null,
          phone: (c.phone as string | null) ?? null,
          relationship_label: (c.relationship_label as string | null) ?? null,
          role: ((rel as Record<string, unknown>).role as "primary" | "family" | "read_only") ?? "family",
          is_primary_contact: ((rel as Record<string, unknown>).is_primary_contact as boolean) ?? false,
        };
      });
      setRoster(merged);
    } catch {
      setRoster([]);
    }
    setRosterLoading(false);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormValues({ name: "", email: "", phone: "", relationship_label: "", role: "family", is_primary_contact: false });
    setRosterMessage(null);
    setShowRosterForm(true);
  };

  const openEditForm = (entry: RosterEntry) => {
    setEditingId(entry.id);
    setFormValues({
      name: entry.name,
      email: entry.email ?? "",
      phone: entry.phone ?? "",
      relationship_label: entry.relationship_label ?? "",
      role: entry.role,
      is_primary_contact: entry.is_primary_contact,
    });
    setRosterMessage(null);
    setShowRosterForm(true);
  };

  const handleSaveCaregiver = async () => {
    if (!formValues.name.trim()) {
      setRosterMessage({ type: "error", text: "Name is required." });
      return;
    }
    setIsSavingCaregiver(true);
    setRosterMessage(null);
    try {
      if (editingId) {
        await (supabase as any).from("caregivers").update({
          name: formValues.name.trim(),
          email: formValues.email.trim() || null,
          phone: formValues.phone.trim() || null,
          relationship_label: formValues.relationship_label.trim() || null,
        }).eq("id", editingId);
        await (supabase as any).from("caregiver_user_relationships").update({
          role: formValues.role,
          is_primary_contact: formValues.is_primary_contact,
        }).eq("caregiver_id", editingId).eq("user_id", DEMO_USER_ID);
      } else {
        const newId = generateId();
        await (supabase as any).from("caregivers").insert({
          id: newId,
          name: formValues.name.trim(),
          email: formValues.email.trim() || null,
          phone: formValues.phone.trim() || null,
          relationship_label: formValues.relationship_label.trim() || null,
        });
        await (supabase as any).from("caregiver_user_relationships").insert({
          user_id: DEMO_USER_ID,
          caregiver_id: newId,
          role: formValues.role,
          is_primary_contact: formValues.is_primary_contact,
          permissions: {},
        });
      }
      await fetchRoster();
      setShowRosterForm(false);
      setRosterMessage({ type: "success", text: editingId ? "Caregiver updated." : "Caregiver added." });
    } catch {
      setRosterMessage({ type: "error", text: "Save failed. Check Supabase connection." });
    }
    setIsSavingCaregiver(false);
  };

  const handleRemoveCaregiver = async (id: string) => {
    try {
      await (supabase as any).from("caregivers").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    } catch {
      // fire-and-forget
    }
    if (state.profile.activeCaregiverId === id) {
      const updated = setActiveCaregiverId("00000000-0000-0000-0000-000000000002");
      setState(updated);
    }
    await fetchRoster();
  };

  const handleViewAs = (id: string) => {
    const updated = setActiveCaregiverId(id);
    setState(updated);
  };

  const fetchActivityCount = () => {
    supabase
      .from("activity_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", "00000000-0000-0000-0000-000000000001")
      .then(({ count }) => setActivityCount(count ?? 0));
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedStatus(null);
    const result = await seedDemoData();
    setIsSeeding(false);
    setSeedStatus({ type: result.success ? "success" : "error", message: result.message });
    if (result.success) fetchActivityCount();
  };

  const handleClear = async () => {
    setIsClearing(true);
    setSeedStatus(null);
    const result = await clearSeedData();
    setIsClearing(false);
    setSeedStatus({ type: result.success ? "success" : "error", message: result.message });
    if (result.success) setActivityCount(0);
  };

  const resetDemoState = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(storageKey);
    window.sessionStorage.removeItem("memory-assistant-demo-unlocked");
    setResetMessage("Demo state reset. Refresh to return to locked entry screen.");
    setState(initialDemoState);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Scenario Demo Simulator</h1>
          <p className="text-base text-brand-muted">Practice supportive responses with sample situations.</p>
        </header>

        <ResponseCard
          title="Demo intent"
          message="This simulator shows MVP support behavior only. It does not provide diagnosis or emergency medical instruction."
        />

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-text">Profile personalization (MVP onboarding)</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Preferred name</span>
              <input
                value={state.profile.preferredName}
                onChange={(e) => updateProfile("preferredName", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Caregiver name</span>
              <input
                value={state.profile.caregiverName}
                onChange={(e) => updateProfile("caregiverName", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Caregiver label</span>
              <input
                value={state.profile.caregiverRelationshipLabel ?? ""}
                onChange={(e) => updateProfile("caregiverRelationshipLabel", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Pronouns</span>
              <select
                value={state.profile.pronouns}
                onChange={(e) => updatePronouns(e.target.value as PronounSet)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              >
                <option value="he/him">he/him</option>
                <option value="she/her">she/her</option>
                <option value="they/them">they/them</option>
                <option value="custom">custom</option>
              </select>
            </label>
            {state.profile.pronouns === "custom" ? (
              <label className="space-y-1 text-sm text-brand-muted md:col-span-2">
                <span>Custom pronouns</span>
                <input
                  value={state.profile.customPronouns ?? ""}
                  onChange={(e) => updateProfile("customPronouns", e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
                />
              </label>
            ) : null}
            <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg px-3 py-2">
              <span className="text-sm text-brand-muted">Independent Mode (no caregiver connected)</span>
              <button
                type="button"
                onClick={toggleIndependentMode}
                className={`rounded-xl px-4 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${
                  state.profile.independentMode
                    ? "bg-brand-primary text-white"
                    : "border border-brand-border bg-brand-surface text-brand-text"
                }`}
              >
                {state.profile.independentMode ? "On" : "Off"}
              </button>
            </div>
          </div>
        </section>

        {/* Caregiver Roster */}
        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-brand-text">Caregiver roster</h2>
            <button
              type="button"
              onClick={openAddForm}
              className="shrink-0 rounded-xl border border-brand-border bg-brand-bg px-3 py-1.5 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              + Add caregiver
            </button>
          </div>

          {rosterLoading ? (
            <p className="text-sm text-brand-muted">Loading roster…</p>
          ) : roster.length === 0 ? (
            <p className="text-sm text-brand-muted">No caregivers found in Supabase for this user.</p>
          ) : (
            <ul className="space-y-2">
              {roster.map((entry) => {
                const roleLabel = entry.role === "read_only" ? "read only" : entry.role;
                return (
                  <li key={entry.id} className="flex flex-col gap-2 rounded-xl border border-brand-border bg-brand-bg px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-text">
                        {entry.name}
                        {entry.relationship_label ? (
                          <span className="ml-1 font-normal text-brand-muted">({entry.relationship_label})</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-brand-muted">
                        {roleLabel}
                        {entry.is_primary_contact ? " · primary call contact" : ""}
                        {entry.id === "00000000-0000-0000-0000-000000000002" ? " · demo default" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditForm(entry)}
                        className="rounded-lg border border-brand-border bg-brand-surface px-3 py-1 text-xs font-medium text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                      >
                        Edit
                      </button>
                      {entry.id !== "00000000-0000-0000-0000-000000000002" ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveCaregiver(entry.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {rosterMessage ? (
            <p className={`text-sm ${rosterMessage.type === "success" ? "text-brand-primary" : "text-red-600"}`}>
              {rosterMessage.text}
            </p>
          ) : null}

          {showRosterForm ? (() => {
            const existingPrimary = roster.find((r) => r.is_primary_contact);
            const primaryLocked = !!existingPrimary && existingPrimary.id !== editingId;
            return (
              <div className="rounded-2xl border border-brand-border bg-brand-bg p-4 space-y-4">
                <h3 className="text-base font-semibold text-brand-text">
                  {editingId ? "Edit caregiver" : "Add caregiver"}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Name <span className="text-red-500">*</span></span>
                    <input
                      value={formValues.name}
                      onChange={(e) => setFormValues((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Relationship label</span>
                    <input
                      value={formValues.relationship_label}
                      onChange={(e) => setFormValues((f) => ({ ...f, relationship_label: e.target.value }))}
                      placeholder="e.g. daughter, son"
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Email</span>
                    <input
                      type="email"
                      value={formValues.email}
                      onChange={(e) => setFormValues((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={formValues.phone}
                      onChange={(e) => setFormValues((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Role</span>
                    <select
                      value={formValues.role}
                      onChange={(e) => setFormValues((f) => ({ ...f, role: e.target.value as FormValues["role"] }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    >
                      <option value="primary">Primary — full dashboard</option>
                      <option value="family">Family — summary only</option>
                      <option value="read_only">Read only — summary only</option>
                    </select>
                  </label>
                  <div className="space-y-1">
                    <p className="text-sm text-brand-muted">Primary call contact</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={primaryLocked}
                        onClick={() => !primaryLocked && setFormValues((f) => ({ ...f, is_primary_contact: !f.is_primary_contact }))}
                        className={`rounded-xl px-4 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${
                          formValues.is_primary_contact
                            ? "bg-brand-primary text-white"
                            : "border border-brand-border bg-brand-surface text-brand-text"
                        } ${primaryLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {formValues.is_primary_contact ? "Yes" : "No"}
                      </button>
                    </div>
                    {primaryLocked ? (
                      <p className="text-xs text-brand-muted">
                        Only one caregiver can be the call contact.{" "}
                        {existingPrimary?.name} is currently set.
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isSavingCaregiver}
                    onClick={handleSaveCaregiver}
                    className="min-h-10 rounded-2xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
                  >
                    {isSavingCaregiver ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowRosterForm(false); setRosterMessage(null); }}
                    className="min-h-10 rounded-2xl border border-brand-border bg-brand-bg px-5 py-2 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })() : null}
        </section>

        {/* View as Caregiver — demo control only */}
        {roster.length > 0 ? (
          <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
            <div className="space-y-0.5">
              <h2 className="text-xl font-semibold text-brand-text">View as caregiver</h2>
              <p className="text-xs text-brand-muted">Demo control — not a real login. Selects whose perspective /caregiver simulates.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {roster.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleViewAs(entry.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${
                    state.profile.activeCaregiverId === entry.id
                      ? "bg-brand-primary text-white"
                      : "border border-brand-border bg-brand-bg text-brand-text"
                  }`}
                >
                  {entry.name}
                  <span className="ml-1.5 text-xs font-normal opacity-75">
                    ({entry.role === "read_only" ? "read only" : entry.role})
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <ResponseCard
          title="Active scenario"
          message={`${activeScenario.label}: ${activeScenario.guidance} Scenario mapping: ${scenarioLocationPreview.label}. Active location mode: ${activeLocationSummary.locationModeLabel}.`}
        />

        <div className="flex justify-end">
          <Link
            href="/debug"
            className="rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-sm font-medium text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            Open debug screen
          </Link>
        </div>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
          <h2 className="text-xl font-semibold text-brand-text">Scenario breakdown</h2>
          <div className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
            <p className="text-sm font-medium text-brand-text">Maps to</p>
            <p className="mt-1 text-sm text-brand-muted">{scenarioLocationPreview.label}</p>
            <p className="mt-1 text-xs text-brand-muted">{scenarioLocationPreview.notes}</p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
            <p className="text-sm font-medium text-brand-text">Where am I?</p>
            <p className="mt-1 text-sm text-brand-muted">{activeScenario.where}</p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
            <p className="text-sm font-medium text-brand-text">What is happening?</p>
            <p className="mt-1 text-sm text-brand-muted">{activeScenario.happening}</p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3">
            <p className="text-sm font-medium text-brand-text">What should I do next?</p>
            <p className="mt-1 text-sm text-brand-muted">{activeScenario.nextStep}</p>
          </div>
          <p className="text-xs text-brand-muted">
            Caregiver-facing takeaway: {activeLocationSummary.placeId ? `this scenario should read as a trusted-place support moment at ${activeLocationSummary.label}.` : "this scenario should clearly show that the app did not recognize the location and that the user may need direct support."}
          </p>
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-brand-text">Demo location source</h2>
            <p className="text-sm text-brand-muted">
              Seeded scenario coordinates are the default. You can optionally use this device&apos;s live browser coordinates as a presentation-room demo override.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setLocationSource("scenario_seed")}
              className={`rounded-2xl border px-4 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${
                state.activeLocationSource === "scenario_seed"
                  ? "border-brand-primary bg-brand-bg text-brand-text"
                  : "border-brand-border bg-brand-surface text-brand-muted"
              }`}
            >
              <span className="block font-semibold text-brand-text">Use seeded scenario location</span>
              <span className="mt-1 block">Reliable default for class demo playback.</span>
            </button>
            <button
              type="button"
              onClick={() => void handleUseBrowserLocation()}
              disabled={isCapturingBrowserLocation}
              className={`rounded-2xl border px-4 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${
                state.activeLocationSource === "browser_geolocation"
                  ? "border-brand-primary bg-brand-bg text-brand-text"
                  : "border-brand-border bg-brand-surface text-brand-muted"
              } disabled:opacity-60`}
            >
              <span className="block font-semibold text-brand-text">
                {isCapturingBrowserLocation ? "Checking current location..." : "Use this device's current location for demo"}
              </span>
              <span className="mt-1 block">Scenario story stays selected, but trusted-place matching uses live browser coordinates when accuracy is good enough.</span>
            </button>
          </div>

          <div className="rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm text-brand-muted">
            <p><span className="font-medium text-brand-text">Current source:</span> {activeLocationSummary.sourceLabel}</p>
            <p className="mt-1"><span className="font-medium text-brand-text">Current match:</span> {activeLocationSummary.label}</p>
            <p className="mt-1"><span className="font-medium text-brand-text">Scenario mapping:</span> {scenarioLocationPreview.label}</p>
            {state.browserLocation ? (
              <p className="mt-1">
                <span className="font-medium text-brand-text">Last browser sample:</span> {state.browserLocation.latitude.toFixed(5)}, {state.browserLocation.longitude.toFixed(5)} · accuracy {Math.round(state.browserLocation.accuracyMeters)} meters
              </p>
            ) : null}
          </div>

          {browserLocationMessage ? (
            <p className={`text-sm ${browserLocationMessage.type === "success" ? "text-brand-primary" : "text-amber-800"}`}>
              {browserLocationMessage.text}
            </p>
          ) : null}
          {activeLocationSummary.fallbackMessage ? (
            <p className="text-sm text-amber-800">{activeLocationSummary.fallbackMessage}</p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-brand-text">Trusted locations</h2>
            <p className="text-sm text-brand-muted">
              Save up to 3 trusted places. Scenarios can then use one of these saved locations or use Other.
            </p>
          </div>

          {[1, 2, 3].map((slotValue) => {
            const slot = slotValue as 1 | 2 | 3;
            const location = trustedLocationForSlot(slot);
            return (
              <div key={slot} className="rounded-2xl border border-brand-border bg-brand-bg p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-brand-text">Trusted location {slot}</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveTrustedLocation(slot)}
                      className="rounded-xl bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearTrustedLocation(slot)}
                      className="rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Name</span>
                    <input
                      value={location.name}
                      onChange={(e) => updateTrustedLocationDraft(slot, "name", e.target.value)}
                      placeholder={slot === 1 ? "Home" : `Trusted place ${slot}`}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Address</span>
                    <input
                      value={location.address ?? ""}
                      onChange={(e) => updateTrustedLocationDraft(slot, "address", e.target.value)}
                      placeholder="Street address or landmark"
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted md:col-span-2">
                    <span>Instructions</span>
                    <input
                      value={location.instructions ?? ""}
                      onChange={(e) => updateTrustedLocationDraft(slot, "instructions", e.target.value)}
                      placeholder="Helpful note for grounding or finding support here"
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <div className="rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-muted md:col-span-2">
                    <p><span className="font-medium text-brand-text">Seeded coordinates:</span> {typeof location.latitude === "number" && typeof location.longitude === "number" ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "Not set"}</p>
                    <p className="mt-1"><span className="font-medium text-brand-text">Match radius:</span> {location.radiusMeters ?? 75} meters</p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface px-4 py-3">
            <p className="text-sm font-medium text-brand-text">Other</p>
            <p className="mt-1 text-sm text-brand-muted">
              Other is not saved as a fourth trusted location. It represents the person being somewhere outside the 1 to 3 saved trusted places.
            </p>
          </div>

          {locationMessage ? (
            <p className={`text-sm ${locationMessage.type === "success" ? "text-brand-primary" : "text-red-600"}`}>
              {locationMessage.text}
            </p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-text">Reset demo</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Clears local demo data and re-enables password gate on refresh.
          </p>
          <button
            type="button"
            onClick={resetDemoState}
            className="mt-3 min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            Reset demo state
          </button>
          {resetMessage ? <p className="mt-2 text-sm text-brand-muted">{resetMessage}</p> : null}
        </section>

        <ScenarioSelector
          scenarios={demoScenarios.map((scenario) => ({
            ...scenario,
            locationLine: `${describeScenarioLocation(scenario, state.trustedLocations).label} · ${describeScenarioLocation(scenario, state.trustedLocations).notes}`
          }))}
          activeScenarioId={state.activeScenarioId}
          onPreview={selectScenario}
        />

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-brand-text">Supabase Demo Data</h2>
          <p className="text-sm text-brand-muted">
            Activity events in Supabase:{" "}
            <span className="font-semibold text-brand-text">
              {activityCount === null ? "loading…" : activityCount}
            </span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isSeeding || isClearing}
              onClick={handleSeed}
              className="min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
            >
              {isSeeding ? "Seeding… (30–60 seconds)" : "Seed Year of Data"}
            </button>
            <button
              type="button"
              disabled={isSeeding || isClearing}
              onClick={handleClear}
              className="min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
            >
              {isClearing ? "Clearing…" : "Clear Seeded Data"}
            </button>
          </div>
          {isSeeding && (
            <p className="text-xs text-brand-muted">This may take 30–60 seconds. Please wait.</p>
          )}
          {seedStatus && (
            <p className={`text-sm ${seedStatus.type === "success" ? "text-brand-primary" : "text-red-600"}`}>
              {seedStatus.message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}


// ---

// FILE: app/api/reorient/route.ts

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { CLAUDE_MODEL } from "@/lib/aiConfig";

const FALLBACK = "I am here with you. Please take a breath. If you need help, contact your caregiver.";

const SYSTEM_PROMPT = `You are a calm, warm memory support guide speaking directly to a person who may feel confused or disoriented.

Rules:
- Respond in 3 to 5 short sentences only.
- Use simple, warm, everyday language.
- Speak directly to the person using "you" and "your".
- Never mention AI, technology, or that you are a system.
- Never diagnose, speculate about health, or sound clinical.
- Never invent facts that are not present in the context.
- If location_mode is "other" or the context says the place is unrecognized, do not guess the location, address, activity, appointment, or reason for being there.
- If context is incomplete, say only what is known and suggest a calm next step.
- End with one grounding, reassuring sentence.

Question rules:
- "Where am I?" focuses only on location. If the location is unrecognized, say that clearly.
- "What is happening?" focuses only on what is currently known. If the app does not know why the person is there, say that clearly.
- "What should I do next?" gives only the next calm step. If the location is unrecognized, keep the guidance safety-focused: stay where you are if safe, call the caregiver, show the helper card, or call emergency services if unsafe or urgent.`;

const questionPrompts: Record<string, string> = {
  where_am_i: "The person is asking: where am I right now? Use only the context below and answer location only.",
  what_is_happening: "The person is asking: what is happening right now? Use only the context below and explain only what is currently known.",
  what_should_i_do_next: "The person is asking: what should I do next? Use only the context below and give one clear, calm next step.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { question?: string; context?: Record<string, string>; userName?: string };
    const { question, context, userName } = body;

    const questionKey = question ?? "where_am_i";
    const questionPrompt = questionPrompts[questionKey] ?? questionPrompts.where_am_i;
    const name = userName ?? "you";

    const contextBlock = context
      ? Object.entries(context)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")
      : "No context available.";

    const userPrompt = `${questionPrompt}

The person's name is ${name}.

Current context:
${contextBlock}

Respond directly to ${name} now.`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: CLAUDE_MODEL,
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          });

          for await (const event of anthropicStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch {
          controller.enqueue(encoder.encode(FALLBACK));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response(FALLBACK, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}


// ---

// FILE: app/api/checkin/route.ts

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { CLAUDE_MODEL } from "@/lib/aiConfig";

const FALLBACK_QUESTIONS = [
  "How are you feeling right now?",
  "Would you like a moment to sit and breathe?",
  "Is there anything you need help with?",
];

const FALLBACK_RESPONSE = "I hear you. Take a gentle breath. You are doing well, and support is close if you need it.";

const QUESTIONS_SYSTEM = `You are a calm memory support guide. Generate exactly 3 short, warm check-in questions for someone who may feel confused or unsettled. Each question should be one sentence, supportive, and relevant to the current context. If recentHelpMeNowQuestion is provided, make one question relevant to that recent interaction. Return only a JSON array of 3 strings.`;

const RESPONSE_SYSTEM = `You are a calm memory support guide speaking directly to a person who may feel confused or unsettled. Respond warmly and briefly to their selected check-in question. Keep the whole response under 4 sentences. End with one sentence phrased exactly like "In a full version, I would [action]." Never mention AI or be clinical.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      mode: "questions" | "response";
      context: Record<string, string>;
      selectedQuestion?: string;
      userName: string;
    };
    const { mode, context, selectedQuestion, userName } = body;
    const name = userName ?? "you";

    const contextBlock = context
      ? Object.entries(context).map(([key, value]) => `${key}: ${value}`).join("\n")
      : "No context available.";

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    if (mode === "questions") {
      const userPrompt = `Generate 3 check-in questions for ${name} based on this context:\n${contextBlock}`;
      try {
        const message = await client.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 200,
          system: QUESTIONS_SYSTEM,
          messages: [{ role: "user", content: userPrompt }],
        });
        const rawText = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
        const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleaned) as string[];
        if (Array.isArray(parsed) && parsed.length === 3) {
          return Response.json(parsed);
        }
        return Response.json(FALLBACK_QUESTIONS);
      } catch (error) {
        console.error("[checkin] questions error:", error instanceof Error ? error.message : error);
        return Response.json(FALLBACK_QUESTIONS);
      }
    }

    const userPrompt = `${name} selected this check-in option: "${selectedQuestion ?? ""}"\n\nContext:\n${contextBlock}\n\nRespond directly to ${name} now.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: CLAUDE_MODEL,
            max_tokens: 200,
            system: RESPONSE_SYSTEM,
            messages: [{ role: "user", content: userPrompt }],
          });
          for await (const event of anthropicStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (error) {
          console.error("[checkin] response stream error:", error instanceof Error ? error.message : error);
          controller.enqueue(encoder.encode(FALLBACK_RESPONSE));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response(FALLBACK_RESPONSE, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}


// ---

// FILE: supabasemigrations60518_initial_schema.sql

[NOT FOUND]

// ---

// FILE: components/HelperModal.tsx

"use client";

import { useEffect } from "react";
import BrandLogo from "@/components/BrandLogo";
import MemoryIcon from "@/components/MemoryIcon";
import { pronounWords, type DemoProfile } from "@/data/demoState";
import type { ActiveLocationSummary, ContextPacket } from "@/data/demoData";

type HelperModalProps = {
  open: boolean;
  onClose: () => void;
  profile: DemoProfile;
  activeLocationSummary: ActiveLocationSummary;
  contextPacket: ContextPacket;
  onCallCaregiver?: () => void;
  onCallEmergency?: () => void;
};

export default function HelperModal({ open, onClose, profile, activeLocationSummary, contextPacket, onCallCaregiver, onCallEmergency }: HelperModalProps) {
  const words = pronounWords(profile.pronouns, profile.customPronouns);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Helper card">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/20"
        aria-label="Close helper card"
      />

      <div className="absolute inset-x-0 top-0 flex justify-center px-4 py-6 sm:inset-y-10 sm:items-start">
        <div className="w-full max-w-lg overflow-auto rounded-3xl border border-brand-border bg-brand-surface shadow-lg">
          <div className="flex items-center gap-3 border-b border-brand-border p-3">
            <BrandLogo size={40} />
            <div>
              <div className="text-lg font-semibold text-brand-text">Memory Assistant</div>
              <div className="text-sm text-brand-muted">A calm support tool</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex min-h-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-bg px-4 text-base font-semibold text-brand-primary"
            >
              Close
            </button>
          </div>

          <div className="p-4">
            <h2 className="text-lg font-semibold text-brand-text">{profile.preferredName} may need a little help right now.</h2>
            <p className="mt-1 text-sm leading-7 text-brand-muted">
              This is a support tool for moments of confusion. If this is an emergency, call emergency services.
            </p>

            <div className="mt-4 space-y-1.5">
              <div className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-bg p-2">
                <div className="mt-0.5 text-brand-compass" aria-hidden="true">
                  <MemoryIcon name="mapPin" className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-semibold text-brand-text">Tell {words.object} where {words.subject} is</div>
                  <div className="mt-1 text-base text-brand-muted">
                    {activeLocationSummary.placeId
                      ? `You are at ${activeLocationSummary.label}, and you are safe right now.`
                      : activeLocationSummary.detail}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-bg p-2">
                <div className="mt-0.5 text-brand-compass" aria-hidden="true">
                  <MemoryIcon name="clock" className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-semibold text-brand-text">Tell {words.object} what time/day it is</div>
                  <div className="mt-1 text-base text-brand-muted">Today is {contextPacket.time_of_day}.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-bg p-2">
                <div className="mt-0.5 text-brand-compass" aria-hidden="true">
                  <MemoryIcon name="checkCircle" className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-base font-semibold text-brand-text">Tell {words.object} what to do next</div>
                  <div className="mt-1 text-base text-brand-muted">
                    {activeLocationSummary.placeId
                      ? contextPacket.next_event
                      : `Please stay with ${profile.preferredName} and help ${words.object} contact ${words.possessive} caregiver, ${profile.caregiverName}.`}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-3xl border border-brand-border bg-brand-support p-2">
              <div className="flex items-center gap-2">
                <div className="text-brand-compass" aria-hidden="true">
                  <MemoryIcon name="phone" className="h-6 w-6" />
                </div>
                <div className="text-lg font-semibold text-brand-text">
                  {profile.caregiverName}
                  {profile.caregiverRelationshipLabel ? ` (${profile.caregiverRelationshipLabel})` : ""}
                </div>
              </div>
              <p className="mt-2 text-sm text-brand-muted">
                {profile.caregiverRelationshipLabel
                  ? `${profile.caregiverName} is ${profile.preferredName}'s ${profile.caregiverRelationshipLabel}. Contact ${words.object} for further guidance.`
                  : `${profile.caregiverName} is ${profile.preferredName}'s caregiver. Contact ${words.object} for further guidance.`}
              </p>

              <button
                type="button"
                onClick={onCallCaregiver}
                className="mt-3 flex min-h-14 w-full items-center justify-center rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
              >
                {`Call ${profile.caregiverName}`}
              </button>

              <p className="mt-3 text-sm text-brand-muted">
                If you are worried or someone is in danger, please contact emergency services.
              </p>
              <button
                type="button"
                onClick={onCallEmergency}
                className="mt-2 flex min-h-12 w-full items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Urgent: call emergency services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// ---

// FILE: components/EventLogList.tsx

"use client";

import { useState } from "react";
import MemoryIcon from "@/components/MemoryIcon";
import type { DemoEvent } from "@/data/demoState";

type EventLogListProps = {
  items: DemoEvent[];
  defaultCollapsed?: boolean;
  title?: string;
  emptyText?: string;
  initialLimit?: number;
  plain?: boolean;
};

function eventLabel(eventType: string): string {
  return eventType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sourceLabel(source: string): string {
  if (source === "app") return "Alex's app";
  if (source === "caregiver") return "Caregiver view";
  if (source === "demo") return "Demo simulator";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function locationModeLabel(mode: string): string {
  if (mode === "trusted_place") return "Trusted place";
  if (mode === "other") return "Other";
  return mode;
}

export default function EventLogList({
  items,
  defaultCollapsed = false,
  title = "Event Log",
  emptyText = "No events yet. Interact with /app, /caregiver, or /demo.",
  initialLimit,
  plain = false
}: EventLogListProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll || !initialLimit ? items : items.slice(0, initialLimit);
  const hasMore = !!initialLimit && items.length > initialLimit;

  return (
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-brand-text">
          <MemoryIcon name="clock" className="h-7 w-7 text-brand-primary" />
          {title}
        </h2>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          className="rounded-xl border border-brand-border px-3 py-2 text-sm font-medium text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>

      {!collapsed ? (
        <>
          <div className={showAll && items.length > 10 ? "mt-3 max-h-[800px] overflow-y-auto" : "mt-3"}>
            <ul className="space-y-3">
              {items.length === 0 ? (
                <li className="rounded-2xl border border-brand-border bg-brand-bg p-4 text-base text-brand-muted">
                  {emptyText}
                </li>
              ) : (
                visibleItems.map((item) => {
                  const isDistress = !plain && item.eventType === "reorientation_started";
                  const isHelperCard = !plain && item.eventType === "helper_card_shown";
                  const isCall = !plain && item.eventType === "caregiver_called";
                  const isEmergency = !plain && item.eventType === "emergency_called";
                  const isOkay = !plain && item.eventType === "okay_confirmed";
                  const cardBg = isEmergency ? "bg-red-600" : isHelperCard ? "bg-yellow-50" : isCall ? "bg-blue-50" : isOkay ? "bg-green-50" : "bg-brand-bg";
                  const borderClass = isDistress ? "border-l-4 border-brand-border border-l-brand-compass" : isOkay ? "border-green-200" : "border-brand-border";
                  const labelClass = isEmergency
                    ? "font-bold text-yellow-300"
                    : isDistress
                      ? "font-semibold text-brand-compass"
                      : isHelperCard
                        ? "font-semibold text-amber-700"
                        : isCall
                          ? "font-semibold text-blue-700"
                          : isOkay
                            ? "font-semibold text-green-700"
                            : "text-brand-text";
                  const label = isEmergency ? "Called Emergency Services" : isOkay ? "Confirmed okay" : eventLabel(item.eventType);
                  return (
                    <li
                      key={item.id}
                      className={`rounded-2xl border p-4 ${cardBg} ${borderClass}`}
                    >
                      <p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                      <p className={`mt-1 text-base leading-6 ${labelClass}`}>{label}</p>
                      {item.eventType === "checkin_submitted" && typeof item.metadata?.question === "string" ? (
                        <p className="mt-1 text-sm text-brand-text italic">&ldquo;{item.metadata.question}&rdquo;</p>
                      ) : null}
                      {item.eventType === "reorientation_card_viewed" && typeof item.metadata?.question === "string" ? (
                        <p className="mt-1 text-sm text-brand-text italic">
                          &ldquo;{(item.metadata.question as string).split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}&rdquo;
                        </p>
                      ) : null}
                      {item.eventType === "reorientation_card_viewed" && typeof item.metadata?.ai_response === "string" ? (
                        <>
                          <p className="mt-2 text-xs text-brand-muted">AI response:</p>
                          <p className="mt-1 text-sm leading-relaxed text-brand-text">{item.metadata.ai_response as string}</p>
                        </>
                      ) : null}
                      {typeof item.metadata?.trustedPlace === "string" && item.metadata.trustedPlace ? (
                        <p className="mt-1 text-sm text-brand-muted">
                          Location: {item.metadata.trustedPlace as string}
                          {typeof item.metadata.trustedPlaceAddress === "string" && item.metadata.trustedPlaceAddress
                            ? ` — ${item.metadata.trustedPlaceAddress as string}`
                            : ""}
                        </p>
                      ) : null}
                      {typeof item.metadata?.locationMode === "string" ? (
                        <p className="mt-1 text-sm text-brand-muted">
                          Location mode: {locationModeLabel(item.metadata.locationMode as string)}
                        </p>
                      ) : null}
                      {item.placeId === null && item.metadata?.reason === "unrecognized_location" ? (
                        <p className="mt-1 text-sm text-amber-800">
                          Location was not recognized as a saved trusted place.
                        </p>
                      ) : null}
                      <p className="text-sm text-brand-muted">
                        Source: {sourceLabel(item.source)}
                        {item.scenarioId ? ` | Scenario: ${eventLabel(item.scenarioId)}` : ""}
                      </p>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          {hasMore ? (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-3 rounded-xl border border-brand-border px-3 py-2 text-sm font-medium text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              {showAll ? "Show less" : "Show more"}
            </button>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm text-brand-muted">Event log is collapsed.</p>
      )}
    </section>
  );
}
