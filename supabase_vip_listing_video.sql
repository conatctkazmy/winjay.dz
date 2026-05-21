insert into storage.buckets (id, name, public)
values ('listing-videos', 'listing-videos', true)
on conflict (id) do update set public = true;

create or replace function public.is_vip()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce((select p.is_vip from public.profiles p where p.id = auth.uid()), false);
$$;

revoke all on function public.is_vip() from public;
grant execute on function public.is_vip() to authenticated;

create or replace function public.owns_listing(p_listing_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.listings l
    where l.id = p_listing_id
      and l.owner_id = auth.uid()
  );
$$;

revoke all on function public.owns_listing(bigint) from public;
grant execute on function public.owns_listing(bigint) to authenticated;

drop policy if exists vip_videos_insert on storage.objects;
drop policy if exists vip_videos_update on storage.objects;
drop policy if exists vip_videos_delete on storage.objects;

create policy vip_videos_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-videos'
  and public.is_vip()
  and split_part(name, '/', 1) = auth.uid()::text
  and public.owns_listing(
    case
      when split_part(name, '/', 2) ~ '^[0-9]+$' then split_part(name, '/', 2)::bigint
      else null
    end
  )
);

create policy vip_videos_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-videos'
  and public.is_vip()
  and split_part(name, '/', 1) = auth.uid()::text
  and public.owns_listing(
    case
      when split_part(name, '/', 2) ~ '^[0-9]+$' then split_part(name, '/', 2)::bigint
      else null
    end
  )
)
with check (
  bucket_id = 'listing-videos'
  and public.is_vip()
  and split_part(name, '/', 1) = auth.uid()::text
  and public.owns_listing(
    case
      when split_part(name, '/', 2) ~ '^[0-9]+$' then split_part(name, '/', 2)::bigint
      else null
    end
  )
);

create policy vip_videos_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-videos'
  and public.is_vip()
  and split_part(name, '/', 1) = auth.uid()::text
  and public.owns_listing(
    case
      when split_part(name, '/', 2) ~ '^[0-9]+$' then split_part(name, '/', 2)::bigint
      else null
    end
  )
);

create or replace function public.enforce_vip_video_details()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  vp text;
  vu text;
begin
  if auth.uid() is null then
    return new;
  end if;

  vp := coalesce(new.details->>'video_path', '');
  vu := coalesce(new.details->>'video_url', '');

  if (vp <> '' or vu <> '') and not (public.is_vip() or public.is_admin()) then
    raise exception 'VIP required for video';
  end if;

  return new;
end;
$$;

do $$
begin
  if to_regclass('public.listings') is null then
    return;
  end if;
  execute 'drop trigger if exists trg_enforce_vip_video_details on public.listings';
  execute 'create trigger trg_enforce_vip_video_details before insert or update on public.listings for each row execute function public.enforce_vip_video_details()';
end $$;
