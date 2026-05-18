-- ============================================
-- HELPER: auto-update updated_at on any table
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- TABLE: profiles
-- ============================================
create table profiles (
  id uuid primary key default gen_random_uuid(),
  preferred_name text not null,
  pronouns text not null default 'they/them',
  custom_pronouns text,
  response_style text not null default 'short, calm, reassuring',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

alter table profiles enable row level security;
create policy "allow all" on profiles for all using (true);

-- ============================================
-- TABLE: caregivers
-- ============================================
create table caregivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  relationship_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create trigger caregivers_updated_at
  before update on caregivers
  for each row execute function update_updated_at();

alter table caregivers enable row level security;
create policy "allow all" on caregivers for all using (true);

-- ============================================
-- TABLE: caregiver_user_relationships
-- ============================================
create table caregiver_user_relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  caregiver_id uuid not null references caregivers(id),
  role text not null default 'family',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, caregiver_id)
);

create trigger caregiver_user_relationships_updated_at
  before update on caregiver_user_relationships
  for each row execute function update_updated_at();

alter table caregiver_user_relationships enable row level security;
create policy "allow all" on caregiver_user_relationships for all using (true);

-- ============================================
-- TABLE: contacts
-- ============================================
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  name text not null,
  phone text,
  email text,
  relationship_label text,
  is_primary_caregiver boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger contacts_updated_at
  before update on contacts
  for each row execute function update_updated_at();

alter table contacts enable row level security;
create policy "allow all" on contacts for all using (true);

-- ============================================
-- TABLE: places
-- ============================================
create table places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  place_type text,
  instructions text,
  is_home boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger places_updated_at
  before update on places
  for each row execute function update_updated_at();

alter table places enable row level security;
create policy "allow all" on places for all using (true);

-- ============================================
-- TABLE: routines
-- ============================================
create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  title text not null,
  description text,
  time_of_day text,
  scheduled_time time,
  days_of_week text[],
  instructions text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger routines_updated_at
  before update on routines
  for each row execute function update_updated_at();

alter table routines enable row level security;
create policy "allow all" on routines for all using (true);

-- ============================================
-- TABLE: scheduled_events
-- ============================================
create table scheduled_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  title text not null,
  description text,
  location text,
  place_id uuid references places(id),
  start_time timestamptz not null,
  end_time timestamptz,
  pickup_by text,
  pickup_time timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger scheduled_events_updated_at
  before update on scheduled_events
  for each row execute function update_updated_at();

alter table scheduled_events enable row level security;
create policy "allow all" on scheduled_events for all using (true);

-- ============================================
-- TABLE: safety_rules
-- ============================================
create table safety_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  rule text not null,
  context text,
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger safety_rules_updated_at
  before update on safety_rules
  for each row execute function update_updated_at();

alter table safety_rules enable row level security;
create policy "allow all" on safety_rules for all using (true);

-- ============================================
-- TABLE: activity_events
-- ============================================
create table activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  event_type text not null,
  scenario_id text,
  source text not null default 'app',
  confidence_level text,
  latitude double precision,
  longitude double precision,
  place_id uuid references places(id),
  ai_response text,
  user_confirmed boolean,
  confirmed_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index activity_events_user_id_idx on activity_events(user_id);
create index activity_events_created_at_idx on activity_events(created_at);
create index activity_events_event_type_idx on activity_events(event_type);

alter table activity_events enable row level security;
create policy "allow all" on activity_events for all using (true);

-- ============================================
-- TABLE: system_events
-- ============================================
create table system_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  event_type text not null,
  scenario_id text,
  source text not null default 'system',
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index system_events_user_id_idx on system_events(user_id);
create index system_events_created_at_idx on system_events(created_at);

alter table system_events enable row level security;
create policy "allow all" on system_events for all using (true);

-- ============================================
-- TABLE: biometric_events
-- ============================================
create table biometric_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  event_type text not null,
  value numeric not null,
  unit text not null,
  threshold_exceeded boolean not null default false,
  source text not null default 'synthetic',
  recorded_at timestamptz not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index biometric_events_user_id_idx on biometric_events(user_id);
create index biometric_events_recorded_at_idx on biometric_events(recorded_at);

alter table biometric_events enable row level security;
create policy "allow all" on biometric_events for all using (true);
