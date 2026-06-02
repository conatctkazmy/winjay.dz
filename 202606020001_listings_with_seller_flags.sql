create or replace view public.listings_with_seller_flags
as
select
  l.*,
  coalesce(p.is_vip, false) as seller_is_vip,
  coalesce(p.verified, false) as seller_verified
from public.listings l
left join public.profiles p
  on p.id = l.owner_id;

grant select on public.listings_with_seller_flags to anon, authenticated;

create index if not exists listings_owner_id_idx
on public.listings (owner_id);

create index if not exists profiles_id_is_vip_verified_idx
on public.profiles (id, is_vip, verified);

