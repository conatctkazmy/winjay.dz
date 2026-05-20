create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.prevent_profile_vip_verified_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    if (new.is_vip is distinct from old.is_vip) or (new.verified is distinct from old.verified) then
      raise exception 'not authorized';
    end if;
  end if;
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.profiles') is null then
    return;
  end if;
  execute 'drop trigger if exists trg_prevent_profile_vip_verified_escalation on public.profiles';
  execute 'create trigger trg_prevent_profile_vip_verified_escalation before update on public.profiles for each row execute function public.prevent_profile_vip_verified_escalation()';
end $$;

do $$
declare r record;
begin
  if to_regclass('public.notifications') is null then
    return;
  end if;
  execute 'alter table public.notifications enable row level security';
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'notifications' loop
    execute format('drop policy if exists %I on public.notifications', r.policyname);
  end loop;
  execute 'create policy notifications_select_own on public.notifications for select to authenticated using (recipient_id = auth.uid())';
  execute 'create policy notifications_update_own on public.notifications for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid())';
end $$;

create or replace function public.notify_message_received(receiver_id uuid, meta jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if receiver_id is null or receiver_id = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, target_profile_id, meta)
  values (receiver_id, auth.uid(), 'message_received', receiver_id, coalesce(meta, '{}'::jsonb));
end;
$$;

create or replace function public.notify_profile_review(target_profile_id uuid, rating int default null)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if target_profile_id is null or target_profile_id = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, target_profile_id, meta)
  values (target_profile_id, auth.uid(), 'profile_review', target_profile_id, jsonb_build_object('rating', rating));
end;
$$;

create or replace function public.notify_profile_share(target_profile_id uuid, platform text default null)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if target_profile_id is null or target_profile_id = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, target_profile_id, meta)
  values (target_profile_id, auth.uid(), 'profile_share', target_profile_id, jsonb_build_object('platform', platform));
end;
$$;

create or replace function public.notify_profile_review_comment(review_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_recipient uuid;
  v_target uuid;
begin
  if review_id is null then
    return;
  end if;
  select pr.author_id, coalesce(pr.target_profile_id, pr.profile_id)
  into v_recipient, v_target
  from public.profile_reviews pr
  where pr.id = review_id;
  if v_recipient is null or v_recipient = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, target_profile_id, meta)
  values (v_recipient, auth.uid(), 'profile_review_comment', v_target, jsonb_build_object('reviewId', review_id));
end;
$$;

create or replace function public.notify_profile_review_reply(review_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_recipient uuid;
  v_target uuid;
begin
  if review_id is null then
    return;
  end if;
  select pr.author_id, coalesce(pr.target_profile_id, pr.profile_id)
  into v_recipient, v_target
  from public.profile_reviews pr
  where pr.id = review_id;
  if v_recipient is null or v_recipient = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, target_profile_id, meta)
  values (v_recipient, auth.uid(), 'profile_review_reply', v_target, jsonb_build_object('reviewId', review_id));
end;
$$;

create or replace function public.notify_listing_like(listing_id bigint)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_owner uuid;
begin
  if listing_id is null then
    return;
  end if;
  select l.owner_id into v_owner
  from public.listings l
  where l.id = listing_id;
  if v_owner is null or v_owner = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, listing_id, meta)
  values (v_owner, auth.uid(), 'listing_like', listing_id, '{}'::jsonb);
end;
$$;

create or replace function public.notify_listing_share(listing_id bigint, platform text default null)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_owner uuid;
begin
  if listing_id is null then
    return;
  end if;
  select l.owner_id into v_owner
  from public.listings l
  where l.id = listing_id;
  if v_owner is null or v_owner = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, listing_id, meta)
  values (v_owner, auth.uid(), 'listing_share', listing_id, jsonb_build_object('platform', platform));
end;
$$;

create or replace function public.notify_listing_review(listing_id bigint, rating int default null)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_owner uuid;
begin
  if listing_id is null then
    return;
  end if;
  select l.owner_id into v_owner
  from public.listings l
  where l.id = listing_id;
  if v_owner is null or v_owner = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, listing_id, meta)
  values (v_owner, auth.uid(), 'listing_review', listing_id, jsonb_build_object('rating', rating));
end;
$$;

