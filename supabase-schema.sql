-- PortCast — Multi-tenant schema
-- Run this in your Supabase project's SQL Editor. Replaces the earlier
-- single-tenant version — if you already ran the old supabase-schema.sql,
-- drop the old `observations` table first (or run on a fresh project).
--
-- Model: ONE shared database, isolated per company via Row Level Security
-- (RLS) rather than physically separate databases per customer. This is
-- the standard approach — same practical isolation, far less to run and
-- pay for as you add companies. Each authenticated user belongs to
-- exactly one company; every query is automatically filtered to that
-- company's rows by Postgres itself, not by app-level code (so it holds
-- even if there's a bug in app.js).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Companies (tenants) — e.g. CalMac, Tiree Sea Tours, Coastal Connections
-- ---------------------------------------------------------------------
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Links a Supabase Auth user to exactly one company.
-- ---------------------------------------------------------------------
create table if not exists company_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  role text not null default 'staff',
  created_at timestamptz not null default now()
);

create or replace function current_company_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select company_id from company_members where user_id = auth.uid()
$$;

-- ---------------------------------------------------------------------
-- Vessels — each company's fleet registry
-- ---------------------------------------------------------------------
create table if not exists vessels (
  id bigint generated always as identity primary key,
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  mmsi text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_vessels_company on vessels (company_id);

-- ---------------------------------------------------------------------
-- Observations — now scoped per company (pier/crew notes)
-- ---------------------------------------------------------------------
create table if not exists observations (
  id bigint generated always as identity primary key,
  company_id uuid not null references companies(id) on delete cascade,
  port text not null,
  category text not null,
  note_text text not null,
  confirms integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_observations_company on observations (company_id);
create index if not exists idx_observations_port on observations (port);
create index if not exists idx_observations_created_at on observations (created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security — this is what actually enforces per-company isolation
-- ---------------------------------------------------------------------
alter table companies enable row level security;
alter table company_members enable row level security;
alter table vessels enable row level security;
alter table observations enable row level security;

create policy "View own company" on companies
  for select using (id = current_company_id());
create policy "Authenticated users can create a company" on companies
  for insert with check (auth.uid() is not null);

create policy "View own membership" on company_members
  for select using (user_id = auth.uid());
create policy "Create own membership" on company_members
  for insert with check (user_id = auth.uid());

create policy "Company can view own vessels" on vessels
  for select using (company_id = current_company_id());
create policy "Company can add own vessels" on vessels
  for insert with check (company_id = current_company_id());
create policy "Company can delete own vessels" on vessels
  for delete using (company_id = current_company_id());

create policy "Company can view own observations" on observations
  for select using (company_id = current_company_id());
create policy "Company can add own observations" on observations
  for insert with check (company_id = current_company_id());
create policy "Company can update own observations" on observations
  for update using (company_id = current_company_id());

-- ---------------------------------------------------------------------
-- Notes for later, once this moves beyond a first pilot company:
--  - Invite flow: currently one user per company creates it and that's
--    it — no "invite a colleague" UI yet. Straightforward to add
--    (insert a company_members row for a second user_id) but needs a
--    proper invite-link mechanism, not built here.
--  - Consider a real admin/support role that can see across companies
--    for your own operations use — do NOT do this by weakening the RLS
--    policies above; use a Supabase service-role key from a secured
--    backend function instead, never from the browser.
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- Captain's Notes — a PUBLIC, low-friction tier for smaller operators
-- (e.g. Tiree Sea Tours) who want an open log anyone can read and post
-- to, without needing full crew accounts. Deliberately open — see the
-- warning below before relying on this for anything sensitive.
-- ---------------------------------------------------------------------
create table if not exists captain_notes (
  id bigint generated always as identity primary key,
  company_id uuid not null references companies(id) on delete cascade,
  author_name text,
  note_text text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_captain_notes_company on captain_notes (company_id);

alter table captain_notes enable row level security;

-- Genuinely public: anyone can read, anyone can post. This is
-- intentional for this feature — it's a public-facing log, not a
-- security boundary. WARNING: open write access means it can be
-- spammed by anyone who finds the endpoint. Fine for a first pilot;
-- if this becomes real, add rate limiting (e.g. a Supabase Edge
-- Function checking request frequency) or a lightweight CAPTCHA before
-- relying on it for anything customer-facing at scale.
create policy "Anyone can read captain's notes" on captain_notes
  for select using (true);
create policy "Anyone can post captain's notes" on captain_notes
  for insert with check (true);

-- Moderation: a company's own staff can delete notes posted under
-- their company_id (e.g. to remove spam or an outdated note).
create policy "Company can delete own captain's notes" on captain_notes
  for delete using (company_id = current_company_id());

-- Company directory needs to be publicly readable too, so a visitor can
-- pick which company's Captain's Notes to view (this ADDS to, not
-- replaces, the existing "View own company" policy — Postgres OR's
-- permissive policies together, so this just widens read access).
create policy "Anyone can view company names" on companies
  for select using (true);
