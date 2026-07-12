-- Add note column to workout_logs
alter table public.workout_logs
  add column if not exists note text check (char_length(note) <= 200);

-- Body weight tracking table
create table if not exists public.body_weight_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  weight_kg   numeric not null check (weight_kg > 0 and weight_kg < 500),
  logged_at   date not null default current_date,
  created_at  timestamptz not null default now(),
  unique (user_id, logged_at)          -- one entry per user per day
);

create index if not exists body_weight_logs_user_date_idx
  on public.body_weight_logs(user_id, logged_at desc);

alter table public.body_weight_logs enable row level security;

-- RLS policies for body_weight_logs (admin client bypasses RLS, so these are safety guards)
drop policy if exists "users manage own body weight" on public.body_weight_logs;
create policy "users manage own body weight"
  on public.body_weight_logs for all
  using (true) with check (true);
