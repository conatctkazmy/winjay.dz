create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  thumbnail_object_path text not null default '',
  vsl_object_path text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_owner_id_idx on public.courses (owner_id);
create index if not exists courses_published_idx on public.courses (is_published);

drop trigger if exists trg_courses_updated_at on public.courses;
create trigger trg_courses_updated_at
before update on public.courses
for each row execute procedure public.set_updated_at();

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_modules_course_id_idx on public.course_modules (course_id);

drop trigger if exists trg_course_modules_updated_at on public.course_modules;
create trigger trg_course_modules_updated_at
before update on public.course_modules
for each row execute procedure public.set_updated_at();

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  position int not null default 0,
  duration_seconds int not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_lessons_course_id_idx on public.course_lessons (course_id);
create index if not exists course_lessons_module_id_idx on public.course_lessons (module_id);

drop trigger if exists trg_course_lessons_updated_at on public.course_lessons;
create trigger trg_course_lessons_updated_at
before update on public.course_lessons
for each row execute procedure public.set_updated_at();

create table if not exists public.course_lesson_media (
  lesson_id uuid primary key references public.course_lessons(id) on delete cascade,
  video_bucket text not null default 'course-videos',
  video_object_path text not null,
  created_at timestamptz not null default now()
);

create type public.course_invite_status as enum ('pending', 'accepted', 'revoked');
create type public.course_enrollment_role as enum ('student', 'assistant');
create type public.course_achievement_code as enum ('first_lesson', 'quarter', 'half', 'complete');

create table if not exists public.course_invites (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  email text not null,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  status public.course_invite_status not null default 'pending',
  created_at timestamptz not null default now(),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz
);

create index if not exists course_invites_course_id_idx on public.course_invites (course_id);
create index if not exists course_invites_email_lower_idx on public.course_invites ((lower(email)));

create table if not exists public.course_enrollments (
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.course_enrollment_role not null default 'student',
  created_at timestamptz not null default now(),
  primary key (course_id, user_id)
);

create index if not exists course_enrollments_user_id_idx on public.course_enrollments (user_id);

create table if not exists public.course_lesson_progress (
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_position_seconds int not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (lesson_id, user_id)
);

create index if not exists course_lesson_progress_user_id_idx on public.course_lesson_progress (user_id);

create table if not exists public.course_achievements (
  code public.course_achievement_code primary key,
  title text not null,
  description text not null,
  icon text not null
);

insert into public.course_achievements (code, title, description, icon) values
  ('first_lesson', 'First Lesson', 'Completed your first lesson.', 'sparkles'),
  ('quarter', '25% Complete', 'Reached 25% completion.', 'trophy'),
  ('half', '50% Complete', 'Reached 50% completion.', 'trophy'),
  ('complete', 'Course Complete', 'Completed the whole course.', 'award')
on conflict (code) do nothing;

create table if not exists public.course_user_achievements (
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  code public.course_achievement_code not null references public.course_achievements(code) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (course_id, user_id, code)
);

alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_lesson_media enable row level security;
alter table public.course_invites enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.course_lesson_progress enable row level security;
alter table public.course_achievements enable row level security;
alter table public.course_user_achievements enable row level security;

drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses
for select
to authenticated
using (
  is_published
  or owner_id = auth.uid()
  or exists (
    select 1 from public.course_enrollments ce
    where ce.course_id = id and ce.user_id = auth.uid()
  )
);

drop policy if exists courses_insert on public.courses;
create policy courses_insert on public.courses
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists courses_update on public.courses;
create policy courses_update on public.courses
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists courses_delete on public.courses;
create policy courses_delete on public.courses
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists course_modules_select on public.course_modules;
create policy course_modules_select on public.course_modules
for select
to authenticated
using (
  exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  or exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid())
  or exists (select 1 from public.course_enrollments ce where ce.course_id = course_id and ce.user_id = auth.uid())
);

drop policy if exists course_modules_write on public.course_modules;
create policy course_modules_write on public.course_modules
for all
to authenticated
using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()))
with check (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));

drop policy if exists course_lessons_select on public.course_lessons;
create policy course_lessons_select on public.course_lessons
for select
to authenticated
using (
  exists (
    select 1 from public.courses c
    where c.id = course_id
      and (c.owner_id = auth.uid()
        or exists (select 1 from public.course_enrollments ce where ce.course_id = c.id and ce.user_id = auth.uid())
        or (c.is_published and is_preview)
      )
  )
);

drop policy if exists course_lessons_write on public.course_lessons;
create policy course_lessons_write on public.course_lessons
for all
to authenticated
using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()))
with check (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));

drop policy if exists course_lesson_media_select on public.course_lesson_media;
create policy course_lesson_media_select on public.course_lesson_media
for select
to authenticated
using (
  exists (
    select 1
    from public.course_lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id
      and (
        c.owner_id = auth.uid()
        or exists (select 1 from public.course_enrollments ce where ce.course_id = c.id and ce.user_id = auth.uid())
      )
  )
);

drop policy if exists course_lesson_media_write on public.course_lesson_media;
create policy course_lesson_media_write on public.course_lesson_media
for all
to authenticated
using (
  exists (
    select 1
    from public.course_lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id and c.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.course_lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id and c.owner_id = auth.uid()
  )
);

drop policy if exists course_invites_select on public.course_invites;
create policy course_invites_select on public.course_invites
for select
to authenticated
using (
  invited_by = auth.uid()
  or lower(email) = public.current_email()
);

