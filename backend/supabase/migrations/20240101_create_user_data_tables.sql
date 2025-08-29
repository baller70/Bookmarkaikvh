-- Create user data storage tables
-- This migration creates tables for storing user-specific data that persists across sessions

-- User Documents table
create table if not exists public.user_documents (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null default 'Untitled Document',
    content jsonb not null default '[]'::jsonb,
    tags text[] default array[]::text[],
    is_public boolean default false,
    collaborators jsonb default '[]'::jsonb,
    versions jsonb default '[]'::jsonb,
    last_edited_by text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Media Files table
create table if not exists public.user_media_files (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    type text not null, -- 'image', 'video', 'document', 'logo'
    url text not null,
    size bigint not null,
    mime_type text not null,
    tags text[] default array[]::text[],
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Tasks table
create table if not exists public.user_tasks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    description text,
    priority text not null default 'medium', -- 'low', 'medium', 'high'
    category text not null default 'General',
    tags text[] default array[]::text[],
    is_completed boolean default false,
    estimated_pomodoros integer default 1,
    completed_pomodoros integer default 0,
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Task Lists table
create table if not exists public.user_task_lists (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    description text,
    color text not null default '#3B82F6',
    task_ids uuid[] default array[]::uuid[],
    is_archived boolean default false,
    is_active_list boolean default false,
    estimated_duration integer default 0,
    completed_tasks integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Comments table
create table if not exists public.user_comments (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    entity_type text not null, -- 'document', 'task', 'media', 'bookmark'
    entity_id text not null,
    parent_id uuid references public.user_comments(id) on delete cascade,
    content text not null,
    mentions text[] default array[]::text[],
    reactions jsonb default '{}'::jsonb,
    attachments jsonb default '[]'::jsonb,
    is_resolved boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Pomodoro Sessions table
create table if not exists public.user_pomodoro_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    task_id uuid references public.user_tasks(id) on delete set null,
    task_title text,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone,
    duration integer not null, -- in minutes
    type text not null default 'work', -- 'work', 'shortBreak', 'longBreak'
    is_completed boolean default false,
    was_interrupted boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Settings table
create table if not exists public.user_settings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    pomodoro_settings jsonb default '{
        "workDuration": 25,
        "shortBreakDuration": 5,
        "longBreakDuration": 15,
        "longBreakInterval": 4,
        "autoStartBreaks": false,
        "autoStartPomodoros": false,
        "soundEnabled": true,
        "notificationsEnabled": true,
        "theme": "light"
    }'::jsonb,
    notification_settings jsonb default '{
        "email": true,
        "push": true,
        "mentions": true,
        "comments": true,
        "tasks": true
    }'::jsonb,
    ui_preferences jsonb default '{
        "sidebarCollapsed": false,
        "defaultView": "dashboard",
        "theme": "light"
    }'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.user_documents enable row level security;
alter table public.user_media_files enable row level security;
alter table public.user_tasks enable row level security;
alter table public.user_task_lists enable row level security;
alter table public.user_comments enable row level security;
alter table public.user_pomodoro_sessions enable row level security;
alter table public.user_settings enable row level security;

-- Create RLS policies for user_documents
create policy "Users can view their own documents"
    on public.user_documents for select
    using (auth.uid() = user_id);

create policy "Users can insert their own documents"
    on public.user_documents for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own documents"
    on public.user_documents for update
    using (auth.uid() = user_id);

create policy "Users can delete their own documents"
    on public.user_documents for delete
    using (auth.uid() = user_id);

-- Create RLS policies for user_media_files
create policy "Users can view their own media files"
    on public.user_media_files for select
    using (auth.uid() = user_id);

create policy "Users can insert their own media files"
    on public.user_media_files for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own media files"
    on public.user_media_files for update
    using (auth.uid() = user_id);

create policy "Users can delete their own media files"
    on public.user_media_files for delete
    using (auth.uid() = user_id);

-- Create RLS policies for user_tasks
create policy "Users can view their own tasks"
    on public.user_tasks for select
    using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
    on public.user_tasks for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
    on public.user_tasks for update
    using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
    on public.user_tasks for delete
    using (auth.uid() = user_id);

-- Create RLS policies for user_task_lists
create policy "Users can view their own task lists"
    on public.user_task_lists for select
    using (auth.uid() = user_id);

create policy "Users can insert their own task lists"
    on public.user_task_lists for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own task lists"
    on public.user_task_lists for update
    using (auth.uid() = user_id);

create policy "Users can delete their own task lists"
    on public.user_task_lists for delete
    using (auth.uid() = user_id);

-- Create RLS policies for user_comments
create policy "Users can view their own comments"
    on public.user_comments for select
    using (auth.uid() = user_id);

create policy "Users can insert their own comments"
    on public.user_comments for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own comments"
    on public.user_comments for update
    using (auth.uid() = user_id);

create policy "Users can delete their own comments"
    on public.user_comments for delete
    using (auth.uid() = user_id);

-- Create RLS policies for user_pomodoro_sessions
create policy "Users can view their own pomodoro sessions"
    on public.user_pomodoro_sessions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own pomodoro sessions"
    on public.user_pomodoro_sessions for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own pomodoro sessions"
    on public.user_pomodoro_sessions for update
    using (auth.uid() = user_id);

create policy "Users can delete their own pomodoro sessions"
    on public.user_pomodoro_sessions for delete
    using (auth.uid() = user_id);

-- Create RLS policies for user_settings
create policy "Users can view their own settings"
    on public.user_settings for select
    using (auth.uid() = user_id);

create policy "Users can insert their own settings"
    on public.user_settings for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own settings"
    on public.user_settings for update
    using (auth.uid() = user_id);

-- Create updated_at triggers for all tables
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger handle_user_documents_updated_at
    before update on public.user_documents
    for each row
    execute function public.handle_updated_at();

create trigger handle_user_media_files_updated_at
    before update on public.user_media_files
    for each row
    execute function public.handle_updated_at();

create trigger handle_user_tasks_updated_at
    before update on public.user_tasks
    for each row
    execute function public.handle_updated_at();

create trigger handle_user_task_lists_updated_at
    before update on public.user_task_lists
    for each row
    execute function public.handle_updated_at();

create trigger handle_user_comments_updated_at
    before update on public.user_comments
    for each row
    execute function public.handle_updated_at();

create trigger handle_user_settings_updated_at
    before update on public.user_settings
    for each row
    execute function public.handle_updated_at();

-- Create indexes for better performance
create index if not exists user_documents_user_id_idx on public.user_documents(user_id);
create index if not exists user_documents_created_at_idx on public.user_documents(created_at desc);

create index if not exists user_media_files_user_id_idx on public.user_media_files(user_id);
create index if not exists user_media_files_type_idx on public.user_media_files(type);
create index if not exists user_media_files_created_at_idx on public.user_media_files(created_at desc);

create index if not exists user_tasks_user_id_idx on public.user_tasks(user_id);
create index if not exists user_tasks_is_completed_idx on public.user_tasks(is_completed);
create index if not exists user_tasks_created_at_idx on public.user_tasks(created_at desc);

create index if not exists user_task_lists_user_id_idx on public.user_task_lists(user_id);

create index if not exists user_comments_user_id_idx on public.user_comments(user_id);
create index if not exists user_comments_entity_idx on public.user_comments(entity_type, entity_id);
create index if not exists user_comments_parent_id_idx on public.user_comments(parent_id);

create index if not exists user_pomodoro_sessions_user_id_idx on public.user_pomodoro_sessions(user_id);
create index if not exists user_pomodoro_sessions_task_id_idx on public.user_pomodoro_sessions(task_id);
create index if not exists user_pomodoro_sessions_created_at_idx on public.user_pomodoro_sessions(created_at desc);

-- Create function to initialize user settings on user creation
create or replace function public.initialize_user_settings()
returns trigger as $$
begin
    insert into public.user_settings (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger to initialize user settings
create trigger on_auth_user_created_settings
    after insert on auth.users
    for each row
    execute function public.initialize_user_settings(); 