-- THE ROYAL AANGAN: run this once in Supabase > SQL Editor.
-- Row Level Security is on for every table and no public policy exists,
-- so the public anon key can read and write nothing. Only the website's
-- server, using the secret service role key, can reach this data.

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 120),
  max_attendees int check (max_attendees is null or max_attendees between 1 and 50),
  audience text not null default 'family' check (audience in ('family', 'friends')),
  created_at timestamptz not null default now()
);

-- Safe to run on a database created before the family and friends pages existed.
alter table guests add column if not exists audience text not null default 'family' check (audience in ('family', 'friends'));

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid unique references guests(id) on delete set null,
  guest_name text not null check (char_length(guest_name) between 1 and 120),
  attending boolean not null,
  attendees int not null default 0 check (attendees between 0 and 50),
  functions text[] not null default '{}',
  dietary text check (char_length(dietary) <= 300),
  message text check (char_length(message) <= 1000),
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blessings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  family text check (char_length(family) <= 80),
  message text not null check (char_length(message) between 1 and 800),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists blessings_public on blessings (status, created_at desc);

create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  artist text check (char_length(artist) <= 120),
  suggested_by text check (char_length(suggested_by) <= 80),
  dedupe_key text not null unique,
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table guests enable row level security;
alter table rsvps enable row level security;
alter table blessings enable row level security;
alter table songs enable row level security;

-- Belt and braces: remove table access from the public roles too, where they exist.
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on guests, rsvps, blessings, songs from %I', r);
    end if;
  end loop;
end $$;
