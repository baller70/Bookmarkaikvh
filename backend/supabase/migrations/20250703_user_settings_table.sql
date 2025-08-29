create table if not exists public.user_settings (
  user_id uuid not null references auth.users (id) on delete cascade,
  setting_key text not null,
  value jsonb not null,
  inserted_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, setting_key)
);

create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row
execute procedure public.set_updated_at(); 