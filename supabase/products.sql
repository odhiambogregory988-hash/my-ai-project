-- ============================================================
-- Orwa Sole Co. — product catalog
-- Run this once in: Supabase Dashboard → SQL Editor → New query
-- (Run supabase/admin_users.sql first — the write policies use public.is_admin.)
--
-- Products live here so admin edits in /admin/products reach every customer.
-- The storefront reads this table directly (RLS allows public select); the
-- admin API writes with the service role key.
-- ============================================================

create table if not exists public.products (
  -- Also the public URL segment: /products/<id>
  id text primary key,
  name text not null,
  price numeric not null default 0,
  collection text not null default '',
  description text not null default '',
  -- Usually a /public path or an admin-uploaded data URL
  image text not null default '',
  category text not null default 'Clothing',
  inventory integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The storefront lists oldest-first so the curated order stays stable.
create index if not exists products_created_at_idx on public.products (created_at);

-- ------------------------------------------------------------
-- Row level security
-- ------------------------------------------------------------
alter table public.products enable row level security;

-- The catalog is public: customers and guests both browse it.
drop policy if exists "products are public" on public.products;
create policy "products are public" on public.products
  for select using (true);

-- Writes go through the admin API (service role bypasses RLS). These policies
-- cover direct authenticated admin access as a second layer, the same way
-- supabase/schema.sql does for orders.
drop policy if exists "admins insert products" on public.products;
create policy "admins insert products" on public.products
  for insert with check (public.is_admin(auth.uid()));

drop policy if exists "admins update products" on public.products;
create policy "admins update products" on public.products
  for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins delete products" on public.products;
create policy "admins delete products" on public.products
  for delete using (public.is_admin(auth.uid()));

-- ------------------------------------------------------------
-- Seed: the catalog the storefront shipped with in lib/store.ts
-- (DEFAULT_PRODUCTS). Re-running is safe — existing rows are left
-- alone, so your own prices and photos are never overwritten.
-- created_at is staggered so the list order is deterministic.
-- ------------------------------------------------------------
insert into public.products (id, name, price, collection, description, image, category, inventory, created_at)
values
  ('1', 'Clarks Desert Boot', 8500, 'Heritage', 'British heritage footwear — iconic since 1950', '/collections/clark.jpeg', 'Footwear', 15, now() - interval '6 minutes'),
  ('2', 'Nairobi Street Style', 3500, 'Street', 'Urban culture meets contemporary fashion', '/collections/wakadinali.jpeg', 'Clothing', 8, now() - interval '5 minutes'),
  ('3', 'Clarks Wallabee', 7200, 'Heritage', 'Timeless suede silhouette — street culture staple', '/collections/clark-2.jpeg', 'Footwear', 3, now() - interval '4 minutes'),
  ('4', 'Urban Essentials', 2800, 'Street', 'Everyday pieces for the modern wardrobe', '/collections/collection-1.jpeg', 'Clothing', 22, now() - interval '3 minutes'),
  ('5', 'Heritage Edit', 4500, 'Heritage', 'Classic styles reimagined for today', '/collections/collection-2.jpeg', 'Clothing', 2, now() - interval '2 minutes'),
  ('6', 'Archive Collection', 5500, 'Archive', 'Rare finds and vintage pieces', '/collections/collection-4.jpeg', 'Accessories', 6, now() - interval '1 minute')
on conflict (id) do nothing;
