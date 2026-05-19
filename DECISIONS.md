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

## Open Decisions (To Resolve Later)

- Data model for routines/events/check-ins
- Demo data strategy for scenario simulation
