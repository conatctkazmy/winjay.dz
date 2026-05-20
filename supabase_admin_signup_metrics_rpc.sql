create or replace function public.admin_signup_metrics(days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  day_count int := greatest(1, least(180, coalesce(days, 30)));
  start_date date := (now() at time zone 'utc')::date - (day_count - 1);
  total_users bigint;
  baseline bigint;
  series jsonb;
  requester_email text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  requester_email := coalesce((select lower(email) from auth.users where id = auth.uid()), '');
  if not public.is_admin() and requester_email <> 'contactkazmy@gmail.com' then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  select count(*) into total_users from auth.users;

  select count(*)
  into baseline
  from auth.users
  where (created_at at time zone 'utc')::date < start_date;

  with days_list as (
    select generate_series(start_date, start_date + (day_count - 1), interval '1 day')::date as d
  ),
  counts as (
    select (created_at at time zone 'utc')::date as d, count(*)::bigint as c
    from auth.users
    where (created_at at time zone 'utc')::date >= start_date
    group by 1
  ),
  merged as (
    select days_list.d, coalesce(counts.c, 0) as count
    from days_list
    left join counts using (d)
    order by days_list.d
  ),
  with_totals as (
    select
      d,
      count,
      baseline + sum(count) over (order by d rows between unbounded preceding and current row) as total
    from merged
  )
  select jsonb_agg(
    jsonb_build_object(
      'date', to_char(d, 'YYYY-MM-DD'),
      'count', count,
      'total', total
    )
    order by d
  )
  into series
  from with_totals;

  return jsonb_build_object(
    'total', total_users,
    'days', day_count,
    'baseline', baseline,
    'series', coalesce(series, '[]'::jsonb)
  );
end;
$$;

grant execute on function public.admin_signup_metrics(integer) to authenticated;

