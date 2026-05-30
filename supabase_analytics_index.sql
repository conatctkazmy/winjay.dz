create index if not exists analytics_events_funnel_idx
on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_user_session_idx
on public.analytics_events (user_id, session_id, created_at desc)
where user_id is not null;
