-- ============================================================================
-- THE PERMANENT GARDEN — migration v2 (whispers: 24 -> 128 characters)
-- ============================================================================
-- The 24-char cap on mark messages felt stingy. Inscriptions may now be up
-- to 128 characters. Everything else — one mark per visitor, no updates,
-- no deletes — is unchanged. The garden only grows.
--
-- HOW TO RUN (same as v1):
--   Supabase dashboard -> Portfolio project -> SQL Editor -> paste -> Run
-- Idempotent: safe to run any number of times.
-- ============================================================================

-- table check constraint
alter table public.garden_marks drop constraint if exists garden_marks_msg_len;
alter table public.garden_marks
    add constraint garden_marks_msg_len check (length(coalesce(message, '')) <= 128);

-- anon insert policy must mirror the new bound
drop policy if exists "garden_marks_insert_one" on public.garden_marks;
create policy "garden_marks_insert_one"
    on public.garden_marks
    for insert
    to anon
    with check (
        form between 0 and 7
        and hue between 0 and 359
        and size between 0.5 and 1.5
        and length(coalesce(message, '')) <= 128
        and abs(x) <= 10000
        and abs(z) <= 10000
        and source in ('quantum', 'local')
    );

-- NOTE: existing marks are untouched — permanence is the point.