drop policy if exists course_invites_write on public.course_invites;
create policy course_invites_write on public.course_invites
for all
to authenticated
using (
  exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid())
)
with check (
  exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid())
);

drop policy if exists course_enrollments_select on public.course_enrollments;
create policy course_enrollments_select on public.course_enrollments
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid())
);

drop policy if exists course_enrollments_owner_manage on public.course_enrollments;
create policy course_enrollments_owner_manage on public.course_enrollments
for all
to authenticated
using (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()))
with check (exists (select 1 from public.courses c where c.id = course_id and c.owner_id = auth.uid()));

drop policy if exists course_lesson_progress_select on public.course_lesson_progress;
create policy course_lesson_progress_select on public.course_lesson_progress
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.course_lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id and c.owner_id = auth.uid()
  )
);

drop policy if exists course_lesson_progress_write on public.course_lesson_progress;
create policy course_lesson_progress_write on public.course_lesson_progress
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists course_achievements_select on public.course_achievements;
create policy course_achievements_select on public.course_achievements
for select
to authenticated
using (true);

drop policy if exists course_user_achievements_select on public.course_user_achievements;
create policy course_user_achievements_select on public.course_user_achievements
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists course_user_achievements_write on public.course_user_achievements;
create policy course_user_achievements_write on public.course_user_achievements
for insert
to authenticated
with check (user_id = auth.uid());

create or replace function public.accept_course_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.course_invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_inv from public.course_invites where id = p_invite_id for update;
  if not found then
    raise exception 'Invite not found';
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'Invite not pending';
  end if;
  if lower(v_inv.email) <> public.current_email() then
    raise exception 'Email mismatch';
  end if;

  update public.course_invites
    set status = 'accepted',
        accepted_by = auth.uid(),
        accepted_at = now()
  where id = p_invite_id;

  insert into public.course_enrollments (course_id, user_id, role)
  values (v_inv.course_id, auth.uid(), 'student')
  on conflict do nothing;
end;
$$;

grant execute on function public.accept_course_invite(uuid) to authenticated;

create or replace function public.upsert_course_lesson_progress(
  p_lesson_id uuid,
  p_position_seconds int,
  p_duration_seconds int,
  p_mark_complete boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_id uuid;
  v_total int;
  v_completed int;
  v_percent int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select l.course_id into v_course_id
  from public.course_lessons l
  where l.id = p_lesson_id;

  if v_course_id is null then
    raise exception 'Lesson not found';
  end if;

  if not exists (select 1 from public.courses c where c.id = v_course_id and c.owner_id = auth.uid())
     and not exists (select 1 from public.course_enrollments ce where ce.course_id = v_course_id and ce.user_id = auth.uid())
  then
    raise exception 'No access';
  end if;

  insert into public.course_lesson_progress (lesson_id, user_id, last_position_seconds, completed, completed_at, updated_at)
  values (
    p_lesson_id,
    auth.uid(),
    greatest(0, coalesce(p_position_seconds, 0)),
    case
      when p_mark_complete then true
      when coalesce(p_duration_seconds, 0) > 0 and coalesce(p_position_seconds, 0) >= greatest(0, p_duration_seconds - 3) then true
      else false
    end,
    case
      when p_mark_complete then now()
      when coalesce(p_duration_seconds, 0) > 0 and coalesce(p_position_seconds, 0) >= greatest(0, p_duration_seconds - 3) then now()
      else null
    end,
    now()
  )
  on conflict (lesson_id, user_id) do update
    set last_position_seconds = greatest(excluded.last_position_seconds, public.course_lesson_progress.last_position_seconds),
        completed = public.course_lesson_progress.completed or excluded.completed,
        completed_at = case
          when public.course_lesson_progress.completed_at is not null then public.course_lesson_progress.completed_at
          when excluded.completed then now()
          else null
        end,
        updated_at = now();

  select count(*)::int into v_total from public.course_lessons where course_id = v_course_id;
  select count(*)::int into v_completed
    from public.course_lesson_progress p
    join public.course_lessons l on l.id = p.lesson_id
    where p.user_id = auth.uid() and p.completed and l.course_id = v_course_id;

  v_percent := case when v_total > 0 then floor((v_completed::numeric / v_total::numeric) * 100)::int else 0 end;

  if v_completed >= 1 then
    insert into public.course_user_achievements (course_id, user_id, code)
    values (v_course_id, auth.uid(), 'first_lesson')
    on conflict do nothing;
  end if;
  if v_percent >= 25 then
    insert into public.course_user_achievements (course_id, user_id, code)
    values (v_course_id, auth.uid(), 'quarter')
    on conflict do nothing;
  end if;
  if v_percent >= 50 then
    insert into public.course_user_achievements (course_id, user_id, code)
    values (v_course_id, auth.uid(), 'half')
    on conflict do nothing;
  end if;
  if v_percent >= 100 and v_total > 0 then
    insert into public.course_user_achievements (course_id, user_id, code)
    values (v_course_id, auth.uid(), 'complete')
    on conflict do nothing;
  end if;

  return json_build_object(
    'course_id', v_course_id,
    'total_lessons', v_total,
    'completed_lessons', v_completed,
    'percent', v_percent
  );
end;
$$;

grant execute on function public.upsert_course_lesson_progress(uuid, int, int, boolean) to authenticated;

insert into storage.buckets (id, name, public)
values ('course-public', 'course-public', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('course-videos', 'course-videos', false)
on conflict (id) do nothing;
