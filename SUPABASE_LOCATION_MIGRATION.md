# Supabase Location Migration

This file records the trusted-location schema alignment that has now been folded into the checked-in migration.

## Goal

Extend the existing `places` table so the app can support:

- up to 3 trusted locations per user
- fixed trusted slots `1`, `2`, and `3`
- future app logic that distinguishes trusted places from "Other"
- compatibility with the current schema, especially `scheduled_events.place_id` and `activity_events.place_id`

Also reconcile an existing schema/code mismatch around `profiles.active_caregiver_id`.

For the current MVP:

- human-readable trusted-place text can stay in `places.name` and `places.address`
- `places.latitude` and `places.longitude` are the source of truth for matching
- trusted-place radius should stay in seeded app/demo configuration for now rather than adding a `radius_meters` column
- do not add reverse geocoding, browser-derived addresses, or external mapping infrastructure as part of this migration

## Summary

Do not create a new `trusted_locations` table.

Instead:

1. Extend `places`
2. Add trusted-location constraints/indexes
3. Fix the `profiles.active_caregiver_id` mismatch

## Required Schema Changes

### 1. Extend `places`

Add:

- `is_trusted boolean not null default false`
- `trusted_slot smallint`

### 2. Add validation constraints

Requirements:

- `trusted_slot` must be `1`, `2`, or `3` when present
- if `trusted_slot` is set, `is_trusted` must be `true`

### 3. Add uniqueness rule

Each user can only have one place in each trusted slot.

Use a partial unique index on:

- `(user_id, trusted_slot)` where `trusted_slot is not null`

### 4. Fix profile/caregiver schema mismatch

Current app code in `lib/profile.ts` reads and writes `profiles.active_caregiver_id`, but that column does not exist in the current migration.

Add:

- `active_caregiver_id uuid references caregivers(id)`

## Recommended SQL

```sql
alter table places
  add column if not exists is_trusted boolean not null default false,
  add column if not exists trusted_slot smallint;

alter table places
  drop constraint if exists places_trusted_slot_valid;

alter table places
  add constraint places_trusted_slot_valid
  check (trusted_slot is null or trusted_slot in (1, 2, 3));

alter table places
  drop constraint if exists places_trusted_slot_requires_trusted;

alter table places
  add constraint places_trusted_slot_requires_trusted
  check (trusted_slot is null or is_trusted = true);

create unique index if not exists places_user_trusted_slot_idx
  on places(user_id, trusted_slot)
  where trusted_slot is not null;

alter table profiles
  add column if not exists active_caregiver_id uuid references caregivers(id);
```

## What Not To Do

- Do not create a separate `trusted_locations` table
- Do not treat "Other" as a permanent fourth trusted slot
- Do not remove or redesign `places`
- Do not remove `scheduled_events.place_id`
- Do not remove `activity_events.place_id`

## Expected Result

After this migration:

- a user can have 0 to 3 trusted places
- each trusted place can occupy slot `1`, `2`, or `3`
- non-trusted places can still exist in `places`
- the app can later map a scenario to a trusted place or to "Other"
- address text remains human-readable UI data, while coordinate matching uses `latitude` / `longitude`
- radius handling remains app-side demo/config data for MVP

## Notes For Follow-Up App Work

Now that the migration file reflects these fields, the next app changes should:

- move demo/app location handling away from hardcoded strings
- map trusted demo locations to real `places` records
- keep "Other" as current-location state rather than a saved trusted place by default
