create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.claim_admin_slot()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing boolean;
begin
  if current_user_id is null then return false; end if;
  select exists(select 1 from public.admin_users where id = current_user_id) into existing;
  if existing then return true; end if;
  if (select count(*) from public.admin_users) >= 2 then return false; end if;
  insert into public.admin_users (id, email)
  values (current_user_id, coalesce((select email from auth.users where id = current_user_id), ''))
  on conflict (id) do nothing;
  return exists(select 1 from public.admin_users where id = current_user_id);
end;
$$;

revoke all on function public.claim_admin_slot() from public;
grant execute on function public.claim_admin_slot() to authenticated;
grant select on public.admin_users to authenticated;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$ select exists(select 1 from public.admin_users where id = user_id); $$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;
create policy "admins can view admin roster" on public.admin_users for select using (public.is_admin(auth.uid()));
