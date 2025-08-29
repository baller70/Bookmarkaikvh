'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Category {
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

export interface CategoryAnalytics {
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
  weeklyTrend: number[];
  monthlyTrend: number[];
}

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  parent_id: string;
  is_ai_suggested: boolean;
  ai_confidence: number;
}

export interface CategoryFilters {
  search: string;
  parentId?: string;
  isAiSuggested?: boolean;
  hasBookmarks?: boolean;
  sortBy: 'name' | 'bookmark_count' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

export interface CategoryStats {
  totalCategories: number;
  totalBookmarks: number;
  averageBookmarksPerCategory: number;
  aiSuggestedCount: number;
  hierarchyDepth: number;
  mostPopularCategory: string;
  leastUsedCategory: string;
  categoryGrowthRate: number;
}

export function useCategories(userId: string = 'dev-user-123') {
  const [categories, setCategories] = useState<Category[]>([]);
  const [analytics, setAnalytics] = useState<CategoryAnalytics[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories from API
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/categories?user_id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to load categories');
      }
      
      const data = await response.json();
      const flatCategories = data.categories || [];
      const hierarchicalCategories = buildCategoryTree(flatCategories);
      
      setCategories(hierarchicalCategories);
      
      // Calculate stats
      const categoryStats = calculateCategoryStats(flatCategories);
      setStats(categoryStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      // In real implementation, this would fetch from analytics API
      // For now, we'll generate mock data based on categories
      const mockAnalytics = generateMockAnalytics(categories);
      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  }, [categories]);

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

  // Calculate category statistics
  const calculateCategoryStats = (flatCategories: Category[]): CategoryStats => {
    const totalCategories = flatCategories.length;
    const totalBookmarks = flatCategories.reduce((sum, cat) => sum + cat.bookmark_count, 0);
    const averageBookmarksPerCategory = totalCategories > 0 ? totalBookmarks / totalCategories : 0;
    const aiSuggestedCount = flatCategories.filter(cat => cat.is_ai_suggested).length;
    
    // Calculate hierarchy depth
    const calculateDepth = (categories: Category[], currentDepth = 0): number => {
      let maxDepth = currentDepth;
      categories.forEach(category => {
        if (category.children && category.children.length > 0) {
          const childDepth = calculateDepth(category.children, currentDepth + 1);
          maxDepth = Math.max(maxDepth, childDepth);
        }
      });
      return maxDepth;
    };
    
    const hierarchyDepth = calculateDepth(buildCategoryTree(flatCategories));
    
    // Find most and least popular categories
    const sortedByBookmarks = [...flatCategories].sort((a, b) => b.bookmark_count - a.bookmark_count);
    const mostPopularCategory = sortedByBookmarks[0]?.name || '';
    const leastUsedCategory = sortedByBookmarks[sortedByBookmarks.length - 1]?.name || '';
    
    // Mock growth rate calculation
    const categoryGrowthRate = Math.random() * 20 - 5; // -5% to +15%
    
    return {
      totalCategories,
      totalBookmarks,
      averageBookmarksPerCategory,
      aiSuggestedCount,
      hierarchyDepth,
      mostPopularCategory,
      leastUsedCategory,
      categoryGrowthRate
    };
  };

