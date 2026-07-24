alter table public.submissions enable row level security;

grant select, insert, update on public.submissions to authenticated;
grant select on public.submissions to anon;

drop policy if exists submissions_insert_any on public.submissions;
create policy submissions_insert_any
on public.submissions
for insert
to anon, authenticated
with check (
  type in ('contact', 'live_checkout')
  or (
    type in ('live_session', 'live_message')
    and auth.uid() is not null
    and user_id = auth.uid()
  )
);

drop policy if exists submissions_live_owner_update on public.submissions;
create policy submissions_live_owner_update
on public.submissions
for update
to authenticated
using (
  (
    type = 'live_session'
    and user_id = auth.uid()
  )
  or public.is_admin()
)
with check (
  (
    type = 'live_session'
    and user_id = auth.uid()
  )
  or public.is_admin()
);

update public.submissions s
set user_id = p.id
from public.profiles p
where s.type = 'live_session'
  and s.user_id is null
  and coalesce(lower(s.payload->>'seller_tag'), '') <> ''
  and lower(s.payload->>'seller_tag') = lower(coalesce(p.tag, ''));
