'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import { Badge } from '../../src/components/ui/badge'
import { Plus, Search, Bookmark, BarChart3, Users, Calendar, ExternalLink } from 'lucide-react'

interface BookmarkItem {
  id: string
  title: string
  url: string
  description?: string
  category?: string
  created_at: string
  favicon?: string
}

interface AnalyticsData {
  totalBookmarks: number
  totalVisits: number
  totalTimeSpent: number
  weeklyStats: Array<{ date: string; visits: number }>
}

export default function DashboardSimple() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBookmarks: 0,
    totalVisits: 0,
    totalTimeSpent: 0,
    weeklyStats: []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load bookmarks
      const bookmarksRes = await fetch('/api/bookmarks', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json()
        setBookmarks(Array.isArray(bookmarksData) ? bookmarksData : [])
      }

      // Load analytics
      const analyticsRes = await fetch('/api/analytics/summary', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleBookmarkClick = (bookmark: BookmarkItem) => {
    window.open(bookmark.url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your bookmarks and view analytics</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBookmarks}</div>
              <p className="text-xs text-muted-foreground">
                {bookmarks.length} loaded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalVisits}</div>
              <p className="text-xs text-muted-foreground">
                Across all bookmarks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.totalTimeSpent / 60)}m</div>
              <p className="text-xs text-muted-foreground">
                Total reading time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(bookmarks.map(b => b.category).filter(Boolean)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.open('/bookmarks/add', '_blank')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Bookmark
            </Button>
            <Button 
              variant="outline"
              onClick={() => loadData()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <Card 
              key={bookmark.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleBookmarkClick(bookmark)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">{bookmark.title}</CardTitle>
                    {bookmark.category && (
                      <Badge variant="secondary" className="w-fit">
                        {bookmark.category}
                      </Badge>
                    )}
                  </div>
                  {bookmark.favicon && (
                    <div className="ml-2 flex-shrink-0">
                      <img 
                        src={bookmark.favicon} 
                        alt="Favicon" 
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {bookmark.description && (
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {bookmark.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm truncate flex-1">
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {new URL(bookmark.url).hostname}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBookmarks.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No bookmarks found' : 'No bookmarks yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? `Try adjusting your search term "${searchTerm}"`
                : 'Get started by adding your first bookmark'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => window.open('/bookmarks/add', '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Bookmark
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
