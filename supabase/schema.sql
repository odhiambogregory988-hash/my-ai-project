-- ============================================================
-- Orwa Sole Co. — Supabase schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query
-- (Requires supabase/admin_users.sql to have been run first,
--  or run both files in order.)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Profiles (one row per auth user)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  address text not null default '',
  avatar_url text not null default '',
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds the column if an older schema is already applied.
alter table public.profiles add column if not exists avatar_url text not null default '';

-- Auto-create a profile when someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 2. Orders
-- ------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'Processing',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. Row level security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- Customers manage their own profile
drop policy if exists "own profile select" on public.profiles;
create policy "own profile select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles
  for insert with check (auth.uid() = id);

-- Customers see and create their own orders
drop policy if exists "own orders select" on public.orders;
create policy "own orders select" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "own orders insert" on public.orders;
create policy "own orders insert" on public.orders
  for insert with check (auth.uid() = user_id);

-- Admins (from admin_users table) can manage everything through the
-- admin API which uses the service role key (bypasses RLS entirely).
-- These policies are a second layer for future server-less admin access.
drop policy if exists "admins read all orders" on public.orders;
create policy "admins read all orders" on public.orders
  for select using (public.is_admin(auth.uid()));

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders
  for update using (public.is_admin(auth.uid()));

drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders" on public.orders
  for delete using (public.is_admin(auth.uid()));

drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles
  for select using (public.is_admin(auth.uid()));

-- ------------------------------------------------------------
-- 4. Public order tracking (no login required)
--    Returns a minimal summary by order number via a secure
--    function, so we never expose raw table access to guests.
-- ------------------------------------------------------------
create or replace function public.track_order(p_order_no text)
returns table (
  order_no text,
  customer_name text,
  status text,
  created_at timestamptz,
  items jsonb,
  subtotal numeric,
  delivery_fee numeric,
  total numeric
)
language sql
security definer
set search_path = public
stable
as $$
  select order_no, customer_name, status, created_at, items, subtotal, delivery_fee, total
  from public.orders
  where order_no = p_order_no;
$$;

revoke all on function public.track_order(text) from public;
grant execute on function public.track_order(text) to anon, authenticated;

-- Admin-only customer list (joins auth users for the email). Returns
-- nothing when the caller is not on the admin roster.
create or replace function public.get_customers()
returns table (
  id uuid,
  email text,
  name text,
  address text,
  avatar_url text,
  provider text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    u.email,
    p.name,
    p.address,
    p.avatar_url,
    u.raw_app_meta_data->>'provider',
    p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin(auth.uid())
  order by p.created_at desc;
$$;

revoke all on function public.get_customers() from public;
grant execute on function public.get_customers() to authenticated;

-- ------------------------------------------------------------
-- 4c. Profile photos (Supabase Storage bucket)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars authenticated upload" on storage.objects;
create policy "avatars authenticated upload" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "avatars own update" on storage.objects;
create policy "avatars own update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid() = owner);

drop policy if exists "avatars own delete" on storage.objects;
create policy "avatars own delete" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid() = owner);

-- Useful index for order lookups
create index if not exists orders_order_no_idx on public.orders (order_no);
create index if not exists orders_user_id_idx on public.orders (user_id);

-- ------------------------------------------------------------
-- 4b. Backfill: copy the name customers signed in with into
--     profiles where it's still empty (older signups).
-- ------------------------------------------------------------
update public.profiles p
set name = coalesce(
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'name',
  ''
)
from auth.users u
where p.id = u.id
  and p.name = '';