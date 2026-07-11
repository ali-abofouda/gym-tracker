create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  pin_hash text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists pin_hash text;

create table if not exists public.exercises (
  id text primary key,
  day_number int not null check (day_number between 1 and 7),
  day_title text not null,
  name text not null,
  sets text not null,
  reps text not null,
  muscle_group text not null,
  is_rest_day boolean not null default false
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id text not null references public.exercises(id) on delete cascade,
  weight numeric not null check (weight > 0),
  reps int check (reps is null or reps > 0),
  logged_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists workout_logs_user_exercise_date_idx
  on public.workout_logs(user_id, exercise_id, logged_at desc, created_at desc);

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_logs enable row level security;

drop policy if exists "profiles are visible to signed in users" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "program is public" on public.exercises;
drop policy if exists "signed in users can read competition logs" on public.workout_logs;
drop policy if exists "users insert own logs" on public.workout_logs;
drop policy if exists "users update own logs" on public.workout_logs;
drop policy if exists "users delete own logs" on public.workout_logs;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create policy "program is public"
on public.exercises for select
to anon, authenticated
using (true);

insert into public.profiles (id, display_name, pin_hash) values
('00000000-0000-0000-0000-000000000001', 'علي', null),
('00000000-0000-0000-0000-000000000002', 'فاروق', null),
('00000000-0000-0000-0000-000000000003', 'أبو ريا', null),
('00000000-0000-0000-0000-000000000004', 'عبده', null),
('00000000-0000-0000-0000-000000000005', 'الديب', null)
on conflict (id) do update set
  display_name = excluded.display_name;
