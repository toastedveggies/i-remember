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

### Phase 3 - Demo readiness
- Improve data flow and UX cohesion
- Add scenario simulator polish
- Prepare class demonstration path

### Phase 4 - Stretch (optional)
- Simple push notification demo

## Non-Goals for Current Stage

- Supabase integration now
- OpenAI/API integration now
- Push notifications now
- Full auth/roles hardening
- Clinical workflows
