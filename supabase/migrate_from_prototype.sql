-- Run this only if you already installed GameFilter's older two-table Supabase schema.
-- Then run schema.sql. Existing reviews/library rows are preserved.

begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profiles (id, display_name)
select id, coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), split_part(email, '@', 1), 'Player')
from auth.users
on conflict (id) do nothing;

-- The old schema copied display_name into every review. Profiles are now the source of truth.
alter table if exists public.reviews drop column if exists display_name;

-- Re-point user ownership FKs through public.profiles so PostgREST can join avatar/name safely.
alter table if exists public.reviews drop constraint if exists reviews_user_id_fkey;
alter table if exists public.reviews
  add constraint reviews_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;

alter table if exists public.library_entries drop constraint if exists library_entries_user_id_fkey;
alter table if exists public.library_entries
  add constraint library_entries_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;

commit;
