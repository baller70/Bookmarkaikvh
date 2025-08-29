'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Star,
  Heart,
  Download,
  Upload,
  Eye,
  TrendingUp,
  RefreshCw,
  Share2,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  BarChart,
  Bar
} from 'recharts'

interface Playbook {
  id: string
  title: string
  description: string
  category: string
  price: number
  rating: number
  reviews: number
  downloads: number
  author: string
  authorAvatar: string
  bookmarkCount: number
  tags: string[]
  featured: boolean
  premium: boolean
  previewBookmarks: string[]
  avatarImage?: string
}

interface UserPlaybook {
  id: string
  title: string
  description: string
  bookmarkCount: number
  category: string
  isPublic: boolean
  price?: number
  earnings?: number
  avatarImage?: string
}

const featuredPlaybooks: Playbook[] = [
  {
    id: '1',
    title: 'Ultimate Web Development Resources',
    description: 'Comprehensive collection of tools, tutorials, and frameworks for modern web development',
    category: 'Development',
    price: 29.99,
    rating: 4.9,
    reviews: 156,
    downloads: 2341,
    author: 'DevMaster Pro',
    authorAvatar: 'DM',
    bookmarkCount: 127,
    tags: ['React', 'JavaScript', 'CSS', 'Tools'],
    featured: true,
    premium: true,
    previewBookmarks: ['React Documentation', 'CSS Grid Guide', 'JavaScript ES6 Features'],
    avatarImage: 'https://example.com/dm.jpg'
  },
  {
    id: '2',
    title: 'AI & Machine Learning Essentials',
    description: 'Curated resources for learning and implementing AI/ML solutions',
    category: 'AI/ML',
    price: 39.99,
    rating: 4.8,
    reviews: 89,
    downloads: 1567,
    author: 'AI Researcher',
    authorAvatar: 'AR',
    bookmarkCount: 94,
    tags: ['TensorFlow', 'PyTorch', 'Datasets', 'Papers'],
    featured: true,
    premium: true,
    previewBookmarks: ['TensorFlow Tutorials', 'Kaggle Datasets', 'ArXiv Papers'],
    avatarImage: 'https://example.com/ar.jpg'
  },
  {
    id: '3',
    title: 'Design System Inspiration',
    description: 'Beautiful design systems and UI/UX resources from top companies',
    category: 'Design',
    price: 19.99,
    rating: 4.7,
    reviews: 203,
    downloads: 3421,
    author: 'DesignGuru',
    authorAvatar: 'DG',
    bookmarkCount: 78,
    tags: ['UI/UX', 'Figma', 'Components', 'Inspiration'],
    featured: false,
    premium: false,
    previewBookmarks: ['Material Design', 'Apple HIG', 'Atlassian Design'],
    avatarImage: 'https://example.com/dg.jpg'
  }
]

const userPlaybooks: UserPlaybook[] = [
  {
    id: '1',
    title: 'My Development Tools',
    description: 'Personal collection of development utilities',
    bookmarkCount: 45,
    category: 'Development',
    isPublic: false,
    earnings: 0,
    avatarImage: 'https://example.com/dm.jpg'
  },
  {
    id: '2',
    title: 'Marketing Resources Hub',
    description: 'Essential marketing tools and guides',
    bookmarkCount: 32,
    category: 'Marketing',
    isPublic: true,
    price: 15.99,
    earnings: 127.93,
    avatarImage: 'https://example.com/ar.jpg'
  }
]

const categories = ['All', 'Development', 'Design', 'Marketing', 'AI/ML', 'Business', 'Education']

