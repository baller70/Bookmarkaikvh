'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bookmark, 
  Globe, 
  Lock, 
  Plus, 
  X,
  Sparkles,
  Users,
  Template,
  Settings
} from 'lucide-react';
import { Collection, CollectionTemplate } from '@/hooks/use-collections';

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (collection: Partial<Collection>) => void;
  templates?: CollectionTemplate[];
}

const defaultTemplates: CollectionTemplate[] = [
  {
    id: 'development',
    name: 'Development Resources',
    description: 'Perfect for organizing programming tutorials, tools, and documentation',
    category: 'Technology',
    tags: ['development', 'programming', 'tools'],
    icon: '💻',
    color: 'blue'
  },
  {
    id: 'research',
    name: 'Research Papers',
    description: 'Organize academic papers and research materials',
    category: 'Academic',
    tags: ['research', 'academic', 'papers'],
    icon: '📚',
    color: 'green'
  },
  {
    id: 'design',
    name: 'Design Portfolio',
    description: 'Showcase your design work and inspiration',
    category: 'Creative',
    tags: ['design', 'portfolio', 'inspiration'],
    icon: '🎨',
    color: 'purple'
  },
  {
    id: 'learning',
    name: 'Learning Path',
    description: 'Structure your learning journey with organized resources',
    category: 'Education',
    tags: ['learning', 'education', 'courses'],
    icon: '🎓',
    color: 'orange'
  },
  {
    id: 'business',
    name: 'Business Resources',
    description: 'Tools and articles for business and entrepreneurship',
    category: 'Business',
    tags: ['business', 'entrepreneurship', 'tools'],
    icon: '💼',
    color: 'indigo'
  },
  {
    id: 'personal',
    name: 'Personal Interests',
    description: 'Organize content around your hobbies and interests',
    category: 'Personal',
    tags: ['personal', 'hobbies', 'interests'],
    icon: '⭐',
    color: 'pink'
  }
];

export const CreateCollectionDialog: React.FC<CreateCollectionDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  templates = defaultTemplates
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTemplate, setSelectedTemplate] = useState<CollectionTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tags: [] as string[],
    collaborators: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [newCollaborator, setNewCollaborator] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTemplateSelect = (template: CollectionTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      tags: [...template.tags]
    }));
    setActiveTab('basic');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addCollaborator = () => {
    if (newCollaborator.trim() && !formData.collaborators.includes(newCollaborator.trim())) {
      setFormData(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, newCollaborator.trim()]
      }));
      setNewCollaborator('');
    }
  };

  const removeCollaborator = (collaborator: string) => {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(c => c !== collaborator)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Collection name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const collectionData: Partial<Collection> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      isPublic: formData.isPublic,
      tags: formData.tags,
      collaborators: formData.collaborators,
      template: selectedTemplate?.id,
      bookmarks: []
    };

    onSubmit(collectionData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      tags: [],
      collaborators: []
    });
    setSelectedTemplate(null);
    setNewTag('');
    setNewCollaborator('');
    setErrors({});
    setActiveTab('basic');
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const getTemplateIcon = (template: CollectionTemplate) => {
    const colorClasses = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-pink-500',
      orange: 'from-orange-500 to-red-500',
      indigo: 'from-indigo-500 to-purple-500',
      pink: 'from-pink-500 to-rose-500'
    };

    const gradient = colorClasses[template.color as keyof typeof colorClasses] || colorClasses.blue;

    return (
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-2xl`}>
        {template.icon}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Create New Collection
          </DialogTitle>
          <DialogDescription>
            Organize your bookmarks into a playlist-like collection. Choose a template or start from scratch.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template" className="flex items-center gap-2">
              <Template className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
              <p className="text-sm text-gray-600">
                Start with a pre-configured template or skip to create a custom collection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      {getTemplateIcon(template)}
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm mb-3">
                      {template.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('basic')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Start from Scratch
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="basic" className="space-y-6">
            {selectedTemplate && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {getTemplateIcon(selectedTemplate)}
                    <div>
                      <p className="font-medium">Using template: {selectedTemplate.name}</p>
                      <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplate(null)}
                      className="ml-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter collection name..."
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this collection is about..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={errors.description ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTag(tag)}
                          className="h-auto p-0 ml-1 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Visibility</Label>
                  <p className="text-sm text-gray-600">
                    Control who can see and access this collection
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                  <Globe className="h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {formData.isPublic ? (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>This collection will be public and discoverable by others</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>This collection will be private and only visible to you</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Collaborators</Label>
                <p className="text-sm text-gray-600">
                  Add people who can edit this collection
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email or username..."
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCollaborator()}
                  />
                  <Button type="button" onClick={addCollaborator} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.collaborators.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {formData.collaborators.map((collaborator) => (
                      <div key={collaborator} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{collaborator}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCollaborator(collaborator)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Create Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 