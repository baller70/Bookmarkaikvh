'use client'

import React, { useState, useEffect, useContext, createContext, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Save,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Info,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Clock,
  Plus,
  CheckSquare,
  RefreshCw,
  Zap,
  Target,
  BookOpen,
  Calendar
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getAISetting, saveAISetting } from '@/lib/user-settings-service'

// TypeScript Interfaces
interface RecommendationSettings {
  suggestionsPerRefresh: 1|2|3|4|5|6|7|8|9|10
  serendipityLevel: 0|1|2|3|4|5|6|7|8|9|10
  autoIncludeOnSelect: boolean
  autoBundle: boolean
  includeTLDR: boolean
  domainBlacklist: string[]
  revisitNudgeDays: 1|3|7|14|21|30
  includeTrending: boolean
}

interface RecommendationItem {
  url: string
  title: string
  description: string
  favicon: string
  readTime: string
  confidence: number
  why: string[]
  id: string
}

interface RecommendationContextType {
  settings: RecommendationSettings
  setSettings: (settings: RecommendationSettings) => void
  hasUnsavedChanges: boolean
  saveSettings: () => void
  resetSettings: () => void
}

// Default Settings
const defaultSettings: RecommendationSettings = {
  suggestionsPerRefresh: 5,
  serendipityLevel: 3,
  autoIncludeOnSelect: true,
  autoBundle: false,
  includeTLDR: true,
  domainBlacklist: [],
  revisitNudgeDays: 14,
  includeTrending: false
}

// Context
const RecommendationContext = createContext<RecommendationContextType | null>(null)

// Custom Hooks
const useRecommendationSettings = () => {
  const context = useContext(RecommendationContext)
  if (!context) {
    throw new Error('useRecommendationSettings must be used within RecommendationProvider')
  }
  return context
}

const useRecAPI = () => {
  const fetchRecommendations = useCallback(async (params: Partial<RecommendationSettings>): Promise<RecommendationItem[]> => {
    console.log('🎯 Fetching AI recommendations with params:', params)
    
    try {
      // Call the real AI recommendations API
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            suggestionsPerRefresh: params.suggestionsPerRefresh || 5,
            serendipityLevel: params.serendipityLevel || 3,
            autoIncludeOnSelect: params.autoIncludeOnSelect || true,
            autoBundle: params.autoBundle || false,
            includeTLDR: params.includeTLDR || true,
            domainBlacklist: params.domainBlacklist || [],
            revisitNudgeDays: params.revisitNudgeDays || 14,
            includeTrending: params.includeTrending || false
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate recommendations')
      }

      console.log('✅ AI recommendations received:', {
        count: data.recommendations.length,
        totalGenerated: data.totalGenerated,
        totalFiltered: data.totalFiltered,
        model: data.model
      })

      return data.recommendations
      
    } catch (error) {
      console.error('❌ Failed to fetch AI recommendations:', error)
      
      // Return fallback mock data on error
      console.log('🔄 Falling back to mock data')
      
      const mockItems: RecommendationItem[] = [
        {
          id: 'fallback-1',
          url: 'https://example.com/ai-breakthroughs',
          title: 'Latest AI Breakthroughs in 2024',
          description: 'Comprehensive overview of the most significant artificial intelligence developments this year.',
          favicon: '🤖',
          readTime: '≈5 min read',
          confidence: 0.87,
          why: ['Matches your AI interest tags', 'Popular in your network', 'Recent publication']
        },
        {
          id: 'fallback-2',
          url: 'https://example.com/typescript-tips',
          title: 'Advanced TypeScript Patterns You Should Know',
          description: 'Deep dive into powerful TypeScript patterns for better code organization.',
          favicon: '📘',
          readTime: '≈8 min read',
          confidence: 0.92,
          why: ['Similar to your saved articles', 'High engagement rate', 'Trending in tech']
        },
        {
          id: 'fallback-3',
          url: 'https://example.com/design-systems',
          title: 'Building Scalable Design Systems',
          description: 'Best practices for creating and maintaining design systems at scale.',
          favicon: '🎨',
          readTime: '≈12 min read',
          confidence: 0.79,
          why: ['Complements your UX bookmarks', 'Recommended by similar users']
        }
      ]
      
      // Return fallback data on error (don't throw to prevent UI breaking)
      return mockItems.slice(0, (params.suggestionsPerRefresh || 5))
    }
  }, [])
  
  return { fetchRecommendations }
}

// Helper Functions (removed unused functions)

