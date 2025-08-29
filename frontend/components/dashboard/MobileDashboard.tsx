'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3, 
  List, 
  Menu,
  Bell,
  Settings,
  RefreshCw,
  ChevronDown,
  Mic,
  Camera,
  QrCode
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePullToRefresh } from '@/hooks/use-touch-gestures'
import { useDeviceInfo } from '@/hooks/use-mobile'
import { MobileBookmarkCard, MobileCompactBookmarkCard } from './MobileBookmarkCard'

interface Bookmark {
  id: number
  title: string
  url: string
  description?: string
  category: string
  tags: string[]
  notes?: string
  ai_summary?: string
  ai_tags?: string[]
  ai_category?: string
  favicon?: string
  priority?: string
  site_health?: string
  is_favorite?: boolean
  visits?: number
  last_visited?: string
  created_at?: string
}

interface MobileDashboardProps {
  bookmarks: Bookmark[]
  onRefresh: () => Promise<void>
  onAddBookmark: () => void
  onEditBookmark: (bookmark: Bookmark) => void
  onDeleteBookmark: (id: number) => void
  onToggleFavorite: (id: number) => void
  onShareBookmark: (bookmark: Bookmark) => void
  onVisitBookmark: (bookmark: Bookmark) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  isLoading?: boolean
}

export function MobileDashboard({
  bookmarks,
  onRefresh,
  onAddBookmark,
  onEditBookmark,
  onDeleteBookmark,
  onToggleFavorite,
  onShareBookmark,
  onVisitBookmark,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedCategory,
  onCategoryChange,
  isLoading = false
}: MobileDashboardProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<{
    id: number
    field: string
    value: string | string[]
  } | null>(null)
  
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { isMobile, isTouch, orientation } = useDeviceInfo()

  // Pull to refresh functionality
  const { isRefreshing, pullDistance, isPulling, bindGestures } = usePullToRefresh(onRefresh)

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(bookmarks.map(b => b.category)))]

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || bookmark.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleStartEditing = (bookmarkId: number, field: string, value: string | string[]) => {
    setEditingBookmark({ id: bookmarkId, field, value })
  }

  const handleSaveEdit = async () => {
    if (!editingBookmark) return
    
    const bookmark = bookmarks.find(b => b.id === editingBookmark.id)
    if (!bookmark) return

    const updatedBookmark = {
      ...bookmark,
      [editingBookmark.field]: editingBookmark.value
    }
    
    await onEditBookmark(updatedBookmark)
    setEditingBookmark(null)
  }

  const handleCancelEdit = () => {
    setEditingBookmark(null)
  }

  const handleEditValueChange = (value: string | string[]) => {
    if (!editingBookmark) return
    setEditingBookmark({ ...editingBookmark, value })
  }

  return (
    <div 
      ref={dashboardRef}
      className="mobile-full-height mobile-scroll-area bg-slate-50 dark:bg-slate-900"
      {...(isTouch ? bindGestures(dashboardRef.current) : {})}
    >
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div 
          className="mobile-pull-refresh active flex items-center gap-2 text-sm text-slate-600"
          style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? 'Refreshing...' : 'Release to refresh'}
        </div>
      )}

      {/* Mobile Header */}
      <header className="mobile-header sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="mobile-title">BookAI Mark</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="h-9 w-9 p-0"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-6">
                  <h2 className="text-lg font-semibold mb-4">Menu</h2>
                  {/* Menu content */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search bookmarks..."
              className="mobile-input pl-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="Voice search"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="QR scan"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto mobile-scroll">
            {/* Category filters */}
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className="whitespace-nowrap flex-shrink-0"
              >
                {category}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Badge variant="secondary" className="text-xs">
            {filteredBookmarks.length} bookmarks
          </Badge>
        </div>
      </header>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 animate-slide-down">
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={onAddBookmark}
              className="h-16 flex-col gap-1 text-xs"
            >
              <Plus className="h-5 w-5" />
              Add
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 text-xs"
            >
              <Camera className="h-5 w-5" />
              Scan
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 text-xs"
            >
              <Mic className="h-5 w-5" />
              Voice
            </Button>
            <Button
              variant="outline"
              className="h-16 flex-col gap-1 text-xs"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="mobile-card animate-pulse">
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mobile-subtitle mb-2">No bookmarks found</h3>
            <p className="mobile-body text-slate-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first bookmark'}
            </p>
            <Button onClick={onAddBookmark} className="mobile-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' ? 'mobile-grid' : 'mobile-list'
          )}>
            {filteredBookmarks.map((bookmark) => (
              viewMode === 'grid' ? (
                <MobileBookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={onEditBookmark}
                  onDelete={onDeleteBookmark}
                  onToggleFavorite={onToggleFavorite}
                  onShare={onShareBookmark}
                  onVisit={onVisitBookmark}
                  editingField={editingBookmark?.id === bookmark.id ? editingBookmark.field : null}
                  editingValue={editingBookmark?.id === bookmark.id ? editingBookmark.value : undefined}
                  onStartEditing={(field, value) => handleStartEditing(bookmark.id, field, value)}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onEditValueChange={handleEditValueChange}
                />
              ) : (
                <MobileCompactBookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={onEditBookmark}
                  onDelete={onDeleteBookmark}
                  onToggleFavorite={onToggleFavorite}
                  onShare={onShareBookmark}
                  onVisit={onVisitBookmark}
                />
              )
            ))}
          </div>
        )}
      </main>

      {/* Mobile FAB (Floating Action Button) */}
      <Button
        onClick={onAddBookmark}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 mobile-button"
        size="sm"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Mobile Navigation (if needed) */}
      {orientation === 'portrait' && (
        <nav className="mobile-nav sticky bottom-0 z-40">
          <div className="flex items-center justify-around py-2">
            <Button variant="ghost" size="sm" className="flex-col gap-1 text-xs">
              <Grid3X3 className="h-5 w-5" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="flex-col gap-1 text-xs">
              <Search className="h-5 w-5" />
              Search
            </Button>
            <Button variant="ghost" size="sm" className="flex-col gap-1 text-xs">
              <Plus className="h-5 w-5" />
              Add
            </Button>
            <Button variant="ghost" size="sm" className="flex-col gap-1 text-xs">
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </div>
        </nav>
      )}
    </div>
  )
} 