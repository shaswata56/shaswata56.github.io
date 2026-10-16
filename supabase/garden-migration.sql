-- ============================================================================
-- THE PERMANENT GARDEN — migration for shaswata.me/garden
-- ============================================================================
-- One glowing mark per visitor, planted forever. Its position, hue, form,
-- size and glow phase are decided by quantum randomness (or an honestly
-- labeled local fallback) on the client; this table simply keeps them safe.
--
-- HOW TO RUN (human steps):
--   1. Open the Supabase dashboard  →  https://supabase.com/dashboard
--   2. Select the project  →  SQL Editor  (left sidebar)
--   3. Paste this entire file into a new query
--   4. Press Run
--   Everything below is idempotent — safe to run any number of times.
--
-- gen_random_uuid() is native on PostgreSQL 13+ (all current Supabase
-- projects), so no extension is required.
-- ============================================================================

create table if not exists public.garden_marks (
    id          uuid        primary key default gen_random_uuid(),
    visitor_id  text        not null,
    x           real        not null,
    z           real        not null,
    hue         smallint    not null,
    form        smallint    not null,
    size        real        not null,
    glow        real        not null,
    message     text,
    source      text        not null default 'quantum',
    planted_at  timestamptz not null default now(),

    -- form variants are 0..7 (crystal, spore, star, bloom, shard, ring, seed, flame)
    constraint garden_marks_form_range   check (form between 0 and 7),
    constraint garden_marks_hue_range    check (hue between 0 and 359),
    constraint garden_marks_size_range   check (size between 0.5 and 1.5),
    constraint garden_marks_msg_len     check (length(coalesce(message, '')) <= 24),
    constraint garden_marks_x_range     check (abs(x) <= 10000),
    constraint garden_marks_z_range     check (abs(z) <= 10000),
    constraint garden_marks_source_ok   check (source in ('quantum', 'local'))
);

-- THE PERMANENCE RULE: one mark per visitor, enforced by the database.
create unique index if not exists garden_marks_visitor_unique
    on public.garden_marks (visitor_id);

-- Supports the paginated oldest-first load in the scene.
create index if not exists garden_marks_planted_at_idx
    on public.garden_marks (planted_at);

-- ----------------------------------------------------------------------------
-- Row level security
-- ----------------------------------------------------------------------------

alter table public.garden_marks enable row level security;

-- Everyone (anon + authenticated) may SEE the whole garden — nothing
-- sensitive is stored.
drop policy if exists "garden_marks_select_all" on public.garden_marks;
create policy "garden_marks_select_all"
    on public.garden_marks
    for select
    to anon, authenticated
    using (true);

-- Anonymous visitors may PLANT one mark, provided it satisfies the same
-- shape constraints as the table itself.
drop policy if exists "garden_marks_insert_one" on public.garden_marks;
create policy "garden_marks_insert_one"
    on public.garden_marks
    for insert
    to anon
    with check (
        form between 0 and 7
        and hue between 0 and 359
        and size between 0.5 and 1.5
        and length(coalesce(message, '')) <= 24
        and abs(x) <= 10000
        and abs(z) <= 10000
        and source in ('quantum', 'local')
    );

-- PERMANENCE: there is deliberately NO update policy and NO delete policy.
-- With RLS enabled, that means nobody — not even a leaked anon key — can
-- alter or remove a mark from the app. The garden only grows.

-- Explicit privileges, belt and braces (RLS policies are the real gate):
grant usage on schema public to anon, authenticated;
grant select, insert on public.garden_marks to anon, authenticated;
revoke update, delete on public.garden_marks from anon, authenticated;
