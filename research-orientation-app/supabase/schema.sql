-- Research Methodology Orientation: database setup for Supabase.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.

-- ───────────── Tables ─────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  institution text not null default '',
  designation text not null default '',
  role text not null default 'participant' check (role in ('participant', 'facilitator', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  module_id text not null,
  body text not null check (char_length(body) <= 20000),
  feedback text,
  feedback_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  module_id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default '',
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists posts_module_idx on public.posts (module_id, created_at);

create table if not exists public.announcements (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null default '',
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 4000),
  created_at timestamptz not null default now()
);

-- ───────────── Helpers ─────────────
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('facilitator', 'admin'));
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- A profile row is created automatically for every new sign-in.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only an admin (or the SQL editor) may change a role.
create or replace function public.guard_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only an administrator can change roles';
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_role();

-- Participants edit their own response; staff may only add feedback.
create or replace function public.guard_submission() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if auth.uid() = old.user_id then
    if new.feedback is distinct from old.feedback and not public.is_staff() then
      raise exception 'Only facilitators can write feedback';
    end if;
    if not public.is_staff() then new.feedback_by := old.feedback_by; end if;
  else
    if new.body is distinct from old.body or new.user_id <> old.user_id or new.module_id <> old.module_id then
      raise exception 'Facilitators can only add feedback';
    end if;
    new.feedback_by := auth.uid();
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists submissions_guard on public.submissions;
create trigger submissions_guard before update on public.submissions
  for each row execute function public.guard_submission();

-- ───────────── Row-level security ─────────────
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.submissions enable row level security;
alter table public.posts enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());
drop policy if exists "profiles update" on public.profiles;
create policy "profiles update" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists "progress read" on public.progress;
create policy "progress read" on public.progress for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists "progress insert" on public.progress;
create policy "progress insert" on public.progress for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "progress update" on public.progress;
create policy "progress update" on public.progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "submissions read" on public.submissions;
create policy "submissions read" on public.submissions for select to authenticated using (user_id = auth.uid() or public.is_staff());
drop policy if exists "submissions insert" on public.submissions;
create policy "submissions insert" on public.submissions for insert to authenticated with check (user_id = auth.uid() and feedback is null);
drop policy if exists "submissions update" on public.submissions;
create policy "submissions update" on public.submissions for update to authenticated
  using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());

drop policy if exists "posts read" on public.posts;
create policy "posts read" on public.posts for select to authenticated using (true);
drop policy if exists "posts insert" on public.posts;
create policy "posts insert" on public.posts for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "posts delete" on public.posts;
create policy "posts delete" on public.posts for delete to authenticated using (user_id = auth.uid() or public.is_staff());

drop policy if exists "announcements read" on public.announcements;
create policy "announcements read" on public.announcements for select to authenticated using (true);
drop policy if exists "announcements insert" on public.announcements;
create policy "announcements insert" on public.announcements for insert to authenticated with check (user_id = auth.uid() and public.is_staff());
drop policy if exists "announcements delete" on public.announcements;
create policy "announcements delete" on public.announcements for delete to authenticated using (public.is_staff());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
