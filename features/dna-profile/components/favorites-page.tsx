'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardContent } from '@bookaimark/ui';
import { 
  Heart, 
  ArrowLeft,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DnaPageHeader } from './dna-page-header';

interface MockBookmark {
  id: string;
  title: string;
  url: string;
  is_favorite: boolean;
}

const EmptyFavoritesState = React.memo(({ onNavigateToDashboard }: { onNavigateToDashboard: () => void }) => (
  <div className="text-center py-16 px-4">
    <div className="max-w-md mx-auto">
      <div className="relative mb-8">
        <Heart className="h-24 w-24 text-gray-200 dark:text-gray-700 mx-auto" />
        <Star className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        No Favorites Yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
        Start building your collection of favorite bookmarks. 
        Click the heart icon on any bookmark to add it here.
      </p>
      <div className="space-y-3">
        <Button onClick={onNavigateToDashboard} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Browse Bookmarks
        </Button>
      </div>
    </div>
  </div>
));

EmptyFavoritesState.displayName = 'EmptyFavoritesState';

export function FavoritesPage({ userId }: { userId: string }) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<MockBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from /api/favorites
      // Simulating empty response
      setBookmarks([]);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-center p-8">
        <p>Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DnaPageHeader 
        title="Favorites"
        description="Your most loved bookmarks"
      />
      <main className="p-4 sm:p-6">
        {bookmarks.length === 0 ? (
          <EmptyFavoritesState onNavigateToDashboard={() => router.push('/dashboard')} />
        ) : (
          <div>
            {/* This part will render when there are actual favorites */}
          </div>
        )}
      </main>
    </div>
  );
} 