create or replace function public.notify_listing_review_comment(review_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_recipient uuid;
  v_listing_id bigint;
begin
  if review_id is null then
    return;
  end if;
  select lr.author_id, lr.listing_id
  into v_recipient, v_listing_id
  from public.listing_reviews lr
  where lr.id = review_id;
  if v_recipient is null or v_recipient = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, listing_id, meta)
  values (v_recipient, auth.uid(), 'listing_review_comment', v_listing_id, jsonb_build_object('reviewId', review_id));
end;
$$;

create or replace function public.notify_listing_review_reply(review_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_recipient uuid;
  v_listing_id bigint;
begin
  if review_id is null then
    return;
  end if;
  select lr.author_id, lr.listing_id
  into v_recipient, v_listing_id
  from public.listing_reviews lr
  where lr.id = review_id;
  if v_recipient is null or v_recipient = auth.uid() then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, listing_id, meta)
  values (v_recipient, auth.uid(), 'listing_review_reply', v_listing_id, jsonb_build_object('reviewId', review_id));
end;
$$;

create or replace function public.notify_listing_view_milestone(listing_id bigint, milestone int default null, views int default null)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_owner uuid;
begin
  if listing_id is null then
    return;
  end if;
  select l.owner_id into v_owner
  from public.listings l
  where l.id = listing_id;
  if v_owner is null then
    return;
  end if;
  insert into public.notifications (recipient_id, actor_id, type, listing_id, meta)
  values (v_owner, null, 'listing_view_milestone', listing_id, jsonb_build_object('milestone', milestone, 'views', views));
end;
$$;

revoke all on function public.notify_message_received(uuid, jsonb) from public;
revoke all on function public.notify_profile_review(uuid, int) from public;
revoke all on function public.notify_profile_share(uuid, text) from public;
revoke all on function public.notify_profile_review_comment(uuid) from public;
revoke all on function public.notify_profile_review_reply(uuid) from public;
revoke all on function public.notify_listing_like(bigint) from public;
revoke all on function public.notify_listing_share(bigint, text) from public;
revoke all on function public.notify_listing_review(bigint, int) from public;
revoke all on function public.notify_listing_review_comment(uuid) from public;
revoke all on function public.notify_listing_review_reply(uuid) from public;
revoke all on function public.notify_listing_view_milestone(bigint, int, int) from public;

grant execute on function public.notify_message_received(uuid, jsonb) to authenticated;
grant execute on function public.notify_profile_review(uuid, int) to authenticated;
grant execute on function public.notify_profile_share(uuid, text) to authenticated;
grant execute on function public.notify_profile_review_comment(uuid) to authenticated;
grant execute on function public.notify_profile_review_reply(uuid) to authenticated;
grant execute on function public.notify_listing_like(bigint) to authenticated;
grant execute on function public.notify_listing_share(bigint, text) to authenticated;
grant execute on function public.notify_listing_review(bigint, int) to authenticated;
grant execute on function public.notify_listing_review_comment(uuid) to authenticated;
grant execute on function public.notify_listing_review_reply(uuid) to authenticated;
grant execute on function public.notify_listing_view_milestone(bigint, int, int) to authenticated;

create or replace function public.admin_set_vip(target_user_id uuid, next boolean)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  update public.profiles
  set is_vip = coalesce(next, false)
  where id = target_user_id;
  begin
    insert into public.admin_audit_log (admin_id, action, target_user_id, meta)
    values (auth.uid(), 'vip_set', target_user_id, jsonb_build_object('is_vip', coalesce(next, false)));
  exception when undefined_table then
    null;
  end;
end;
$$;

create or replace function public.admin_set_verified(target_user_id uuid, next boolean)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  update public.profiles
  set verified = coalesce(next, false)
  where id = target_user_id;
  begin
    insert into public.admin_audit_log (admin_id, action, target_user_id, meta)
    values (auth.uid(), 'verified_set', target_user_id, jsonb_build_object('verified', coalesce(next, false)));
  exception when undefined_table then
    null;
  end;
end;
$$;

