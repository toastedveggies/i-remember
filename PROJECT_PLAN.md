# PROJECT_PLAN

## Project

**Name:** Memory Assistant  
**Type:** Class prototype (mobile-first web app)  
**Goal:** Help a person experiencing confusion reorient to the present moment using verified context and bounded guidance.

## Core Product Statement

Memory Assistant answers:
1. Where am I?
2. What is happening?
3. What should I do next?

## Strict Scope Boundaries

- Not a full AI companion
- Not a clinical assessment or diagnostic tool
- Not an emergency monitoring or alerting platform
- Prototype only; avoid production-scale architecture
- Avoid scope creep; place non-MVP ideas in `FUTURE_IDEAS.md`

## MVP Modules

1. Today Window at `/app`
2. Reorientation Assistant triggered from `/app`
3. Quick Check-In (3-5 supportive questions)
4. Caregiver Dashboard at `/caregiver`
5. Scenario Demo Simulator at `/demo`
6. Event logging
7. Stretch: simple push notification demo (later)

## Initial Build Phases

### Phase 0 - Planning and setup docs
- Establish scope, constraints, and collaboration instructions
- Create project management docs
- Align setup and deployment guidance in README

### Phase 1 - App shell and routes
- Initialize/confirm mobile-first structure
- Create placeholder route experiences for `/app`, `/caregiver`, `/demo`
- Maintain lightweight UI scaffolding only

### Phase 2 - MVP feature implementation
- Build Today Window
- Build bounded Reorientation Assistant workflow
- Build Quick Check-In
- Add event logging flow
- Represent user/caregiver separation through route/UI simulation only (`/app`, `/caregiver`, `/demo`)
- Keep state/event handling local/mock for MVP validation (no production auth/backend dependency)
- Add lightweight onboarding profile preferences in MVP data model (preferred name, pronouns, caregiver label/name for copy personalization)

### Phase 3 - Demo readiness
- Improve data flow and UX cohesion
- Add scenario simulator polish
- Prepare class demonstration path

### Phase 4 - Stretch (optional)
- Simple push notification demo

## Phase 2 Definition of Done

Phase 2 is complete when the following MVP criteria are met using route-based role separation (`/app`, `/caregiver`, `/demo`) and simulated/verified prototype data. No production authentication or role-based login is required for Phase 2.

### Reorientation flow (`/app`)
- User can trigger the reorientation assistant from the Today experience.
- Assistant displays a structured grounding card that clearly covers:
  - current place/context (where available)
  - current time/day context
  - immediate next step guidance
- User can return to the Today experience without breaking flow.

### Quick check-in states (`/app`)
- User can complete a 3-5 question check-in and submit a state.
- Submitted state is visible in the current session UI (confirmation/status).
- At least one calm follow-up prompt is shown after submission.

### Caregiver view (`/caregiver`)
- Caregiver route shows simulated recent check-in status and recent activity/events.
- View clearly indicates this is a caregiver-facing dashboard simulation.
- Data displayed is consistent with the active demo/mock state.

### Demo mode (`/demo`)
- User can select a scenario from the demo route.
- Scenario selection updates the simulated context used by `/app` and `/caregiver`.
- Active scenario is visible so demo state is easy to explain during class presentation.

### Event logging
- MVP event names are emitted for key flows:
  - `reorientation_started`
  - `reorientation_card_viewed`
  - `checkin_submitted`
  - `caregiver_view_opened`
  - `fallback_shown`
  - `demo_scenario_selected`
- Events can be inspected in a local/mock/in-memory log for demo validation.

### Fallback/safety behavior
- When context is incomplete, assistant uses calm, transparent wording and avoids overclaiming.
- Assistant presents a safe fallback next step (for example, check routine context or contact caregiver).
- If user indicates urgent safety concern, assistant directs user to contact caregiver or emergency services.

### Onboarding profile personalization (MVP data scope)
- App has a lightweight onboarding/profile data structure that includes:
  - preferred display name
  - preferred pronouns (for helper/support copy)
  - caregiver display name/label used in support actions
- Personalized text uses onboarding/profile values consistently across intro text, helper card, and caregiver references.
- For MVP, profile values may be local/mock/in-memory; no production auth or account linking is required.

## Safety Contract

### Allowed assistant behaviors
- Reorient the user with known context.
- Summarize available time/location/routine context without overclaiming.
- Provide simple, bounded next-step guidance.
- Encourage contacting a caregiver when appropriate.

### Prohibited assistant behaviors
- Diagnosing conditions or making medical judgments.
- Claiming certainty when key data is missing.
- Inventing personal facts not present in known context.
- Replacing caregiver support or emergency response.
- Giving emergency medical instructions.

### Fallback behavior
- If context is missing or inconsistent, the assistant states what it knows, what it does not know, and offers a calm next step.

### Escalation language
- If the user reports feeling unsafe or needs urgent help, the assistant should direct them to contact a caregiver immediately or call emergency services.

## Non-Goals for Current Stage

- Supabase integration now
- OpenAI/API integration now
- Push notifications now
- Full auth/roles hardening
- Clinical workflows
