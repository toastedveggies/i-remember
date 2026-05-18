# FUTURE_IDEAS

Parking lot for ideas that are intentionally out of current MVP scope.

## Rules for This File

- Add ideas here instead of implementing them immediately.
- Keep each idea concise with a short rationale.
- Move ideas into active scope only when reflected in `PROJECT_PLAN.md` and `BUILD_STATUS.md`.

## Idea Backlog

- Narrative presets for seed data — allow facilitators to select from pre-defined story arcs (e.g. "stable phase", "gradual progression", "crisis week") when seeding Supabase demo data, rather than always generating the same one-year pattern
- Caregiver invite flow — allow Alex to invite a caregiver by email from within the app, creating a `caregiver_user_relationships` row with a role assignment
- Role-based caregiver dashboard visibility — primary caregivers see full metrics; family/secondary caregivers see summary only (missed calls, emergency events, stability score)
- Push notification enhancements beyond basic demo
- Rich caregiver analytics and trends
- Multi-profile household support
- Voice-first reorientation flow
- Calendar integrations
- Wearable/device integrations (see Fitbit detail below)
- Advanced safety escalation workflows

---

## Fitbit Heart Rate Alert Integration (Weekend Prototype)

**Status:** Backlog — not in active scope

**Demo path:** Facilitator walks a lap during class presentation, heart rate spikes on their Fitbit, caregiver dashboard updates in real time showing elevated BPM.

### Implementation outline

- Use Fitbit Web API with OAuth 2.0 to pull real-time heart rate data from a paired Fitbit device
- Implement OAuth flow via Next.js API routes — no third-party auth library needed
- Register app at dev.fitbit.com to get client ID and secret; store in `.env.local`, never commit
- Poll heart rate endpoint every 30–60 seconds during an active demo session
- If BPM exceeds a configurable threshold (default 100), fire an `elevated_heart_rate` event to `activityEvents` with `source: "app"`
- Display `elevated_heart_rate` events in Alex's Activity panel with a distinct visual (orange background, heart icon, BPM value shown)
- Add a heart rate alert row to the Caregiver Snapshot when threshold is exceeded

### Key constraints

- Fitbit does NOT sync to Apple Health on iPhone — must use Fitbit Web API directly
- Scope is demo-only: single user account, no production auth hardening needed
- All Fitbit credentials must live in `.env.local` and be excluded from version control
