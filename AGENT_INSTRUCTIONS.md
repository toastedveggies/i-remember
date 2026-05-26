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