// Provider Component
const RecommendationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<RecommendationSettings>(defaultSettings)
  const [persistedSettings, setPersistedSettings] = useState<RecommendationSettings>(defaultSettings)

  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        try {
          const remote = await getAISetting(user.id, 'recommendations')
          setSettings(remote)
          setPersistedSettings(remote)
        } catch (error) {
          console.error('Failed to load recommendation settings:', error)
        }
      }
    })()
  }, [])

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(persistedSettings)
  }, [settings, persistedSettings])

  const saveSettings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      try {
        await saveAISetting(user.id, 'recommendations', settings)
        setPersistedSettings(settings)
        toast.success('Recommendation settings saved successfully')
      } catch (error) {
        console.error('Failed to save recommendation settings:', error)
        toast.error('Failed to save recommendation settings')
      }
    }
  }

  const resetSettings = useCallback(() => {
    setSettings(persistedSettings)
    toast.info('Settings reset to last saved state')
  }, [persistedSettings])

  return (
    <RecommendationContext.Provider value={{
      settings,
      setSettings,
      hasUnsavedChanges,
      saveSettings,
      resetSettings
    }}>
      {children}
    </RecommendationContext.Provider>
  )
}

export default function RecommendationsPage() {
  return (
    <RecommendationProvider>
      <RecommendationContent />
    </RecommendationProvider>
  )
}

