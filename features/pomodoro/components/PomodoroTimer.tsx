'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  SkipForward,
  Coffee,
  Zap,
  Clock,
  Target,
  CheckCircle2
} from 'lucide-react';
import { Task } from '../types';

interface PomodoroTimerProps {
  timer: any;
  currentTask?: Task;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  skipBreak: () => void;
  snoozeTimer: (duration: number) => void;
  canSnooze: boolean;
  snoozeCount: number;
  maxSnoozeCount: number;
  snoozeOptions: any[];
  tasks: Task[];
  selectTask: (task: Task) => void;
}

export default function PomodoroTimer({
  timer,
  currentTask,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  resetTimer,
  skipBreak,
  snoozeTimer,
  canSnooze,
  snoozeCount,
  maxSnoozeCount,
  snoozeOptions,
  tasks,
  selectTask
}: PomodoroTimerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = timer.duration * 60;
    const elapsed = totalTime - timer.remainingTime;
    return (elapsed / totalTime) * 100;
  };

  const getTimerColor = () => {
    switch (timer.type) {
      case 'work': return 'text-red-600';
      case 'shortBreak': return 'text-green-600';
      case 'longBreak': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    switch (timer.type) {
      case 'work': return 'bg-red-500';
      case 'shortBreak': return 'bg-green-500';
      case 'longBreak': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const activeTasks = tasks.filter(task => !task.isCompleted);

  return (
    <div className="space-y-6">
      {/* Main Timer Display */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-2">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Timer Type Badge */}
            <div className="flex items-center justify-center space-x-2">
              {timer.type === 'work' ? (
                <Zap className="w-6 h-6 text-red-500" />
              ) : (
                <Coffee className="w-6 h-6 text-green-500" />
              )}
              <Badge 
                variant="outline" 
                className={`text-lg px-4 py-2 ${
                  timer.type === 'work' ? 'border-red-200 text-red-700' : 'border-green-200 text-green-700'
                }`}
              >
                {timer.type === 'work' ? 'WORK SESSION' : 
                 timer.type === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK'}
              </Badge>
            </div>

            {/* Time Display */}
            <div className={`text-8xl font-bold ${getTimerColor()}`}>
              {formatTime(timer.remainingTime)}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto">
              <Progress 
                value={getProgress()} 
                className="h-3"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0:00</span>
                <span>{formatTime(timer.duration * 60)}</span>
              </div>
            </div>

            {/* Session Counter */}
            <div className="text-gray-600">
              <span className="text-sm">Session </span>
              <span className="text-lg font-semibold">{timer.sessionCount + 1}</span>
            </div>
          </div>
        </CardContent>
      </Card>      {/* Timer Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center space-x-4">
            {!timer.isActive ? (
              <Button 
                onClick={startTimer}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                START
              </Button>
            ) : timer.isPaused ? (
              <Button 
                onClick={resumeTimer}
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                RESUME
              </Button>
            ) : (
              <Button 
                onClick={pauseTimer}
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8"
              >
                <Pause className="w-5 h-5 mr-2" />
                PAUSE
              </Button>
            )}

            <Button 
              onClick={stopTimer}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <Square className="w-5 h-5 mr-2" />
              STOP
            </Button>

            <Button 
              onClick={resetTimer}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              RESET
            </Button>

            {timer.type !== 'work' && (
              <Button 
                onClick={skipBreak}
                variant="outline"
                size="lg"
                className="px-8"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                SKIP BREAK
              </Button>
            )}
          </div>

          {/* Snooze Options */}
          {canSnooze && timer.remainingTime <= 60 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Snooze timer ({snoozeCount}/{maxSnoozeCount} used)
              </p>
              <div className="flex justify-center space-x-2">
                {snoozeOptions.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => snoozeTimer(option.duration)}
                    variant="outline"
                    size="sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>      {/* Current Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>CURRENT TASK</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentTask ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{currentTask.title}</h3>
                  {currentTask.description && (
                    <p className="text-gray-600 mt-1">{currentTask.description}</p>
                  )}
                </div>
                <Badge className={`
                  ${currentTask.priority === 'urgent' ? 'bg-red-100 text-red-800' : ''}
                  ${currentTask.priority === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                  ${currentTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${currentTask.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                `}>
                  {currentTask.priority.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Progress: {currentTask.completedPomodoros}/{currentTask.estimatedPomodoros} pomodoros</span>
                <span>Category: {currentTask.category}</span>
              </div>

              <Progress 
                value={(currentTask.completedPomodoros / currentTask.estimatedPomodoros) * 100}
                className="h-2"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No task selected</p>
              {activeTasks.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-3">Quick select:</p>
                  {activeTasks.slice(0, 3).map((task) => (
                    <Button
                      key={task.id}
                      variant="outline"
                      size="sm"
                      onClick={() => selectTask(task)}
                      className="w-full text-left justify-start"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {task.title}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Go to Tasks tab to create your first task
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}