  // Generate mock analytics data
  const generateMockAnalytics = (categories: Category[]): CategoryAnalytics[] => {
    const flatCategories = flattenCategories(categories);
    
    return flatCategories.map(category => ({
      id: category.id,
      name: category.name,
      bookmarkCount: category.bookmark_count,
      totalVisits: Math.floor(Math.random() * 1000) + 100,
      averageTimeSpent: Math.floor(Math.random() * 200) + 50,
      lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      growthRate: (Math.random() - 0.5) * 40, // -20% to +20%
      efficiency: Math.floor(Math.random() * 30) + 70, // 70% to 100%
      popularityScore: Math.floor(Math.random() * 30) + 70, // 70 to 100
      aiAccuracy: category.is_ai_suggested ? Math.floor(Math.random() * 20) + 80 : undefined, // 80% to 100%
      weeklyTrend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10),
      monthlyTrend: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 10)
    }));
  };

  // Flatten category tree for analytics
  const flattenCategories = (categories: Category[]): Category[] => {
    const flattened: Category[] = [];
    
    const flatten = (cats: Category[]) => {
      cats.forEach(cat => {
        flattened.push(cat);
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children);
        }
      });
    };
    
    flatten(categories);
    return flattened;
  };

  // Create new category
  const createCategory = async (categoryData: Omit<CategoryFormData, 'parent_id'> & { parent_id?: string }): Promise<Category | null> => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryData,
          user_id: userId,
          parent_id: categoryData.parent_id || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      const data = await response.json();
      await loadCategories(); // Reload to get updated tree
      return data.category;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      return null;
    }
  };

  // Update category
  const updateCategory = async (categoryId: string, updates: Partial<CategoryFormData>): Promise<Category | null> => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category');
      }

      const data = await response.json();
      await loadCategories(); // Reload to get updated tree
      return data.category;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      return null;
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/${categoryId}?user_id=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      await loadCategories(); // Reload to get updated tree
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      return false;
    }
  };

  // Move category (for drag and drop)
  const moveCategory = async (categoryId: string, newParentId: string | null, newOrder: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: newParentId,
          order: newOrder
        })
      });

      if (!response.ok) {
        throw new Error('Failed to move category');
      }

      await loadCategories(); // Reload to get updated tree
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move category');
      return false;
    }
  };

  // Filter categories
  const filterCategories = (filters: Partial<CategoryFilters>): Category[] => {
    let filtered = flattenCategories(categories);

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchLower) ||
        (cat.description && cat.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply parent filter
    if (filters.parentId !== undefined) {
      filtered = filtered.filter(cat => cat.parent_id === filters.parentId);
    }

    // Apply AI suggested filter
    if (filters.isAiSuggested !== undefined) {
      filtered = filtered.filter(cat => cat.is_ai_suggested === filters.isAiSuggested);
    }

    // Apply has bookmarks filter
    if (filters.hasBookmarks !== undefined) {
      if (filters.hasBookmarks) {
        filtered = filtered.filter(cat => cat.bookmark_count > 0);
      } else {
        filtered = filtered.filter(cat => cat.bookmark_count === 0);
      }
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal: any = a[filters.sortBy!];
        let bVal: any = b[filters.sortBy!];

        if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        if (filters.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }

    return buildCategoryTree(filtered);
  };

  // Get category by ID
  const getCategoryById = (categoryId: string): Category | null => {
    const flatCategories = flattenCategories(categories);
    return flatCategories.find(cat => cat.id === categoryId) || null;
  };

  // Get category path (breadcrumb)
  const getCategoryPath = (categoryId: string): Category[] => {
    const path: Category[] = [];
    const flatCategories = flattenCategories(categories);
    
    let current = flatCategories.find(cat => cat.id === categoryId);
    while (current) {
      path.unshift(current);
      current = current.parent_id ? flatCategories.find(cat => cat.id === current!.parent_id) : null;
    }
    
    return path;
  };

  // Get category analytics by ID
  const getCategoryAnalytics = (categoryId: string): CategoryAnalytics | null => {
    return analytics.find(a => a.id === categoryId) || null;
  };

  // Load initial data
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Load analytics when categories change
  useEffect(() => {
    if (categories.length > 0) {
      loadAnalytics();
    }
  }, [loadAnalytics]);

  return {
    // Data
    categories,
    analytics,
    stats,
    
    // State
    isLoading,
    error,
    
    // Actions
    loadCategories,
    loadAnalytics,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    
    // Utilities
    filterCategories,
    getCategoryById,
    getCategoryPath,
    getCategoryAnalytics,
    flattenCategories: () => flattenCategories(categories),
    
    // Clear error
    clearError: () => setError(null)
  };
} 