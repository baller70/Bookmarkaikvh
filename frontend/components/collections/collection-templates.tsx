'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Star, 
  TrendingUp, 
  Calendar,
  Users,
  Bookmark,
  Code,
  Palette,
  BookOpen,
  Briefcase,
  Heart,
  Gamepad2,
  Music,
  Camera,
  Plane,
  Coffee,
  Zap
} from 'lucide-react';
import { Collection, CollectionTemplate } from '@/hooks/use-collections';

interface CollectionTemplatesProps {
  onCreateFromTemplate: (template: Partial<Collection>) => void;
}

const featuredTemplates: CollectionTemplate[] = [
  {
    id: 'development',
    name: 'Development Resources',
    description: 'Essential tools, tutorials, and documentation for developers',
    category: 'Technology',
    tags: ['development', 'programming', 'tools', 'tutorials'],
    icon: '💻',
    color: 'blue',
    defaultBookmarks: []
  },
  {
    id: 'design-inspiration',
    name: 'Design Inspiration',
    description: 'Beautiful designs, color palettes, and creative inspiration',
    category: 'Creative',
    tags: ['design', 'inspiration', 'ui', 'ux', 'creativity'],
    icon: '🎨',
    color: 'purple',
    defaultBookmarks: []
  },
  {
    id: 'research-papers',
    name: 'Research Papers',
    description: 'Academic papers, studies, and research materials',
    category: 'Academic',
    tags: ['research', 'academic', 'papers', 'studies'],
    icon: '📚',
    color: 'green',
    defaultBookmarks: []
  },
  {
    id: 'startup-resources',
    name: 'Startup Resources',
    description: 'Tools, guides, and resources for entrepreneurs',
    category: 'Business',
    tags: ['startup', 'entrepreneurship', 'business', 'tools'],
    icon: '🚀',
    color: 'orange',
    defaultBookmarks: []
  },
  {
    id: 'learning-path',
    name: 'Learning Path',
    description: 'Structured learning journey with courses and tutorials',
    category: 'Education',
    tags: ['learning', 'education', 'courses', 'skills'],
    icon: '🎓',
    color: 'indigo',
    defaultBookmarks: []
  },
  {
    id: 'job-hunting',
    name: 'Job Hunting',
    description: 'Job boards, interview prep, and career resources',
    category: 'Career',
    tags: ['jobs', 'career', 'interviews', 'resume'],
    icon: '💼',
    color: 'blue',
    defaultBookmarks: []
  }
];

