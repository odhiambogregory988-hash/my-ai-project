-- ============================================================
-- Orwa Sole Co. — seasonal brand collections
-- Run this once in: Supabase Dashboard → SQL Editor → New query
-- (Run supabase/admin_users.sql first — these policies use public.is_admin.)
--
-- One season is live at a time. The admin publishes a season from
-- /admin/season; the storefront home page renders the published one.
-- ============================================================

create table if not exists public.season_collections (
  id uuid primary key default gen_random_uuid(),
  -- Display name, e.g. "Spring 2026"
  season text not null,
  headline text not null default '',
  -- Campaign banner: a public URL, /public path, or an admin-uploaded data URL
  hero_image text not null default '',
  -- Curated pieces: [{ id, productId?, name, description, price, originalPrice,
  --                    badge, delivery, image, collection, category, inventory }]
  items jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only ever one live season — the storefront query assumes that.
create unique index if not exists season_collections_single_published
  on public.season_collections (published)
  where published;

create index if not exists season_collections_updated_at_idx
  on public.season_collections (updated_at desc);

-- ------------------------------------------------------------
-- Row level security
-- ------------------------------------------------------------
alter table public.season_collections enable row level security;

-- Customers (and logged-out visitors) may read the live season only.
-- Drafts stay private until the admin publishes them.
drop policy if exists "published seasons are public" on public.season_collections;
create policy "published seasons are public" on public.season_collections
  for select using (published);

-- Admins on the roster can read the whole archive.
drop policy if exists "admins read all seasons" on public.season_collections;
create policy "admins read all seasons" on public.season_collections
  for select using (public.is_admin(auth.uid()));

-- Admins write through the admin API, which uses the service role key and
-- bypasses RLS. These policies cover direct authenticated admin access.
drop policy if exists "admins insert seasons" on public.season_collections;
create policy "admins insert seasons" on public.season_collections
  for insert with check (public.is_admin(auth.uid()));

drop policy if exists "admins update seasons" on public.season_collections;
create policy "admins update seasons" on public.season_collections
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins delete seasons" on public.season_collections;
create policy "admins delete seasons" on public.season_collections
  for delete using (public.is_admin(auth.uid()));
