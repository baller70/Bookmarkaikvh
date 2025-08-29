'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Share2, 
  Star, 
  Users, 
  Bookmark,
  Play,
  Pause,
  MoreVertical,
  Eye,
  Heart,
  TrendingUp,
  Calendar,
  User,
  Globe,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useCollections } from '@/hooks/use-collections';
import { CollectionCard } from '@/components/collections/collection-card';
import { CreateCollectionDialog } from '@/components/collections/create-collection-dialog';
import { CollectionTemplates } from '@/components/collections/collection-templates';
import { CollectionAnalytics } from '@/components/collections/collection-analytics';

interface Collection {
  id: string;
  name: string;
  description: string;
  bookmarks: string[];
  isPublic: boolean;
  collaborators: string[];
  tags: string[];
  template?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats: {
    views: number;
    likes: number;
    bookmarkCount: number;
    lastActivity: string;
  };
}

const BookmarkCollections: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState<'all' | 'my' | 'shared' | 'public'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [activeTab, setActiveTab] = useState('collections');

  const {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    shareCollection,
    getCollectionAnalytics
  } = useCollections();

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = (() => {
      switch (filterBy) {
        case 'my': return collection.owner.id === 'current-user-id';
        case 'shared': return collection.collaborators.includes('current-user-id');
        case 'public': return collection.isPublic;
        default: return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const handleCreateCollection = async (collectionData: Partial<Collection>) => {
    try {
      await createCollection(collectionData);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleShareCollection = async (collectionId: string, permissions: any) => {
    try {
      await shareCollection(collectionId, permissions);
    } catch (error) {
      console.error('Failed to share collection:', error);
    }
  };

  if (selectedCollection) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedCollection(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Collections
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bookmark className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{selectedCollection.name}</h1>
                  <p className="text-gray-600 mt-1">{selectedCollection.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedCollection.owner.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4" />
                      {selectedCollection.stats.bookmarkCount} bookmarks
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedCollection.stats.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {selectedCollection.stats.likes} likes
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCollection.bookmarks.map((bookmarkId, index) => (
                <Card key={bookmarkId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">Sample Bookmark {index + 1}</h4>
                        <p className="text-xs text-gray-500 mt-1">bookmark-url-{index + 1}.com</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">Technology</Badge>
                          <Badge variant="secondary" className="text-xs">Tutorial</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bookmark Collections</h1>
            <p className="text-gray-600 mt-2">
              Organize your bookmarks into playlist-like collections
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Collection
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collections">My Collections</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="collections" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={filterBy === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterBy === 'my' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('my')}
                  >
                    My Collections
                  </Button>
                  <Button
                    variant={filterBy === 'shared' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('shared')}
                  >
                    Shared
                  </Button>
                  <Button
                    variant={filterBy === 'public' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterBy('public')}
                  >
                    Public
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Collections Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first collection to get started'
                  }
                </p>
                {!searchQuery && filterBy === 'all' && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Collection
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    viewMode={viewMode}
                    onSelect={setSelectedCollection}
                    onShare={handleShareCollection}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <CollectionTemplates onCreateFromTemplate={handleCreateCollection} />
          </TabsContent>

          <TabsContent value="discover">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Trending Collections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-sm font-medium">
                            {i}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Web Design Resources</p>
                            <p className="text-xs text-gray-500">1.2k views</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recently Updated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>U{i}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">React Tutorials</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Community Favorites
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded flex items-center justify-center">
                            <Heart className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">AI & ML Papers</p>
                            <p className="text-xs text-gray-500">456 likes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <Bookmark className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">Design Inspiration</h3>
                            <p className="text-sm text-gray-500">Public Collection</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Public
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        A curated collection of design inspiration and resources
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>24 bookmarks</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            1.2k
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            89
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <CollectionAnalytics />
          </TabsContent>
        </Tabs>

        {/* Create Collection Dialog */}
        <CreateCollectionDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateCollection}
        />
      </div>
    </div>
  );
};

export default BookmarkCollections; 