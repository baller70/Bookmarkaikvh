'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Sparkles,
  Brain,
  Lightbulb,
  Target,
  Zap,
  History,
  Bookmark,
  Globe,
  Calendar,
  TrendingUp,
  Filter,
  Mic,
  Camera,
  FileText,
  Code,
  Video,
  Image,
  Music,
  Archive,
  Settings,
  ChevronRight,
  Clock,
  Star,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface SearchSuggestion {
  id: string
  text: string
  icon: React.ElementType
  category: string
  description: string
}

interface RecentSearch {
  id: string
  query: string
  timestamp: Date
  resultCount: number
}

interface SearchResult {
  id: string
  title: string
  url: string
  description: string
  favicon: string
  tags: string[]
  dateAdded: Date
  relevanceScore: number
  source: string
}

const quickActions: SearchSuggestion[] = [
  {
    id: '1',
    text: 'Troubleshoot',
    icon: Target,
    category: 'Help',
    description: 'Find solutions to common problems'
  },
  {
    id: '2',
    text: 'Perplexity 101',
    icon: Brain,
    category: 'Learning',
    description: 'Learn how to use search effectively'
  },
  {
    id: '3',
    text: 'Fact Check',
    icon: Lightbulb,
    category: 'Verification',
    description: 'Verify information and claims'
  },
  {
    id: '4',
    text: 'Summarize',
    icon: FileText,
    category: 'Analysis',
    description: 'Get concise summaries of content'
  },
  {
    id: '5',
    text: 'Sports',
    icon: TrendingUp,
    category: 'News',
    description: 'Latest sports news and updates'
  }
]

const aiSuggestions: string[] = [
  'What are the latest developments in AI technology?',
  'How to optimize React performance in large applications?',
  'Best practices for TypeScript in enterprise projects?',
  'Explain the differences between REST and GraphQL APIs',
  'What are the current trends in web development?'
]

const recentSearches: RecentSearch[] = [
  {
    id: '1',
    query: 'React hooks best practices',
    timestamp: new Date('2024-01-20'),
    resultCount: 15
  },
  {
    id: '2',
    query: 'TypeScript utility types',
    timestamp: new Date('2024-01-19'),
    resultCount: 8
  },
  {
    id: '3',
    query: 'Next.js 14 features',
    timestamp: new Date('2024-01-18'),
    resultCount: 12
  }
]

export default function DnaSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeTab, setActiveTab] = useState<'discover' | 'library' | 'history'>('discover')

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return

    setIsSearching(true)
    
    // Simulate API call
    setTimeout(() => {
      setResults([
        {
          id: '1',
          title: 'React Hooks Documentation',
          url: 'https://react.dev/reference/react',
          description: 'Complete reference for React Hooks including useState, useEffect, and custom hooks',
          favicon: '/react-icon.png',
          tags: ['React', 'Hooks', 'Documentation'],
          dateAdded: new Date('2024-01-15'),
          relevanceScore: 0.95,
          source: 'React.dev'
        }
      ])
      setIsSearching(false)
      toast.success(`Found ${1} result for "${query}"`)
    }, 1000)
  }

  const handleQuickAction = (action: SearchSuggestion) => {
    setSearchQuery(action.text)
    handleSearch(action.text)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    handleSearch(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="text-center pt-16 pb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <h1 className="text-4xl font-bold tracking-tight">perplexity</h1>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Ask anything or @mention a Space ✨ NEW PERPLEXITY DESIGN LOADED ✨
        </p>
      </div>

      {/* Search Container */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Search Input */}
        <div className="relative mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Ask anything or @mention a Space"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-0 bg-white dark:bg-gray-800 shadow-lg"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Mic className="h-4 w-4 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Camera className="h-4 w-4 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FileText className="h-4 w-4 text-gray-500" />
              </Button>
              <Button
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleQuickAction(action)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{action.text}</span>
              </Button>
            )
          })}
        </div>

        {/* Content Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <Button
              variant={activeTab === 'discover' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('discover')}
              className="rounded-full px-6 py-2 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Discover
            </Button>
            <Button
              variant={activeTab === 'library' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('library')}
              className="rounded-full px-6 py-2 text-sm font-medium"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Library
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('history')}
              className="rounded-full px-6 py-2 text-sm font-medium"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'discover' && (
            <div className="space-y-6">
              {/* AI Suggestions */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">AI Suggestions</h3>
                  </div>
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Trending Topics</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['AI Development', 'React 18', 'TypeScript 5', 'Next.js 14', 'Web3', 'Machine Learning'].map((topic) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors duration-200 p-2 justify-center"
                        onClick={() => handleSuggestionClick(topic)}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'library' && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Bookmark className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Your Library</h3>
                </div>
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your saved searches and bookmarks will appear here
                  </p>
                  <Button variant="outline" className="rounded-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <History className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Recent Searches</h3>
                </div>
                <div className="space-y-3">
                  {recentSearches.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleSuggestionClick(search.query)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{search.query}</p>
                            <p className="text-sm text-gray-500">{search.resultCount} results • {search.timestamp.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Search Results</h3>
                </div>
                <div className="space-y-4">
                  {results.map((result) => (
                    <div key={result.id} className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Globe className="h-3 w-3 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{result.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(result.relevanceScore * 100)}% match
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{result.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{result.source}</span>
                            <span>•</span>
                            <span>{result.dateAdded.toLocaleDateString()}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto text-xs"
                              onClick={() => window.open(result.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 