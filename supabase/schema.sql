-- =============================================================================
-- PythonTools — Supabase / Postgres schema
-- =============================================================================
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- or via the Supabase CLI. It is idempotent and safe to re-run.
--
-- NOTE ON AUTH: This app does NOT use Supabase Auth. Authentication is handled
-- by the Next.js server, which hashes passwords with bcrypt and stores the
-- resulting hash in users.password_hash. The server talks to these tables using
-- the service_role key, which bypasses Row Level Security. RLS is still enabled
-- below as a defense-in-depth measure so that the anon/public key cannot read
-- or write these tables directly.
--
-- WHERE DATA LIVES: ALL persistent data — user accounts AND every post — is
-- stored ONLY in these Postgres tables. Nothing sensitive is kept in the
-- browser: no passwords, no emails (none are collected), no profile data. The
-- only thing the browser holds is a single httpOnly, signed session cookie
-- (`pt_session`) that the browser's JavaScript cannot even read.
-- =============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
create table if not exists public.users (
    id            uuid primary key default gen_random_uuid(),
    username      text not null check (char_length(username) between 3 and 32),
    password_hash text not null,           -- bcrypt hash, never the raw password
    created_at    timestamptz not null default now()
);

-- Case-insensitive uniqueness on username so "Alice" and "alice" can't both exist.
create unique index if not exists users_username_lower_key
    on public.users (lower(username));

-- -----------------------------------------------------------------------------
-- posts
-- -----------------------------------------------------------------------------
create table if not exists public.posts (
    id          uuid primary key default gen_random_uuid(),
    author_id   uuid not null references public.users (id) on delete cascade,
    title       text not null check (char_length(title) between 3 and 120),
    description text not null default '' check (char_length(description) <= 5000),
    code        text not null check (char_length(code) between 1 and 100000), -- raw python source
    created_at  timestamptz not null default now()
);

create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
-- Enable RLS and add NO permissive policies for the anon/authenticated roles.
-- With RLS on and no policies, the public (anon) key is denied all access.
-- The Next.js server uses the service_role key, which bypasses RLS entirely.
alter table public.users enable row level security;
alter table public.posts enable row level security;
