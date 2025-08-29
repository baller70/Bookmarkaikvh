import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { authenticateUser } from '@/lib/auth-utils';

// File-based storage for pomodoro data
const POMODORO_FILE = join(process.cwd(), 'data', 'pomodoro.json');

interface PomodoroData {
  tasks: Task[];
  sessions: PomodoroSession[];
  settings: PomodoroSettings;
  taskLists: TaskList[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  isCompleted: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  userId: string;
}

interface PomodoroSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  type: 'work' | 'shortBreak' | 'longBreak';
  isCompleted: boolean;
  wasInterrupted: boolean;
  userId: string;
}

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  tickingSound: boolean;
  alarmSound: string;
  alarmVolume: number;
  userId: string;
}

interface TaskList {
  id: string;
  name: string;
  description?: string;
  color: string;
  taskIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isActiveList: boolean;
  estimatedDuration: number;
  completedTasks: number;
  userId: string;
}

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// Load pomodoro data from file
async function loadPomodoroData(): Promise<PomodoroData> {
  try {
    await ensureDataDirectory();
    if (!existsSync(POMODORO_FILE)) {
      const defaultData: PomodoroData = {
        tasks: [],
        sessions: [],
        settings: {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          longBreakInterval: 4,
          autoStartBreaks: true,
          autoStartWork: false,
          soundEnabled: true,
          notificationsEnabled: true,
          tickingSound: false,
          alarmSound: 'bell',
          alarmVolume: 0.7,
          userId: 'dev-user-fixed-id'
        },
        taskLists: []
      };
      await savePomodoroData(defaultData);
      return defaultData;
    }
    const data = await readFile(POMODORO_FILE, 'utf-8');
    return JSON.parse(data) as PomodoroData;
  } catch (error) {
    console.error('❌ Error loading pomodoro data:', error);
    return {
      tasks: [],
      sessions: [],
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreaks: true,
        autoStartWork: false,
        soundEnabled: true,
        notificationsEnabled: true,
        tickingSound: false,
        alarmSound: 'bell',
        alarmVolume: 0.7,
        userId: 'dev-user-fixed-id'
      },
      taskLists: []
    };
  }
}

// Save pomodoro data to file
async function savePomodoroData(data: PomodoroData): Promise<void> {
  try {
    await ensureDataDirectory();
    await writeFile(POMODORO_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error saving pomodoro data:', error);
    throw error;
  }
}

// GET /api/pomodoro - Get all pomodoro data for user
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }
    
    const userId = authResult.userId!;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // tasks, sessions, settings, lists

    const data = await loadPomodoroData();

    // Filter data by user
    const userData = {
      tasks: data.tasks.filter(task => task.userId === userId),
      sessions: data.sessions.filter(session => session.userId === userId),
      settings: data.settings.userId === userId ? data.settings : {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreaks: true,
        autoStartWork: false,
        soundEnabled: true,
        notificationsEnabled: true,
        tickingSound: false,
        alarmSound: 'bell',
        alarmVolume: 0.7,
        userId
      },
      taskLists: data.taskLists.filter(list => list.userId === userId)
    };

    // Return specific type if requested
    if (type) {
      return NextResponse.json({
        success: true,
        data: userData[type as keyof typeof userData] || null
      });
    }

    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('❌ Error fetching pomodoro data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pomodoro - Create or update pomodoro data
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }
    
    const userId = authResult.userId!;
    const body = await request.json();
    const { type, action, data: itemData } = body;

    const data = await loadPomodoroData();

    switch (type) {
      case 'task':
        if (action === 'create') {
          const newTask: Task = {
            ...itemData,
            id: Date.now().toString(),
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          data.tasks.push(newTask);
        } else if (action === 'update') {
          const taskIndex = data.tasks.findIndex(task => task.id === itemData.id && task.userId === userId);
          if (taskIndex !== -1) {
            data.tasks[taskIndex] = {
              ...data.tasks[taskIndex],
              ...itemData,
              updatedAt: new Date()
            };
          }
        } else if (action === 'delete') {
          data.tasks = data.tasks.filter(task => !(task.id === itemData.id && task.userId === userId));
        }
        break;

      case 'session':
        if (action === 'create') {
          const newSession: PomodoroSession = {
            ...itemData,
            id: Date.now().toString(),
            userId,
            startTime: new Date(itemData.startTime),
            endTime: new Date(itemData.endTime)
          };
          data.sessions.push(newSession);
        }
        break;

      case 'settings':
        if (action === 'update') {
          data.settings = {
            ...data.settings,
            ...itemData,
            userId
          };
        }
        break;

      case 'taskList':
        if (action === 'create') {
          const newTaskList: TaskList = {
            ...itemData,
            id: Date.now().toString(),
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          data.taskLists.push(newTaskList);
        } else if (action === 'update') {
          const listIndex = data.taskLists.findIndex(list => list.id === itemData.id && list.userId === userId);
          if (listIndex !== -1) {
            data.taskLists[listIndex] = {
              ...data.taskLists[listIndex],
              ...itemData,
              updatedAt: new Date()
            };
          }
        } else if (action === 'delete') {
          data.taskLists = data.taskLists.filter(list => !(list.id === itemData.id && list.userId === userId));
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type specified' },
          { status: 400 }
        );
    }

    await savePomodoroData(data);

    return NextResponse.json({
      success: true,
      message: `${type} ${action}d successfully`
    });

  } catch (error) {
    console.error('❌ Error updating pomodoro data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}                