function MarketplaceCard({
  id,
  avatar,
  avatarImage,
  title,
  author,
  description,
  previewBookmarks = [],
  downloads,
  rating,
  bookmarkCount,
  tags = [],
  price,
  onBuy,
  onFavorite,
  isFavorite,
}) {
  // Helper function to limit description to 25 words
  const limitDescription = (text: string, maxWords: number = 25) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer group" style={{ boxShadow: '0 2px 12px 0 rgba(16,30,54,0.04)', minHeight: '480px', maxHeight: '480px' }}>
      <Link href={`/marketplace/${id}`} className="flex-1 flex flex-col">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
            {avatarImage ? (
              <img src={avatarImage} alt="Avatar" className="object-cover w-full h-full" />
            ) : (
              avatar
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold leading-tight text-black group-hover:text-blue-600 transition-colors break-words" style={{letterSpacing: '-0.02em'}}>{title}</span>
            </div>
            <div className="text-base text-gray-500 font-medium leading-tight truncate">by {author}</div>
          </div>
        </div>
        <div className="mt-2 text-base text-gray-500 font-normal leading-snug line-clamp-2" style={{maxHeight: '48px', overflow: 'hidden'}}>
          {limitDescription(description)}
        </div>
        <div className="mt-3">
          <div className="font-bold text-base text-gray-900 mb-1">Preview:</div>
          <ul className="space-y-1">
            {previewBookmarks.slice(0, 5).map((bookmark, i) => (
              <li key={i} className="flex items-center gap-2 text-base text-blue-900 truncate" style={{maxWidth: '220px'}}>
                <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                {bookmark.length > 32 ? bookmark.slice(0, 29) + '...' : bookmark}
              </li>
            ))}
            {previewBookmarks.length > 5 && (
              <li className="text-sm text-gray-500 italic">
                +{previewBookmarks.length - 5} more bookmarks
              </li>
            )}
          </ul>
        </div>
        <div className="flex items-center gap-4 mt-3 text-base text-gray-700">
          <span className="flex items-center gap-2">
            <span className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100">
              <Eye className="h-4 w-4 text-gray-400" />
            </span>
            {downloads}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-7 w-7 flex items-center justify-center rounded-full bg-yellow-100">
              <Star className="h-4 w-4 text-yellow-400" />
            </span>
            {rating}
          </span>
          <span className="text-base text-gray-700">{Math.min(bookmarkCount, 5)} bookmarks</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-gray-100 rounded-full px-3 py-1 text-base font-bold text-gray-900 truncate" style={{maxWidth: '90px'}}>
              {tag.length > 12 ? tag.slice(0, 10) + '...' : tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="bg-gray-100 rounded-full px-3 py-1 text-base font-bold text-gray-900 truncate" style={{maxWidth: '90px'}}>
              +{tags.length - 3}
            </span>
          )}
        </div>
        <div className="flex-1" />
      </Link>
      <div className="border-t border-gray-200 mt-4 pt-3 flex items-center gap-2 justify-end">
        <span className="text-2xl font-extrabold text-green-600 mr-auto">${price}</span>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onFavorite()
          }}
          className="rounded-lg border border-gray-200 bg-white h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onBuy()
          }}
          className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold flex items-center gap-2 px-5 h-10 shadow-none hover:from-blue-600 hover:to-purple-600 transition"
        >
          <ShoppingCart className="h-5 w-5" />
          Buy Now
        </button>
      </div>
    </div>
  )
}

