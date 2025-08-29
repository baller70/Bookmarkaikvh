-- Generic settings store for small UI preferences (persist across devices)

create table if not exists public.settings_store (
  id uuid primary key default gen_random_uuid(),
  "table" text not null,
  title text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Ensure uniqueness per table+title so upserts work predictably
create unique index if not exists settings_store_table_title_idx
  on public.settings_store ("table", title);

-- Enable RLS but allow service role to bypass
alter table public.settings_store enable row level security;


