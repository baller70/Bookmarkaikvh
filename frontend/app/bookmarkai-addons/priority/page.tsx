'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  TrendingUp, 
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  Clock,
  Zap,
  Target,
  ArrowLeft,
  Star,
  BarChart3,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface Priority {
  id: string
  name: string
  description: string
  level: number
  color: string
  icon: string
  bookmarkCount: number
  createdAt: string
  updatedAt: string
  isDefault: boolean
}

export default function PriorityPage() {
  const [priorities, setPriorities] = useState<Priority[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null)
  const [newPriority, setNewPriority] = useState({
    name: '',
    description: '',
    level: 3,
    color: '#3B82F6',
    icon: 'target'
  })
  const [filterLevel, setFilterLevel] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all')

  // Sample data - replace with actual API calls
  useEffect(() => {
    const samplePriorities: Priority[] = [
      {
        id: '1',
        name: 'Critical',
        description: 'Highest priority items that need immediate attention',
        level: 5,
        color: '#EF4444',
        icon: 'alert-circle',
        bookmarkCount: 8,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        isDefault: true
      },
      {
        id: '2',
        name: 'High',
        description: 'Important items that should be addressed soon',
        level: 4,
        color: '#F97316',
        icon: 'arrow-up',
        bookmarkCount: 15,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        isDefault: true
      },
      {
        id: '3',
        name: 'Medium',
        description: 'Standard priority for regular items',
        level: 3,
        color: '#3B82F6',
        icon: 'target',
        bookmarkCount: 25,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-22',
        isDefault: true
      },
      {
        id: '4',
        name: 'Low',
        description: 'Items that can be addressed when time permits',
        level: 2,
        color: '#10B981',
        icon: 'arrow-down',
        bookmarkCount: 12,
        createdAt: '2024-01-12',
        updatedAt: '2024-01-19',
        isDefault: true
      },
      {
        id: '5',
        name: 'Someday',
        description: 'Items for future reference with no urgency',
        level: 1,
        color: '#6B7280',
        icon: 'clock',
        bookmarkCount: 6,
        createdAt: '2024-01-08',
        updatedAt: '2024-01-16',
        isDefault: true
      },
      {
        id: '6',
        name: 'Learning',
        description: 'Educational content for skill development',
        level: 3,
        color: '#8B5CF6',
        icon: 'zap',
        bookmarkCount: 18,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-23',
        isDefault: false
      },
      {
        id: '7',
        name: 'Work Project',
        description: 'Resources related to current work projects',
        level: 4,
        color: '#EC4899',
        icon: 'star',
        bookmarkCount: 22,
        createdAt: '2024-01-14',
        updatedAt: '2024-01-21',
        isDefault: false
      }
    ]
    setPriorities(samplePriorities)
  }, [])

  const filteredPriorities = priorities.filter(priority => {
    const matchesSearch = priority.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      priority.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterLevel === 'all') return matchesSearch
    return matchesSearch && priority.level.toString() === filterLevel
  })

  const handleCreatePriority = () => {
    if (!newPriority.name.trim()) {
      toast({
        title: "Error",
        description: "Priority name is required",
        variant: "destructive"
      })
      return
    }

    // Check if priority already exists
    if (priorities.some(priority => priority.name.toLowerCase() === newPriority.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "Priority already exists",
        variant: "destructive"
      })
      return
    }

    const priority: Priority = {
      id: Date.now().toString(),
      name: newPriority.name,
      description: newPriority.description,
      level: newPriority.level,
      color: newPriority.color,
      icon: newPriority.icon,
      bookmarkCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isDefault: false
    }

    setPriorities([...priorities, priority])
    setNewPriority({ name: '', description: '', level: 3, color: '#3B82F6', icon: 'target' })
    setIsCreateDialogOpen(false)
    
    toast({
      title: "Success",
      description: "Priority created successfully"
    })
  }

  const handleEditPriority = () => {
    if (!editingPriority || !editingPriority.name.trim()) {
      toast({
        title: "Error",
        description: "Priority name is required",
        variant: "destructive"
      })
      return
    }

    // Check if priority name already exists (excluding current priority)
    if (priorities.some(priority => priority.id !== editingPriority.id && priority.name.toLowerCase() === editingPriority.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "Priority already exists",
        variant: "destructive"
      })
      return
    }

    setPriorities(priorities.map(priority => 
      priority.id === editingPriority.id 
        ? { ...editingPriority, updatedAt: new Date().toISOString().split('T')[0] }
        : priority
    ))
    setIsEditDialogOpen(false)
    setEditingPriority(null)
    
    toast({
      title: "Success",
      description: "Priority updated successfully"
    })
  }

  const handleDeletePriority = (priorityId: string) => {
    const priority = priorities.find(p => p.id === priorityId)
    if (priority && priority.isDefault) {
      toast({
        title: "Cannot delete default priority",
        description: `"${priority.name}" is a default priority and cannot be deleted.`,
        variant: "destructive"
      })
      return
    }
    
    if (priority && priority.bookmarkCount > 0) {
      toast({
        title: "Cannot delete priority",
        description: `Priority "${priority.name}" is used by ${priority.bookmarkCount} bookmarks. Please reassign the bookmarks first.`,
        variant: "destructive"
      })
      return
    }

    setPriorities(priorities.filter(p => p.id !== priorityId))
    toast({
      title: "Success",
      description: "Priority deleted successfully"
    })
  }

  const openEditDialog = (priority: Priority) => {
    setEditingPriority({ ...priority })
    setIsEditDialogOpen(true)
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'alert-circle': return AlertCircle
      case 'arrow-up': return ArrowUp
      case 'arrow-down': return ArrowDown
      case 'target': return Target
      case 'clock': return Clock
      case 'zap': return Zap
      case 'star': return Star
      default: return Target
    }
  }

  const colorOptions = [
    '#EF4444', '#F97316', '#3B82F6', '#10B981', '#6B7280',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#84CC16'
  ]

  const iconOptions = [
    { value: 'alert-circle', label: 'Alert Circle', icon: AlertCircle },
    { value: 'arrow-up', label: 'Arrow Up', icon: ArrowUp },
    { value: 'arrow-down', label: 'Arrow Down', icon: ArrowDown },
    { value: 'target', label: 'Target', icon: Target },
    { value: 'clock', label: 'Clock', icon: Clock },
    { value: 'zap', label: 'Zap', icon: Zap },
    { value: 'star', label: 'Star', icon: Star }
  ]

  const levelLabels = {
    5: 'Critical',
    4: 'High',
    3: 'Medium',
    2: 'Low',
    1: 'Minimal'
  }

  const sortedPriorities = [...filteredPriorities].sort((a, b) => b.level - a.level)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-card backdrop-blur-sm border-b border-gray-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <h1 className="text-xl font-bold">Priority</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Priorities</h2>
              <p className="text-gray-600 dark:text-gray-400">Set priority levels for better bookmark organization</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Priority</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Priority</DialogTitle>
                  <DialogDescription>
                    Add a new priority level to organize your bookmarks.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newPriority.name}
                      onChange={(e) => setNewPriority({ ...newPriority, name: e.target.value })}
                      placeholder="Enter priority name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPriority.description}
                      onChange={(e) => setNewPriority({ ...newPriority, description: e.target.value })}
                      placeholder="Enter priority description"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level">Priority Level</Label>
                    <Select value={newPriority.level.toString()} onValueChange={(value) => setNewPriority({ ...newPriority, level: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 - Critical</SelectItem>
                        <SelectItem value="4">4 - High</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="2">2 - Low</SelectItem>
                        <SelectItem value="1">1 - Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newPriority.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewPriority({ ...newPriority, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Select value={newPriority.icon} onValueChange={(value) => setNewPriority({ ...newPriority, icon: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreatePriority}>
                    Create Priority
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{priorities.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Default Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{priorities.filter(p => p.isDefault).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Custom Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{priorities.filter(p => !p.isDefault).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{priorities.reduce((sum, priority) => sum + priority.bookmarkCount, 0)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search priorities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterLevel} onValueChange={(value: any) => setFilterLevel(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="5">Level 5</SelectItem>
                  <SelectItem value="4">Level 4</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priorities List */}
          <div className="space-y-4">
            {sortedPriorities.map((priority) => {
              const IconComponent = getIconComponent(priority.icon)
              return (
                <Card key={priority.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: priority.color }}
                          >
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-lg">{priority.name}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                Level {priority.level}
                              </Badge>
                              {priority.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-sm mt-1">
                              {priority.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-gray-500">
                          <div>{priority.bookmarkCount} bookmarks</div>
                          <div className="text-xs">Updated {priority.updatedAt}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(priority)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePriority(priority.id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={priority.isDefault}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          {filteredPriorities.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No priorities found' : 'No priorities yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Create your first priority to organize your bookmarks'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Priority
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Priority</DialogTitle>
            <DialogDescription>
              Update the priority information.
            </DialogDescription>
          </DialogHeader>
          {editingPriority && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingPriority.name}
                  onChange={(e) => setEditingPriority({ ...editingPriority, name: e.target.value })}
                  placeholder="Enter priority name"
                  disabled={editingPriority.isDefault}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingPriority.description}
                  onChange={(e) => setEditingPriority({ ...editingPriority, description: e.target.value })}
                  placeholder="Enter priority description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-level">Priority Level</Label>
                <Select 
                  value={editingPriority.level.toString()} 
                  onValueChange={(value) => setEditingPriority({ ...editingPriority, level: parseInt(value) })}
                  disabled={editingPriority.isDefault}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Critical</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="1">1 - Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingPriority.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingPriority({ ...editingPriority, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Icon</Label>
                                  <Select 
                    value={editingPriority.icon} 
                    onValueChange={(value) => setEditingPriority({ ...editingPriority, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              {editingPriority.isDefault && (
                <div className="text-sm text-gray-500 italic">
                  Note: Default priorities have limited editing options.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditPriority}>
              Update Priority
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 