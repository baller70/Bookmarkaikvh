import { useState, useEffect, useCallback } from 'react';

export interface Collection {
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

export interface CollectionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  defaultBookmarks?: string[];
  icon: string;
  color: string;
}

export interface CollectionAnalytics {
  totalCollections: number;
  totalBookmarks: number;
  totalViews: number;
  totalLikes: number;
  averageBookmarksPerCollection: number;
  mostPopularCollection: Collection | null;
  recentActivity: Array<{
    type: 'created' | 'updated' | 'shared' | 'liked';
    collectionId: string;
    collectionName: string;
    timestamp: string;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [templates, setTemplates] = useState<CollectionTemplate[]>([]);
  const [analytics, setAnalytics] = useState<CollectionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockCollections: Collection[] = [
    {
      id: '1',
      name: 'Web Development Resources',
      description: 'Essential tools and tutorials for web developers',
      bookmarks: ['bookmark-1', 'bookmark-2', 'bookmark-3', 'bookmark-4', 'bookmark-5'],
      isPublic: true,
      collaborators: ['user-2', 'user-3'],
      tags: ['development', 'web', 'programming'],
      template: 'development',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      owner: {
        id: 'current-user-id',
        name: 'John Doe',
        avatar: '/avatars/john.jpg'
      },
      stats: {
        views: 1250,
        likes: 89,
        bookmarkCount: 5,
        lastActivity: '2024-01-20T15:30:00Z'
      }
    },
    {
      id: '2',
      name: 'Design Inspiration',
      description: 'Beautiful designs and creative inspiration',
      bookmarks: ['bookmark-6', 'bookmark-7', 'bookmark-8'],
      isPublic: false,
      collaborators: [],
      tags: ['design', 'inspiration', 'ui', 'ux'],
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-18T09:15:00Z',
      owner: {
        id: 'current-user-id',
        name: 'John Doe',
        avatar: '/avatars/john.jpg'
      },
      stats: {
        views: 456,
        likes: 23,
        bookmarkCount: 3,
        lastActivity: '2024-01-18T09:15:00Z'
      }
    },
    {
      id: '3',
      name: 'AI & Machine Learning',
      description: 'Latest papers and resources in AI/ML',
      bookmarks: ['bookmark-9', 'bookmark-10', 'bookmark-11', 'bookmark-12'],
      isPublic: true,
      collaborators: ['user-4'],
      tags: ['ai', 'machine-learning', 'research'],
      template: 'research',
      createdAt: '2024-01-05T16:45:00Z',
      updatedAt: '2024-01-19T11:20:00Z',
      owner: {
        id: 'user-2',
        name: 'Jane Smith',
        avatar: '/avatars/jane.jpg'
      },
      stats: {
        views: 2340,
        likes: 156,
        bookmarkCount: 4,
        lastActivity: '2024-01-19T11:20:00Z'
      }
    }
  ];

  const mockTemplates: CollectionTemplate[] = [
    {
      id: 'development',
      name: 'Development Resources',
      description: 'Perfect for organizing programming tutorials, tools, and documentation',
      category: 'Technology',
      tags: ['development', 'programming', 'tools'],
      icon: '💻',
      color: 'blue',
      defaultBookmarks: []
    },
    {
      id: 'research',
      name: 'Research Papers',
      description: 'Organize academic papers and research materials',
      category: 'Academic',
      tags: ['research', 'academic', 'papers'],
      icon: '📚',
      color: 'green',
      defaultBookmarks: []
    },
    {
      id: 'design',
      name: 'Design Portfolio',
      description: 'Showcase your design work and inspiration',
      category: 'Creative',
      tags: ['design', 'portfolio', 'inspiration'],
      icon: '🎨',
      color: 'purple',
      defaultBookmarks: []
    },
    {
      id: 'learning',
      name: 'Learning Path',
      description: 'Structure your learning journey with organized resources',
      category: 'Education',
      tags: ['learning', 'education', 'courses'],
      icon: '🎓',
      color: 'orange',
      defaultBookmarks: []
    },
    {
      id: 'business',
      name: 'Business Resources',
      description: 'Tools and articles for business and entrepreneurship',
      category: 'Business',
      tags: ['business', 'entrepreneurship', 'tools'],
      icon: '💼',
      color: 'indigo',
      defaultBookmarks: []
    },
    {
      id: 'personal',
      name: 'Personal Interests',
      description: 'Organize content around your hobbies and interests',
      category: 'Personal',
      tags: ['personal', 'hobbies', 'interests'],
      icon: '⭐',
      color: 'pink',
      defaultBookmarks: []
    }
  ];

  const mockAnalytics: CollectionAnalytics = {
    totalCollections: 3,
    totalBookmarks: 12,
    totalViews: 4046,
    totalLikes: 268,
    averageBookmarksPerCollection: 4,
    mostPopularCollection: mockCollections[2],
    recentActivity: [
      {
        type: 'updated',
        collectionId: '1',
        collectionName: 'Web Development Resources',
        timestamp: '2024-01-20T15:30:00Z'
      },
      {
        type: 'liked',
        collectionId: '3',
        collectionName: 'AI & Machine Learning',
        timestamp: '2024-01-19T11:20:00Z'
      },
      {
        type: 'shared',
        collectionId: '2',
        collectionName: 'Design Inspiration',
        timestamp: '2024-01-18T09:15:00Z'
      }
    ],
    viewsOverTime: [
      { date: '2024-01-14', views: 45 },
      { date: '2024-01-15', views: 67 },
      { date: '2024-01-16', views: 89 },
      { date: '2024-01-17', views: 123 },
      { date: '2024-01-18', views: 156 },
      { date: '2024-01-19', views: 201 },
      { date: '2024-01-20', views: 234 }
    ],
    topCategories: [
      { category: 'Technology', count: 8 },
      { category: 'Design', count: 3 },
      { category: 'Research', count: 4 },
      { category: 'Business', count: 2 }
    ]
  };

  // Load collections on mount
  useEffect(() => {
    loadCollections();
    loadTemplates();
    loadAnalytics();
  }, []);

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setCollections(mockCollections);
    } catch (err) {
      setError('Failed to load collections');
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      setTemplates(mockTemplates);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  }, []);

  const createCollection = useCallback(async (collectionData: Partial<Collection>) => {
    try {
      const newCollection: Collection = {
        id: `collection-${Date.now()}`,
        name: collectionData.name || 'Untitled Collection',
        description: collectionData.description || '',
        bookmarks: collectionData.bookmarks || [],
        isPublic: collectionData.isPublic || false,
        collaborators: collectionData.collaborators || [],
        tags: collectionData.tags || [],
        template: collectionData.template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: {
          id: 'current-user-id',
          name: 'John Doe',
          avatar: '/avatars/john.jpg'
        },
        stats: {
          views: 0,
          likes: 0,
          bookmarkCount: collectionData.bookmarks?.length || 0,
          lastActivity: new Date().toISOString()
        }
      };

      // In a real app, this would be an API call
      setCollections(prev => [newCollection, ...prev]);
      
      // Update analytics
      if (analytics) {
        setAnalytics(prev => prev ? {
          ...prev,
          totalCollections: prev.totalCollections + 1,
          totalBookmarks: prev.totalBookmarks + newCollection.stats.bookmarkCount,
          recentActivity: [
            {
              type: 'created',
              collectionId: newCollection.id,
              collectionName: newCollection.name,
              timestamp: newCollection.createdAt
            },
            ...prev.recentActivity.slice(0, 9)
          ]
        } : null);
      }

      return newCollection;
    } catch (err) {
      setError('Failed to create collection');
      throw err;
    }
  }, [analytics]);

  const updateCollection = useCallback(async (id: string, updates: Partial<Collection>) => {
    try {
      // In a real app, this would be an API call
      setCollections(prev => prev.map(collection => 
        collection.id === id 
          ? { 
              ...collection, 
              ...updates, 
              updatedAt: new Date().toISOString(),
              stats: {
                ...collection.stats,
                lastActivity: new Date().toISOString()
              }
            }
          : collection
      ));

      // Update analytics
      if (analytics) {
        const collection = collections.find(c => c.id === id);
        if (collection) {
          setAnalytics(prev => prev ? {
            ...prev,
            recentActivity: [
              {
                type: 'updated',
                collectionId: id,
                collectionName: collection.name,
                timestamp: new Date().toISOString()
              },
              ...prev.recentActivity.slice(0, 9)
            ]
          } : null);
        }
      }
    } catch (err) {
      setError('Failed to update collection');
      throw err;
    }
  }, [collections, analytics]);

  const deleteCollection = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      const collection = collections.find(c => c.id === id);
      setCollections(prev => prev.filter(collection => collection.id !== id));

      // Update analytics
      if (analytics && collection) {
        setAnalytics(prev => prev ? {
          ...prev,
          totalCollections: prev.totalCollections - 1,
          totalBookmarks: prev.totalBookmarks - collection.stats.bookmarkCount
        } : null);
      }
    } catch (err) {
      setError('Failed to delete collection');
      throw err;
    }
  }, [collections, analytics]);

  const shareCollection = useCallback(async (id: string, permissions: any) => {
    try {
      // In a real app, this would be an API call
      const collection = collections.find(c => c.id === id);
      
      if (collection) {
        await updateCollection(id, {
          isPublic: permissions.isPublic,
          collaborators: permissions.collaborators || collection.collaborators
        });

        // Update analytics
        if (analytics) {
          setAnalytics(prev => prev ? {
            ...prev,
            recentActivity: [
              {
                type: 'shared',
                collectionId: id,
                collectionName: collection.name,
                timestamp: new Date().toISOString()
              },
              ...prev.recentActivity.slice(0, 9)
            ]
          } : null);
        }
      }
    } catch (err) {
      setError('Failed to share collection');
      throw err;
    }
  }, [collections, analytics, updateCollection]);

  const likeCollection = useCallback(async (id: string) => {
    try {
      // In a real app, this would be an API call
      setCollections(prev => prev.map(collection => 
        collection.id === id 
          ? { 
              ...collection, 
              stats: {
                ...collection.stats,
                likes: collection.stats.likes + 1
              }
            }
          : collection
      ));

      // Update analytics
      if (analytics) {
        const collection = collections.find(c => c.id === id);
        if (collection) {
          setAnalytics(prev => prev ? {
            ...prev,
            totalLikes: prev.totalLikes + 1,
            recentActivity: [
              {
                type: 'liked',
                collectionId: id,
                collectionName: collection.name,
                timestamp: new Date().toISOString()
              },
              ...prev.recentActivity.slice(0, 9)
            ]
          } : null);
        }
      }
    } catch (err) {
      setError('Failed to like collection');
      throw err;
    }
  }, [collections, analytics]);

  const addBookmarkToCollection = useCallback(async (collectionId: string, bookmarkId: string) => {
    try {
      // In a real app, this would be an API call
      setCollections(prev => prev.map(collection => 
        collection.id === collectionId 
          ? { 
              ...collection, 
              bookmarks: [...collection.bookmarks, bookmarkId],
              updatedAt: new Date().toISOString(),
              stats: {
                ...collection.stats,
                bookmarkCount: collection.stats.bookmarkCount + 1,
                lastActivity: new Date().toISOString()
              }
            }
          : collection
      ));

      // Update analytics
      if (analytics) {
        setAnalytics(prev => prev ? {
          ...prev,
          totalBookmarks: prev.totalBookmarks + 1
        } : null);
      }
    } catch (err) {
      setError('Failed to add bookmark to collection');
      throw err;
    }
  }, [analytics]);

  const removeBookmarkFromCollection = useCallback(async (collectionId: string, bookmarkId: string) => {
    try {
      // In a real app, this would be an API call
      setCollections(prev => prev.map(collection => 
        collection.id === collectionId 
          ? { 
              ...collection, 
              bookmarks: collection.bookmarks.filter(id => id !== bookmarkId),
              updatedAt: new Date().toISOString(),
              stats: {
                ...collection.stats,
                bookmarkCount: Math.max(0, collection.stats.bookmarkCount - 1),
                lastActivity: new Date().toISOString()
              }
            }
          : collection
      ));

      // Update analytics
      if (analytics) {
        setAnalytics(prev => prev ? {
          ...prev,
          totalBookmarks: Math.max(0, prev.totalBookmarks - 1)
        } : null);
      }
    } catch (err) {
      setError('Failed to remove bookmark from collection');
      throw err;
    }
  }, [analytics]);

  const getCollectionAnalytics = useCallback(async (collectionId?: string) => {
    try {
      if (collectionId) {
        // Return analytics for specific collection
        const collection = collections.find(c => c.id === collectionId);
        return collection ? {
          collection,
          detailedStats: {
            viewsOverTime: mockAnalytics.viewsOverTime,
            likesOverTime: mockAnalytics.viewsOverTime.map(v => ({ ...v, likes: Math.floor(v.views * 0.1) })),
            topBookmarks: collection.bookmarks.slice(0, 5).map((id, index) => ({
              id,
              title: `Bookmark ${index + 1}`,
              views: Math.floor(Math.random() * 100) + 10,
              clicks: Math.floor(Math.random() * 50) + 5
            }))
          }
        } : null;
      }
      
      // Return overall analytics
      return analytics;
    } catch (err) {
      console.error('Error getting analytics:', err);
      return null;
    }
  }, [collections, analytics]);

  return {
    // Data
    collections,
    templates,
    analytics,
    loading,
    error,

    // Actions
    createCollection,
    updateCollection,
    deleteCollection,
    shareCollection,
    likeCollection,
    addBookmarkToCollection,
    removeBookmarkFromCollection,
    getCollectionAnalytics,
    
    // Utility
    refresh: loadCollections
  };
}; 