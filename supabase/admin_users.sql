-- ============================================================
-- Orwa Sole Co. — Admin roster
-- The admin area is locked to a list of emails. The owner is
-- seeded below and can add/remove other admin emails.
-- Run this in: Supabase Dashboard → SQL Editor (before schema.sql).
-- ============================================================

create table if not exists public.admin_users (
  email text primary key,
  id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Owner — the only email that starts with full rights.
insert into public.admin_users (email)
values ('odhiambogregory988@gmail.com')
on conflict (email) do nothing;

-- Secondary owner account used for admin sign-in (odhiambogregory985).
insert into public.admin_users (email)
values ('odhiambogregory985@gmail.com')
on conflict (email) do nothing;

-- First Google sign-in with the owner email auto-creates the admin account.
-- This lets the owner "sign up as admin with Google" without any setup.
create or replace function public.claim_owner()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
begin
  if current_user_id is null then return false; end if;
  select email into current_email from auth.users where id = current_user_id;
  if current_email is null then return false; end if;
  if lower(current_email) <> 'odhiambogregory988@gmail.com' then return false; end if;
  insert into public.admin_users (email, id)
  values (lower(current_email), current_user_id)
  on conflict (email) do update set id = excluded.id;
  return true;
end;
$$;

revoke all on function public.claim_owner() from public;
grant execute on function public.claim_owner() to authenticated;

alter table public.admin_users enable row level security;

-- New is_admin: an auth user is an admin when their email is on the roster.
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.admin_users a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = user_id
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- Admins can see the roster, add new admins, and remove non-owner admins.
grant select, insert, delete on public.admin_users to authenticated;

drop policy if exists "admins can view admin roster" on public.admin_users;
create policy "admins can view admin roster" on public.admin_users
  for select using (public.is_admin(auth.uid()));

drop policy if exists "admins can add admins" on public.admin_users;
create policy "admins can add admins" on public.admin_users
  for insert with check (public.is_admin(auth.uid()));

drop policy if exists "admins can remove admins" on public.admin_users;
create policy "admins can remove admins" on public.admin_users
  for delete using (
    public.is_admin(auth.uid())
    and email <> 'odhiambogregory988@gmail.com'
  );