const categoryTemplates: Record<string, CollectionTemplate[]> = {
  'Technology': [
    {
      id: 'web-dev',
      name: 'Web Development',
      description: 'Frontend, backend, and full-stack web development resources',
      category: 'Technology',
      tags: ['web', 'frontend', 'backend', 'javascript'],
      icon: '🌐',
      color: 'blue'
    },
    {
      id: 'mobile-dev',
      name: 'Mobile Development',
      description: 'iOS, Android, and cross-platform mobile development',
      category: 'Technology',
      tags: ['mobile', 'ios', 'android', 'react-native'],
      icon: '📱',
      color: 'green'
    },
    {
      id: 'data-science',
      name: 'Data Science',
      description: 'Machine learning, AI, and data analysis resources',
      category: 'Technology',
      tags: ['data', 'ml', 'ai', 'python'],
      icon: '📊',
      color: 'purple'
    },
    {
      id: 'devops',
      name: 'DevOps & Cloud',
      description: 'Infrastructure, deployment, and cloud computing',
      category: 'Technology',
      tags: ['devops', 'cloud', 'aws', 'docker'],
      icon: '☁️',
      color: 'indigo'
    }
  ],
  'Creative': [
    {
      id: 'graphic-design',
      name: 'Graphic Design',
      description: 'Typography, layouts, and visual design inspiration',
      category: 'Creative',
      tags: ['graphics', 'typography', 'layout', 'visual'],
      icon: '🎨',
      color: 'pink'
    },
    {
      id: 'photography',
      name: 'Photography',
      description: 'Photography techniques, gear, and inspiration',
      category: 'Creative',
      tags: ['photography', 'camera', 'editing', 'portfolio'],
      icon: '📸',
      color: 'orange'
    },
    {
      id: 'music-production',
      name: 'Music Production',
      description: 'Audio production, mixing, and music creation',
      category: 'Creative',
      tags: ['music', 'audio', 'production', 'mixing'],
      icon: '🎵',
      color: 'purple'
    }
  ],
  'Business': [
    {
      id: 'marketing',
      name: 'Digital Marketing',
      description: 'SEO, social media, and digital marketing strategies',
      category: 'Business',
      tags: ['marketing', 'seo', 'social-media', 'analytics'],
      icon: '📈',
      color: 'green'
    },
    {
      id: 'finance',
      name: 'Personal Finance',
      description: 'Investment, budgeting, and financial planning',
      category: 'Business',
      tags: ['finance', 'investment', 'budgeting', 'money'],
      icon: '💰',
      color: 'yellow'
    }
  ],
  'Lifestyle': [
    {
      id: 'fitness',
      name: 'Fitness & Health',
      description: 'Workout routines, nutrition, and wellness',
      category: 'Lifestyle',
      tags: ['fitness', 'health', 'nutrition', 'wellness'],
      icon: '💪',
      color: 'red'
    },
    {
      id: 'travel',
      name: 'Travel Planning',
      description: 'Destinations, itineraries, and travel tips',
      category: 'Lifestyle',
      tags: ['travel', 'destinations', 'planning', 'tips'],
      icon: '✈️',
      color: 'blue'
    },
    {
      id: 'cooking',
      name: 'Cooking & Recipes',
      description: 'Recipes, cooking techniques, and food inspiration',
      category: 'Lifestyle',
      tags: ['cooking', 'recipes', 'food', 'kitchen'],
      icon: '🍳',
      color: 'orange'
    }
  ]
};

export const CollectionTemplates: React.FC<CollectionTemplatesProps> = ({
  onCreateFromTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('featured');

  const categories = Object.keys(categoryTemplates);
  const allTemplates = Object.values(categoryTemplates).flat();

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateFromTemplate = (template: CollectionTemplate) => {
    onCreateFromTemplate({
      name: template.name,
      description: template.description,
      tags: [...template.tags],
      template: template.id,
      isPublic: false,
      collaborators: [],
      bookmarks: template.defaultBookmarks || []
    });
  };

  const getTemplateIcon = (template: CollectionTemplate) => {
    const colorClasses = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-pink-500',
      orange: 'from-orange-500 to-red-500',
      indigo: 'from-indigo-500 to-purple-500',
      pink: 'from-pink-500 to-rose-500',
      red: 'from-red-500 to-pink-500',
      yellow: 'from-yellow-500 to-orange-500'
    };

    const gradient = colorClasses[template.color as keyof typeof colorClasses] || colorClasses.blue;

    return (
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-2xl`}>
        {template.icon}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Collection Templates</h2>
        <p className="text-gray-600">
          Start with a pre-built template to quickly organize your bookmarks
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
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
                  <CardDescription className="text-sm mb-4">
                    {template.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleCreateFromTemplate(template)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
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
                  <CardDescription className="text-sm mb-4">
                    {template.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleCreateFromTemplate(template)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500">
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Trending templates with usage stats */}
            {featuredTemplates.slice(0, 6).map((template, index) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTemplateIcon(template)}
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        #{index + 1}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 500) + 100} uses
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm mb-4">
                    {template.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{Math.floor(Math.random() * 50) + 10}% this week
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {Math.floor(Math.random() * 200) + 50} creators
                    </span>
                  </div>
                  <Button 
                    onClick={() => handleCreateFromTemplate(template)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 