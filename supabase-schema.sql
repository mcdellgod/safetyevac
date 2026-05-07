create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.buildings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references public.buildings(id) on delete cascade,
  name text not null,
  assembly_point text,
  guide_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('EXERCISE','REAL')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','CLOSED')),
  building_name text not null,
  zones text[] not null default '{}',
  assembly_point text,
  message text,
  notified_count integer not null default 0,
  triggered_by text,
  triggered_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.evacuation_responses (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.alerts(id) on delete cascade,
  person_name text not null,
  role text not null default 'employee',
  zone text,
  is_present boolean,
  is_safe boolean,
  location text,
  notes text,
  responded_at timestamptz not null default now()
);

create table if not exists public.first_aid_reports (
  id uuid primary key default gen_random_uuid(),
  location text not null,
  victim_name text,
  incident_type text not null,
  status text not null default 'OPEN' check (status in ('OPEN','CLOSED')),
  reported_by text,
  reported_at timestamptz not null default now()
);

create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.alerts(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.sites enable row level security;
alter table public.buildings enable row level security;
alter table public.zones enable row level security;
alter table public.alerts enable row level security;
alter table public.evacuation_responses enable row level security;
alter table public.first_aid_reports enable row level security;
alter table public.app_events enable row level security;

-- Prototype only: these policies make the online demo writable without login.
-- Replace with role-based authenticated policies before using real personal data.
create policy "demo public read organizations" on public.organizations for select to anon, authenticated using (true);
create policy "demo public read sites" on public.sites for select to anon, authenticated using (true);
create policy "demo public read buildings" on public.buildings for select to anon, authenticated using (true);
create policy "demo public read zones" on public.zones for select to anon, authenticated using (true);
create policy "demo public all alerts" on public.alerts for all to anon, authenticated using (true) with check (true);
create policy "demo public all responses" on public.evacuation_responses for all to anon, authenticated using (true) with check (true);
create policy "demo public all first aid" on public.first_aid_reports for all to anon, authenticated using (true) with check (true);
create policy "demo public all events" on public.app_events for all to anon, authenticated using (true) with check (true);
