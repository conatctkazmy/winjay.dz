create or replace view public.listings_with_seller_flags
as
select
  l.*,
  coalesce(p.is_vip, false) as seller_is_vip,
  coalesce(p.verified, false) as seller_verified
from public.listings l
left join public.profiles p
  on p.id = l.owner_id
where l.deleted_at is null;
