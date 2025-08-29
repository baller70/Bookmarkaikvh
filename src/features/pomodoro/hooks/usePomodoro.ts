'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PomodoroTimer,
  Task,
  TaskList,
  PomodoroSession,
  PomodoroAnalytics,
  PomodoroSettings,
  TimerState,
  TimerAction,
  SnoozeOption,
  WeeklyData,
  MonthlyData,
  ListCreationData
} from '../types';

// Default settings
const DEFAULT_SETTINGS: PomodoroSettings = {
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
  alarmVolume: 0.7
};

// Snooze options
const SNOOZE_OPTIONS: SnoozeOption[] = [
  { id: '1', label: '1 minute', duration: 1 },
  { id: '5', label: '5 minutes', duration: 5 },
  { id: '10', label: '10 minutes', duration: 10 },
  { id: '15', label: '15 minutes', duration: 15 }
];

export const usePomodoro = () => {
  const userId = 'dev-user-123'; // In production, this would come from auth context

  // State management
  const [timer, setTimer] = useState<PomodoroTimer>({
    id: '1',
    duration: 25,
    remainingTime: 25 * 60,
    isActive: false,
    isPaused: false,
    type: 'work',
    sessionCount: 0
  });

  const [currentTask, setCurrentTask] = useState<Task | undefined>();
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for timer functionality
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // API helper functions
  const loadPomodoroData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pomodoro?user_id=${userId}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setTasks(data.tasks || []);
        setTaskLists(data.taskLists || []);
        setSessions(data.sessions || []);
        setSettings(data.settings || DEFAULT_SETTINGS);
      } else {
        console.error('Failed to load pomodoro data:', result.error);
      }
    } catch (error) {
      console.error('Error loading pomodoro data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load data on mount
  useEffect(() => {
    loadPomodoroData();
  }, [loadPomodoroData]);

  // Timer control functions
  const startTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      startTime: new Date()
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isPaused: true
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isPaused: false
    }));
  }, []);

  const stopTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      remainingTime: prev.duration * 60,
      endTime: new Date()
    }));
    setSnoozeCount(0);
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      remainingTime: prev.duration * 60,
      isActive: false,
      isPaused: false,
      sessionCount: 0
    }));
    setSnoozeCount(0);
  }, []);

  const completeSession = useCallback(async () => {
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      taskId: currentTask?.id,
      taskTitle: currentTask?.title,
      startTime: timer.startTime || new Date(),
      endTime: new Date(),
      duration: timer.duration,
      type: timer.type,
      isCompleted: true,
      wasInterrupted: false,
      userId
    };

    // Save session to API
    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'session',
          action: 'create',
          data: newSession
        })
      });

      setSessions(prev => [newSession, ...prev]);
    } catch (error) {
      console.error('Error saving session:', error);
    }

    // Update task progress if there's a current task
    if (currentTask && timer.type === 'work') {
      const updatedTask = {
        ...currentTask,
        completedPomodoros: currentTask.completedPomodoros + 1
      };

      try {
        await fetch('/api/pomodoro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'task',
            action: 'update',
            data: updatedTask
          })
        });

        setTasks(prev => prev.map(task => 
          task.id === currentTask.id ? updatedTask : task
        ));
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }

    // Move to next session type
    const nextSessionCount = timer.sessionCount + 1;
    const isLongBreakTime = nextSessionCount % settings.longBreakInterval === 0;
    
    let nextType: 'work' | 'shortBreak' | 'longBreak' = 'work';
    let nextDuration = settings.workDuration;

    if (timer.type === 'work') {
      nextType = isLongBreakTime ? 'longBreak' : 'shortBreak';
      nextDuration = isLongBreakTime ? settings.longBreakDuration : settings.shortBreakDuration;
    } else {
      nextType = 'work';
      nextDuration = settings.workDuration;
    }

    setTimer(prev => ({
      ...prev,
      type: nextType,
      duration: nextDuration,
      remainingTime: nextDuration * 60,
      sessionCount: nextSessionCount,
      isActive: false,
      isPaused: false
    }));
  }, [currentTask, timer, settings, userId]);

  const snoozeTimer = useCallback((minutes: number) => {
    setTimer(prev => ({
      ...prev,
      remainingTime: prev.remainingTime + (minutes * 60),
      isPaused: false
    }));
    setSnoozeCount(prev => prev + 1);
  }, []);

  // Timer effect
  useEffect(() => {
    if (timer.isActive && !timer.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.remainingTime <= 1) {
            // Timer completed
            completeSession();
            return prev;
          }
          return {
            ...prev,
            remainingTime: prev.remainingTime - 1
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isActive, timer.isPaused, completeSession]);

  // Task management functions
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task',
          action: 'create',
          data: newTask
        })
      });

      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, [userId]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const updatedTask = { id: taskId, ...updates };

    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task',
          action: 'update',
          data: updatedTask
        })
      });

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task',
          action: 'delete',
          data: { id: taskId }
        })
      });

      setTasks(prev => prev.filter(task => task.id !== taskId));
      if (currentTask?.id === taskId) {
        setCurrentTask(undefined);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, [currentTask]);

  const selectTask = useCallback((task: Task) => {
    setCurrentTask(task);
  }, []);

  // Task list management
  const createList = useCallback(async (listData: ListCreationData) => {
    const newList: TaskList = {
      id: Date.now().toString(),
      name: listData.name,
      description: listData.description,
      color: listData.color,
      taskIds: listData.selectedTaskIds,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
      isActiveList: false,
      estimatedDuration: listData.selectedTaskIds.reduce((total, taskId) => {
        const task = tasks.find(t => t.id === taskId);
        return total + (task?.estimatedPomodoros || 0);
      }, 0),
      completedTasks: 0
    };

    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'taskList',
          action: 'create',
          data: newList
        })
      });

      setTaskLists(prev => [newList, ...prev]);
      return newList;
    } catch (error) {
      console.error('Error creating task list:', error);
      throw error;
    }
  }, [tasks, userId]);

  const updateList = useCallback(async (listId: string, updates: Partial<TaskList>) => {
    const updatedList = { id: listId, ...updates };

    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'taskList',
          action: 'update',
          data: updatedList
        })
      });

      setTaskLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...list, ...updates, updatedAt: new Date() }
          : list
      ));
    } catch (error) {
      console.error('Error updating task list:', error);
      throw error;
    }
  }, []);

  const deleteList = useCallback(async (listId: string) => {
    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'taskList',
          action: 'delete',
          data: { id: listId }
        })
      });

      setTaskLists(prev => prev.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Error deleting task list:', error);
      throw error;
    }
  }, []);

  const setActiveList = useCallback(async (listId: string) => {
    // Update all lists to set only the selected one as active
    const updatedLists = taskLists.map(list => ({
      ...list,
      isActiveList: list.id === listId
    }));

    try {
      // Update each list in the API
      await Promise.all(
        updatedLists.map(list =>
          fetch('/api/pomodoro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'taskList',
              action: 'update',
              data: list
            })
          })
        )
      );

      setTaskLists(updatedLists);
    } catch (error) {
      console.error('Error setting active list:', error);
      throw error;
    }
  }, [taskLists]);

  const getTasksForList = useCallback((listId: string): Task[] => {
    const list = taskLists.find(l => l.id === listId);
    if (!list) return [];
    return list.taskIds.map(taskId => tasks.find(t => t.id === taskId)).filter(Boolean) as Task[];
  }, [taskLists, tasks]);

  const getCurrentList = useCallback((): TaskList | undefined => {
    return taskLists.find(list => list.isActiveList);
  }, [taskLists]);

  // Settings management
  const updateSettings = useCallback(async (newSettings: Partial<PomodoroSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };

    try {
      await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'settings',
          action: 'update',
          data: updatedSettings
        })
      });

      setSettings(updatedSettings);
      
      // Update timer duration if not active
      if (!timer.isActive && newSettings.workDuration && timer.type === 'work') {
        setTimer(prev => ({
          ...prev,
          duration: newSettings.workDuration!,
          remainingTime: newSettings.workDuration! * 60
        }));
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }, [settings, timer.isActive, timer.type]);

  // Analytics functions
  const getAnalytics = useCallback((): PomodoroAnalytics => {
    const completedTasks = tasks.filter(task => task.isCompleted);
    const completedSessions = sessions.filter(s => s.isCompleted);
    const workSessions = completedSessions.filter(s => s.type === 'work');
    const totalFocusTime = workSessions.reduce((sum, session) => sum + session.duration, 0);

    // Calculate weekly data
    const weeklyData: WeeklyData[] = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + (i * 7)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekSessions = completedSessions.filter(session => 
        session.startTime >= weekStart && session.startTime <= weekEnd
      );
      
      weeklyData.push({
        week: `Week ${i + 1}`,
        sessions: weekSessions.length,
        focusTime: weekSessions.reduce((sum, session) => sum + session.duration, 0),
        tasksCompleted: completedTasks.filter(task => 
          task.completedAt && task.completedAt >= weekStart && task.completedAt <= weekEnd
        ).length
      });
    }

    // Calculate monthly data
    const monthlyData: MonthlyData[] = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const monthSessions = completedSessions.filter(session => 
        session.startTime >= monthStart && session.startTime <= monthEnd
      );
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        sessions: monthSessions.length,
        focusTime: monthSessions.reduce((sum, session) => sum + session.duration, 0),
        tasksCompleted: completedTasks.filter(task => 
          task.completedAt && task.completedAt >= monthStart && task.completedAt <= monthEnd
        ).length
      });
    }

    return {
      totalSessions: completedSessions.length,
      totalFocusTime,
      averageSessionLength: workSessions.length > 0 ? totalFocusTime / workSessions.length : 0,
      completedTasks: completedTasks.length,
      totalTasks: tasks.length,
      productivity: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      currentStreak: 0, // Could be calculated based on consecutive days with sessions
      weeklyData,
      monthlyData
    };
  }, [tasks, sessions]);

  return {
    timer,
    currentTask,
    tasks,
    taskLists,
    sessions,
    settings,
    snoozeCount,
    isLoading,
    snoozeOptions: SNOOZE_OPTIONS,
    
    // Timer controls
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    snoozeTimer,
    
    // Task management
    createTask,
    updateTask,
    deleteTask,
    selectTask,
    
    // List management
    createList,
    updateList,
    deleteList,
    setActiveList,
    getTasksForList,
    getCurrentList,
    
    // Settings
    updateSettings,
    
    // Analytics
    getAnalytics,
    
    // Data loading
    loadPomodoroData
  };
};

export default usePomodoro;