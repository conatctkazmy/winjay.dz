alter table public.listings enable row level security;

grant select on public.listings to anon;
grant select, insert, update, delete on public.listings to authenticated;

drop policy if exists listings_public_read on public.listings;
create policy listings_public_read
on public.listings
for select
to anon, authenticated
using (
  deleted_at is null
  and status = 'active'
);

drop policy if exists listings_owner_or_admin_read on public.listings;
create policy listings_owner_or_admin_read
on public.listings
for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.is_admin, false) = true
  )
);

drop policy if exists listings_owner_or_admin_insert on public.listings;
create policy listings_owner_or_admin_insert
on public.listings
for insert
to authenticated
with check (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.is_admin, false) = true
  )
);

drop policy if exists listings_owner_or_admin_update on public.listings;
create policy listings_owner_or_admin_update
on public.listings
for update
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.is_admin, false) = true
  )
)
with check (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.is_admin, false) = true
  )
);

drop policy if exists listings_owner_or_admin_delete on public.listings;
create policy listings_owner_or_admin_delete
on public.listings
for delete
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.is_admin, false) = true
  )
);
