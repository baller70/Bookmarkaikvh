'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Heart, 
  ExternalLink, 
  Edit2, 
  Share2, 
  Trash2, 
  Eye, 
  Clock,
  Tag,
  Star,
  MoreHorizontal,
  Check,
  X,
  Copy,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSwipeActions, useTouchGestures } from '@/hooks/use-touch-gestures'
import { useDeviceInfo } from '@/hooks/use-mobile'

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

interface MobileBookmarkCardProps {
  bookmark: Bookmark
  onEdit?: (bookmark: Bookmark) => void
  onDelete?: (id: number) => void
  onToggleFavorite?: (id: number) => void
  onShare?: (bookmark: Bookmark) => void
  onVisit?: (bookmark: Bookmark) => void
  editingField?: string | null
  editingValue?: string | string[]
  onStartEditing?: (field: string, value: string | string[]) => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
  onEditValueChange?: (value: string | string[]) => void
  className?: string
}

export function MobileBookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare,
  onVisit,
  editingField,
  editingValue,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  className
}: MobileBookmarkCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const { isTouch } = useDeviceInfo()

  // Swipe actions for mobile
  const { isSwiping, swipeDirection, bindGestures } = useSwipeActions({
    onSwipeLeft: () => {
      if (onDelete) {
        onDelete(bookmark.id)
      }
    },
    onSwipeRight: () => {
      if (onToggleFavorite) {
        onToggleFavorite(bookmark.id)
      }
    }
  })

  // Long press for context menu
  const { touchState } = useTouchGestures({
    onLongPress: () => {
      setShowActions(!showActions)
    }
  })

  const handleQuickAction = (action: 'favorite' | 'share' | 'edit' | 'delete' | 'visit') => {
    switch (action) {
      case 'favorite':
        onToggleFavorite?.(bookmark.id)
        break
      case 'share':
        onShare?.(bookmark)
        break
      case 'edit':
        onEdit?.(bookmark)
        break
      case 'delete':
        onDelete?.(bookmark.id)
        break
      case 'visit':
        onVisit?.(bookmark)
        break
    }
    setShowActions(false)
  }

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  const getUsagePercentage = (visits?: number) => {
    if (!visits) return 0
    return Math.min((visits / 100) * 100, 100)
  }

  return (
    <div className="relative">
      {/* Swipe indicators */}
      {isSwiping && swipeDirection === 'left' && (
        <div className="absolute right-0 top-0 h-full w-16 bg-red-500 flex items-center justify-center rounded-r-mobile z-10">
          <Trash2 className="h-6 w-6 text-white" />
        </div>
      )}
      {isSwiping && swipeDirection === 'right' && (
        <div className="absolute left-0 top-0 h-full w-16 bg-blue-500 flex items-center justify-center rounded-l-mobile z-10">
          <Heart className="h-6 w-6 text-white" />
        </div>
      )}

      <Card 
        ref={cardRef}
        className={cn(
          "mobile-card group transition-all duration-200",
          isSwiping && "transform scale-[0.98]",
          touchState.isLongPressing && "shadow-lg",
          className
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
        {...(isTouch ? bindGestures(cardRef.current) : {})}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {/* Favicon */}
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={bookmark.favicon} alt="" />
              <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800">
                {bookmark.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Title and URL */}
            <div className="flex-1 min-w-0">
              {editingField === 'title' ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingValue as string}
                    onChange={(e) => onEditValueChange?.(e.target.value)}
                    className="mobile-input text-sm font-medium"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSaveEdit}
                    className="h-8 w-8 p-0 text-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCancelEdit}
                    className="h-8 w-8 p-0 text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <h3 
                  className="font-medium text-sm leading-tight mb-1 line-clamp-2 cursor-pointer"
                  onClick={() => onStartEditing?.('title', bookmark.title)}
                >
                  {bookmark.title}
                </h3>
              )}
              
              <p className="text-xs text-slate-500 truncate">
                {extractDomain(bookmark.url)}
              </p>
            </div>

            {/* Quick actions toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          {bookmark.description && (
            <div className="mb-3">
              {editingField === 'description' ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingValue as string}
                    onChange={(e) => onEditValueChange?.(e.target.value)}
                    className="mobile-input text-sm resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onSaveEdit}
                      className="text-green-600"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onCancelEdit}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p 
                  className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 cursor-pointer"
                  onClick={() => onStartEditing?.('description', bookmark.description || '')}
                >
                  {bookmark.description}
                </p>
              )}
            </div>
          )}

          {/* Tags and Category */}
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-xs">
              {bookmark.category}
            </Badge>
            {bookmark.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {bookmark.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{bookmark.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              {bookmark.visits && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{bookmark.visits}</span>
                </div>
              )}
              {bookmark.last_visited && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(bookmark.last_visited).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            {bookmark.is_favorite && (
              <Heart className="h-4 w-4 text-red-500 fill-current" />
            )}
          </div>

          {/* Quick Actions Panel */}
          {showActions && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction('visit')}
                  className="h-12 flex-col gap-1 text-xs"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction('favorite')}
                  className="h-12 flex-col gap-1 text-xs"
                >
                  <Heart className={cn("h-4 w-4", bookmark.is_favorite && "text-red-500 fill-current")} />
                  {bookmark.is_favorite ? 'Unfav' : 'Favorite'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction('share')}
                  className="h-12 flex-col gap-1 text-xs"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction('edit')}
                  className="h-12 flex-col gap-1 text-xs"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Swipe instruction overlay */}
      {isTouch && !isSwiping && (
        <div className="absolute bottom-2 right-2 text-xs text-slate-400 opacity-50">
          Swipe ← → for actions
        </div>
      )}
    </div>
  )
}

// Compact mobile bookmark card for list view
export function MobileCompactBookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare,
  onVisit,
  className
}: Omit<MobileBookmarkCardProps, 'editingField' | 'editingValue' | 'onStartEditing' | 'onSaveEdit' | 'onCancelEdit' | 'onEditValueChange'>) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { isTouch } = useDeviceInfo()

  const { isSwiping, swipeDirection, bindGestures } = useSwipeActions({
    onSwipeLeft: () => onDelete?.(bookmark.id),
    onSwipeRight: () => onToggleFavorite?.(bookmark.id)
  })

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <div className="relative">
      {/* Swipe indicators */}
      {isSwiping && swipeDirection === 'left' && (
        <div className="absolute right-0 top-0 h-full w-12 bg-red-500 flex items-center justify-center rounded-r-mobile z-10">
          <Trash2 className="h-4 w-4 text-white" />
        </div>
      )}
      {isSwiping && swipeDirection === 'right' && (
        <div className="absolute left-0 top-0 h-full w-12 bg-blue-500 flex items-center justify-center rounded-l-mobile z-10">
          <Heart className="h-4 w-4 text-white" />
        </div>
      )}

      <div
        ref={cardRef}
        className={cn(
          "mobile-list-item mobile-touch-feedback",
          isSwiping && "transform scale-[0.98]",
          className
        )}
        onClick={() => onVisit?.(bookmark)}
        {...(isTouch ? bindGestures(cardRef.current) : {})}
      >
        {/* Favicon */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={bookmark.favicon} alt="" />
          <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800">
            {bookmark.title.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{bookmark.title}</h3>
            {bookmark.is_favorite && (
              <Heart className="h-3 w-3 text-red-500 fill-current flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="truncate">{extractDomain(bookmark.url)}</span>
            {bookmark.visits && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{bookmark.visits}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick action */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onShare?.(bookmark)
          }}
          className="h-8 w-8 p-0 opacity-60 hover:opacity-100 flex-shrink-0"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 