create or replace function public.enforce_listing_active_has_photo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if coalesce(new.status, '') = 'active' then
      raise exception 'Listing must have at least 1 photo';
    end if;
    return new;
  end if;

  if coalesce(new.status, '') = 'active' then
    if not exists (
      select 1
      from public.listing_images li
      where li.listing_id = new.id
      limit 1
    ) then
      raise exception 'Listing must have at least 1 photo';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_listing_active_has_photo on public.listings;

create trigger trg_enforce_listing_active_has_photo
before insert or update on public.listings
for each row
execute function public.enforce_listing_active_has_photo();

create or replace function public.listing_images_keep_listing_in_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.listing_images li
    where li.listing_id = old.listing_id
    limit 1
  ) then
    update public.listings
    set status = 'draft'
    where id = old.listing_id
      and status = 'active';
  end if;
  return old;
end;
$$;

drop trigger if exists trg_listing_images_keep_listing_in_sync on public.listing_images;

create trigger trg_listing_images_keep_listing_in_sync
after delete on public.listing_images
for each row
execute function public.listing_images_keep_listing_in_sync();
