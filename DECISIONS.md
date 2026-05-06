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

## Open Decisions (To Resolve Later)

- Data model for routines/events/check-ins
- Event logging granularity and retention
- Assistant response guardrails and fallback behavior
- Demo data strategy for scenario simulation
