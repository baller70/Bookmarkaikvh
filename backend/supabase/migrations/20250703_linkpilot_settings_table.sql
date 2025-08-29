create table if not exists public.linkpilot_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  auto_processing jsonb not null default '{}',
  inserted_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger trg_linkpilot_settings_updated_at
before update on public.linkpilot_settings
for each row
execute procedure public.set_updated_at(); 