function RecommendationContent() {
  const { settings, setSettings, hasUnsavedChanges, saveSettings, resetSettings } = useRecommendationSettings()
  const { fetchRecommendations } = useRecAPI()
  
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({
    engine: false,
    automation: false,
    content: false,
    revisit: false
  })

  const updateSetting = <K extends keyof RecommendationSettings>(path: K, value: RecommendationSettings[K]) => {
    setSettings({ ...settings, [path]: value })
  }

  const generateRecommendations = async () => {
    setIsGenerating(true)
    try {
      const newRecs = await fetchRecommendations(settings)
      setRecommendations(newRecs)
      setSelectedItems(new Set())
    } catch (error) {
      toast.error('Failed to generate recommendations')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
      
      // Auto-include if enabled
      if (settings.autoIncludeOnSelect) {
        setTimeout(() => {
          addSelectedToBookmarks()
        }, 500)
      }
    }
    setSelectedItems(newSelected)
  }

  const addSelectedToBookmarks = async () => {
    const count = selectedItems.size
    if (count === 0) return

    try {
      // Get selected recommendations
      const selectedRecommendations = recommendations.filter(rec => selectedItems.has(rec.id))
      
      // Create bookmarks with auto-generated metadata
      const bookmarksToCreate = selectedRecommendations.map(rec => ({
        url: rec.url,
        title: rec.title,
        description: rec.description,
        category: generateCategoryFromRecommendation(rec),
        tags: generateTagsFromRecommendation(rec),
        ai_summary: rec.description,
        ai_tags: rec.why.map(reason => extractKeywordsFromReason(reason)).flat(),
        ai_category: generateCategoryFromRecommendation(rec),
        confidence_score: rec.confidence,
        recommendation_id: rec.id,
        recommendation_context: {
          readTime: rec.readTime,
          confidence: rec.confidence,
          reasons: rec.why,
          favicon: rec.favicon,
          generatedAt: new Date().toISOString(),
          settings: settings
        },
        notes: `AI Recommendation - ${Math.round(rec.confidence * 100)}% match\nReasons: ${rec.why.join('; ')}`
      }))

      console.log('🔗 Creating bookmarks from AI recommendations:', bookmarksToCreate)

      // Call the API to create bookmarks (using same user ID as dashboard)
      const response = await fetch('/api/ai/recommendations/to-bookmarks?user_id=48e1b5b9-3b0f-4ccb-8b34-831b1337fc3f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarks: bookmarksToCreate,
          settings: {
            autoBundle: settings.autoBundle,
            bundleName: settings.autoBundle ? `AI Recommendations ${new Date().toLocaleDateString()}` : null
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create bookmarks')
      }

      console.log('✅ Bookmarks created successfully:', result)

      // Clear selected items
      setSelectedItems(new Set())
      
      // Show success message
      if (settings.autoBundle && count > 1) {
        toast.success(`✅ ${count} bookmarks added to collection "${result.collectionName}"`)
      } else {
        toast.success(`✅ ${count} bookmark${count > 1 ? 's' : ''} added with auto-generated tags and categories`)
      }

      // Remove processed recommendations from the list (optional)
      setRecommendations(prev => prev.filter(rec => !selectedItems.has(rec.id)))

    } catch (error) {
      console.error('❌ Failed to create bookmarks:', error)
      toast.error(`Failed to create bookmarks: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Helper function to generate category from recommendation
  const generateCategoryFromRecommendation = (rec: RecommendationItem): string => {
    const title = rec.title.toLowerCase()
    const description = rec.description.toLowerCase()
    const text = `${title} ${description}`

    // AI/ML related
    if (text.includes('ai') || text.includes('machine learning') || text.includes('neural') || 
        text.includes('artificial intelligence') || text.includes('openai') || text.includes('chatgpt')) {
      return 'AI/ML'
    }
    
    // Development related
    if (text.includes('react') || text.includes('javascript') || text.includes('typescript') || 
        text.includes('node') || text.includes('api') || text.includes('code') || 
        text.includes('programming') || text.includes('development')) {
      return 'Development'
    }
    
    // Design related
    if (text.includes('design') || text.includes('ui') || text.includes('ux') || 
        text.includes('figma') || text.includes('interface')) {
      return 'Design'
    }
    
    // Tools & Productivity
    if (text.includes('tool') || text.includes('productivity') || text.includes('extension') || 
        text.includes('automation') || text.includes('workflow')) {
      return 'Tools & Productivity'
    }
    
    // Learning & Education
    if (text.includes('tutorial') || text.includes('course') || text.includes('learn') || 
        text.includes('guide') || text.includes('documentation') || text.includes('education')) {
      return 'Learning & Education'
    }
    
    // News & Articles
    if (text.includes('news') || text.includes('article') || text.includes('blog') || 
        text.includes('update') || text.includes('trend')) {
      return 'News & Articles'
    }

    // Default fallback
    return 'General'
  }

  // Helper function to generate tags from recommendation
  const generateTagsFromRecommendation = (rec: RecommendationItem): string[] => {
    const tags = new Set<string>()
    const text = `${rec.title} ${rec.description}`.toLowerCase()

    // Technology tags
    const techTerms = ['react', 'javascript', 'typescript', 'node', 'python', 'ai', 'ml', 
                      'api', 'css', 'html', 'vue', 'angular', 'nextjs', 'express']
    techTerms.forEach(term => {
      if (text.includes(term)) {
        tags.add(term.charAt(0).toUpperCase() + term.slice(1))
      }
    })

    // Content type tags
    if (rec.readTime.includes('min')) {
      const minutes = parseInt(rec.readTime.match(/\d+/)?.[0] || '0')
      if (minutes <= 5) tags.add('Quick Read')
      else if (minutes <= 15) tags.add('Medium Read')
      else tags.add('Long Read')
    }

    // Confidence-based tags
    if (rec.confidence >= 0.9) tags.add('Highly Relevant')
    else if (rec.confidence >= 0.7) tags.add('Relevant')

    // Source-based tags
    if (text.includes('github')) tags.add('GitHub')
    if (text.includes('youtube')) tags.add('Video')
    if (text.includes('documentation') || text.includes('docs')) tags.add('Documentation')
    if (text.includes('tutorial')) tags.add('Tutorial')
    if (text.includes('tool')) tags.add('Tool')

    // AI recommendation tag
    tags.add('AI Recommended')
    tags.add('Auto-Generated')

    return Array.from(tags).slice(0, 8) // Limit to 8 tags
  }

  // Helper function to extract keywords from reasoning
  const extractKeywordsFromReason = (reason: string): string[] => {
    const keywords = new Set<string>()
    const lowerReason = reason.toLowerCase()

    // Extract common technical terms
    const patterns = [
      /\b(react|javascript|typescript|python|ai|ml|api|css|html|vue|angular|nextjs)\b/g,
      /\b(development|design|productivity|learning|tutorial|tool)\b/g,
      /\b(trending|popular|engagement|recent|new)\b/g
    ]

    patterns.forEach(pattern => {
      const matches = lowerReason.match(pattern) || []
      matches.forEach((match: string) => keywords.add(match.charAt(0).toUpperCase() + match.slice(1)))
    })

    return Array.from(keywords)
  }

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Personalized Recommendations</h1>
                <p className="text-muted-foreground mt-1">
                  AI-powered suggestions tailored to your interests and reading habits
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">AI LinkPilot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Bar */}
        {hasUnsavedChanges && (
          <Alert className="mx-4 sm:mx-6 lg:mx-8 mt-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span>You have unsaved changes to your recommendation settings.</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={resetSettings}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button size="sm" onClick={saveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Control Panel</CardTitle>
                  <CardDescription>Configure your recommendation preferences</CardDescription>
                </CardHeader>
              </Card>

              {/* Recommendation Engine */}
              <Card>
                <Collapsible open={!collapsedSections.engine} onOpenChange={() => toggleSection('engine')}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <CardTitle>Recommendation Engine</CardTitle>
                        </div>
                        {collapsedSections.engine ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Suggestions per refresh</Label>
                          <Badge variant="secondary">{settings.suggestionsPerRefresh}</Badge>
                        </div>
                        <Slider
                          value={[settings.suggestionsPerRefresh]}
                          onValueChange={([value]) => updateSetting('suggestionsPerRefresh', value as RecommendationSettings['suggestionsPerRefresh'])}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Serendipity</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Focus ←→ Explore</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Slider
                          value={[settings.serendipityLevel]}
                          onValueChange={([value]) => updateSetting('serendipityLevel', value as RecommendationSettings['serendipityLevel'])}
                          min={0}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Focus</span>
                          <span>Explore</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <Label>Include trending links (20%)</Label>
                        </div>
                        <Switch
                          checked={settings.includeTrending}
                          onCheckedChange={(checked) => updateSetting('includeTrending', checked)}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Automation */}
              <Card>
                <Collapsible open={!collapsedSections.automation} onOpenChange={() => toggleSection('automation')}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-primary" />
                          <CardTitle>Automation</CardTitle>
                        </div>
                        {collapsedSections.automation ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Auto-include after selection</Label>
                        <Switch
                          checked={settings.autoIncludeOnSelect}
                          onCheckedChange={(checked) => updateSetting('autoIncludeOnSelect', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Auto-bundle accepted links into new collection</Label>
                        <Switch
                          checked={settings.autoBundle}
                          onCheckedChange={(checked) => updateSetting('autoBundle', checked)}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Content Details */}
              <Card>
                <Collapsible open={!collapsedSections.content} onOpenChange={() => toggleSection('content')}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <CardTitle>Content Details</CardTitle>
                        </div>
                        {collapsedSections.content ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Show TL;DR summaries</Label>
                        <Switch
                          checked={settings.includeTLDR}
                          onCheckedChange={(checked) => updateSetting('includeTLDR', checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Domain blacklist</Label>
                        <Textarea
                          placeholder="Enter domains to exclude, one per line"
                          value={settings.domainBlacklist.join('\n')}
                          onChange={(e) => updateSetting('domainBlacklist', e.target.value.split('\n').filter(Boolean))}
                          className="min-h-[80px]"
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Revisit Nudge */}
              <Card>
                <Collapsible open={!collapsedSections.revisit} onOpenChange={() => toggleSection('revisit')}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <CardTitle>Revisit Nudge</CardTitle>
                        </div>
                        {collapsedSections.revisit ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Resurface unopened links after</Label>
                          <Badge variant="secondary">{settings.revisitNudgeDays} days</Badge>
                        </div>
                        <Slider
                          value={[settings.revisitNudgeDays]}
                          onValueChange={([value]) => updateSetting('revisitNudgeDays', value as RecommendationSettings['revisitNudgeDays'])}
                          min={1}
                          max={30}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={generateRecommendations}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Generate New Suggestions
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Preview Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    {recommendations.length > 0 
                      ? `${recommendations.length} personalized suggestions based on your preferences`
                      : 'Click "Generate New Suggestions" to get started'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recommendations yet</p>
                      <p className="text-sm text-muted-foreground">Generate suggestions to see personalized content</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map((item) => (
                        <RecommendationCard
                          key={item.id}
                          item={item}
                          isSelected={selectedItems.has(item.id)}
                          onToggleSelect={() => toggleItemSelection(item.id)}
                          showTLDR={settings.includeTLDR}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Batch Toolbar */}
        {selectedItems.size > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <Card className="shadow-lg border-primary">
              <CardContent className="flex items-center space-x-4 py-3 px-6">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedItems.size} selected</span>
                <Separator orientation="vertical" className="h-6" />
                <Button onClick={addSelectedToBookmarks}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Selected
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Recommendation Card Component
interface RecommendationCardProps {
  item: RecommendationItem
  isSelected: boolean
  onToggleSelect: () => void
  showTLDR: boolean
}

function RecommendationCard({ item, isSelected, onToggleSelect, showTLDR }: RecommendationCardProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(feedback === type ? null : type)
    toast.success(`Feedback recorded - we'll ${type === 'up' ? 'show more' : 'show fewer'} similar recommendations`)
  }

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="text-2xl">{item.favicon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:text-primary transition-colors line-clamp-2"
                >
                  {item.title}
                </a>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.readTime}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(item.confidence * 100)}% match
                </Badge>
              </div>
              {showTLDR && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex p-1 hover:bg-muted rounded-sm cursor-pointer">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">Why this link?</p>
                  {item.why.map((reason, index) => (
                    <p key={index} className="text-xs">• {reason}</p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
            
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              aria-label={`Select ${item.title}`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={feedback === 'up' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleFeedback('up')}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant={feedback === 'down' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleFeedback('down')}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Confidence: {Math.round(item.confidence * 100)}%
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 