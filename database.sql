-- Planned database tables for the online version.
-- This is a draft; it is not connected to the game yet.

create table if not exists players (
  id uuid primary key,
  username text not null unique,
  location_name text not null,
  latitude double precision,
  longitude double precision,
  empire_flag text not null,
  created_at timestamptz not null default now()
);

create table if not exists villages (
  player_id uuid primary key references players(id) on delete cascade,
  town_hall_level integer not null default 1,
  building_state jsonb not null default '[]'::jsonb,
  resources jsonb not null default
    '{"gold":2500,"elixir":1800,"dark":120,"gems":25}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists friendships (
  requester_id uuid not null references players(id) on delete cascade,
  recipient_id uuid not null references players(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  primary key (requester_id, recipient_id),
  check (requester_id <> recipient_id)
);

create table if not exists clans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  owner_id uuid not null references players(id),
  created_at timestamptz not null default now()
);

create table if not exists clan_members (
  clan_id uuid not null references clans(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (clan_id, player_id)
);
