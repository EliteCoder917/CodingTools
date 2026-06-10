-- =============================================================================
-- Migration 0002 — multi-file posts, full-text search, profiles/edit/delete
-- =============================================================================
-- Run this AFTER schema.sql, in the Supabase SQL Editor. It is idempotent and
-- safe to re-run. It:
--   * adds a post_files table so one post can hold several Python scripts, each
--     with a name and a subtitle describing how it contributes to the post
--   * migrates any existing single posts.code value into a post_files row, then
--     drops posts.code
--   * adds full-text search (indexed GIN tsvector) over title + description
--   * adds posts.file_count (trigger-maintained, indexed) for fast filtering
--   * adds atomic create/update RPCs so a post and its files change together
-- =============================================================================

-- -----------------------------------------------------------------------------
-- post_files: the individual scripts that make up a post
-- -----------------------------------------------------------------------------
create table if not exists public.post_files (
    id         uuid primary key default gen_random_uuid(),
    post_id    uuid not null references public.posts (id) on delete cascade,
    position   int  not null default 0,                 -- display order within a post
    name       text not null default 'script.py'
                    check (char_length(name) between 1 and 120),
    note       text not null default ''                 -- subtitle: how it contributes
                    check (char_length(note) <= 500),
    content    text not null                            -- raw python source (always text)
                    check (char_length(content) between 1 and 100000),
    created_at timestamptz not null default now()
);

-- Fast lookup + ordering of a post's files.
create index if not exists post_files_post_id_idx
    on public.post_files (post_id, position);

alter table public.post_files enable row level security;

-- -----------------------------------------------------------------------------
-- posts.file_count — denormalized count for O(log n) "single vs multi-file" filter
-- -----------------------------------------------------------------------------
alter table public.posts add column if not exists file_count int not null default 0;

-- -----------------------------------------------------------------------------
-- Migrate the old single posts.code column into post_files, then drop it.
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'code'
  ) then
    insert into public.post_files (post_id, position, name, note, content)
    select p.id, 0, 'script.py', '', p.code
    from public.posts p
    where p.code is not null
      and char_length(p.code) > 0
      and not exists (select 1 from public.post_files f where f.post_id = p.id);

    alter table public.posts drop column code;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Full-text search over title (weight A) + description (weight B), GIN-indexed.
-- -----------------------------------------------------------------------------
alter table public.posts add column if not exists search_vector tsvector
    generated always as (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) stored;

create index if not exists posts_search_idx on public.posts using gin (search_vector);
create index if not exists posts_file_count_idx on public.posts (file_count);

-- -----------------------------------------------------------------------------
-- Keep posts.file_count in sync automatically.
-- -----------------------------------------------------------------------------
create or replace function public.sync_post_file_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set file_count = file_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set file_count = file_count - 1 where id = old.post_id;
  end if;
  return null;
end $$;

drop trigger if exists post_files_count_trg on public.post_files;
create trigger post_files_count_trg
    after insert or delete on public.post_files
    for each row execute function public.sync_post_file_count();

-- Backfill counts for any pre-existing rows.
update public.posts p
set file_count = (select count(*) from public.post_files f where f.post_id = p.id);

-- -----------------------------------------------------------------------------
-- Atomic create: insert a post and all of its files in one transaction.
-- p_files is a JSON array of { name, note, content } objects (max 10).
-- -----------------------------------------------------------------------------
create or replace function public.create_post_with_files(
    p_author      uuid,
    p_title       text,
    p_description text,
    p_files       jsonb
) returns uuid language plpgsql as $$
declare
  v_post_id uuid;
  v_file    jsonb;
  v_pos     int := 0;
begin
  if p_files is null or jsonb_array_length(p_files) < 1 then
    raise exception 'at least one file is required';
  end if;
  if jsonb_array_length(p_files) > 10 then
    raise exception 'too many files (max 10)';
  end if;

  insert into public.posts (author_id, title, description)
  values (p_author, p_title, p_description)
  returning id into v_post_id;

  for v_file in select * from jsonb_array_elements(p_files)
  loop
    insert into public.post_files (post_id, position, name, note, content)
    values (
      v_post_id,
      v_pos,
      coalesce(nullif(v_file->>'name', ''), 'script.py'),
      coalesce(v_file->>'note', ''),
      v_file->>'content'
    );
    v_pos := v_pos + 1;
  end loop;

  return v_post_id;
end $$;

-- -----------------------------------------------------------------------------
-- Atomic update: owner-checked. Replaces the post's files wholesale.
-- Returns true on success, false if the post does not exist. Raises if the
-- caller is not the author.
-- -----------------------------------------------------------------------------
create or replace function public.update_post_with_files(
    p_post        uuid,
    p_author      uuid,
    p_title       text,
    p_description text,
    p_files       jsonb
) returns boolean language plpgsql as $$
declare
  v_owner uuid;
  v_file  jsonb;
  v_pos   int := 0;
begin
  select author_id into v_owner from public.posts where id = p_post;
  if v_owner is null then
    return false;
  end if;
  if v_owner <> p_author then
    raise exception 'not authorized';
  end if;
  if p_files is null or jsonb_array_length(p_files) < 1 then
    raise exception 'at least one file is required';
  end if;
  if jsonb_array_length(p_files) > 10 then
    raise exception 'too many files (max 10)';
  end if;

  update public.posts
  set title = p_title, description = p_description
  where id = p_post;

  delete from public.post_files where post_id = p_post;

  for v_file in select * from jsonb_array_elements(p_files)
  loop
    insert into public.post_files (post_id, position, name, note, content)
    values (
      p_post,
      v_pos,
      coalesce(nullif(v_file->>'name', ''), 'script.py'),
      coalesce(v_file->>'note', ''),
      v_file->>'content'
    );
    v_pos := v_pos + 1;
  end loop;

  return true;
end $$;
