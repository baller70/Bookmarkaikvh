// Advanced Analytics & Visualization Types

export interface BookmarkAnalytics {
  id: string
  userId: string
  bookmarkId: string
  url: string
  title: string
  category: string
  tags: string[]
  visits: number
  timeSpent: number // in minutes
  lastVisited: Date
  createdAt: Date
  updatedAt: Date
  source: 'manual' | 'import' | 'extension' | 'api'
  deviceType: 'desktop' | 'mobile' | 'tablet'
  location?: {
    country: string
    city: string
    timezone: string
  }
}

export interface UserBehaviorMetrics {
  userId: string
  totalBookmarks: number
  totalVisits: number
  totalTimeSpent: number
  averageTimePerBookmark: number
  mostActiveHours: number[]
  mostActiveDays: string[]
  topCategories: CategoryMetric[]
  topTags: TagMetric[]
  searchQueries: SearchMetric[]
  organizationPatterns: OrganizationPattern[]
  engagementScore: number
  retentionRate: number
  lastActiveDate: Date
  streakDays: number
}

export interface CategoryMetric {
  category: string
  count: number
  visits: number
  timeSpent: number
  percentage: number
  growth: number // percentage change
  color: string
}

export interface TagMetric {
  tag: string
  count: number
  frequency: number
  coOccurrence: string[] // tags that often appear together
  sentiment: 'positive' | 'neutral' | 'negative'
  trending: boolean
}

export interface SearchMetric {
  query: string
  count: number
  resultsFound: number
  clickThroughRate: number
  timestamp: Date
  success: boolean
}

export interface OrganizationPattern {
  type: 'by_category' | 'by_tag' | 'by_date' | 'by_domain' | 'by_topic'
  usage: number
  efficiency: number
  preference: number
}

export interface KnowledgeGraphNode {
  id: string
  type: 'bookmark' | 'category' | 'tag' | 'domain' | 'topic' | 'user'
  label: string
  description?: string
  url?: string
  size: number // relative importance/connections
  color: string
  position?: { x: number; y: number }
  metadata: Record<string, any>
  connections: number
  importance: number
  cluster?: string
}

export interface KnowledgeGraphEdge {
  id: string
  source: string
  target: string
  type: 'related' | 'tagged' | 'categorized' | 'visited_together' | 'similar_content' | 'user_connection'
  weight: number
  strength: number
  label?: string
  metadata: Record<string, any>
  bidirectional: boolean
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[]
  edges: KnowledgeGraphEdge[]
  clusters: GraphCluster[]
  metrics: GraphMetrics
  layout: 'force' | 'circular' | 'hierarchical' | 'grid'
  filters: GraphFilters
}

export interface GraphCluster {
  id: string
  label: string
  nodes: string[]
  color: string
  size: number
  density: number
  centrality: number
}

export interface GraphMetrics {
  totalNodes: number
  totalEdges: number
  density: number
  avgDegree: number
  clustering: number
  diameter: number
  components: number
  modularity: number
}

export interface GraphFilters {
  nodeTypes: string[]
  edgeTypes: string[]
  minConnections: number
  maxConnections: number
  timeRange: { start: Date; end: Date }
  categories: string[]
  tags: string[]
  users: string[]
}

export interface UsagePattern {
  id: string
  userId: string
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal'
  pattern: {
    time: string
    value: number
    normalized: number
  }[]
  strength: number
  confidence: number
  description: string
  insights: string[]
  recommendations: string[]
  startDate: Date
  endDate: Date
}

export interface TrendAnalysis {
  id: string
  type: 'category' | 'tag' | 'domain' | 'content_type' | 'user_behavior'
  subject: string
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  data: TrendDataPoint[]
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  velocity: number // rate of change
  acceleration: number // change in velocity
  significance: number // statistical significance
  forecast: TrendForecast[]
  insights: TrendInsight[]
  anomalies: TrendAnomaly[]
}

export interface TrendDataPoint {
  timestamp: Date
  value: number
  normalized: number
  confidence: number
  metadata?: Record<string, any>
}

export interface TrendForecast {
  timestamp: Date
  predicted: number
  confidence: number
  lower: number
  upper: number
}

export interface TrendInsight {
  type: 'peak' | 'valley' | 'trend_change' | 'seasonal' | 'anomaly'
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  recommendation?: string
}

export interface TrendAnomaly {
  timestamp: Date
  value: number
  expected: number
  deviation: number
  severity: 'low' | 'medium' | 'high'
  explanation?: string
}

export interface AnalyticsDashboard {
  id: string
  userId: string
  name: string
  description?: string
  layout: DashboardLayout
  widgets: AnalyticsWidget[]
  filters: DashboardFilters
  timeRange: TimeRange
  refreshInterval: number // in seconds
  isPublic: boolean
  sharedWith: string[]
  createdAt: Date
  updatedAt: Date
  lastViewedAt: Date
}

export interface DashboardLayout {
  type: 'grid' | 'masonry' | 'flex'
  columns: number
  gap: number
  responsive: boolean
}

