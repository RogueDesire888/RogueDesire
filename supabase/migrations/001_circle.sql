-- Enter the Circle: entries. Not yet applied (Supabase is not connected).
-- Run once against the project's Postgres before /circle goes live.

create extension if not exists pgcrypto;

create table if not exists public.circle_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  email_normalized text not null unique,
  city text,
  instagram text,
  role text,
  music text,
  involvement text,
  message text,
  referral_code text,
  source_path text,
  consent boolean not null,
  ip_hash text,
  user_agent text
);

create index if not exists circle_entries_created_at_idx on public.circle_entries (created_at);
create index if not exists circle_entries_referral_code_idx on public.circle_entries (referral_code);

-- RLS on with no policies: only the service role (server) can read or write.
alter table public.circle_entries enable row level security;
