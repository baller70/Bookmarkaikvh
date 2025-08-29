'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  List,
  Clock,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  Users
} from 'lucide-react';
import { Task, TaskList, ListCreationData } from '../types';

interface ListManagerProps {
  tasks: Task[];
  taskLists: TaskList[];
  currentList?: TaskList;
  createList: (listData: ListCreationData) => TaskList;
  updateList: (listId: string, updates: Partial<TaskList>) => void;
  deleteList: (listId: string) => void;
  setActiveList: (listId: string) => void;
  getTasksForList: (listId: string) => Task[];
}

const LIST_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16'  // Lime
];

export default function ListManager({
  tasks,
  taskLists,
  currentList,
  createList,
  updateList,
  deleteList,
  setActiveList,
  getTasksForList
}: ListManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    color: LIST_COLORS[0]
  });

  const availableTasks = tasks.filter(task => !task.isCompleted);
  const maxListSize = 5;

  const handleCreateList = () => {
    if (!newList.name.trim() || selectedTasks.length === 0) return;

    createList({
      name: newList.name,
      description: newList.description,
      color: newList.color,
      selectedTaskIds: selectedTasks
    });

    // Reset form
    setNewList({ name: '', description: '', color: LIST_COLORS[0] });
    setSelectedTasks([]);
    setShowCreateForm(false);
  };

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else if (prev.length < maxListSize) {
        return [...prev, taskId];
      }
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">LIST MANAGER</h2>
          <p className="text-gray-600">Create focused lists of 4-5 tasks for timer sessions</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          CREATE LIST
        </Button>
      </div>

      {/* Create List Form */}
      {showCreateForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>CREATE NEW LIST</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Name *
                </label>
                <Input
                  value={newList.name}
                  onChange={(e) => setNewList(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Morning Focus, Project Alpha..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex space-x-2">
                  {LIST_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewList(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newList.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={newList.description}
                onChange={(e) => setNewList(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for this list..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Tasks ({selectedTasks.length}/{maxListSize})
              </label>
              <div className="max-h-64 overflow-y-auto border rounded-lg p-3 bg-white">
                {availableTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No available tasks. Create some tasks first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableTasks.map(task => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedTasks.includes(task.id)
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => handleTaskToggle(task.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedTasks.includes(task.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedTasks.includes(task.id) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{task.estimatedPomodoros} pomodoros</span>
                              <Badge className={`text-xs ${
                                task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleCreateList} 
                className="bg-green-500 hover:bg-green-600"
                disabled={!newList.name.trim() || selectedTasks.length === 0}
              >
                <List className="w-4 h-4 mr-2" />
                CREATE LIST
              </Button>
              <Button 
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                CANCEL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {taskLists.length === 0 && !showCreateForm && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <List className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lists Created</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first focused task list to get started with organized pomodoro sessions.
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              CREATE YOUR FIRST LIST
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 