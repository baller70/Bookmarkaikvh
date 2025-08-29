'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  FolderPlus, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  Brain,
  ArrowLeft,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Folder,
  Hash,
  Eye,
  Clock,
  Users,
  Star
} from 'lucide-react';
import Link from 'next/link';

// Types
interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  parent_id?: string;
  order: number;
  user_id: string;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
  is_ai_suggested?: boolean;
  ai_confidence?: number;
  children?: Category[];
}

interface CategoryAnalytics {
  id: string;
  name: string;
  bookmarkCount: number;
  totalVisits: number;
  averageTimeSpent: number;
  lastUsed: string;
  growthRate: number;
  efficiency: number;
  popularityScore: number;
  aiAccuracy?: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  parent_id: string;
  is_ai_suggested: boolean;
  ai_confidence: number;
}

const PREDEFINED_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const AI_SUGGESTED_CATEGORIES = [
  { name: 'Web Development', confidence: 0.92, description: 'Frontend, backend, and full-stack development resources' },
  { name: 'Machine Learning', confidence: 0.88, description: 'AI, ML, and data science content' },
  { name: 'Design Systems', confidence: 0.85, description: 'UI/UX design patterns and guidelines' },
  { name: 'DevOps & Infrastructure', confidence: 0.91, description: 'Deployment, monitoring, and infrastructure tools' },
  { name: 'Business Strategy', confidence: 0.87, description: 'Strategic planning and business development' }
];

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState<CategoryAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: PREDEFINED_COLORS[0],
    parent_id: '',
    is_ai_suggested: false,
    ai_confidence: 0
  });

  // Load categories and analytics
  useEffect(() => {
    loadCategories();
    loadAnalytics();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories?user_id=dev-user-123');
      if (response.ok) {
        const data = await response.json();
        setCategories(buildCategoryTree(data.categories || []));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Mock analytics data - in real implementation, this would come from API
      const mockAnalytics: CategoryAnalytics[] = [
        {
          id: '1',
          name: 'Web Development',
          bookmarkCount: 234,
          totalVisits: 1250,
          averageTimeSpent: 145,
          lastUsed: '2024-01-15',
          growthRate: 15.2,
          efficiency: 87,
          popularityScore: 92,
          aiAccuracy: 94
        },
        {
          id: '2',
          name: 'Design',
          bookmarkCount: 156,
          totalVisits: 890,
          averageTimeSpent: 98,
          lastUsed: '2024-01-14',
          growthRate: -3.1,
          efficiency: 72,
          popularityScore: 78,
          aiAccuracy: 89
        },
        {
          id: '3',
          name: 'Machine Learning',
          bookmarkCount: 89,
          totalVisits: 567,
          averageTimeSpent: 203,
          lastUsed: '2024-01-13',
          growthRate: 28.7,
          efficiency: 94,
          popularityScore: 85,
          aiAccuracy: 96
        }
      ];
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Build hierarchical category tree
  const buildCategoryTree = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map of all categories
    flatCategories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build tree structure
    flatCategories.forEach(category => {
      const categoryNode = categoryMap.get(category.id)!;
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        const parent = categoryMap.get(category.parent_id)!;
        parent.children!.push(categoryNode);
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories.sort((a, b) => a.order - b.order);
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      // Update category order/parent via API
      const response = await fetch(`/api/categories/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: destination.droppableId === 'root' ? null : destination.droppableId,
          order: destination.index
        })
      });

      if (response.ok) {
        // Reload categories to reflect changes
        loadCategories();
      }
    } catch (error) {
      console.error('Error updating category order:', error);
    }
  };

  // Create category
  const handleCreateCategory = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: 'dev-user-123',
          parent_id: formData.parent_id || null
        })
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        resetForm();
        loadCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        resetForm();
        loadCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}?user_id=dev-user-123`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadCategories();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Add AI suggested category
  const handleAddAISuggestion = (suggestion: typeof AI_SUGGESTED_CATEGORIES[0]) => {
    setFormData({
      name: suggestion.name,
      description: suggestion.description,
      color: PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)],
      parent_id: '',
      is_ai_suggested: true,
      ai_confidence: suggestion.confidence
    });
    setIsCreateDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: PREDEFINED_COLORS[0],
      parent_id: '',
      is_ai_suggested: false,
      ai_confidence: 0
    });
  };

  // Edit category
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      parent_id: category.parent_id || '',
      is_ai_suggested: category.is_ai_suggested || false,
      ai_confidence: category.ai_confidence || 0
    });
    setIsEditDialogOpen(true);
  };

  // Toggle category expansion
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Render category tree item
  const renderCategoryItem = (category: Category, level: number = 0) => (
    <Draggable key={category.id} draggableId={category.id} index={category.order}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-2 ${level > 0 ? 'ml-6' : ''}`}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div {...provided.dragHandleProps}>
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                  </div>
                  
                  {category.children && category.children.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(category.id)}
                      className="p-1 h-6 w-6"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{category.name}</h3>
                      {category.is_ai_suggested && (
                        <Badge variant="secondary" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          AI {Math.round((category.ai_confidence || 0) * 100)}%
                        </Badge>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {category.bookmark_count} bookmarks
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                    className="p-1 h-6 w-6"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Render children if expanded */}
          {expandedCategories.has(category.id) && category.children && (
            <div className="mt-2">
              {category.children.map(child => renderCategoryItem(child, level + 1))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-gray-600">Organize and analyze your bookmark categories</p>
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your bookmarks
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this category"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="parent">Parent Category (Optional)</Label>
                <Select value={formData.parent_id} onValueChange={(value) => setFormData({ ...formData, parent_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Root Category)</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Color</Label>
                <div className="flex space-x-2 mt-2">
                  {PREDEFINED_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="ai-suggested"
                  checked={formData.is_ai_suggested}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_ai_suggested: checked })}
                />
                <Label htmlFor="ai-suggested">AI Suggested Category</Label>
              </div>
              
              {formData.is_ai_suggested && (
                <div>
                  <Label htmlFor="confidence">AI Confidence</Label>
                  <Input
                    id="confidence"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.ai_confidence}
                    onChange={(e) => setFormData({ ...formData, ai_confidence: parseFloat(e.target.value) })}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory} disabled={!formData.name.trim()}>
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="management">Category Management</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="ai-suggestions">AI Suggestions</TabsTrigger>
        </TabsList>

        {/* Category Management Tab */}
        <TabsContent value="management" className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="root" type="CATEGORY">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  {filteredCategories.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm ? 'No categories match your search.' : 'Create your first category to get started.'}
                        </p>
                        {!searchTerm && (
                          <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Category
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredCategories.map(category => renderCategoryItem(category))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <Badge variant={category.growthRate > 0 ? "default" : "secondary"}>
                      {category.growthRate > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(category.growthRate)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center text-gray-600">
                        <Hash className="h-3 w-3 mr-1" />
                        Bookmarks
                      </div>
                      <div className="font-medium">{category.bookmarkCount}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-600">
                        <Eye className="h-3 w-3 mr-1" />
                        Total Visits
                      </div>
                      <div className="font-medium">{category.totalVisits}</div>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Avg. Time
                      </div>
                      <div className="font-medium">{category.averageTimeSpent}s</div>
                    </div>
                    <div>
                      <div className="flex items-center text-gray-600">
                        <Star className="h-3 w-3 mr-1" />
                        Popularity
                      </div>
                      <div className="font-medium">{category.popularityScore}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Efficiency Score</span>
                      <span>{category.efficiency}%</span>
                    </div>
                    <Progress value={category.efficiency} className="h-2" />
                  </div>
                  
                  {category.aiAccuracy && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>AI Accuracy</span>
                        <span>{category.aiAccuracy}%</span>
                      </div>
                      <Progress value={category.aiAccuracy} className="h-2" />
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Last used: {new Date(category.lastUsed).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="ai-suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Category Suggestions
              </CardTitle>
              <CardDescription>
                Based on your bookmark patterns, here are some category suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {AI_SUGGESTED_CATEGORIES.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{suggestion.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddAISuggestion(suggestion)}
                    className="ml-4"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this category"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-parent">Parent Category (Optional)</Label>
              <Select value={formData.parent_id} onValueChange={(value) => setFormData({ ...formData, parent_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root Category)</SelectItem>
                  {categories
                    .filter(cat => cat.id !== selectedCategory?.id)
                    .map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Color</Label>
              <div className="flex space-x-2 mt-2">
                {PREDEFINED_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={!formData.name.trim()}>
              Update Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 