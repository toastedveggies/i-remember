# DEMO_RUNBOOK

## Purpose

Quick operator script for class demo flow.

## Access

- Demo password: `memory2026`
- Password gate appears before site access.

## Reset Before Demo

1. Go to `/demo`.
2. Use **Reset demo state**.
3. Refresh browser.
4. Re-enter password to confirm clean start.

## Suggested Walkthrough (2-3 minutes)

1. `/demo`:
- Explain this is a prototype simulator.
- Set profile values (name/pronouns/caregiver label).
- Pick scenario (morning/afternoon/evening).

2. `/app`:
- Show personalized greeting and scenario-aware grounding cards.
- Tap **Help me now** to refresh support guidance.
- Complete quick check-in and show:
  - saved status
  - recommended next action
- Show urgent support section:
  - caregiver action
  - emergency instruction (non-direct-dial).

3. `/caregiver`:
- Confirm simulated caregiver snapshot matches current scenario/check-in.
- Optionally open event log to show recorded interactions.

## Key Talking Points

- Scope is bounded MVP for reorientation support, not medical diagnosis.
- Route-based user/caregiver separation is intentional for prototype stage.
- Data persistence is local browser storage for demo only.
- Event logging is lightweight and ready for later backend persistence.

## If Something Goes Wrong

- If profile/copy looks stale: return to `/demo`, adjust profile, reselect scenario.
- If state seems inconsistent: use **Reset demo state**, refresh, and re-enter password.