create or replace function public.admin_approve_vip(app_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  select user_id into v_user_id from public.vip_applications where id = app_id;
  if v_user_id is null then
    raise exception 'application not found';
  end if;
  update public.vip_applications
  set status = 'approved',
      decided_by = auth.uid(),
      decided_at = now()
  where id = app_id;
  update public.profiles set is_vip = true where id = v_user_id;
  begin
    insert into public.admin_audit_log (admin_id, action, target_user_id, meta)
    values (auth.uid(), 'vip_approved', v_user_id, jsonb_build_object('app_id', app_id));
  exception when undefined_table then
    null;
  end;
end;
$$;

create or replace function public.admin_reject_vip(app_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  select user_id into v_user_id from public.vip_applications where id = app_id;
  if v_user_id is null then
    raise exception 'application not found';
  end if;
  update public.vip_applications
  set status = 'rejected',
      decided_by = auth.uid(),
      decided_at = now()
  where id = app_id;
  begin
    insert into public.admin_audit_log (admin_id, action, target_user_id, meta)
    values (auth.uid(), 'vip_rejected', v_user_id, jsonb_build_object('app_id', app_id));
  exception when undefined_table then
    null;
  end;
end;
$$;

create or replace function public.admin_approve_verified(app_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  select user_id into v_user_id from public.verified_applications where id = app_id;
  if v_user_id is null then
    raise exception 'application not found';
  end if;
  update public.verified_applications
  set status = 'approved',
      decided_by = auth.uid(),
      decided_at = now()
  where id = app_id;
  update public.profiles set verified = true where id = v_user_id;
  begin
    insert into public.admin_audit_log (admin_id, action, target_user_id, meta)
    values (auth.uid(), 'verified_approved', v_user_id, jsonb_build_object('app_id', app_id));
  exception when undefined_table then
    null;
  end;
end;
$$;

create or replace function public.admin_reject_verified(app_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  select user_id into v_user_id from public.verified_applications where id = app_id;
  if v_user_id is null then
    raise exception 'application not found';
  end if;
  update public.verified_applications
  set status = 'rejected',
      decided_by = auth.uid(),
      decided_at = now()
  where id = app_id;
  begin
    insert into public.admin_audit_log (admin_id, action, target_user_id, meta)
    values (auth.uid(), 'verified_rejected', v_user_id, jsonb_build_object('app_id', app_id));
  exception when undefined_table then
    null;
  end;
end;
$$;

create or replace function public.admin_approve_identity(app_id uuid, referrals_required int default 10)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_refs int := 0;
  v_has_basics boolean := false;
  v_has_phone boolean := false;
  v_has_work boolean := false;
  v_has_refs boolean := false;
  v_eligible boolean := false;
  v_granted boolean := false;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  select user_id into v_user_id from public.identity_applications where id = app_id;
  if v_user_id is null then
    raise exception 'application not found';
  end if;
  update public.identity_applications
  set status = 'approved',
      decided_by = auth.uid(),
      decided_at = now()
  where id = app_id;
  insert into public.notifications (recipient_id, actor_id, type, meta)
  values (v_user_id, null, 'identity_approved', jsonb_build_object('app_id', app_id));

  select
    (coalesce(nullif(trim(p.display_name), ''), '') <> '') and (coalesce(nullif(trim(p.tag), ''), '') <> ''),
    (coalesce(nullif(trim(p.phone), ''), '') <> ''),
    (coalesce(nullif(trim(p.work_category), ''), '') <> '')
  into v_has_basics, v_has_phone, v_has_work
  from public.profiles p
  where p.id = v_user_id;

  select count(*)::int into v_refs
  from public.referrals r
  where r.referrer_id = v_user_id;

  v_has_refs := v_refs >= coalesce(referrals_required, 10);
  v_eligible := v_has_basics and v_has_phone and v_has_work and v_has_refs;

  if v_eligible then
    update public.profiles set verified = true where id = v_user_id;
    insert into public.notifications (recipient_id, actor_id, type, meta)
    values (v_user_id, null, 'verified_granted', jsonb_build_object('source', 'free_verified_quest'));
    v_granted := true;
  end if;

  begin
    insert into public.admin_audit_log (admin_id, action, target_user_id, meta)
    values (
      auth.uid(),
      'identity_approved',
      v_user_id,
      jsonb_build_object(
        'app_id', app_id,
        'granted_verified', v_granted,
        'eligibility', jsonb_build_object(
          'eligible', v_eligible,
          'refs', v_refs,
          'hasBasics', v_has_basics,
          'hasPhone', v_has_phone,
          'hasWork', v_has_work,
          'hasRefs', v_has_refs
        )
      )
    );
  exception when undefined_table then
    null;
  end;

  return jsonb_build_object(
    'granted_verified', v_granted,
    'eligible', v_eligible,
    'refs', v_refs,
    'hasBasics', v_has_basics,
    'hasPhone', v_has_phone,
    'hasWork', v_has_work,
    'hasRefs', v_has_refs
  );
end;
$$;

create or replace function public.admin_reject_identity(app_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  select user_id into v_user_id from public.identity_applications where id = app_id;
  if v_user_id is null then
    raise exception 'application not found';
  end if;
  update public.identity_applications
  set status = 'rejected',
      decided_by = auth.uid(),
      decided_at = now()
  where id = app_id;
  insert into public.notifications (recipient_id, actor_id, type, meta)
  values (v_user_id, null, 'identity_rejected', jsonb_build_object('app_id', app_id));
  begin
    insert into public.admin_audit_log (admin_id, action, target_user_id, meta)
    values (auth.uid(), 'identity_rejected', v_user_id, jsonb_build_object('app_id', app_id));
  exception when undefined_table then
    null;
  end;
end;
$$;

revoke all on function public.admin_set_vip(uuid, boolean) from public;
revoke all on function public.admin_set_verified(uuid, boolean) from public;
revoke all on function public.admin_approve_vip(uuid) from public;
revoke all on function public.admin_reject_vip(uuid) from public;
revoke all on function public.admin_approve_verified(uuid) from public;
revoke all on function public.admin_reject_verified(uuid) from public;
revoke all on function public.admin_approve_identity(uuid, int) from public;
revoke all on function public.admin_reject_identity(uuid) from public;

grant execute on function public.admin_set_vip(uuid, boolean) to authenticated;
grant execute on function public.admin_set_verified(uuid, boolean) to authenticated;
grant execute on function public.admin_approve_vip(uuid) to authenticated;
grant execute on function public.admin_reject_vip(uuid) to authenticated;
grant execute on function public.admin_approve_verified(uuid) to authenticated;
grant execute on function public.admin_reject_verified(uuid) to authenticated;
grant execute on function public.admin_approve_identity(uuid, int) to authenticated;
grant execute on function public.admin_reject_identity(uuid) to authenticated;

do $$
declare
  t text;
  r record;
begin
  foreach t in array array['vip_applications', 'verified_applications', 'identity_applications', 'admin_audit_log', 'submissions'] loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    execute format('alter table public.%I enable row level security', t);
    for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy if exists %I on public.%I', r.policyname, t);
    end loop;
  end loop;

  if to_regclass('public.vip_applications') is not null then
    execute 'create policy vip_apps_insert_own on public.vip_applications for insert to authenticated with check (user_id = auth.uid())';
    execute 'create policy vip_apps_select_own on public.vip_applications for select to authenticated using (user_id = auth.uid())';
    execute 'create policy vip_apps_admin_all on public.vip_applications for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;

  if to_regclass('public.verified_applications') is not null then
    execute 'create policy verified_apps_insert_own on public.verified_applications for insert to authenticated with check (user_id = auth.uid())';
    execute 'create policy verified_apps_select_own on public.verified_applications for select to authenticated using (user_id = auth.uid())';
    execute 'create policy verified_apps_admin_all on public.verified_applications for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;

  if to_regclass('public.identity_applications') is not null then
    execute 'create policy identity_apps_insert_own on public.identity_applications for insert to authenticated with check (user_id = auth.uid())';
    execute 'create policy identity_apps_select_own on public.identity_applications for select to authenticated using (user_id = auth.uid())';
    execute 'create policy identity_apps_admin_all on public.identity_applications for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;

  if to_regclass('public.admin_audit_log') is not null then
    execute 'create policy audit_admin_select on public.admin_audit_log for select to authenticated using (public.is_admin())';
    execute 'create policy audit_admin_insert on public.admin_audit_log for insert to authenticated with check (public.is_admin())';
  end if;

  if to_regclass('public.submissions') is not null then
    execute 'create policy submissions_insert_any on public.submissions for insert to anon, authenticated with check (true)';
    execute 'create policy submissions_admin_select on public.submissions for select to authenticated using (public.is_admin())';
  end if;
end $$;
