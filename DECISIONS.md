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

## Open Decisions (To Resolve Later)

- Data model for routines/events/check-ins
- Demo data strategy for scenario simulation
