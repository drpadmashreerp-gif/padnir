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

-- The book's chapters, readable only by signed-in people on the allowed list.
-- Filled by running supabase/content.sql after this file.
create table if not exists public.book_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- People the administrator has allowed to use the book (invite-only).
create table if not exists public.allowed_users (
  email text primary key check (email = lower(email) and position('@' in email) > 1),
  role text not null default 'participant' check (role in ('participant', 'facilitator', 'admin')),
  note text not null default '',
  added_at timestamptz not null default now()
);

-- ───────────── Helpers ─────────────
-- True when the signed-in person is still on the allowed list. Removing an email cuts access at once.
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.allowed_users a join auth.users u on lower(u.email) = a.email where u.id = auth.uid());
$$;
create or replace function public.my_email() returns text
language sql stable security definer set search_path = public as $$ select lower(email) from auth.users where id = auth.uid(); $$;
create or replace function public.am_i_allowed() returns boolean
language sql stable security definer set search_path = public as $$ select public.is_member(); $$;
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_member() and exists (select 1 from public.profiles where id = auth.uid() and role in ('facilitator', 'admin'));
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_member() and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Only invited emails can create an account; the profile starts with the role the administrator chose.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare invited_role text;
begin
  select role into invited_role from public.allowed_users where email = lower(new.email);
  if invited_role is null then
    raise exception 'This email has not been given access to the book';
  end if;
  insert into public.profiles (id, role) values (new.id, invited_role) on conflict (id) do nothing;
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
alter table public.allowed_users enable row level security;
alter table public.book_content enable row level security;
drop policy if exists "book read" on public.book_content;
create policy "book read" on public.book_content for select to authenticated using (public.is_member());

drop policy if exists "allowed read" on public.allowed_users;
create policy "allowed read" on public.allowed_users for select to authenticated using (public.is_admin());
drop policy if exists "allowed insert" on public.allowed_users;
create policy "allowed insert" on public.allowed_users for insert to authenticated with check (public.is_admin());
drop policy if exists "allowed update" on public.allowed_users;
create policy "allowed update" on public.allowed_users for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "allowed delete" on public.allowed_users;
create policy "allowed delete" on public.allowed_users for delete to authenticated using (public.is_admin() and email <> public.my_email());

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using (public.is_member() and (id = auth.uid() or public.is_staff()));
drop policy if exists "profiles update" on public.profiles;
create policy "profiles update" on public.profiles for update to authenticated
  using (public.is_member() and (id = auth.uid() or public.is_admin())) with check (public.is_member() and (id = auth.uid() or public.is_admin()));

drop policy if exists "progress read" on public.progress;
create policy "progress read" on public.progress for select to authenticated using (public.is_member() and (user_id = auth.uid() or public.is_staff()));
drop policy if exists "progress insert" on public.progress;
create policy "progress insert" on public.progress for insert to authenticated with check (public.is_member() and user_id = auth.uid());
drop policy if exists "progress update" on public.progress;
create policy "progress update" on public.progress for update to authenticated using (user_id = auth.uid()) with check (public.is_member() and user_id = auth.uid());

drop policy if exists "submissions read" on public.submissions;
create policy "submissions read" on public.submissions for select to authenticated using (public.is_member() and (user_id = auth.uid() or public.is_staff()));
drop policy if exists "submissions insert" on public.submissions;
create policy "submissions insert" on public.submissions for insert to authenticated with check (public.is_member() and user_id = auth.uid() and feedback is null);
drop policy if exists "submissions update" on public.submissions;
create policy "submissions update" on public.submissions for update to authenticated
  using (public.is_member() and (user_id = auth.uid() or public.is_staff())) with check (public.is_member() and (user_id = auth.uid() or public.is_staff()));

drop policy if exists "posts read" on public.posts;
create policy "posts read" on public.posts for select to authenticated using (public.is_member());
drop policy if exists "posts insert" on public.posts;
create policy "posts insert" on public.posts for insert to authenticated with check (public.is_member() and user_id = auth.uid());
drop policy if exists "posts delete" on public.posts;
create policy "posts delete" on public.posts for delete to authenticated using (public.is_member() and (user_id = auth.uid() or public.is_staff()));

drop policy if exists "announcements read" on public.announcements;
create policy "announcements read" on public.announcements for select to authenticated using (public.is_member());
drop policy if exists "announcements insert" on public.announcements;
create policy "announcements insert" on public.announcements for insert to authenticated with check (user_id = auth.uid() and public.is_staff());
drop policy if exists "announcements delete" on public.announcements;
create policy "announcements delete" on public.announcements for delete to authenticated using (public.is_staff());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.am_i_allowed() to authenticated;

-- For the administrator's Access panel: every invited email, whether they have joined, and their profile.
create or replace function public.admin_people()
returns table (email text, role text, note text, added_at timestamptz, joined boolean, user_id uuid, name text, institution text, last_sign_in timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Only an administrator can view this list'; end if;
  return query
    select a.email, coalesce(p.role, a.role), a.note, a.added_at, u.id is not null, u.id, coalesce(p.name, ''), coalesce(p.institution, ''), u.last_sign_in_at
    from public.allowed_users a
    left join auth.users u on lower(u.email) = a.email
    left join public.profiles p on p.id = u.id
    order by a.added_at desc;
end $$;
revoke all on function public.admin_people() from public;
grant execute on function public.admin_people() to authenticated;

-- ───────────── First administrator ─────────────
-- IMPORTANT: replace your.email@example.com with YOUR email (lower case) before running this file. You can then add everyone else from the app.
insert into public.allowed_users (email, role, note) values ('your.email@example.com', 'admin', 'Course administrator')
  on conflict (email) do update set role = 'admin';
