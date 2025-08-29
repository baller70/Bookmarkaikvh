-- Create oracle_settings table to store per-user Oracle preferences
create table if not exists oracle_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Enable RLS (policies to be added separately via dashboard or migrations)
alter table oracle_settings enable row level security; 