function BookmarkMarketplace() {
  const [activeTab, setActiveTab] = useState('browse')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaybook, setNewPlaybook] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    tags: ''
  })
  const [purchases, setPurchases] = useState<any[] | null>(null)
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false)

  const filteredPlaybooks = featuredPlaybooks.filter(playbook => {
    const matchesCategory = selectedCategory === 'All' || playbook.category === selectedCategory
    const matchesSearch = playbook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playbook.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playbook.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handlePurchase = (playbook: Playbook) => {
    toast.success(`Successfully purchased "${playbook.title}" for $${playbook.price}!`)
  }

  const handleCreatePlaybook = () => {
    if (!newPlaybook.title || !newPlaybook.description || !newPlaybook.category) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Playbook created successfully!')
    setShowCreateModal(false)
    setNewPlaybook({ title: '', description: '', category: '', price: 0, tags: '' })
  }

  const renderBrowseTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search playbooks, tags, or authors..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Featured Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured Playbooks</h2>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredPlaybooks.map(playbook => (
            <MarketplaceCard
              key={playbook.id}
              id={playbook.id}
              avatar={playbook.authorAvatar}
              avatarImage={playbook.avatarImage}
              title={playbook.title}
              author={playbook.author}
              description={playbook.description}
              previewBookmarks={playbook.previewBookmarks}
              downloads={playbook.downloads}
              rating={playbook.rating}
              bookmarkCount={playbook.bookmarkCount}
              tags={playbook.tags}
              price={playbook.price}
              onBuy={() => handlePurchase(playbook)}
              onFavorite={() => {}}
              isFavorite={false}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const renderMyPlaybooksTab = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {userPlaybooks.map(playbook => (
        <MarketplaceCard
          key={playbook.id}
          id={playbook.id}
          avatar={playbook.title.slice(0, 2).toUpperCase()}
          avatarImage={playbook.avatarImage}
          title={playbook.title}
          author="You"
          description={playbook.description}
          previewBookmarks={[]}
          downloads={playbook.bookmarkCount}
          rating={0}
          bookmarkCount={playbook.bookmarkCount}
          tags={[playbook.category]}
          price={playbook.price ?? 0}
          onBuy={() => {}}
          onFavorite={() => {}}
          isFavorite={false}
        />
      ))}
    </div>
  )

  const renderPurchasedTab = () => {
    const fetchPurchases = async () => {
      try {
        setIsLoadingPurchases(true)
        const res = await fetch('/api/marketplace/orders?page=1&limit=20')
        if (!res.ok) throw new Error('Failed to load purchases')
        const json = await res.json()
        setPurchases(json.data || [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to load purchases')
        setPurchases([])
      } finally {
        setIsLoadingPurchases(false)
      }
    }

    if (purchases === null && !isLoadingPurchases) {
      fetchPurchases()
    }

    if (isLoadingPurchases || purchases === null) {
      return (
        <div className="py-12">
          <div className="h-24 w-full rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-24 w-full rounded-lg bg-gray-100 animate-pulse mt-4" />
          <div className="h-24 w-full rounded-lg bg-gray-100 animate-pulse mt-4" />
        </div>
      )
    }

    if (purchases.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No purchases yet</h3>
          <p className="text-gray-500 mb-4">Browse the marketplace to find amazing playbook collections</p>
          <Button onClick={() => setActiveTab('browse')}>
            Browse Marketplace
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {purchases.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-sm font-bold">
                  {order.listing?.title?.slice(0,2) || 'PB'}
                </div>
                <div>
                  <div className="font-semibold">{order.listing?.title || `Listing #${order.listingId}`}</div>
                  <div className="text-xs text-gray-500">Order #{order.id} • {(order.createdAt ? new Date(order.createdAt) : new Date()).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/marketplace/${order.listingId}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
                <Button size="sm" onClick={() => toast.success('Starting download...')}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderAnalyticsTab = () => (
    <MarketplaceAnalytics />
  )

  const renderAchievementsTab = () => (
    <div className="text-center py-12">
      <Star className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-600 mb-2">Achievements coming soon</h3>
      <p className="text-gray-500 mb-4">You will be able to view your marketplace achievements here</p>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header: 1:1 copy of settings page header */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-6">
        {/* Back to Dashboard */}
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        {/* Vertical Divider */}
        <span className="h-6 border-l border-gray-200" />
        {/* Title and Icon */}
        <span className="flex items-center gap-2">
          <ShoppingCart className="h-7 w-7 text-gray-700" />
          <span className="text-2xl font-bold">Marketplace</span>
        </span>
      </div>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bookmark Marketplace</h1>
            <p className="text-gray-600">Discover, buy, and sell curated playbook collections</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white p-1 rounded-lg mb-8 shadow-sm">
            {[
              { id: 'browse', label: 'Browse', icon: Search },
              { id: 'my-playbooks', label: 'My Playbooks', icon: Upload },
              { id: 'purchased', label: 'Purchased', icon: Download },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'achievements', label: 'Achievements', icon: Star }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
          
          {/* Tab Content */}
          {activeTab === 'browse' && renderBrowseTab()}
          {activeTab === 'my-playbooks' && renderMyPlaybooksTab()}
          {activeTab === 'purchased' && renderPurchasedTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'achievements' && renderAchievementsTab()}
          
          {/* Create Playbook Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Create New Playbook</CardTitle>
                  <CardDescription>Create a new bookmark collection to share or sell</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title *</label>
                    <Input
                      placeholder="Enter playbook title"
                      value={newPlaybook.title}
                      onChange={(e) => setNewPlaybook({...newPlaybook, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description *</label>
                    <Textarea
                      placeholder="Describe your playbook"
                      value={newPlaybook.description}
                      onChange={(e) => setNewPlaybook({...newPlaybook, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category *</label>
                    <Select value={newPlaybook.category} onValueChange={(value) => setNewPlaybook({...newPlaybook, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <Input
                      placeholder="Enter tags separated by commas"
                      value={newPlaybook.tags}
                      onChange={(e) => setNewPlaybook({...newPlaybook, tags: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePlaybook}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      Create
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

<<<<<<< Current (Your changes)
<<<<<<< Current (Your changes)
<<<<<<< Current (Your changes)
<<<<<<< Current (Your changes)
<<<<<<< Current (Your changes)
export default function MarketplacePage() {
  return (
    <BookmarkMarketplace />
  )
}


function MarketplaceAnalytics() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [data, setData] = useState<any | null>(null)

  const fetchAnalytics = useCallback(async (range: '7d' | '30d' | '90d') => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/collections/analytics?time_range=${range}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch analytics: ${res.status}`)
      }
      const json = await res.json()
      setData(json.analytics ?? null)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics(timeRange)
  }, [fetchAnalytics, timeRange])

  const viewsSeries = useMemo(() => {
    return (data?.viewsOverTime ?? []).map((d: any) => ({
      date: d.date,
      views: d.views,
      likes: d.likes,
      collections: d.collections
    }))
  }, [data])

  const topCollections = useMemo(() => {
    return data?.topCollections ?? []
  }, [data])

  const handleRefresh = () => fetchAnalytics(timeRange)

  const exportCsv = () => {
    const rows = [['date', 'views', 'likes', 'collections']]
    viewsSeries.forEach((r: any) => rows.push([r.date, r.views, r.likes, r.collections]))
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `marketplace-analytics-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareReport = async () => {
    try {
      const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
      if ((navigator as any).share) {
        await (navigator as any).share({
          title: 'Marketplace Analytics',
          text: 'Checkout my marketplace analytics',
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
      }
      // optional toast if available
      try { toast.success('Share link ready') } catch {}
    } catch (e) {
      console.error(e)
      try { toast.error('Unable to share') } catch {}
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleRefresh} disabled={isLoading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={isLoading} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={shareReport} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Total Collections</div>
            <div className="text-2xl font-bold">{data?.totalCollections ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Total Bookmarks</div>
            <div className="text-2xl font-bold">{data?.totalBookmarks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Total Views</div>
            <div className="text-2xl font-bold">{data?.totalViews ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-500">Engagement Rate</div>
            <div className="text-2xl font-bold">{data?.engagementMetrics?.engagementRate != null ? `${data.engagementMetrics.engagementRate}%` : '0%'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Views over time</CardTitle>
          <CardDescription>Traffic trends for your collections</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={viewsSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" fillOpacity={1} fill="url(#colorViews)" />
              <Line type="monotone" dataKey="likes" stroke="#22c55e" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Collections */}
      <Card>
        <CardHeader>
          <CardTitle>Top Collections</CardTitle>
          <CardDescription>Best performing collections by views</CardDescription>
        </CardHeader>
        <CardContent>
          {topCollections.length === 0 ? (
            <p className="text-gray-500">No data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Views</th>
                    <th className="py-2 pr-4">Likes</th>
                    <th className="py-2 pr-4">Bookmarks</th>
                    <th className="py-2 pr-4">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {topCollections.map((c: any) => (
                    <tr key={c.id} className="border-t">
                      <td className="py-2 pr-4">{c.name}</td>
                      <td className="py-2 pr-4">{c.views}</td>
                      <td className="py-2 pr-4">{c.likes}</td>
                      <td className="py-2 pr-4">{c.bookmarks}</td>
                      <td className="py-2 pr-4">{c.growth}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
=======
export default BookmarkMarketplace
>>>>>>> Incoming (Background Agent changes)
=======
export default BookmarkMarketplace
>>>>>>> Incoming (Background Agent changes)
=======
export default BookmarkMarketplace
>>>>>>> Incoming (Background Agent changes)
=======
export default BookmarkMarketplace
>>>>>>> Incoming (Background Agent changes)
=======
export default BookmarkMarketplace
>>>>>>> Incoming (Background Agent changes)

