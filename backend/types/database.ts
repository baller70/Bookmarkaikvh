// Database types for user data persistence
// These types correspond to the database tables created in the migration

export interface UserDocument {
  id: string;
  user_id: string;
  title: string;
  content: any[]; // JSON content blocks
  tags: string[];
  is_public: boolean;
  collaborators: any[]; // JSON array of collaborator objects
  versions: any[]; // JSON array of version objects
  last_edited_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserMediaFile {
  id: string;
  user_id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'logo';
  url: string;
  size: number;
  mime_type: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  is_completed: boolean;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserTaskList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  task_ids: string[];
  is_archived: boolean;
  is_active_list: boolean;
  estimated_duration: number;
  completed_tasks: number;
  created_at: string;
  updated_at: string;
}

export interface UserComment {
  id: string;
  user_id: string;
  entity_type: 'document' | 'task' | 'media' | 'bookmark';
  entity_id: string;
  parent_id?: string;
  content: string;
  mentions: string[];
  reactions: Record<string, any>;
  attachments: any[];
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPomodoroSession {
  id: string;
  user_id: string;
  task_id?: string;
  task_title?: string;
  start_time: string;
  end_time?: string;
  duration: number; // in minutes
  type: 'work' | 'shortBreak' | 'longBreak';
  is_completed: boolean;
  was_interrupted: boolean;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  pomodoro_settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    theme: string;
  };
  notification_settings: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    comments: boolean;
    tasks: boolean;
  };
  ui_preferences: {
    sidebarCollapsed: boolean;
    defaultView: string;
    theme: string;
  };
  created_at: string;
  updated_at: string;
}

// Input types for creating/updating records
export interface CreateUserDocumentInput {
  title?: string;
  content?: any[];
  tags?: string[];
  is_public?: boolean;
  collaborators?: any[];
}

export interface UpdateUserDocumentInput {
  title?: string;
  content?: any[];
  tags?: string[];
  is_public?: boolean;
  collaborators?: any[];
  last_edited_by?: string;
}

export interface CreateUserMediaFileInput {
  name: string;
  type: 'image' | 'video' | 'document' | 'logo';
  url: string;
  size: number;
  mime_type: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreateUserTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  estimated_pomodoros?: number;
  due_date?: string;
}

export interface UpdateUserTaskInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  is_completed?: boolean;
  estimated_pomodoros?: number;
  completed_pomodoros?: number;
  due_date?: string;
  completed_at?: string;
}

export interface CreateUserCommentInput {
  entity_type: 'document' | 'task' | 'media' | 'bookmark';
  entity_id: string;
  parent_id?: string;
  content: string;
  mentions?: string[];
  attachments?: any[];
}

export interface CreateUserPomodoroSessionInput {
  task_id?: string;
  task_title?: string;
  start_time: string;
  end_time?: string;
  duration: number;
  type: 'work' | 'shortBreak' | 'longBreak';
  is_completed?: boolean;
  was_interrupted?: boolean;
}

// Response types for API endpoints
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
} 