export interface AnalyticsWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'graph' | 'heatmap' | 'timeline' | 'gauge' | 'progress'
  title: string
  description?: string
  position: { x: number; y: number; w: number; h: number }
  config: WidgetConfig
  data: any[]
  filters: WidgetFilters
  refreshRate: number
  isVisible: boolean
  hasError: boolean
  lastUpdated: Date
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar' | 'bubble'
  colors: string[]
  showLegend: boolean
  showTooltip: boolean
  showGrid: boolean
  animation: boolean
  responsive: boolean
  aspectRatio?: number
  options: Record<string, any>
}

export interface WidgetFilters {
  categories: string[]
  tags: string[]
  dateRange: TimeRange
  users: string[]
  devices: string[]
  sources: string[]
}

export interface DashboardFilters {
  global: boolean
  timeRange: TimeRange
  categories: string[]
  tags: string[]
  users: string[]
  customFilters: CustomFilter[]
}

export interface CustomFilter {
  id: string
  name: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: any
  active: boolean
}

export interface TimeRange {
  start: Date
  end: Date
  preset?: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'all_time' | 'custom'
  timezone: string
}

export interface AnalyticsReport {
  id: string
  name: string
  description?: string
  type: 'summary' | 'detailed' | 'trend' | 'comparison' | 'custom'
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html'
  schedule?: ReportSchedule
  recipients: string[]
  filters: ReportFilters
  sections: ReportSection[]
  generatedAt: Date
  fileUrl?: string
  status: 'generating' | 'completed' | 'failed' | 'scheduled'
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  time: string
  timezone: string
  enabled: boolean
  nextRun: Date
}

export interface ReportFilters {
  timeRange: TimeRange
  categories: string[]
  tags: string[]
  users: string[]
  includeArchived: boolean
}

export interface ReportSection {
  id: string
  type: 'overview' | 'charts' | 'tables' | 'insights' | 'recommendations'
  title: string
  content: any
  order: number
  visible: boolean
}

export interface AnalyticsState {
  dashboards: AnalyticsDashboard[]
  currentDashboard?: AnalyticsDashboard
  userMetrics: UserBehaviorMetrics
  knowledgeGraph: KnowledgeGraph
  usagePatterns: UsagePattern[]
  trends: TrendAnalysis[]
  reports: AnalyticsReport[]
  isLoading: boolean
  error?: string
  lastUpdated: Date
}

export interface AnalyticsActions {
  loadDashboard: (dashboardId: string) => Promise<void>
  createDashboard: (dashboard: Partial<AnalyticsDashboard>) => Promise<string>
  updateDashboard: (dashboardId: string, updates: Partial<AnalyticsDashboard>) => Promise<void>
  deleteDashboard: (dashboardId: string) => Promise<void>
  addWidget: (dashboardId: string, widget: Partial<AnalyticsWidget>) => Promise<void>
  updateWidget: (widgetId: string, updates: Partial<AnalyticsWidget>) => Promise<void>
  removeWidget: (widgetId: string) => Promise<void>
  loadUserMetrics: (userId: string, timeRange: TimeRange) => Promise<void>
  loadKnowledgeGraph: (filters: GraphFilters) => Promise<void>
  loadUsagePatterns: (userId: string) => Promise<void>
  loadTrends: (type: string, timeframe: string) => Promise<void>
  generateReport: (config: Partial<AnalyticsReport>) => Promise<string>
  exportData: (format: string, filters: any) => Promise<string>
  refreshData: () => Promise<void>
}

// Default dashboard configurations
export const DEFAULT_DASHBOARD_WIDGETS: Partial<AnalyticsWidget>[] = [
  {
    type: 'metric',
    title: 'Total Bookmarks',
    position: { x: 0, y: 0, w: 3, h: 2 },
    config: {
      colors: ['#3b82f6'],
      showLegend: false,
      showTooltip: true,
      animation: true,
      responsive: true,
      options: {}
    }
  },
  {
    type: 'chart',
    title: 'Bookmarks Over Time',
    position: { x: 3, y: 0, w: 9, h: 4 },
    config: {
      chartType: 'line',
      colors: ['#3b82f6', '#10b981'],
      showLegend: true,
      showTooltip: true,
      showGrid: true,
      animation: true,
      responsive: true,
      options: {}
    }
  },
  {
    type: 'chart',
    title: 'Top Categories',
    position: { x: 0, y: 4, w: 6, h: 4 },
    config: {
      chartType: 'doughnut',
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      showLegend: true,
      showTooltip: true,
      animation: true,
      responsive: true,
      options: {}
    }
  },
  {
    type: 'table',
    title: 'Recent Activity',
    position: { x: 6, y: 4, w: 6, h: 4 },
    config: {
      colors: [],
      showLegend: false,
      showTooltip: false,
      responsive: true,
      options: {
        pagination: true,
        sorting: true,
        filtering: true
      }
    }
  }
] 