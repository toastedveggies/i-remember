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
