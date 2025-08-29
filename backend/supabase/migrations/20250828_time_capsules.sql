-- Time Capsule schema for schedule persistence

create table if not exists public.time_capsules (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default now() not null,
  type text default 'manual' check (type in ('manual','scheduled','auto')),
  status text default 'active' check (status in ('active','archived','scheduled')),
  size double precision default 0,
  bookmark_count integer default 0,
  folder_count integer default 0,
  tag_count integer default 0,
  ai_summary text
);

create table if not exists public.time_capsule_schedule (
  id uuid default gen_random_uuid() primary key,
  enabled boolean default true,
  frequency text default 'weekly' check (frequency in ('daily','weekly','monthly')),
  max_capsules integer default 10,
  auto_cleanup boolean default true,
  next_run timestamp with time zone default now()
);

-- RLS optional: allow read/write for authenticated
alter table public.time_capsules enable row level security;
alter table public.time_capsule_schedule enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'time_capsules' and policyname = 'allow all') then
    create policy "allow all" on public.time_capsules for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'time_capsule_schedule' and policyname = 'allow all') then
    create policy "allow all" on public.time_capsule_schedule for all using (true) with check (true);
  end if;
end $$;


