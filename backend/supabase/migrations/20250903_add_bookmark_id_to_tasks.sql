-- Add bookmark_id to user_tasks and user_pomodoro_sessions for per-bookmark scoping
-- Safe to run multiple times with IF NOT EXISTS patterns

begin;

-- Add column to user_tasks
alter table if exists public.user_tasks
  add column if not exists bookmark_id uuid references public.user_bookmarks(id) on delete cascade;

-- Index for user + bookmark filter patterns
create index if not exists user_tasks_user_bookmark_idx on public.user_tasks(user_id, bookmark_id);
create index if not exists user_tasks_bookmark_idx on public.user_tasks(bookmark_id);

-- Add column to user_pomodoro_sessions
alter table if exists public.user_pomodoro_sessions
  add column if not exists bookmark_id uuid references public.user_bookmarks(id) on delete cascade;

create index if not exists user_pomodoro_sessions_user_bookmark_idx on public.user_pomodoro_sessions(user_id, bookmark_id);
create index if not exists user_pomodoro_sessions_bookmark_idx on public.user_pomodoro_sessions(bookmark_id);

commit;