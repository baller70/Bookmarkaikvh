'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Brain, Palette, Folder, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  parent_id?: string;
  is_ai_suggested?: boolean;
  ai_confidence?: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  parent_id: string;
  is_ai_suggested: boolean;
  ai_confidence: number;
}

interface CategoryFormProps {
  categories: Category[];
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
  className?: string;
}

const PREDEFINED_COLORS = [
  { value: '#3B82F6', name: 'Blue', class: 'bg-blue-500' },
  { value: '#EF4444', name: 'Red', class: 'bg-red-500' },
  { value: '#10B981', name: 'Green', class: 'bg-green-500' },
  { value: '#F59E0B', name: 'Yellow', class: 'bg-yellow-500' },
  { value: '#8B5CF6', name: 'Purple', class: 'bg-purple-500' },
  { value: '#EC4899', name: 'Pink', class: 'bg-pink-500' },
  { value: '#06B6D4', name: 'Cyan', class: 'bg-cyan-500' },
  { value: '#84CC16', name: 'Lime', class: 'bg-lime-500' },
  { value: '#F97316', name: 'Orange', class: 'bg-orange-500' },
  { value: '#6366F1', name: 'Indigo', class: 'bg-indigo-500' },
  { value: '#14B8A6', name: 'Teal', class: 'bg-teal-500' },
  { value: '#F43F5E', name: 'Rose', class: 'bg-rose-500' }
];

const AI_SUGGESTED_CATEGORIES = [
  { name: 'Web Development', confidence: 0.92, description: 'Frontend, backend, and full-stack development resources' },
  { name: 'Machine Learning', confidence: 0.88, description: 'AI, ML, and data science content' },
  { name: 'Design Systems', confidence: 0.85, description: 'UI/UX design patterns and guidelines' },
  { name: 'DevOps & Infrastructure', confidence: 0.91, description: 'Deployment, monitoring, and infrastructure tools' },
  { name: 'Business Strategy', confidence: 0.87, description: 'Strategic planning and business development' },
  { name: 'Mobile Development', confidence: 0.89, description: 'iOS, Android, and cross-platform development' },
  { name: 'Data Analytics', confidence: 0.84, description: 'Data analysis, visualization, and business intelligence' },
  { name: 'Cybersecurity', confidence: 0.86, description: 'Security best practices and tools' }
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  categories,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
  className = ''
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: PREDEFINED_COLORS[0].value,
    parent_id: '',
    is_ai_suggested: false,
    ai_confidence: 0,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Category name must be less than 50 characters';
    }

    // Check for duplicate names (excluding current category in edit mode)
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() &&
      (mode === 'create' || cat.id !== initialData?.name)
    );
    if (existingCategory) {
      newErrors.name = 'A category with this name already exists';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    if (formData.is_ai_suggested && (formData.ai_confidence < 0 || formData.ai_confidence > 1)) {
      newErrors.ai_confidence = 'AI confidence must be between 0 and 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle field changes
  const handleFieldChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Apply AI suggestion
  const applyAISuggestion = (suggestion: typeof AI_SUGGESTED_CATEGORIES[0]) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      description: suggestion.description,
      is_ai_suggested: true,
      ai_confidence: suggestion.confidence,
      color: PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)].value
    }));
    setShowAISuggestions(false);
  };

  // Get available parent categories (excluding current category and its descendants in edit mode)
  const availableParentCategories = categories.filter(cat => {
    if (mode === 'edit' && initialData?.name) {
      // In edit mode, exclude the current category and its descendants
      return cat.name !== initialData.name;
    }
    return true;
  });

  return (
    <div className={`category-form ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Folder className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
            <CardDescription>
              {mode === 'create' ? 'Create a new category' : 'Edit category details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Enter category name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe this category"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200 characters
              </p>
            </div>

            <div>
              <Label htmlFor="parent">Parent Category (Optional)</Label>
              <Select 
                value={formData.parent_id} 
                onValueChange={(value) => handleFieldChange('parent_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root Category)</SelectItem>
                  {availableParentCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Appearance
            </CardTitle>
            <CardDescription>
              Choose a color to identify this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {PREDEFINED_COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all hover:scale-110
                      ${formData.color === color.value 
                        ? 'border-gray-800 ring-2 ring-gray-300' 
                        : 'border-gray-300 hover:border-gray-500'
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleFieldChange('color', color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="text-sm text-gray-600">
                  Selected: {PREDEFINED_COLORS.find(c => c.value === formData.color)?.name}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Settings
            </CardTitle>
            <CardDescription>
              Configure AI-related settings for this category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="ai-suggested"
                checked={formData.is_ai_suggested}
                onCheckedChange={(checked) => handleFieldChange('is_ai_suggested', checked)}
              />
              <Label htmlFor="ai-suggested">AI Suggested Category</Label>
            </div>

            {formData.is_ai_suggested && (
              <div>
                <Label htmlFor="confidence">AI Confidence Score</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="confidence"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.ai_confidence}
                    onChange={(e) => handleFieldChange('ai_confidence', parseFloat(e.target.value))}
                    className={`w-24 ${errors.ai_confidence ? 'border-red-500' : ''}`}
                  />
                  <Badge variant="secondary">
                    {Math.round(formData.ai_confidence * 100)}% confidence
                  </Badge>
                </div>
                {errors.ai_confidence && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.ai_confidence}
                  </p>
                )}
              </div>
            )}

            {mode === 'create' && (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showAISuggestions ? 'Hide' : 'Show'} AI Suggestions
                </Button>

                {showAISuggestions && (
                  <div className="mt-4 space-y-2">
                    <Label>AI Category Suggestions</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {AI_SUGGESTED_CATEGORIES.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => applyAISuggestion(suggestion)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-sm">{suggestion.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(suggestion.confidence * 100)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                          </div>
                          <Button size="sm" variant="ghost">
                            Apply
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || Object.keys(errors).length > 0}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Category' : 'Update Category'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm; 