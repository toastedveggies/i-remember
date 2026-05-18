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
   - OpenAI/server-side API setup (when introduced)

## Guardrails

- Do not add OpenAI integration until explicitly planned.
- Do not implement push notifications yet (stretch only, later).
- Prefer clear, small, reviewable changes.
- The app supports Independent Mode (no caregiver connected). This is intentional and not a bug.
- A new route `/caregiver/insights` is planned for Phase 4. It is accessible from both `/app` and `/caregiver`.

## Handoff Expectations

When finishing a task:
- Update `BUILD_STATUS.md` with accurate details.
- Add notable trade-offs/decisions to `DECISIONS.md`.
- Keep next steps explicit for the next agent/human contributor.
