create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  user_id uuid null,
  anon_id text null,
  session_id text null,
  section text null,
  listing_id bigint null,
  category text null,
  wilaya text null,
  device jsonb null,
  meta jsonb null
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name);
create index if not exists analytics_events_listing_id_idx on public.analytics_events (listing_id);
create index if not exists analytics_events_user_id_idx on public.analytics_events (user_id);
create index if not exists analytics_events_anon_id_idx on public.analytics_events (anon_id);
create index if not exists analytics_events_session_id_idx on public.analytics_events (session_id);

alter table public.analytics_events enable row level security;

grant insert on public.analytics_events to anon;
grant insert on public.analytics_events to authenticated;

drop policy if exists "analytics_events_insert_anyone" on public.analytics_events;
create policy "analytics_events_insert_anyone"
on public.analytics_events
for insert
to anon, authenticated
with check (true);

create or replace function public.admin_funnel_metrics(days integer default 7)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  day_count int := greatest(1, least(90, coalesce(days, 7)));
  since_ts timestamptz := (now() at time zone 'utc') - make_interval(days => day_count);
  requester_email text;
  home_sessions bigint;
  detail_sessions bigint;
  contact_sessions bigint;
  chat_sessions bigint;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  requester_email := coalesce((select lower(email) from auth.users where id = auth.uid()), '');
  if not public.is_admin() and requester_email <> 'contactkazmy@gmail.com' then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select count(distinct session_id)
  into home_sessions
  from public.analytics_events
  where created_at >= since_ts and event_name = 'home_view';

  select count(distinct session_id)
  into detail_sessions
  from public.analytics_events
  where created_at >= since_ts and event_name = 'listing_open';

  select count(distinct session_id)
  into contact_sessions
  from public.analytics_events
  where created_at >= since_ts and event_name = 'contact_click';

  select count(distinct session_id)
  into chat_sessions
  from public.analytics_events
  where created_at >= since_ts and event_name = 'chat_start';

  return jsonb_build_object(
    'days', day_count,
    'since', to_char(since_ts, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'sessions', jsonb_build_object(
      'home', coalesce(home_sessions, 0),
      'detail', coalesce(detail_sessions, 0),
      'contact', coalesce(contact_sessions, 0),
      'chat', coalesce(chat_sessions, 0)
    ),
    'rates', jsonb_build_object(
      'home_to_detail', round(coalesce(detail_sessions, 0)::numeric / nullif(coalesce(home_sessions, 0), 0), 4),
      'detail_to_contact', round(coalesce(contact_sessions, 0)::numeric / nullif(coalesce(detail_sessions, 0), 0), 4),
      'contact_to_chat', round(coalesce(chat_sessions, 0)::numeric / nullif(coalesce(contact_sessions, 0), 0), 4),
      'home_to_chat', round(coalesce(chat_sessions, 0)::numeric / nullif(coalesce(home_sessions, 0), 0), 4)
    )
  );
end;
$$;

grant execute on function public.admin_funnel_metrics(integer) to authenticated;
