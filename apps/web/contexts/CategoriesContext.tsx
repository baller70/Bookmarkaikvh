'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  bookmarkCount: number;
  // to match the dashboard component
  createdAt?: string;
  updatedAt?: string;
}

interface CategoriesContextType {
  categories: Category[];
  isLoading: boolean;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    console.log('✅✅✅ [CategoriesContext] Fetching categories...');
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.success && data.categories) {
        console.log(`✅✅✅ [CategoriesContext] Successfully fetched ${data.categories.length} categories.`);
        setCategories(data.categories);
      } else {
        console.error('🛑🛑🛑 [CategoriesContext] Failed to fetch categories:', data.error);
        toast({
          title: "Error Loading Categories",
          description: data.error || "Could not load categories from the server.",
          variant: "destructive",
        });
        setCategories([]);
      }
    } catch (error) {
      console.error('🛑🛑🛑 [CategoriesContext] CRITICAL: Exception while fetching categories:', error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server to get categories.",
        variant: "destructive",
      });
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoriesContext.Provider value={{ categories, isLoading, refreshCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
