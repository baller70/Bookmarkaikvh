-- Create ai_settings table to store per-user AI tool preferences
create table if not exists ai_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Enable RLS (policies to be added separately via dashboard or migrations)
alter table ai_settings enable row level security; 