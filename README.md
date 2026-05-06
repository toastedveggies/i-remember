# Memory Assistant (Prototype)

Memory Assistant is a mobile-first Next.js prototype that helps a person reorient to the present moment by answering:
- Where am I?
- What is happening?
- What should I do next?

This is a **class prototype**, not a production medical system.

## Product Boundaries

- Not a full AI companion
- Not a clinical assessment tool
- Not an emergency monitoring system
- Scope is intentionally bounded to MVP modules in `PROJECT_PLAN.md`

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (planned, not connected yet)
- Server-side API routes for AI calls (planned)
- Vercel deployment

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Run locally

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Environment Variables (`.env.local`)

Create a `.env.local` file in the repo root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Notes:
- Keep this file local and out of version control.
- Do not place service role keys in client-exposed variables.

## Supabase Setup (Manual - Later)

Supabase is not connected yet. When ready:

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. In the Supabase dashboard, open **Project Settings** -> **API**.
3. Copy:
   - **Project URL** -> use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** -> use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Add these values to your local `.env.local`.

### Future schema/migration setup (planned)

When database work starts:
- Define schema SQL/migrations in a dedicated folder (for example `supabase/migrations`).
- Add repeatable migration commands and policy setup steps.
- Document local dev workflow for resetting and applying migrations.
- Keep schema notes synced in `DECISIONS.md` and `BUILD_STATUS.md`.

## Vercel Setup (Manual - Later)

### 1) Connect repo to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **Add New...** -> **Project**
3. Import this GitHub repository
4. Use default Next.js build settings unless requirements change

### 2) Configure environment variables in Vercel

In the Vercel project settings, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Add them for at least:
- Preview
- Production

### 3) Deploy from GitHub to Vercel

- Push changes to GitHub
- Vercel auto-builds on push/PR (if connected)
- Validate deployment logs and app health after each deploy

## Project Operating Docs

Before making implementation changes, review:
- `PROJECT_PLAN.md`
- `BUILD_STATUS.md`
- `DECISIONS.md`
- `FUTURE_IDEAS.md`
- `AGENT_INSTRUCTIONS.md`

## Current Status

Planning docs are in place and app implementation is intentionally not started yet.
