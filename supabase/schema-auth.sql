-- Sati Tech IAC: dedicated project's authentication foundation.
-- Apply ONLY to a newly created IAC Supabase project; do not mix with Sales OS.
-- Run as a privileged migration; never embed service_role keys in the browser.
-- Approved staff/partner role grants must occur server-side, after verification.

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  program_interest text not null default 'learning'
    check (program_interest in ('learning','mentorship','internship')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_assignments (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('student','intern','trainer','partner','admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index if not exists role_assignments_by_role on public.role_assignments(role);

alter table public.profiles enable row level security;
alter table public.role_assignments enable row level security;

-- Users can inspect and edit their OWN display profile, never another student's.
create policy "iac_profile_owner_read" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "iac_profile_owner_insert" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "iac_profile_owner_update" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Role membership is server-assigned. A member can only see their own roles.
create policy "iac_role_member_read" on public.role_assignments
  for select to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.profiles from public, anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

revoke all on public.role_assignments from public, anon, authenticated;
grant select on public.role_assignments to authenticated;

-- On signup, create an ordinary student role and a user-editable display profile.
-- raw_user_meta_data is ONLY used for DISPLAY fields, never for authorization.
create or replace function private.create_iac_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, full_name, program_interest)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name',''),90),
    case
      when new.raw_user_meta_data ->> 'program_interest' in ('learning','mentorship','internship')
      then new.raw_user_meta_data ->> 'program_interest'
      else 'learning'
    end
  ) on conflict(id) do nothing;

  insert into public.role_assignments(user_id, role)
  values(new.id,'student')
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function private.create_iac_profile() from public, anon, authenticated;

drop trigger if exists on_iac_user_created on auth.users;
create trigger on_iac_user_created
  after insert on auth.users
  for each row execute function private.create_iac_profile();

-- Staff, intern and partner role promotion must be performed by a trusted
-- server-side admin workflow, with evidence of verification and audit logging.
-- Never create public INSERT/UPDATE policies on role_assignments.
