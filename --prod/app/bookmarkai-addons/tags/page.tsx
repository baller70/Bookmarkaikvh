'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Tags, 
  Hash,
  ArrowLeft,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Tag {
  id: string
  name: string
  description: string
  color: string
  bookmarkCount: number
  createdAt: string
  updatedAt: string
  isPopular: boolean
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })
  const [filterType, setFilterType] = useState<'all' | 'popular' | 'recent'>('all')

  // Sample data - replace with actual API calls
  useEffect(() => {
    const sampleTags: Tag[] = [
      {
        id: '1',
        name: 'javascript',
        description: 'JavaScript programming language resources',
        color: '#F7DF1E',
        bookmarkCount: 25,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        isPopular: true
      },
      {
        id: '2',
        name: 'react',
        description: 'React framework and related tools',
        color: '#61DAFB',
        bookmarkCount: 18,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        isPopular: true
      },
      {
        id: '3',
        name: 'tutorial',
        description: 'Educational and learning content',
        color: '#10B981',
        bookmarkCount: 32,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-22',
        isPopular: true
      },
      {
        id: '4',
        name: 'api',
        description: 'API documentation and resources',
        color: '#8B5CF6',
        bookmarkCount: 14,
        createdAt: '2024-01-12',
        updatedAt: '2024-01-19',
        isPopular: false
      },
      {
        id: '5',
        name: 'design',
        description: 'UI/UX design inspiration',
        color: '#EC4899',
        bookmarkCount: 12,
        createdAt: '2024-01-08',
        updatedAt: '2024-01-16',
        isPopular: false
      },
      {
        id: '6',
        name: 'tools',
        description: 'Development tools and utilities',
        color: '#F59E0B',
        bookmarkCount: 9,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-23',
        isPopular: false
      },
      {
        id: '7',
        name: 'css',
        description: 'CSS styling and animations',
        color: '#1572B6',
        bookmarkCount: 16,
        createdAt: '2024-01-14',
        updatedAt: '2024-01-21',
        isPopular: true
      },
      {
        id: '8',
        name: 'nodejs',
        description: 'Node.js backend development',
        color: '#339933',
        bookmarkCount: 11,
        createdAt: '2024-01-18',
        updatedAt: '2024-01-24',
        isPopular: false
      }
    ]
    setTags(sampleTags)
  }, [])

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'popular') return matchesSearch && tag.isPopular
    if (filterType === 'recent') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return matchesSearch && new Date(tag.createdAt) > oneWeekAgo
    }
    return matchesSearch
  })

  const handleCreateTag = () => {
    if (!newTag.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive"
      })
      return
    }

    // Check if tag already exists
    if (tags.some(tag => tag.name.toLowerCase() === newTag.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "Tag already exists",
        variant: "destructive"
      })
      return
    }

    const tag: Tag = {
      id: Date.now().toString(),
      name: newTag.name.toLowerCase(),
      description: newTag.description,
      color: newTag.color,
      bookmarkCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPopular: false
    }

    setTags([...tags, tag])
    setNewTag({ name: '', description: '', color: '#3B82F6' })
    setIsCreateDialogOpen(false)
    
    toast({
      title: "Success",
      description: "Tag created successfully"
    })
  }

  const handleEditTag = () => {
    if (!editingTag || !editingTag.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive"
      })
      return
    }

    // Check if tag name already exists (excluding current tag)
    if (tags.some(tag => tag.id !== editingTag.id && tag.name.toLowerCase() === editingTag.name.toLowerCase())) {
      toast({
        title: "Error",
        description: "Tag already exists",
        variant: "destructive"
      })
      return
    }

    setTags(tags.map(tag => 
      tag.id === editingTag.id 
        ? { ...editingTag, name: editingTag.name.toLowerCase(), updatedAt: new Date().toISOString().split('T')[0] }
        : tag
    ))
    setIsEditDialogOpen(false)
    setEditingTag(null)
    
    toast({
      title: "Success",
      description: "Tag updated successfully"
    })
  }

  const handleDeleteTag = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    if (tag && tag.bookmarkCount > 0) {
      toast({
        title: "Cannot delete tag",
        description: `Tag "${tag.name}" is used by ${tag.bookmarkCount} bookmarks. Please remove the tag from bookmarks first.`,
        variant: "destructive"
      })
      return
    }

    setTags(tags.filter(t => t.id !== tagId))
    toast({
      title: "Success",
      description: "Tag deleted successfully"
    })
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag({ ...tag })
    setIsEditDialogOpen(true)
  }

  const colorOptions = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#84CC16',
    '#F7DF1E', '#61DAFB', '#1572B6', '#339933', '#E34F26'
  ]

  const popularTags = tags.filter(tag => tag.isPopular).slice(0, 5)
  const recentTags = tags.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

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
                <Tags className="h-6 w-6" />
                <h1 className="text-xl font-bold">Tags</h1>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Tags</h2>
              <p className="text-gray-600 dark:text-gray-400">Create and organize tags for better bookmark organization</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Tag</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                  <DialogDescription>
                    Add a new tag to organize your bookmarks.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                      placeholder="Enter tag name (e.g., javascript, tutorial)"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTag.description}
                      onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                      placeholder="Enter tag description"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newTag.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTag({ ...newTag, color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateTag}>
                    Create Tag
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{popularTags.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.reduce((sum, tag) => sum + tag.bookmarkCount, 0)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'popular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('popular')}
              >
                <Star className="h-4 w-4 mr-1" />
                Popular
              </Button>
              <Button
                variant={filterType === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('recent')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Recent
              </Button>
            </div>
          </div>

          {/* Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTags.map((tag) => (
              <Card key={tag.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-medium truncate">
                            #{tag.name}
                          </CardTitle>
                          {tag.isPopular && (
                            <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {tag.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tag)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {tag.bookmarkCount} bookmarks
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tag.updatedAt}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTags.length === 0 && (
            <div className="text-center py-12">
              <Tags className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No tags found' : 'No tags yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Create your first tag to organize your bookmarks'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
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
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag information.
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  placeholder="Enter tag name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTag.description}
                  onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                  placeholder="Enter tag description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingTag.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingTag({ ...editingTag, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditTag}>
              Update Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 