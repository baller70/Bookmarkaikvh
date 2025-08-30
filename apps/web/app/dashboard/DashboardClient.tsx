'use client'

/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation';
import { useAnalytics } from '../../src/hooks/useAnalytics'

// Helper function to create a Supabase client
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Force dynamic rendering - prevent static generation  
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { BookmarkManager } from '../../components/bookmarks/BookmarkManager'

import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Grid3X3, 
  List, 
  LayoutGrid, 
  Clock,
  Heart,
  ExternalLink,
  Edit,
  Edit2,
  Star,
  Eye,
  TrendingUp,
  Bookmark,
  Tag,
  Share2,
  Download,
  X,
  Calendar,
  Globe,
  Trash2,
  Copy,
  Activity,
  Folder as FolderIcon,
  Target,
  Kanban,
  GitBranch,
  Camera,
  GripVertical,
  Check,
  Bell,
  Timer,
  Image,
  Upload,
  ImageIcon,
  Play,
  Pause,
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  BookmarkIcon as BookmarkIconLucide,
  Building,
  Columns,
  FileText,
  Settings,
  Users,
  TestTube,
  GraduationCap,
  Rocket,
  Zap,
  ShoppingCart,
  PieChart,
  Code,
  Palette,
  Database,
  Shield,
  Smartphone,
  Monitor,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  BarChart3,
  Lightbulb,
  Layers,
  Cloud,
  BookOpen,
  Workflow,
  ClipboardCheck,
  Users2,
  TrendingDown,
  Filter as FilterIcon,
  RotateCcw,
  AlertTriangle,
  AlertCircle
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { NotificationTab } from '../../src/features/notifications'
import { TimerTab } from '../../src/features/pomodoro'
import { MediaHub } from '../../src/features/media'
import { SimpleBoardCanvas } from '../../src/features/simpleBoard/SimpleBoardCanvas'
import { FolderHierarchyManager, FolderHierarchyAssignment } from '../../src/components/hierarchy/Hierarchy'
import { FolderOrgChartView } from '../../src/components/ui/folder-org-chart-view'
import { FolderCard, type BookmarkWithRelations } from '../../src/components/ui/FolderCard'
import { FolderFormDialog, type Folder } from '../../src/components/ui/FolderFormDialog'
import { KanbanView } from '../../src/components/ui/BookmarkKanban'
import TrelloBoard from '../../src/components/ui/TrelloBoard'
import { SyncButton } from '@/components/SyncButton'
import { getProfilePicture, onProfilePictureChange } from '@/lib/profile-utils'

import { useRealTimeAnalytics } from '@/lib/real-time-analytics'
import { toast } from 'sonner'

// Import React Flow components for custom background
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import the Perplexity-style search component
import DnaSearch from '../../src/components/dna-profile/dna-search'
// Import Oracle component
import Oracle from '../../src/components/oracle/Oracle'

// Custom Infinity Board Background Component (no nodes, just background)
const InfinityBoardBackground = ({ isActive }: { isActive: boolean }) => {
  const [nodes] = useNodesState([]);
  const [edges] = useEdgesState([]);

  return isActive ? (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        onError={(error) => {
          console.error('❌ InfinityBoardBackground React Flow Error:', error);
        }}
      >
        <Background gap={12} color="#e5e7eb" />
        <MiniMap position="bottom-left" />
        <Controls position="bottom-right" />
      </ReactFlow>
    </ReactFlowProvider>
  ) : null;
};

// HIERARCHY Infinity Board with Full Editing Capabilities - DEFINITIVE SOLUTION
const KHV1InfinityBoard = ({ folders, bookmarks, onCreateFolder, onAddBookmark, onOpenDetail, isActive, folderAssignments, onHierarchyAssignmentsChange }: {
  folders: any[];
  bookmarks: any[];
  onCreateFolder: () => void;
  onAddBookmark: () => void;
  onOpenDetail: (bookmark: any) => void;
  isActive: boolean;
  folderAssignments: FolderHierarchyAssignment[];
  onHierarchyAssignmentsChange: (assignments: FolderHierarchyAssignment[]) => void;
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 });
  
  return isActive ? (
    <div className="relative w-full min-h-screen overflow-auto">
      {/* Background Layer: React Flow for infinity board only */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <ReactFlowProvider>
          <ReactFlow
            nodes={[]}
            edges={[]}
            fitView
            attributionPosition="bottom-left"
            className="bg-gray-50"
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            onMove={(_, viewport) => {
              setTransform({
                x: viewport.x,
                y: viewport.y,
                zoom: viewport.zoom
              });
            }}
            onError={(error) => {
              console.error('❌ KHV1InfinityBoard React Flow Error:', error);
            }}
          >
            <Background gap={12} color="#e5e7eb" />
            <Controls position="bottom-right" />
            <MiniMap position="bottom-left" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      
      {/* Foreground Layer: Fully Interactive Components */}
      <div 
        className="relative w-full pointer-events-auto z-10"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
          transformOrigin: '0 0',
          transition: 'none', // Disable transitions for smooth interaction
          paddingTop: '40px',
          paddingLeft: '40px',
          paddingBottom: '40px',
          minHeight: 'calc(100vh + 80px)' // Ensure there's room to scroll
        }}
      >
        <div className="w-full max-w-[92vw]">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/60 w-full min-h-[80vh]">
            <FolderOrgChartView
              folders={folders}
              bookmarks={bookmarks}
              onCreateFolder={onCreateFolder}
              onEditFolder={() => {}}
              onDeleteFolder={() => {}}
              onAddBookmarkToFolder={() => {}}
              onDropBookmarkToFolder={() => {}}
              onBookmarkUpdated={() => {}}
              onBookmarkDeleted={() => {}}
              onOpenDetail={onOpenDetail}
              currentFolderId={null}
              onFolderNavigate={() => {}}
              selectedFolder={null}
              onAddBookmark={onAddBookmark}
              hierarchyAssignments={folderAssignments}
              onHierarchyAssignmentsChange={onHierarchyAssignmentsChange}
            />
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

// Client-only wrapper to prevent hydration mismatches
function ClientOnlyDndProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only run on the client after hydration
    setMounted(true)
  }, [])

  // During SSR (and the first client render) render nothing to avoid mismatches
  if (!mounted) {
    return null
  }

  return <>{children}</>
}

export default function Dashboard() {
  // Reading search params forces dynamic rendering
  const searchParams = useSearchParams();

    // Force dynamic rendering by checking browser environment
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    console.log('🚀 Dashboard component is executing! [UPDATED]', new Date().toISOString());
    console.log('🌐 Is Browser:', isBrowser);
    console.log('🔧 Component version: LATEST WITH DEBUG');
    
  }, []); // Run once after mount
  
  // State management
  const [viewMode, setViewMode] = useState('grid')
  const [showAddBookmark, setShowAddBookmark] = useState(false)
  const [selectedBookmarks, setSelectedBookmarks] = useState<number[]>([])
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [chartTimePeriod, setChartTimePeriod] = useState('3months')
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    category: 'Development',
    priority: 'medium',
    notes: '',
    circularImage: '',
    logo: ''
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [notification, setNotification] = useState<string | null>(null)
  const [userDefaultLogo, setUserDefaultLogo] = useState<string>('')
  const [showDefaultLogoModal, setShowDefaultLogoModal] = useState(false)
  const [newDefaultLogo, setNewDefaultLogo] = useState('')
  // New states for folder-based compact view
  const [compactViewMode, setCompactViewMode] = useState<'folders' | 'bookmarks'>('folders')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  // near top state declarations after other states
  const [folderAssignments, setFolderAssignments] = useState<FolderHierarchyAssignment[]>([]);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [selectedGoalFolder, setSelectedGoalFolder] = useState<Folder | null>(null);
  // Folder creation states
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: '',
    color: '#3b82f6', // Default blue color
    description: ''
  });

  // Add Bookmark modal states
  const [addBookmarkTab, setAddBookmarkTab] = useState<'new' | 'existing'>('new');
  const [selectedExistingBookmarks, setSelectedExistingBookmarks] = useState<number[]>([]);
  const [existingBookmarksSearch, setExistingBookmarksSearch] = useState('');

  // HIERARCHY view mode state
  const [khV1ViewMode, setKhV1ViewMode] = useState<'chart' | 'timeline'>('chart');

  // Add active tab state for bookmark modal
  const [activeBookmarkTab, setActiveBookmarkTab] = useState('overview');
  const [hasVisitedMediaTab, setHasVisitedMediaTab] = useState(false);

  // ARP (Application Requirements Document) template system state
  const [arpSelectedTemplate, setArpSelectedTemplate] = useState('developer');
  const [arpCompletedSteps, setArpCompletedSteps] = useState<string[]>([]);
  const [arpCurrentStep, setArpCurrentStep] = useState(0);
  const [arpShowAllSteps, setArpShowAllSteps] = useState(false);

  // Dynamic folders based on real bookmark categories
  const [dynamicFolders, setDynamicFolders] = useState<any[]>([]);
  
  // State for opened folder in Folder 2.0
  const [openedFolder, setOpenedFolder] = useState<any>(null);

  const [mockGoalFolders, setMockGoalFolders] = useState([
    {
      id: '1',
      name: 'Q1 Learning Goals',
      description: 'Complete React and TypeScript courses',
      color: '#3b82f6',
      deadline_date: '2024-03-31',
      goal_type: 'learn_category',
      goal_description: 'Master React hooks and TypeScript fundamentals',
      goal_status: 'in_progress',
      goal_priority: 'high',
      goal_progress: 65,
      goal_notes: 'Making good progress on React hooks'
    },
    {
      id: '2',
      name: 'Project Organization',
      description: 'Organize all development resources',
      color: '#10b981',
      deadline_date: '2024-02-15',
      goal_type: 'organize',
      goal_description: 'Create a systematic approach to project management',
      goal_status: 'pending',
      goal_priority: 'medium',
      goal_progress: 25,
      goal_notes: 'Need to start organizing soon'
    },
    {
      id: '3',
      name: 'Research New Technologies',
      description: 'Explore emerging web technologies',
      color: '#f59e0b',
      deadline_date: '2024-04-30',
      goal_type: 'research_topic',
      goal_description: 'Research and evaluate new frameworks and tools',
      goal_status: 'in_progress',
      goal_priority: 'low',
      goal_progress: 40,
      goal_notes: 'Focusing on Next.js 14 and React Server Components'
    }
  ]);

  // --- Bookmark data state (fetched from database) ---
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);
  
  // User ID for API calls - must match the API default
  const userId = 'dev-user-123';

  // Real-time analytics
  const { analyticsData, globalStats, isLoading: analyticsLoading, trackVisit: trackVisitGlobal, trackTimeSpent: trackTimeSpentGlobal, getBookmarkAnalytics, refreshAnalytics: refreshGlobalAnalytics } = useAnalytics(bookmarks);
  
  // Dedicated analytics for the selected bookmark to prevent global state interference
  const {
    analyticsData: selectedBookmarkAnalyticsData,
    isLoading: selectedBookmarkAnalyticsLoading,
    trackVisit: trackSelectedBookmarkVisit,
    trackTimeSpent: trackSelectedBookmarkTimeSpent,
    getBookmarkAnalytics: getSelectedBookmarkAnalytics,
    refreshAnalytics: refreshSelectedBookmarkAnalytics,
  } = useAnalytics(selectedBookmark?.id);

  // Combined tracking functions that update both global and selected bookmark analytics
  const trackVisitCombined = async (bookmarkId: string) => {
    // Track on the dedicated instance first (for immediate UI updates)
    await trackSelectedBookmarkVisit(bookmarkId);
    
    // Update direct cache immediately for instant UI updates
    setDirectAnalyticsCache(prev => ({
      ...prev,
      [bookmarkId]: {
        visits: (prev[bookmarkId]?.visits || 0) + 1,
        timeSpent: prev[bookmarkId]?.timeSpent || 0
      }
    }));
    
    // Refresh global analytics to keep front cards in sync
    setTimeout(() => {
      refreshGlobalAnalytics();
      fetchDirectAnalytics(bookmarkId); // Refresh direct cache with server data
    }, 500);
  };

  const trackTimeSpentCombined = async (bookmarkId: string, timeSpent: number) => {
    // Track on the dedicated instance first
    await trackSelectedBookmarkTimeSpent(bookmarkId, timeSpent);
    
    // Refresh global analytics to keep front cards in sync
    setTimeout(() => {
      refreshGlobalAnalytics();
    }, 500);
  };

  // Direct analytics cache to bypass complex hook logic
  const [directAnalyticsCache, setDirectAnalyticsCache] = useState<{[key: string]: {visits: number, timeSpent: number}}>({});
  
  // Fetch analytics directly for a bookmark and cache it
  const fetchDirectAnalytics = async (bookmarkId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/analytics?bookmarkId=${bookmarkId}`);
      const result = await response.json();
      if (result.success) {
        const cacheData = {
          visits: result.data.visits || 0,
          timeSpent: result.data.timeSpent || 0
        };
        setDirectAnalyticsCache(prev => ({
          ...prev,
          [bookmarkId]: cacheData
        }));
      }
    } catch (error) {
      console.error('Failed to fetch direct analytics:', error);
    }
  };
  
  // Load direct analytics for all bookmarks when they change
  useEffect(() => {
    bookmarks.forEach(bookmark => {
      if (!directAnalyticsCache[bookmark.id]) {
        fetchDirectAnalytics(bookmark.id);
      }
    });
  }, [bookmarks]);
  
  // Unified analytics getter that prioritizes dedicated instance data
  const getUnifiedBookmarkAnalytics = (bookmarkId: string) => {
    // If this is the selected bookmark, use the dedicated instance (most up-to-date)
    if (selectedBookmark?.id === bookmarkId) {
      return getSelectedBookmarkAnalytics(bookmarkId);
    }
    
    // Otherwise, try direct cache first, then global instance
    const directData = directAnalyticsCache[bookmarkId];
    if (directData) {
      return directData;
    }
    
    // Fallback to global instance
    return getBookmarkAnalytics(bookmarkId);
  };

  // Health check loading state for individual bookmarks
  const [healthCheckLoading, setHealthCheckLoading] = useState<{ [key: string]: boolean }>({});
  const [uploadingBackground, setUploadingBackground] = useState(false);
  
  // Theme color state
  const [themeColor, setThemeColor] = useState('#3b82f6'); // Default blue
  const [isThemeLoading, setIsThemeLoading] = useState(true);
  
  // Username state
  const [username, setUsername] = useState('TOM');
  
  // Analytics summary polling for top cards
  const [summary, setSummary] = useState<{ totalVisits: number; totalTimeSpentMinutes: number; thisWeekVisits?: number; brokenCount?: number } | null>(null)
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/api/analytics/summary')
        const json = await res.json()
        if (active && json && !json.error) setSummary(json)
      } catch {}
    }
    load()
    const id = setInterval(load, 30000)
    return () => { active = false; clearInterval(id) }
  }, [])

  // Analytics metrics state
  const [selectedMetrics, setSelectedMetrics] = useState(['Total Visits', 'Engagement Score']);
  const [isMetricsDropdownOpen, setIsMetricsDropdownOpen] = useState(false);
  
  // Available metrics options
  const availableMetrics = [
    'Total Visits',
    'Engagement Score', 
    'Click-through Rate',
    'Session Duration',
    'Bounce Rate',
    'Page Views',
    'User Retention',
    'Conversion Rate',
    'Active Users',
    'Revenue Generated'
  ];

  // Removed isClient useEffect - not needed for static dashboard

  // Load and persist lightweight chart preferences via Supabase API (/api/save)
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const res = await fetch('/api/save?table=dashboard&title=Chart Preferences')
        const json = await res.json()
        const prefs = json?.data?.settings
        if (prefs) {
          if (Array.isArray(prefs.selectedMetrics)) setSelectedMetrics(prefs.selectedMetrics)
          if (typeof prefs.chartTimePeriod === 'string') setChartTimePeriod(prefs.chartTimePeriod)
        }
      } catch {}
    }
    loadPrefs()
  }, [])

  useEffect(() => {
    const savePrefs = async () => {
      try {
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'dashboard',
            title: 'Chart Preferences',
            data: { selectedMetrics, chartTimePeriod },
          }),
        })
      } catch {}
    }
    savePrefs()
  }, [selectedMetrics, chartTimePeriod])

  // Load theme color and username from settings
  useEffect(() => {
    const loadSettings = () => {
      try {
        setIsThemeLoading(true);
        
        // Load from localStorage first
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          const accentColor = settings.appearance?.accentColor;
          const customColor = settings.appearance?.customColor;
          
          // Load username from profile settings
          if (settings.profile?.name) {
            setUsername(settings.profile.name);
          }
          
          // Define color palette mapping
          const colorPalettes = {
            'blue': '#3b82f6',
            'green': '#10b981', 
            'purple': '#8b5cf6',
            'red': '#ef4444',
            'orange': '#f97316'
          };
          
          // Use custom color if accent is custom, otherwise use palette color
          const finalColor = accentColor === 'custom' ? customColor : colorPalettes[accentColor] || '#3b82f6';
          setThemeColor(finalColor);
          
          console.log('🎨 Theme color loaded:', finalColor);
          console.log('👤 Username loaded:', settings.profile?.name || 'TOM');
        }
        
        // Listen for settings updates
        const handleSettingsUpdate = () => {
          loadSettings();
        };
        
        window.addEventListener('userSettingsUpdated', handleSettingsUpdate);
        
        return () => {
          window.removeEventListener('userSettingsUpdated', handleSettingsUpdate);
        };
      } catch (error) {
        console.error('❌ Error loading settings:', error);
      } finally {
        setIsThemeLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Fetch bookmarks from database
  useEffect(() => {
    console.log('🟢 Dashboard: Bookmarks useEffect triggered');
    console.log('🟢 Dashboard: userId =', userId);
    console.log('🟢 Dashboard: Current URL =', window.location.href);
    
    // Force a visible test
    if (typeof window !== 'undefined') {
      console.log('🟢 Dashboard: Window is available, component is mounting');
      // Add a temporary alert to test if JS is working
      // alert('Dashboard component is loading!');
    }
    
    const fetchBookmarks = async () => {
      try {
        setIsLoadingBookmarks(true);
        console.log('🔍 Fetching bookmarks for user ID:', userId);
        const response = await fetch(`/api/bookmarks`);
        const data = await response.json();
        
        console.log('📡 API Response:', data);
        
        if (data.success) {
          setBookmarks(data.bookmarks);
          console.log(`✅ Loaded ${data.bookmarks.length} bookmarks from database`);
        } else {
          console.error('❌ Failed to fetch bookmarks:', data.error);
          // Fallback to empty array
          setBookmarks([]);
        }
      } catch (error) {
        console.error('❌ Error fetching bookmarks:', error);
        // Fallback to empty array
        setBookmarks([]);
      } finally {
        setIsLoadingBookmarks(false);
      }
    };

    fetchBookmarks();

    // Add global event listener for bookmark refresh
    const handleBookmarkRefresh = () => {
      console.log('🔄 Refreshing bookmarks due to external update');
      fetchBookmarks();
    };

    window.addEventListener('bookmarkAdded', handleBookmarkRefresh);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('bookmarkAdded', handleBookmarkRefresh);
    };
  }, []);

  // ---- Folder category ordering state (for compact & list views) ----
  const [folderCategories, setFolderCategories] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const scrollLockRef = useRef(false);

  // Initialize / sync folderCategories with current bookmark categories while preserving user-defined order
  useEffect(() => {
    const currentCategories = Array.from(new Set(bookmarks.map((b) => b.category)));

    setFolderCategories((prev) => {
      if (prev.length === 0) {
        return currentCategories; // initial load
      }
      const missing = currentCategories.filter((c) => !prev.includes(c));
      if (missing.length === 0) return prev;
      return [...prev, ...missing];
    });
  }, [bookmarks]);

  // Generate dynamic folders from dedicated categories API
  useEffect(() => {
    const loadDynamicFolders = async () => {
      try {
        // Fetch categories from the dedicated categories API
        const response = await fetch('/api/categories?user_id=dev-user-123');
        const data = await response.json();
        
        if (data.success && data.categories) {
          // Convert categories to folder format
          const folders = data.categories.map((category: any) => ({
            id: `folder-${category.id}`,
            name: category.name,
            description: category.description,
            color: category.color,
            bookmarkCount: category.bookmarkCount
          }));
          
          setDynamicFolders(folders);
          console.log('📁 Loaded dynamic folders from categories API:', folders);
        } else {
          console.log('⚠️ No categories found, using empty folders');
          setDynamicFolders([]);
        }
      } catch (error) {
        console.error('❌ Error loading dynamic folders:', error);
        // Fallback to empty folders
        setDynamicFolders([]);
      }
    };

    loadDynamicFolders();
  }, []); // Load once on component mount

  // Reset compact view mode when switching away from compact/list view
  useEffect(() => {
    if (viewMode !== 'compact' && viewMode !== 'list') {
      setCompactViewMode('folders')
      setSelectedFolder(null)
    }
  }, [viewMode])

  // Removed client-side effect - not needed

  // Session recovery for viewing time tracking
  useEffect(() => {
    const recoverViewingSessions = () => {
      const storedSession = localStorage.getItem('bookmarkViewSession')
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession)
          const now = Date.now()
          const timeSinceStart = now - session.startTime
          
          // Recover viewing sessions
          console.log('🔄 Recovered viewing session for bookmark:', session.bookmarkId, 'time since start:', Math.round(timeSinceStart / (1000 * 60)), 'minutes')
        } catch (error) {
          console.error('Error recovering viewing session:', error)
          localStorage.removeItem('bookmarkViewSession')
        }
      }
    }
    
    // Run recovery on mount
    recoverViewingSessions()
    
    // Set up periodic session recovery (every 2 minutes)
    const recoveryInterval = setInterval(recoverViewingSessions, 2 * 60 * 1000)
    
    return () => clearInterval(recoveryInterval)
  }, [])

  // Test function to manually end session (for debugging)
  const testEndSession = () => {
    const storedSession = localStorage.getItem('bookmarkSession')
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession)
        const sessionEndTime = Date.now()
        const timeSpentMinutes = Math.round((sessionEndTime - session.startTime) / (1000 * 60))
        
        console.log(`🧪 Manual session end test for bookmark ${session.bookmarkId}: ${timeSpentMinutes} minutes`)
        
        // Update analytics with time spent
        fetch('/api/bookmarks/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookmarkId: session.bookmarkId,
            action: 'timeUpdate',
            timeSpent: Math.max(timeSpentMinutes, 1),
            sessionEndTime: new Date().toISOString()
          })
        }).then(response => {
          if (response.ok) {
            console.log(`📊 Manual test - Time tracking updated: ${timeSpentMinutes} minutes`)
          } else {
            console.error('Manual test - Failed to update time tracking')
          }
        }).catch(error => {
          console.error('Manual test - Error:', error)
        })
        
        // Clear session data
        localStorage.removeItem('bookmarkSession')
      } catch (error) {
        console.error('Error in manual session end test:', error)
      }
    } else {
      console.log('🧪 No active session to end')
    }
  }

  // Load global logo from Supabase settings first, fallback to local profile picture
  useEffect(() => {
    const loadGlobalLogo = async () => {
      try {
        const res = await fetch('/api/save?table=bookmarks&title=Global Default Logo')
        const json = await res.json()
        const url = json?.data?.settings?.url
        if (url) {
          setUserDefaultLogo(url)
          return
        }
      } catch {}
      const profilePicture = getProfilePicture()
      setUserDefaultLogo(profilePicture)
    }

    loadGlobalLogo()

    // Keep listening for local profile changes as a live fallback
    const unsubscribe = onProfilePictureChange((newPicture) => {
      setUserDefaultLogo(newPicture)
    })
    return unsubscribe
  }, [])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Available bookmarks that can be added to the workspace
  const availableBookmarks = [
    {
      id: 101,
      title: "YOUTUBE",
      url: "https://youtube.com",
      description: "Video sharing and streaming platform",
      category: "Entertainment",
      tags: ["VIDEO", "STREAMING", "CONTENT"],
      priority: "medium",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 102,
      title: "TWITTER",
      url: "https://twitter.com",
      description: "Social media and microblogging platform",
      category: "Social",
      tags: ["SOCIAL", "NEWS", "NETWORKING"],
      priority: "low",
      logo: "https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 103,
      title: "LINKEDIN",
      url: "https://linkedin.com",
      description: "Professional networking platform",
      category: "Professional",
      tags: ["NETWORKING", "CAREER", "BUSINESS"],
      priority: "medium",
      logo: "https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca",
      circularImage: "/placeholder.svg"
    },
    {
      id: 104,
      title: "CODEPEN",
      url: "https://codepen.io",
      description: "Online code editor and frontend showcase",
      category: "Development",
      tags: ["CODE", "FRONTEND", "DEMO"],
      priority: "medium",
      logo: "https://cpwebassets.codepen.io/assets/favicon/apple-touch-icon-5ae1a0698dcc2402e9712f7d01ed509a57814f994c660df9f7a952f3060705ee.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 105,
      title: "MEDIUM",
      url: "https://medium.com",
      description: "Online publishing platform for articles and blogs",
      category: "Learning",
      tags: ["BLOG", "ARTICLES", "WRITING"],
      priority: "low",
      logo: "https://miro.medium.com/v2/resize:fill:152:152/1*sHhtYhaCe2Uc3IU0IgKwIQ.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 106,
      title: "BEHANCE",
      url: "https://behance.net",
      description: "Creative portfolio showcase platform",
      category: "Design",
      tags: ["PORTFOLIO", "CREATIVE", "SHOWCASE"],
      priority: "medium",
      logo: "https://a5.behance.net/2acd763a-9c19-4ac0-9c1e-6d2b2c0e5e0a/img/site/apple-touch-icon.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 107,
      title: "SLACK",
      url: "https://slack.com",
      description: "Team collaboration and messaging platform",
      category: "Productivity",
      tags: ["TEAM", "COMMUNICATION", "WORKSPACE"],
      priority: "high",
      logo: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 108,
      title: "TRELLO",
      url: "https://trello.com",
      description: "Visual project management with boards and cards",
      category: "Productivity",
      tags: ["PROJECT", "KANBAN", "ORGANIZATION"],
      priority: "medium",
      logo: "https://d2k1ftgv7pobq7.cloudfront.net/meta/c/p/res/images/trello-meta-logo.png",
      circularImage: "/placeholder.svg"
    }
  ];

  // Load bookmarks directly from database API
  const loadBookmarks = async () => {
    console.log('🚀 loadBookmarks function called!');
    setIsLoadingBookmarks(true);
    try {
      console.log('🔍 Loading bookmarks from database for user:', userId)
      console.log('🔍 Making fetch request to:', `/api/bookmarks?user_id=${userId}`)
      const response = await fetch(`/api/bookmarks?user_id=${userId}`)
      
      if (!response.ok) {
        console.error('❌ API Response not OK:', response.status, response.statusText)
        setBookmarks([])
        return
      }
      
      const result = await response.json()
      
      console.log('📡 Database API Response:', result)
      console.log('📡 Response success:', result.success)
      console.log('📡 Bookmarks array:', result.bookmarks)
      console.log('📡 Bookmarks length:', result.bookmarks?.length)
      
      if (result.success && result.bookmarks && Array.isArray(result.bookmarks)) {
        console.log('✅ Loaded bookmarks from database:', result.bookmarks.length)
        console.log('✅ Setting bookmarks state with:', result.bookmarks)
        setBookmarks(result.bookmarks)
        console.log('✅ Bookmarks state set successfully')
      } else {
        console.log('⚠️ Invalid response format or no bookmarks found')
        console.log('⚠️ result.success:', result.success)
        console.log('⚠️ result.bookmarks:', result.bookmarks)
        console.log('⚠️ Array.isArray(result.bookmarks):', Array.isArray(result.bookmarks))
        setBookmarks([])
      }
    } catch (error) {
      console.error('❌ Error loading bookmarks:', error)
      console.error('❌ Error details:', error.message)
      setBookmarks([])
    } finally {
      setIsLoadingBookmarks(false);
    }
  }

  // Load bookmarks from database on component mount
  useEffect(() => {
    console.log('🔄 Mount effect triggered, loading bookmarks...');
    console.log('🔄 userId:', userId);
    console.log('🔄 loadBookmarks function:', typeof loadBookmarks);
    
    const executeLoad = async () => {
      try {
        console.log('🔄 About to call loadBookmarks...');
        await loadBookmarks();
        console.log('🔄 loadBookmarks completed');
      } catch (error) {
        console.error('❌ Error in loadBookmarks:', error);
        setIsLoadingBookmarks(false); // Stop loading on error
      }
    };
    
    // Add timeout fallback
    const timeout = setTimeout(() => {
      console.log('⏰ Loading timeout - forcing loading to false');
      setIsLoadingBookmarks(false);
    }, 10000); // 10 second timeout
    
    executeLoad();
    
    return () => clearTimeout(timeout);
  }, [])

  // Debug bookmarks state changes
  useEffect(() => {
    console.log('🔄 Bookmarks state changed:', bookmarks?.length, 'bookmarks')
    console.log('🔄 Current bookmarks:', bookmarks)
  }, [bookmarks])

  // Ensure any legacy bookmark objects that may still contain tags don't render them on the cards
  useEffect(() => {
    setBookmarks(prev => prev.map(b => ({ ...b, tags: Array.isArray(b.tags) ? b.tags : [] })))
  }, [])

  // Load hierarchy assignments from API - MOVED TO TOP TO FIX HOOKS ORDER
  useEffect(() => {
    const loadHierarchyAssignments = async () => {
      try {
        const response = await fetch(`/api/hierarchy?user_id=${userId}`);
        const data = await response.json();
        
        if (data.success && data.assignments) {
          setFolderAssignments(data.assignments);
          console.log('✅ Loaded hierarchy assignments:', data.assignments);
        } else {
          console.log('📁 No hierarchy assignments found, using empty array');
          setFolderAssignments([]);
        }
      } catch (error) {
        console.error('❌ Error loading hierarchy assignments:', error);
        setFolderAssignments([]);
      }
    };

    loadHierarchyAssignments();
  }, [userId]);

  // Save hierarchy assignments to API - MOVED UP TO FIX HOOKS ORDER
  const saveHierarchyAssignments = async (assignments: FolderHierarchyAssignment[]) => {
    try {
      const response = await fetch('/api/hierarchy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignments,
          user_id: userId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Hierarchy assignments saved successfully');
        showNotification('Hierarchy assignments saved!');
      } else {
        console.error('❌ Failed to save hierarchy assignments:', data.error);
        showNotification('Failed to save hierarchy assignments');
      }
    } catch (error) {
      console.error('❌ Error saving hierarchy assignments:', error);
      showNotification('Error saving hierarchy assignments');
    }
  };

  // Handle hierarchy assignments change with persistence - MOVED UP TO FIX HOOKS ORDER
  const handleHierarchyAssignmentsChange = (assignments: FolderHierarchyAssignment[]) => {
    setFolderAssignments(assignments);
    saveHierarchyAssignments(assignments);
  };

  // Preserve scroll position during selectedBookmarks state changes
  useEffect(() => {
    // Disable scroll restoration globally to prevent browser interference
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual'
    }
    
    // Add CSS to prevent scroll jumping
    const style = document.createElement('style')
    style.textContent = `
      html {
        scroll-behavior: auto !important;
      }
      body {
        overflow-anchor: none;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      // Cleanup
      document.head.removeChild(style)
      if (history.scrollRestoration) {
        history.scrollRestoration = 'auto'
      }
    }
  }, [])

  // Monitor selectedBookmarks changes for debugging
  useEffect(() => {
    console.log('📋 Selected bookmarks changed:', selectedBookmarks.length)
  }, [selectedBookmarks]);

  // Create folders for hierarchy after bookmarks are loaded
  const foldersForHierarchyV1 = useMemo(() => {
    const categories = [...new Set(bookmarks.map((b) => b.category))];
    return categories.map((cat) => ({
      id: cat,
      name: cat,
      color: '#6b7280',
      bookmark_count: bookmarks.filter((b) => b.category === cat).length,
    }));
  }, [bookmarks]);

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (Array.isArray(bookmark.tags) && bookmark.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    
    const matchesCategory = selectedCategory === 'all' || bookmark.category.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  // Loading state and empty state handling
  console.log('🟢 Dashboard render: isLoadingBookmarks =', isLoadingBookmarks);
  console.log('🟢 Dashboard render: bookmarks.length =', bookmarks.length);
  console.log('🟢 Dashboard render: filteredBookmarks.length =', filteredBookmarks.length);
  console.log('🟢 Dashboard render: bookmarks =', bookmarks);
  // Removed isClient check to fix hydration issues and loading screen

  if (isLoadingBookmarks) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading your bookmarks...</p>
            <p className="mt-2 text-sm text-gray-500">Debug: Loading state = {isLoadingBookmarks ? 'true' : 'false'}</p>
            <p className="mt-1 text-sm text-gray-500">Debug: Bookmarks count = {bookmarks.length}</p>
          </div>
        </div>
      </div>
    )
  }

  // Utility functions for title and URL formatting
  // GRID CARD CHARACTER LIMIT STANDARD:
  // - Grid cards (GridBookmarkCard & CompactBookmarkCard): 14 characters max
  // - This ensures proper spacing from right edge (~1 character buffer)
  // - Use truncateTitle(title, 14) for all grid view cards
  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const extractDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      // If URL parsing fails, try to extract domain manually
      const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
      return match ? match[1] : url;
    }
  };

  const handleAddBookmark = async () => {
    // Validate required fields
    if (!newBookmark.title.trim()) {
      alert('Please enter a bookmark title');
      return;
    }
    
    if (!newBookmark.url.trim()) {
      alert('Please enter a bookmark URL');
      return;
    }
    
    // Validate URL format
    try {
      new URL(newBookmark.url);
    } catch {
      alert('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    try {
      console.log('🚀 Saving bookmark to database...');
      
      const requestBody = {
        title: newBookmark.title,
        url: newBookmark.url,
        description: newBookmark.description || 'No description provided',
        category: newBookmark.category,
        tags: newBookmark.tags ? newBookmark.tags.split(',').map(tag => tag.trim()) : [],
        notes: newBookmark.notes || 'No notes added',
        userId: userId, // Include userId for proper database association
        enableAI: true, // Enable AI automation for description, tags, and category
      };
      
      console.log('📤 Request body being sent:', requestBody);
      
      // Call the API to save the bookmark
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('📥 API Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save bookmark');
      }

      console.log('✅ Bookmark saved successfully:', result.bookmark);
      console.log('🤖 AI Data:', {
        ai_summary: result.bookmark?.ai_summary,
        ai_tags: result.bookmark?.ai_tags,
        ai_category: result.bookmark?.ai_category
      });
      
      // Reload bookmarks from the database to get the latest data
      await loadBookmarks();
      
      console.log('✅ Bookmarks reloaded from database');
      setShowAddBookmark(false);
      resetAddBookmarkForm();
      showNotification('Bookmark saved successfully!');
      
    } catch (error) {
      console.error('❌ Error saving bookmark:', error);
      alert(`Failed to save bookmark: ${(error as Error).message}`);
    }
  }

  const resetAddBookmarkForm = () => {
    setNewBookmark({
      title: '',
      url: '',
      description: '',
      tags: '',
      category: 'Development',
      priority: 'medium',
      notes: '',
      circularImage: '',
      logo: ''
    })
  }

  const handleAddFolder = () => {
    if (newFolder.name.trim()) {
      // For now, we'll just show a notification that the folder was created
      // In a real app, this would save to a database
      showNotification(`Folder "${newFolder.name}" created successfully!`)
      
      // Reset the form
      setNewFolder({
        name: '',
        color: '#3b82f6',
        description: ''
      })
      
      // Close the modal
      setShowAddFolder(false)
    }
  }

  const resetAddFolderForm = () => {
    setNewFolder({
      name: '',
      color: '#3b82f6',
      description: ''
    })
  }

  // Existing bookmarks handlers
  const handleExistingBookmarkSelect = (bookmarkId: number) => {
    setSelectedExistingBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    )
  }

  const handleAddExistingBookmarks = async () => {
    if (selectedExistingBookmarks.length === 0) {
      showNotification('Please select at least one bookmark to add')
      return
    }

    // Check if we're adding related bookmarks (modal is open with selected bookmark)
    if (isModalOpen && selectedBookmark) {
      // Add as related bookmarks to the selected bookmark
      const relatedBookmarkIds = selectedExistingBookmarks.map(id => 
        bookmarks.find(b => b.id === id)?.id || id
      ).filter(id => id !== selectedBookmark.id) // Don't add bookmark as related to itself

      if (relatedBookmarkIds.length === 0) {
        showNotification('Cannot add bookmark as related to itself')
        return
      }

      // Update the selected bookmark with new related bookmarks
      const updatedBookmark = {
        ...selectedBookmark,
        relatedBookmarks: [...(selectedBookmark.relatedBookmarks || []), ...relatedBookmarkIds]
      }

      // Update bookmarks array
      setBookmarks(prev => prev.map(bookmark => 
        bookmark.id === selectedBookmark.id ? updatedBookmark : bookmark
      ))

      // Update selected bookmark for immediate UI update
      setSelectedBookmark(updatedBookmark)
      
      // Save the updated bookmark to the backend
      try {
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: updatedBookmark.id,
            title: updatedBookmark.title,
            url: updatedBookmark.url,
            description: updatedBookmark.description || '',
            category: updatedBookmark.category || '',
            tags: Array.isArray(updatedBookmark.tags) ? updatedBookmark.tags : [],
            notes: updatedBookmark.notes || '',
            ai_summary: updatedBookmark.ai_summary || '',
            ai_tags: updatedBookmark.ai_tags || [],
            ai_category: updatedBookmark.ai_category || updatedBookmark.category || '',
            relatedBookmarks: updatedBookmark.relatedBookmarks || []
          })
        })

        const result = await response.json()
        
        if (result.success) {
          showNotification(`Added ${relatedBookmarkIds.length} related bookmark(s) successfully!`)
        } else {
          showNotification('Failed to save related bookmarks')
          console.error('Save failed:', result.error)
        }
      } catch (error) {
        showNotification('Error saving related bookmarks')
        console.error('Save error:', error)
      }
    } else {
      // Original functionality: Add as new bookmarks to workspace
      const bookmarksToAdd = availableBookmarks.filter(bookmark => 
        selectedExistingBookmarks.includes(bookmark.id)
      ).map(bookmark => ({
        ...bookmark,
        id: bookmarks.length + bookmark.id, // Ensure unique IDs
        isFavorite: false,
        visits: 0,
        lastVisited: new Date().toLocaleDateString(),
        dateAdded: new Date().toLocaleDateString(),
        favicon: bookmark.title.charAt(0).toUpperCase(),
        screenshot: "/placeholder.svg",
        notes: 'Added from available bookmarks',
        timeSpent: '0m',
        weeklyVisits: 0,
        siteHealth: 'working',
        project: {
          name: "IMPORTED",
          progress: 0,
          status: "New"
        }
      }))

      setBookmarks(prev => [...prev, ...bookmarksToAdd])
      showNotification(`Added ${bookmarksToAdd.length} bookmark(s) successfully!`)
    }

    setSelectedExistingBookmarks([])
    setShowAddBookmark(false)
  }

  const resetAddBookmarkModal = () => {
    setAddBookmarkTab('new')
    setSelectedExistingBookmarks([])
    setExistingBookmarksSearch('')
    resetAddBookmarkForm()
  }

  // Filter available bookmarks for search
  const filteredAvailableBookmarks = availableBookmarks.filter(bookmark => {
    const searchLower = existingBookmarksSearch.toLowerCase()
    return bookmark.title.toLowerCase().includes(searchLower) ||
           bookmark.description.toLowerCase().includes(searchLower) ||
           bookmark.category.toLowerCase().includes(searchLower) ||
           bookmark.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
  }).filter(availableBookmark => 
    // Only show bookmarks that aren't already added to the workspace
    !bookmarks.some(existingBookmark => existingBookmark.url === availableBookmark.url)
  )

  // Filter existing user bookmarks for the existing bookmarks tab
  const filteredExistingBookmarks = bookmarks.filter(bookmark => {
    const searchLower = existingBookmarksSearch.toLowerCase()
    return bookmark.title.toLowerCase().includes(searchLower) ||
           bookmark.description.toLowerCase().includes(searchLower) ||
           bookmark.category.toLowerCase().includes(searchLower) ||
           (Array.isArray(bookmark.tags) && bookmark.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
  }).filter(bookmark => 
    // Exclude the currently selected bookmark from the list
    selectedBookmark ? bookmark.id !== selectedBookmark.id : true
  )

  const handleBookmarkSelect = (bookmarkId: number) => {
    // Capture scroll position before any changes
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    
    // Disable browser scroll restoration
    const originalScrollRestoration = history.scrollRestoration
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual'
    }
    
    // Update state
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    )
    
    // Aggressive scroll position restoration
    const restoreScroll = () => {
      window.scrollTo(scrollX, scrollY)
    }
    
    // Multiple restoration strategies to handle React re-render timing
    restoreScroll() // Immediate
    requestAnimationFrame(restoreScroll) // Next frame
    setTimeout(restoreScroll, 0) // Next tick
    setTimeout(restoreScroll, 1) // Micro delay
    setTimeout(restoreScroll, 10) // Small delay
    setTimeout(restoreScroll, 50) // Medium delay
    
    // Restore browser scroll restoration after everything settles
    setTimeout(() => {
      if (originalScrollRestoration) {
        history.scrollRestoration = originalScrollRestoration
      }
    }, 100)
  }

  const handleBookmarkClick = (bookmark: any) => {
    setSelectedBookmark(bookmark)
    setIsModalOpen(true)
    
    // Track the visit using the combined function (updates both instances)
    // Note: We'll track this after setting selectedBookmark so the dedicated instance is initialized
    setTimeout(() => {
      if (bookmark?.id) {
        trackVisitCombined(bookmark.id)
      }
    }, 100)
    
    // Start time tracking for bookmark viewing
    const sessionStartTime = Date.now()
    const sessionData = {
      bookmarkId: bookmark.id,
      startTime: sessionStartTime,
      title: bookmark.title,
      type: 'viewing' // Track viewing time, not external site time
    }
    
    localStorage.setItem('bookmarkViewSession', JSON.stringify(sessionData))
    console.log('🚀 Started viewing time tracking for:', bookmark.title)
  }

  const startEditing = (field: string, currentValue: string | string[]) => {
    setEditingField(field)
    if (field === 'tags' && Array.isArray(currentValue)) {
      setEditingValue(currentValue.join(', '))
    } else {
      setEditingValue(currentValue as string)
    }
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditingValue('')
  }

  const saveEdit = async () => {
    if (!selectedBookmark || !editingField) return

    let newValue: string | string[] = editingValue
    if (editingField === 'tags') {
      newValue = editingValue.split(',').map(tag => tag.trim().toUpperCase()).filter(tag => tag.length > 0)
    } else if (editingField === 'title') {
      newValue = editingValue.toUpperCase()
    }

    // Create updated bookmark object
    const updatedBookmark = { ...selectedBookmark, [editingField]: newValue }

    try {
      // Save to bookmarks API endpoint with ID for update
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedBookmark.id, // Include ID for update
          title: updatedBookmark.title,
          url: updatedBookmark.url,
          description: updatedBookmark.description || '',
          category: updatedBookmark.category || '',
          tags: Array.isArray(updatedBookmark.tags) ? updatedBookmark.tags : [],
          notes: updatedBookmark.notes || '',
          ai_summary: updatedBookmark.ai_summary || '',
          ai_tags: updatedBookmark.ai_tags || [],
          ai_category: updatedBookmark.ai_category || updatedBookmark.category || ''
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update the bookmark in the bookmarks array only after successful save
        setBookmarks(prev => prev.map(bookmark => 
          bookmark.id === selectedBookmark.id 
            ? updatedBookmark
            : bookmark
        ))

        // Update the selected bookmark for immediate UI update
        setSelectedBookmark(updatedBookmark)
        
        showNotification(`${editingField} updated successfully!`)
      } else {
        showNotification('Failed to save changes')
        console.error('Save failed:', result.error)
      }
    } catch (error) {
      showNotification('Error saving changes')
      console.error('Save error:', error)
    }

    setEditingField(null)
    setEditingValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle special keys if we're in an input field for editing
    const target = e.target as HTMLElement
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
    
    if (isInputField) {
      // Allow normal text editing in input fields
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        saveEdit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        cancelEditing()
      }
      // For all other keys (including backspace), let them work normally in the input
      // Stop propagation to prevent other handlers from interfering
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key.length === 1) {
        e.stopPropagation()
      }
    }
  }

  const toggleFavorite = async () => {
    if (!selectedBookmark) return

    const newFavoriteStatus = !selectedBookmark.isFavorite
    const updatedBookmark = { ...selectedBookmark, isFavorite: newFavoriteStatus }

    try {
      // Save to bookmarks API endpoint with ID for update
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedBookmark.id, // Include ID for update
          title: updatedBookmark.title,
          url: updatedBookmark.url,
          description: updatedBookmark.description || '',
          category: updatedBookmark.category || '',
          tags: Array.isArray(updatedBookmark.tags) ? updatedBookmark.tags : [],
          notes: updatedBookmark.notes || '',
          ai_summary: updatedBookmark.ai_summary || '',
          ai_tags: updatedBookmark.ai_tags || [],
          ai_category: updatedBookmark.ai_category || updatedBookmark.category || ''
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update the bookmark in the bookmarks array only after successful save
        setBookmarks(prev => prev.map(bookmark => 
          bookmark.id === selectedBookmark.id 
            ? updatedBookmark
            : bookmark
        ))

        // Update the selected bookmark for immediate UI update
        setSelectedBookmark(updatedBookmark)
        
        showNotification(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!')
      } else {
        showNotification('Failed to update favorite status')
        console.error('Save failed:', result.error)
      }
    } catch (error) {
      showNotification('Error updating favorite status')
      console.error('Save error:', error)
    }
  }

  const shareBookmark = async () => {
    if (!selectedBookmark) return

    const shareData = {
      title: selectedBookmark.title,
      text: selectedBookmark.description,
      url: selectedBookmark.url,
    }

    try {
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${selectedBookmark.title}\n${selectedBookmark.description}\n${selectedBookmark.url}`)
        showNotification('Bookmark details copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback to copying URL only
      try {
        await navigator.clipboard.writeText(selectedBookmark.url)
        showNotification('Bookmark URL copied to clipboard!')
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError)
        showNotification('Unable to share or copy bookmark')
      }
    }
  }

  const copyBookmarkUrl = async () => {
    if (!selectedBookmark) return

    try {
      await navigator.clipboard.writeText(selectedBookmark.url)
      showNotification('Bookmark URL copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = selectedBookmark.url
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        showNotification('Bookmark URL copied to clipboard!')
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
        showNotification('Unable to copy URL to clipboard')
      }
      document.body.removeChild(textArea)
    }
  }

  const visitSite = () => {
    if (!selectedBookmark) return
    
    // Track the visit using the combined function (updates both instances)
    trackVisitCombined(selectedBookmark.id)
    
    // Open the bookmark URL
    window.open(selectedBookmark.url, '_blank', 'noopener,noreferrer')
    
    console.log('🔗 Opened bookmark:', selectedBookmark.title)
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const deleteBookmark = async (bookmarkId: string | number) => {
    try {
      const response = await fetch(`/api/bookmarks?id=${bookmarkId}&user_id=${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove bookmark from local state
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        showNotification('Bookmark deleted successfully!');
      } else {
        showNotification('Failed to delete bookmark');
        console.error('Delete failed:', data.error);
      }
    } catch (error) {
      showNotification('Error deleting bookmark');
      console.error('Delete error:', error);
    }
  }

  const handleSetDefaultLogo = async () => {
    if (!selectedBookmark || !newDefaultLogo) return;
    try {
      // Persist per-bookmark logo by storing it in customBackground
      const resp = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBookmark.id,
          customBackground: newDefaultLogo,
          // include existing fields to satisfy update payload
          title: selectedBookmark.title,
          url: selectedBookmark.url,
          description: selectedBookmark.description || '',
          category: selectedBookmark.category || '',
          tags: Array.isArray(selectedBookmark.tags) ? selectedBookmark.tags : [],
          notes: selectedBookmark.notes || '',
          ai_summary: selectedBookmark.ai_summary || '',
          ai_tags: Array.isArray(selectedBookmark.ai_tags) ? selectedBookmark.ai_tags : [],
          ai_category: selectedBookmark.ai_category || null
        })
      })
      if (!resp.ok) throw new Error('Failed to save bookmark logo')

      // Update local state for this bookmark only (avatar + background)
      setBookmarks(prev => prev.map(b =>
        String(b.id) === String(selectedBookmark.id)
          ? { ...b, customBackground: newDefaultLogo, circularImage: newDefaultLogo }
          : b
      ))
      setSelectedBookmark(prev => prev ? { ...prev, customBackground: newDefaultLogo, circularImage: newDefaultLogo } : prev)

      setShowDefaultLogoModal(false)
      setNewDefaultLogo('')
      showNotification('Bookmark logo updated')
    } catch (e) {
      console.error(e)
      showNotification('Failed to update logo')
    }
  }

  const openDefaultLogoModal = () => {
    setNewDefaultLogo(userDefaultLogo)
    setShowDefaultLogoModal(true)
  }

  const handleBackgroundUpload = async () => {
    if (!selectedBookmark) return;
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setUploadingBackground(true)
        try {
          const reader = new FileReader()
          reader.onload = async (e) => {
            const imageDataUrl = e.target?.result as string
            
            // Update this specific bookmark background (front avatar uses this)
            const response = await fetch('/api/bookmarks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: selectedBookmark.id,
                customBackground: imageDataUrl,
                // Include existing bookmark data to avoid overwrites
                title: selectedBookmark.title,
                url: selectedBookmark.url,
                description: selectedBookmark.description || '',
                category: selectedBookmark.category || '',
                tags: Array.isArray(selectedBookmark.tags) ? selectedBookmark.tags : [],
                notes: selectedBookmark.notes || '',
                ai_summary: selectedBookmark.ai_summary || '',
                ai_tags: Array.isArray(selectedBookmark.ai_tags) ? selectedBookmark.ai_tags : [],
                ai_category: selectedBookmark.ai_category || null,
                is_favorite: selectedBookmark.is_favorite || false,
                project: selectedBookmark.project || null,
                tasks: selectedBookmark.tasks || [],
                relatedBookmarks: selectedBookmark.relatedBookmarks || []
              })
            })

            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`Failed to save background: ${errorText}`)
            }

            // Verify by reloading this bookmark from the API (ensures Supabase write succeeded)
            try {
              const verifyRes = await fetch(`/api/bookmarks`)
              const verifyJson = await verifyRes.json()
              const refreshed = Array.isArray(verifyJson?.bookmarks) ? verifyJson.bookmarks.find((b:any) => String(b.id) === String(selectedBookmark.id)) : null
              if (refreshed) {
                // Update local state with authoritative values
                setBookmarks(prev => prev.map((bookmark) =>
                  String(bookmark.id) === String(selectedBookmark.id)
                    ? { 
                        ...bookmark, 
                        customBackground: refreshed.customBackground || imageDataUrl
                      }
                    : bookmark
                ))
                setSelectedBookmark((prev) => prev ? { 
                  ...prev, 
                  customBackground: refreshed.customBackground || imageDataUrl
                } : prev)
              } else {
                // Fallback to optimistic state if verify failed
                setBookmarks(prev => prev.map((bookmark) =>
                  String(bookmark.id) === String(selectedBookmark.id)
                    ? { ...bookmark, customBackground: imageDataUrl }
                    : bookmark
                ))
                setSelectedBookmark((prev) => prev ? { ...prev, customBackground: imageDataUrl } : prev)
              }
            } catch {}
            
            toast.success('✅ Background uploaded and saved!')
          }
          reader.readAsDataURL(file)
        } catch (error) {
          console.error('Background upload error:', error)
          toast.error('Failed to upload background')
        } finally {
          setUploadingBackground(false)
        }
      }
    }
    input.click()
  }

  // New explicit button: Replace Front (BG + avatar via customBackground)
  const handleReplaceFront = async () => {
    await handleBackgroundUpload();
  }

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value)
    setActiveBookmarkTab(value)
    if (value === 'media') {
      console.log('Media tab visited - setting hasVisitedMediaTab to true')
      setHasVisitedMediaTab(true)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && over?.id) {
      // Handle bookmark reordering
      const activeBookmarkIndex = bookmarks.findIndex((item) => item.id === active.id)
      const overBookmarkIndex = bookmarks.findIndex((item) => item.id === over.id)
      
      if (activeBookmarkIndex !== -1 && overBookmarkIndex !== -1) {
        setBookmarks((items) => arrayMove(items, activeBookmarkIndex, overBookmarkIndex))
        return
      }

      // Handle mockGoalFolders reordering (Goal 2.0) - only in goal2 view
      if (viewMode === 'goal2') {
        const activeGoalIndex = mockGoalFolders.findIndex((item) => item.id === active.id)
        const overGoalIndex = mockGoalFolders.findIndex((item) => item.id === over.id)
        
        console.log('🎯 Goal 2.0 Drag Debug:', {
          activeId: active.id,
          overId: over.id,
          activeGoalIndex,
          overGoalIndex,
          mockGoalFoldersLength: mockGoalFolders.length,
          mockGoalFolders: mockGoalFolders.map(f => ({ id: f.id, name: f.name }))
        })
        
        if (activeGoalIndex !== -1 && overGoalIndex !== -1) {
          console.log('✅ Goal 2.0 Reordering folders from index', activeGoalIndex, 'to index', overGoalIndex)
          setMockGoalFolders((items) => {
            const newItems = arrayMove(items, activeGoalIndex, overGoalIndex)
            console.log('🎯 New Goal order:', newItems.map(f => ({ id: f.id, name: f.name })))
            return newItems
          })
          console.log('🎉 Goal 2.0 drag-and-drop completed successfully!')
          return
        }
      }

          // Handle dynamicFolders reordering (Folder 2.0)
    const activeFolderIndex = dynamicFolders.findIndex((item) => item.id === active.id)
    const overFolderIndex = dynamicFolders.findIndex((item) => item.id === over.id)
    
    if (activeFolderIndex !== -1 && overFolderIndex !== -1) {
      setDynamicFolders((items) => arrayMove(items, activeFolderIndex, overFolderIndex))
      return
    }

      // Handle category folder reordering for Compact & List folder views
      if ((viewMode === 'compact' || viewMode === 'list') && compactViewMode === 'folders') {
        const activeCatIndex = folderCategories.findIndex((cat) => cat === active.id)
        const overCatIndex = folderCategories.findIndex((cat) => cat === over.id)
        if (activeCatIndex !== -1 && overCatIndex !== -1) {
          setFolderCategories((items) => arrayMove(items, activeCatIndex, overCatIndex))
          return
        }
      }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getSiteHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'good':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      case 'working':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      case 'fair':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'poor':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200'
      case 'broken':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Check health of bookmarks
  const checkBookmarkHealth = async (bookmarkIds: number[]) => {
    try {
      // Set loading state for each bookmark
      const loadingStates: { [key: number]: boolean } = {};
      bookmarkIds.forEach(id => {
        loadingStates[id] = true;
      });
      setHealthCheckLoading(prev => ({ ...prev, ...loadingStates }));

      const response = await fetch('/api/bookmarks/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarkIds,
          userId: userId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to check bookmark health')
      }

      const data = await response.json()
      
      if (data.success) {
        // Update bookmarks with new health status - the API already increments the count
        setBookmarks(prev => prev.map(bookmark => {
          const healthResult = data.results.find((r: any) => r.bookmarkId === bookmark.id)
          if (healthResult) {
            return {
              ...bookmark,
              site_health: healthResult.status,
              siteHealth: healthResult.status, // Keep both for compatibility
              last_health_check: healthResult.lastChecked,
              lastHealthCheck: healthResult.lastChecked, // Keep both for compatibility
              // Don't increment here - the API already incremented and saved the count
              // We'll get the updated count when we reload bookmarks from the database
            }
          }
          return bookmark
        }))
        
        // Reload bookmarks from database to get the updated health check count
        setTimeout(() => {
          loadBookmarks()
        }, 100)
        
        // Refresh analytics summary to update the BROKEN card count
        setTimeout(async () => {
          try {
            const res = await fetch('/api/analytics/summary')
            const json = await res.json()
            if (json && !json.error) setSummary(json)
          } catch {}
        }, 200)
        
        showNotification(`Health check completed for ${data.results.length} bookmarks`)
      }
    } catch (error) {
      console.error('Health check error:', error)
      showNotification('Failed to check bookmark health')
    } finally {
      // Clear loading state for all checked bookmarks
      const clearedStates: { [key: number]: boolean } = {};
      bookmarkIds.forEach(id => {
        clearedStates[id] = false;
      });
      setHealthCheckLoading(prev => ({ ...prev, ...clearedStates }));
    }
  }

  // Calculate total visits across all bookmarks for percentage calculation - using live analytics data
  const totalVisits = bookmarks.reduce((sum, bookmark) => {
    const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
    return sum + (analytics ? analytics.visits : 0) // Never fall back to bookmark.visits
  }, 0)

  // Calculate usage percentage for a bookmark
  const getUsagePercentage = (visits: number) => {
    if (totalVisits === 0) return 0
    return Math.round((visits / totalVisits) * 100)
  }

  // Get category color for folder icons
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Development': 'text-red-500',
      'Design': 'text-blue-500',
      'Productivity': 'text-green-500',
      'Entertainment': 'text-purple-500',
      'Social': 'text-yellow-500',
      'Education': 'text-indigo-500',
      'News': 'text-orange-500',
      'Shopping': 'text-pink-500',
      'Finance': 'text-teal-500',
      'Health': 'text-emerald-500'
    }
    return colors[category] || 'text-gray-600'
  }

  // Get percentage color based on usage level
  const getPercentageColor = (percentage: number) => {
    if (percentage < 25) return '#dc2626' // red-600
    if (percentage < 50) return '#2563eb' // blue-600
    if (percentage < 75) return '#ea580c' // orange-600
    return '#16a34a' // green-600
  }

  // Hexagon component for displaying usage percentage
  const UsageHexagon = ({ percentage }: { percentage: number }) => {
    const color = getPercentageColor(percentage)
    return (
      <div className="absolute bottom-2 right-2 flex items-center justify-center">
        <svg width="80" height="70" viewBox="0 0 80 70" className="drop-shadow-sm">
          {/* Hexagon shape */}
          <path
            d="M40 5 L65 18 L65 47 L40 60 L15 47 L15 18 Z"
            fill="white"
            stroke={color}
            strokeWidth="2"
          />
          {/* Percentage text */}
          <text
            x="40"
            y="35"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize="18"
            fontWeight="bold"
          >
            {percentage}%
          </text>
        </svg>
      </div>
    )
  }

  // Action icons component for top right corner
  const BookmarkActionIcons = ({ bookmark }: { bookmark: any }) => (
    <TooltipProvider>
      <div className="absolute top-12 right-2 flex flex-col items-center space-y-1 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Toggle favorite for this specific bookmark
                const newFavoriteStatus = !bookmark.isFavorite
                setBookmarks(prev => prev.map(b => 
                  b.id === bookmark.id 
                    ? { ...b, isFavorite: newFavoriteStatus }
                    : b
                ))
                
                // Save to backend
                fetch('/api/bookmarks', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    id: bookmark.id,
                    user_id: 'dev-user-123',
                    title: bookmark.title,
                    url: bookmark.url,
                    description: bookmark.description,
                    category: bookmark.category,
                    tags: bookmark.tags,
                    notes: bookmark.notes,
                    isFavorite: newFavoriteStatus,
                    ai_summary: bookmark.ai_summary,
                    ai_tags: bookmark.ai_tags,
                    ai_category: bookmark.ai_category
                  }),
                })
              }}
            >
              <Heart className={`h-4 w-4 ${bookmark.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add to favorites</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Open bookmark detail modal
                setSelectedBookmark(bookmark)
                setIsModalOpen(true)
              }}
            >
              <Eye className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View details</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Start editing the bookmark title
                setSelectedBookmark(bookmark)
                startEditing('title', bookmark.title)
              }}
            >
              <Edit2 className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit bookmark</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={async (e) => {
                e.stopPropagation()
                console.log('🔄 Duplicate button clicked for bookmark:', bookmark.title)
                try {
                  // Create duplicate bookmark object
                  const duplicatedBookmark = {
                    user_id: 'dev-user-123',
                    title: `${bookmark.title} (Copy)`,
                    url: bookmark.url,
                    description: bookmark.description || '',
                    category: bookmark.category || 'General',
                    tags: bookmark.tags || [],
                    notes: bookmark.notes || '',
                    ai_summary: bookmark.ai_summary || '',
                    ai_tags: bookmark.ai_tags || [],
                    ai_category: bookmark.ai_category || bookmark.category || 'General'
                  }

                  console.log('📋 Creating duplicate bookmark:', duplicatedBookmark)

                  // Save to backend
                  const response = await fetch('/api/bookmarks', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(duplicatedBookmark),
                  })

                  console.log('🌐 API Response status:', response.status)

                  if (response.ok) {
                    const result = await response.json()
                    console.log('✅ API Response:', result)
                    if (result.success) {
                      // Reload bookmarks to show the new duplicate
                      console.log('🔄 Reloading bookmarks...')
                      loadBookmarks()
                      showNotification('Bookmark duplicated successfully!')
                    } else {
                      console.error('❌ API returned failure:', result)
                      showNotification('Failed to duplicate bookmark')
                    }
                  } else {
                    console.error('❌ API request failed with status:', response.status)
                    showNotification('Failed to duplicate bookmark')
                  }
                } catch (error) {
                  console.error('❌ Error duplicating bookmark:', error)
                  showNotification('Failed to duplicate bookmark')
                }
              }}
            >
              <Copy className="h-4 w-4 text-gray-400 hover:text-purple-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Duplicate bookmark</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Share bookmark
                const shareData = {
                  title: bookmark.title,
                  text: bookmark.description,
                  url: bookmark.url,
                }
                if (navigator.share) {
                  navigator.share(shareData).catch((error) => {
                    console.error('Error sharing:', error)
                    if (error instanceof Error && error.name === 'InvalidStateError') {
                      showNotification('Please wait for the previous share to complete')
                    } else {
                      showNotification('Failed to share bookmark')
                    }
                  })
                } else {
                  navigator.clipboard.writeText(`${bookmark.title}\n${bookmark.description}\n${bookmark.url}`).then(() => {
                    showNotification('Bookmark details copied to clipboard!')
                  }).catch(() => {
                    showNotification('Failed to share bookmark')
                  })
                }
              }}
            >
              <Share2 className="h-4 w-4 text-gray-400 hover:text-green-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share bookmark</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Delete bookmark with confirmation
                if (confirm(`Are you sure you want to delete "${bookmark.title}"?`)) {
                  deleteBookmark(bookmark.id)
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete bookmark</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )

  // Enhanced Site Health Component with modal analytics card design
  const SiteHealthComponent = ({ bookmark, onClick, isLoading = false }: { 
    bookmark: any; 
    onClick?: () => void; 
    isLoading?: boolean;
  }) => {
    const health = bookmark.site_health || bookmark.siteHealth || 'working';
    const isClickable = !!onClick;
    
    const getHealthIcon = () => {
      if (isLoading) {
        return <RotateCcw className="h-7 w-7 animate-spin" />;
      }
      
      switch (health) {
        case 'excellent':
          return <CheckCircle className="h-7 w-7" />;
        case 'good':
          return <Shield className="h-7 w-7" />;
        case 'working':
          return <Shield className="h-7 w-7" />;
        case 'fair':
          return <AlertTriangle className="h-7 w-7" />;
        case 'poor':
          return <AlertTriangle className="h-7 w-7" />;
        case 'broken':
          return <X className="h-7 w-7" />;
        default:
          return <Globe className="h-7 w-7" />;
      }
    };
    
    const getHealthColor = () => {
      switch (health) {
        case 'excellent':
          return 'text-emerald-600';
        case 'good':
          return 'text-green-600';
        case 'working':
          return 'text-green-600';
        case 'fair':
          return 'text-amber-600';
        case 'poor':
          return 'text-orange-600';
        case 'broken':
          return 'text-red-600';
        default:
          return 'text-gray-600';
      }
    };
    
    const getHealthText = () => {
      if (isLoading) return 'CHECKING...';
      
      switch (health) {
        case 'excellent':
          return 'WORKING';
        case 'good':
          return 'WORKING';
        case 'working':
          return 'WORKING';
        case 'fair':
          return 'WORKING';
        case 'poor':
          return 'BROKEN';
        case 'broken':
          return 'BROKEN';
        default:
          return 'BROKEN';
      }
    };

    const getHealthCheckCount = () => {
      if (isLoading) return '...';
      
      // Get health check count from bookmark data
      const healthCheckCount = bookmark.healthCheckCount || 0;
      
      return healthCheckCount;
    };

    const getStatusIndicator = () => {
      if (isLoading) return null;
      
      return (
        <div className={`w-2 h-2 rounded-full mt-1 mx-auto ${
          health === 'working' || health === 'good' || health === 'excellent' 
            ? 'bg-green-500 animate-pulse' 
            : health === 'fair' 
            ? 'bg-yellow-500' 
            : 'bg-red-500'
        }`} title="Live status indicator" />
      );
    };

    return (
      <div 
        className={`text-center w-full ${
          isClickable ? 'cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg' : ''
        }`}
        onClick={isClickable ? onClick : undefined}
        title={isClickable ? `Click to check ${bookmark.title} health` : `Site health: ${health}`}
      >
        <div className={`flex justify-center mx-auto mb-3 ${getHealthColor()}`}>
          {getHealthIcon()}
        </div>
        <p className={`text-3xl font-bold ${getHealthColor()}`}>
          {getHealthCheckCount()}
        </p>
        <p className="text-xs text-muted-foreground font-medium">
          {getHealthText()}
        </p>
        {getStatusIndicator()}
      </div>
    );
  };

  const SiteHealthComponentModal = ({ bookmark, onClick, isLoading = false }: { 
    bookmark: any; 
    onClick?: () => void; 
    isLoading?: boolean;
  }) => {
    const health = bookmark.site_health || bookmark.siteHealth || 'unknown';

    const getHealthIcon = () => {
      if (isLoading) {
        return <RotateCcw className="h-8 w-8 animate-spin" />;
      }
      
      switch (health) {
        case 'excellent':
          return <Shield className="h-8 w-8" />;
        case 'good':
          return <Shield className="h-8 w-8" />;
        case 'working':
          return <Shield className="h-8 w-8" />;
        case 'fair':
          return <AlertTriangle className="h-8 w-8" />;
        case 'poor':
          return <AlertCircle className="h-8 w-8" />;
        default:
          return <Shield className="h-8 w-8" />;
      }
    };

    const getHealthColor = () => {
      if (isLoading) return 'text-blue-500';
      
      switch (health) {
        case 'excellent':
          return 'text-green-600';
        case 'good':
          return 'text-green-500';
        case 'working':
          return 'text-green-500';
        case 'fair':
          return 'text-yellow-500';
        case 'poor':
          return 'text-red-500';
        default:
          return 'text-gray-500';
      }
    };

    const getHealthText = () => {
      if (isLoading) return 'CHECKING...';
      
      switch (health) {
        case 'excellent':
          return 'WORKING';
        case 'good':
          return 'WORKING';
        case 'working':
          return 'WORKING';
        case 'fair':
          return 'WORKING';
        case 'poor':
          return 'BROKEN';
        case 'broken':
          return 'BROKEN';
        default:
          return 'BROKEN';
      }
    };

    const getStatusIndicator = () => {
      if (isLoading) return null;
      
      return (
        <div className={`w-2 h-2 rounded-full mt-1 mx-auto ${
          health === 'working' || health === 'good' || health === 'excellent' 
            ? 'bg-green-500 animate-pulse' 
            : health === 'fair' 
            ? 'bg-yellow-500' 
            : 'bg-red-500'
        }`} title="Live status indicator" />
      );
    };

    return (
      <div 
        className={`text-center w-full ${
          onClick ? 'cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg' : ''
        }`}
        onClick={onClick}
        title={onClick ? `Click to check ${bookmark.title} health` : `Site health: ${health}`}
      >
        <div className={`flex justify-center mx-auto mb-3 ${getHealthColor()}`}>
          {getHealthIcon()}
        </div>
        {getStatusIndicator()}
      </div>
    );
  };

  const SortableGridBookmarkCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Top Right Corner */}
        <div 
          {...listeners} 
          className="absolute top-2 right-2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <GridBookmarkCard bookmark={bookmark} />
      </div>
    )
  }

  const GridBookmarkCard = ({ bookmark }: { bookmark: any }) => (
    <Card 
      className="group hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white border border-gray-300 backdrop-blur-sm relative overflow-hidden"
      style={{
        borderColor: 'rgb(209 213 219)', // gray-300
        transition: 'all 0.5s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = themeColor;
        e.currentTarget.style.boxShadow = `0 25px 50px -12px ${themeColor}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgb(209 213 219)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
      }}
      onClick={(e) => {
        // Handle bulk selection mode
        if (bulkMode) {
          e.preventDefault()
          e.stopPropagation()
          handleBookmarkSelect(bookmark.id)
          return
        }
        // Don't open modal if we're currently editing this bookmark
        if (editingField && selectedBookmark?.id === bookmark.id) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        handleBookmarkClick(bookmark)
      }}
    >
      {/* Bulk Selection Checkbox - Simplified Direct Approach */}
      {bulkMode && (
        <div 
          className="absolute top-3 left-3 z-[9999] cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Checkbox clicked for bookmark:', bookmark.id)
            handleBookmarkSelect(bookmark.id)
          }}
        >
          <div 
            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center shadow-lg ${
              selectedBookmarks.includes(bookmark.id) 
                ? 'bg-blue-600 border-blue-600' 
                : 'bg-white border-gray-400 hover:border-blue-500'
            }`}
          >
            {selectedBookmarks.includes(bookmark.id) && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Background Website Logo with 5% opacity - Custom background takes priority */}
      {(() => {
        if (bookmark.customBackground) {
          return (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
              style={{
                backgroundImage: `url(${bookmark.customBackground})`,
                backgroundSize: (bookmark.customBackground && /logo\.clearbit\.com|faviconkit\.com|s2\/favicons/.test(bookmark.customBackground)) ? '140% 140%' : 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.10
              }}
            />
          );
        } else {
          const domain = extractDomain(bookmark.url);
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
          const bg = bookmark.customBackground || userDefaultLogo || faviconUrl;
          return (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: (bg && /logo\.clearbit\.com|faviconkit\.com|s2\/favicons/.test(bg)) ? '140% 140%' : 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.10
              }}
            />
          );
        }
      })()}
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative z-20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center ring-2 ring-gray-300/50 group-hover:ring-gray-400 transition-all duration-300 shadow-sm">
              {(() => {
                const domain = extractDomain(bookmark.url);
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                return (
                  <img 
                    src={bookmark.customBackground || faviconUrl} 
                    alt={`${bookmark.title} favicon`}
                    className="w-8 h-8 rounded-lg"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.onerror = null;
                      el.src = userDefaultLogo || "/placeholder.svg";
                    }}
                  />
                );
              })()}
            </div>
            <div className="flex-1 min-w-0">
              {editingField === 'title' && selectedBookmark?.id === bookmark.id ? (
                <div 
                  className="flex items-center space-x-2"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                    }}
                    className="font-bold text-gray-900 font-audiowide uppercase text-lg bg-transparent border-b-2 border-blue-500 outline-none flex-1"
                    autoFocus
                    placeholder="Enter title..."
                  />
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        saveEdit()
                      }}
                      className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        cancelEditing()
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <h3 
                  className="font-bold text-gray-900 font-audiowide uppercase text-lg group-hover:text-blue-900 transition-colors duration-300 truncate cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBookmark(bookmark);
                    startEditing('title', bookmark.title);
                  }}
                >
                  {truncateTitle(bookmark.title, 14)}
                </h3>
              )}
              <p className="text-sm text-blue-600 hover:underline font-medium mt-1">{extractDomain(bookmark.url)}</p>
            </div>
          </div>
        </div>
        
        {/* Action Icons for Grid View */}
        <BookmarkActionIcons bookmark={bookmark} />
        
        <div className="mb-4 flex justify-center">
          <div className="relative">
            {(() => {
              const domain = extractDomain(bookmark.url);
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
              const globalLogo = userDefaultLogo && !/default-profile/i.test(userDefaultLogo) && userDefaultLogo.trim() !== '' ? userDefaultLogo : undefined;
              const src = globalLogo || faviconUrl;
              return (
                <img 
                  src={src}
                  alt={`${bookmark.title} image`}
                  className="w-24 h-24 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-2 ring-gray-200/50 group-hover:ring-blue-300/60 transition-all duration-300 shadow-md group-hover:shadow-lg"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.onerror = null;
                    el.src = "/placeholder.svg";
                  }}
                />
              );
            })()}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-transparent to-black/5 group-hover:to-blue-500/10 transition-all duration-300"></div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {bookmark.ai_summary || bookmark.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <Badge className={`text-xs border shadow-sm ${getPriorityColor(bookmark.priority)}`}>
            {bookmark.priority}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200/50 hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300">
            {bookmark.ai_category || bookmark.category}
            {bookmark.ai_category && bookmark.ai_category !== bookmark.category && (
              <span className="ml-1 text-blue-600">🤖</span>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100/80 mb-6 relative">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1.5">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">
                {(() => {
                  const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
                  const directCache = directAnalyticsCache[bookmark.id]
                  

                  
                  // NEVER fall back to bookmark data - always use analytics or show 0
                  // This prevents the reversion issue on page refresh
                  const finalVisits = (analytics && analytics.visits !== undefined) ? analytics.visits : 0;
                  
                  return finalVisits;
                })()}
              </span>
              {/* Real-time indicator */}
              {!analyticsLoading && getBookmarkAnalytics(bookmark.id) && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live data" />
              )}
            </div>
            <div className="flex items-center space-x-2 bg-green-50/80 rounded-full px-3 py-1.5">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                {(() => {
                  const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
                  const directCache = directAnalyticsCache[bookmark.id]
                  

                  
                  // NEVER fall back to bookmark data - always use analytics or show 0
                  const timeSpent = analytics ? analytics.timeSpent : 0
                  const timeDisplay = timeSpent > 0 ? `${timeSpent}m` : '0m';
                  
                  return timeDisplay;
                })()}
              </span>
              {/* Real-time indicator */}
              {!analyticsLoading && getBookmarkAnalytics(bookmark.id) && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live data" />
              )}
            </div>
          </div>
          {/* Usage Percentage Hexagon - Moved here to be even with visits */}
          <div className="flex flex-col items-center justify-center">
            <svg width="70" height="62" viewBox="0 0 70 62" className="drop-shadow-sm">
              <path
                d="M35 4 L55 15 L55 40 L35 51 L15 40 L15 15 Z"
                fill="white"
                stroke={(() => {
                  const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
                  const visits = analytics ? analytics.visits : 0
                  const percentage = getUsagePercentage(visits)
                  return getPercentageColor(percentage)
                })()}
                strokeWidth="2"
              />
              <text
                x="35"
                y="30"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={(() => {
                  const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
                  const visits = analytics ? analytics.visits : 0
                  const percentage = getUsagePercentage(visits)
                  return getPercentageColor(percentage)
                })()}
                fontSize="16"
                fontWeight="bold"
              >
                {(() => {
                  const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
                  const visits = analytics ? analytics.visits : 0
                  return getUsagePercentage(visits)
                })()}%
              </text>
            </svg>
            <span className="text-xs text-gray-800 font-bold mt-1">USAGE</span>
          </div>
        </div>



        {/* Project Information Section - Moved to bottom and separated */}
        <div className="border-t border-gray-200/60 pt-3 mt-2">
          {/* Open/Completed Task stats above progress bar */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">OPEN TASK</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">TOTAL: {(() => {
              const tasks = (bookmark.tasks || []) as Array<{ isCompleted?: boolean }>
              return tasks.filter(t => !t.isCompleted).length
            })()}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">COMPLETED TASK</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">TOTAL: {(() => {
              const tasks = (bookmark.tasks || []) as Array<{ isCompleted?: boolean }>
              return tasks.filter(t => !!t.isCompleted).length
            })()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            {(() => {
              const t = (bookmark.tasks || []) as Array<{estimatedPomodoros?:number; completedPomodoros?:number; isCompleted?:boolean}>
              const pct = (() => {
                if (!t.length) return (bookmark.project?.progress || 0)
                const totals = t.reduce((acc,task)=>{
                  const est = Math.max(0, Number(task.estimatedPomodoros||0))
                  const comp = Math.max(0, Number(task.completedPomodoros||0))
                  return { est: acc.est + est, comp: acc.comp + Math.min(comp, est) }
                }, { est: 0, comp: 0 })
                return totals.est > 0 ? Math.round((totals.comp / totals.est) * 100) : (bookmark.project?.progress || 0)
              })()
              return (
                <div 
                  className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                ></div>
              )
            })()}
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-semibold text-green-600">{(() => {
              const t = (bookmark.tasks || []) as Array<{estimatedPomodoros?:number; completedPomodoros?:number; isCompleted?:boolean}>
              if (!t.length) return bookmark.project?.progress || 0
              const totals = t.reduce((acc,task)=>{
                const est = Math.max(0, Number(task.estimatedPomodoros||0))
                const comp = Math.max(0, Number(task.completedPomodoros||0))
                return { est: acc.est + est, comp: acc.comp + Math.min(comp, est) }
              }, { est: 0, comp: 0 })
              const pct = totals.est > 0 ? Math.round((totals.comp / totals.est) * 100) : (bookmark.project?.progress || 0)
              return pct
            })()}%</span>
          </div>
        </div>
      </CardContent>
      
      {/* Action Icons */}
      <BookmarkActionIcons bookmark={bookmark} />
    </Card>
  )

  const SortableCompactBookmarkCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
        <CompactBookmarkCard bookmark={bookmark} />
      </div>
    )
  }

  const CompactBookmarkCard = ({ bookmark }: { bookmark: any }) => (
    <div 
      className="group cursor-pointer"
      onClick={(e) => {
        // Handle bulk selection mode
        if (bulkMode) {
          e.preventDefault()
          e.stopPropagation()
          handleBookmarkSelect(bookmark.id)
          return
        }
        handleBookmarkClick(bookmark)
      }}
    >
      {/* Square Box Design matching folder cards - SAME SIZE */}
      <div className="aspect-square w-full bg-white border border-black relative overflow-hidden rounded-lg">
        
                 {/* Bulk Selection Checkbox for Compact View */}
         {bulkMode && (
           <div 
             className="absolute top-2 left-2 z-[9999] cursor-pointer"
             onMouseDown={(e) => e.stopPropagation()}
             onMouseUp={(e) => e.stopPropagation()}
             onClick={(e) => {
               e.preventDefault()
               e.stopPropagation()
               console.log('Compact checkbox clicked for bookmark:', bookmark.id)
               handleBookmarkSelect(bookmark.id)
             }}
           >
             <div 
               className={`w-5 h-5 border-2 rounded-md flex items-center justify-center shadow-lg ${
                 selectedBookmarks.includes(bookmark.id) 
                   ? 'bg-blue-600 border-blue-600' 
                   : 'bg-white border-gray-400 hover:border-blue-500'
               }`}
             >
               {selectedBookmarks.includes(bookmark.id) && (
                 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                 </svg>
               )}
             </div>
           </div>
         )}
        {/* Background Website Logo with 5% opacity - Custom background takes priority */}
        {(() => {
          if (bookmark.customBackground) {
            return (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${bookmark.customBackground})`,
                  opacity: 0.10
                }}
              />
            );
          } else {
            const domain = extractDomain(bookmark.url);
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            const bg = bookmark.customBackground || userDefaultLogo || faviconUrl;
            return (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${bg})`,
                  opacity: 0.10
                }}
              />
            );
          }
        })()}
        <div className="p-2 h-full flex flex-col justify-between relative z-10">
                    {/* Top section with favicon and title */}
          <div>
            <div className="mb-1">
              <div className="w-12 h-12">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center ring-1 ring-gray-300/50 group-hover:ring-gray-400 transition-all duration-300 shadow-sm m-1">
                  {(() => {
                    const domain = extractDomain(bookmark.url);
                    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                    return (
                      <img 
                        src={bookmark.customBackground || faviconUrl} 
                        alt={`${bookmark.title} favicon`}
                        className="w-6 h-6 rounded"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.onerror = null;
                          el.src = userDefaultLogo || "/placeholder.svg";
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 font-audiowide uppercase text-base leading-tight ml-1">
              {truncateTitle(bookmark.title, 14)}
            </h3>
            <p className="text-xs text-blue-600 ml-1 mt-1">{extractDomain(bookmark.url)}</p>
          </div>
          
          {/* Middle section with badges */}
          <div className="flex flex-col space-y-1 ml-1">
            <Badge className={`text-xs border shadow-sm w-fit ${getPriorityColor(bookmark.priority)}`}>
              {bookmark.priority}
            </Badge>
          </div>
          
          {/* Bottom section with visits and profile image */}
          <div className="flex justify-between items-end">
            <div className="flex items-center space-x-1.5">
              <Eye className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600 font-semibold">
                {(() => {
                  const analytics = getUnifiedBookmarkAnalytics(bookmark.id);
                  console.log('🔍 Analytics for', bookmark.id, ':', analytics);
                  return analytics?.visits || 0;
                })()}
              </p>
              <span className="text-sm text-gray-500 font-medium uppercase">Visits</span>
              {/* Live indicator */}
              {!analyticsLoading && getBookmarkAnalytics(bookmark.id) && (
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" title="Live data" />
              )}
            </div>
            {(() => {
              const domain = extractDomain(bookmark.url);
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
              const globalLogo = userDefaultLogo && !/default-profile/i.test(userDefaultLogo) && userDefaultLogo.trim() !== '' ? userDefaultLogo : undefined;
              const src = globalLogo || faviconUrl;
              return (
                <img 
                  src={src}
                  alt={`${bookmark.title} image`}
                  className="w-16 h-16 object-cover rounded-full border border-gray-300"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.onerror = null;
                    el.src = "/placeholder.svg";
                  }}
                />
              );
            })()}
          </div>
        </div>
        
        {/* Drag Icon - positioned at top right corner next to border */}
        <div className="absolute top-0.5 right-0.5">
          <div className="opacity-50 hover:opacity-100 transition-opacity duration-200">
            <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </div>
        </div>
        
        {/* Usage Percentage Hexagon - positioned diagonally (Much Bigger) */}
        <div className="absolute top-2 right-2">
          <svg width="70" height="60" viewBox="0 0 70 60" className="drop-shadow-lg">
            <path
              d="M35 5 L55 15 L55 38 L35 48 L15 38 L15 15 Z"
              fill="white"
              stroke={(() => {
                const analytics = getBookmarkAnalytics(bookmark.id)
                const visits = analytics ? analytics.visits : 0
                const percentage = getUsagePercentage(visits)
                return getPercentageColor(percentage)
              })()}
              strokeWidth="3"
            />
            <text
              x="35"
              y="26"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={(() => {
                const analytics = getBookmarkAnalytics(bookmark.id)
                const visits = analytics ? analytics.visits : 0
                const percentage = getUsagePercentage(visits)
                return getPercentageColor(percentage)
              })()}
              fontSize="16"
              fontWeight="bold"
            >
              {(() => {
                const analytics = getBookmarkAnalytics(bookmark.id)
                const visits = analytics ? analytics.visits : 0
                return getUsagePercentage(visits)
              })()}%
            </text>
          </svg>
        </div>
        
        {/* Action Icons - positioned at bottom right corner */}
        <div className="absolute bottom-1 right-1">
          <BookmarkActionIcons bookmark={bookmark} />
        </div>
      </div>
    </div>
  )

    const CompactFolderCard = ({ category, bookmarkCount }: { category: string, bookmarkCount: number }) => (
    <div 
      className="group cursor-pointer"
      onClick={() => {
        setSelectedFolder(category)
        setCompactViewMode('bookmarks')
      }}
    >
      {/* Simple Square Box Design */}
      <div className="aspect-square w-full bg-white border border-black relative overflow-hidden rounded-lg">
        {/* Background Default Logo with 5% opacity */}
        {userDefaultLogo && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${userDefaultLogo})`,
              opacity: 0.05
            }}
          />
        )}
        <div className="p-2 h-full flex flex-col justify-between relative z-10">
          {/* Top section with folder icon and title */}
          <div>
            <div className="mb-2">
              <div className="w-20 h-20">
                <FolderIcon className={`h-16 w-16 ${getCategoryColor(category)} m-2`} />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 font-audiowide uppercase text-lg leading-tight ml-2">
              {category}
            </h3>
          </div>
          
          {/* Bottom section with item count and profile image */}
          <div className="flex justify-between items-end">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">
                {bookmarkCount} BOOKMARKS
              </p>
            </div>
            <img 
              src={userDefaultLogo || "/placeholder.svg"} 
              alt={`${category} owner`}
              className="w-16 h-16 object-cover rounded-full border border-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const ListFolderCard = ({ category, bookmarkCount }: { category: string, bookmarkCount: number }) => (
    <div 
      className="group cursor-pointer"
      onClick={() => {
        setSelectedFolder(category)
        setCompactViewMode('bookmarks')
      }}
    >
      {/* Horizontal List Design */}
      <div className="w-full bg-white border border-black relative overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300">
        {/* Background Default Logo with 5% opacity */}
        {userDefaultLogo && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${userDefaultLogo})`,
              opacity: 0.05
            }}
          />
        )}
        <div className="p-4 flex items-center justify-between relative z-10">
          {/* Left section with folder icon and title */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16">
              <FolderIcon className={`h-12 w-12 ${getCategoryColor(category)} m-2`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 font-audiowide uppercase text-xl leading-tight">
                {category}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Bookmark className="h-4 w-4 text-gray-600" />
                <p className="text-sm text-gray-600">
                  {bookmarkCount} BOOKMARKS
                </p>
              </div>
            </div>
          </div>
          
          {/* Right section with profile image */}
          <div className="flex items-center space-x-4">
            <img 
              src={userDefaultLogo || "/placeholder.svg"} 
              alt={`${category} owner`}
              className="w-16 h-16 object-cover rounded-full border border-gray-300"
            />
            <ArrowLeft className="h-6 w-6 text-gray-400 rotate-180" />
          </div>
        </div>
      </div>
    </div>
  )

  // Sortable Folder Cards for Drag and Drop
  const SortableCompactFolderCard = ({ category, bookmarkCount }: { category: string, bookmarkCount: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Top Right */}
        <div 
          {...listeners} 
          className="absolute top-2 right-2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <CompactFolderCard category={category} bookmarkCount={bookmarkCount} />
      </div>
    )
  }

  const SortableListFolderCard = ({ category, bookmarkCount }: { category: string, bookmarkCount: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} className="relative group">
        {/* Drag Handle - Right Side */}
        <div 
          {...listeners} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <ListFolderCard category={category} bookmarkCount={bookmarkCount} />
      </div>
    )
  }

  const SortableListBookmarkCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <ListBookmarkCard bookmark={bookmark} />
      </div>
    )
  }

  const ListBookmarkCard = ({ bookmark }: { bookmark: any }) => (
    <Card 
      className="group hover:shadow-xl transition-all duration-400 cursor-pointer bg-white border border-black backdrop-blur-sm relative overflow-hidden rounded-lg"
      style={{
        borderColor: 'rgb(0 0 0)', // black
        transition: 'all 0.4s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = themeColor;
        e.currentTarget.style.boxShadow = `0 20px 25px -5px ${themeColor}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgb(0 0 0)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
      }}
      onClick={(e) => {
        // Handle bulk selection mode
        if (bulkMode) {
          e.preventDefault()
          e.stopPropagation()
          handleBookmarkSelect(bookmark.id)
          return
        }
        handleBookmarkClick(bookmark)
      }}
    >
             {/* Bulk Selection Checkbox for List View */}
       {bulkMode && (
         <div 
           className="absolute top-3 left-3 z-[9999] cursor-pointer"
           onMouseDown={(e) => e.stopPropagation()}
           onMouseUp={(e) => e.stopPropagation()}
           onClick={(e) => {
             e.preventDefault()
             e.stopPropagation()
             console.log('List checkbox clicked for bookmark:', bookmark.id)
             handleBookmarkSelect(bookmark.id)
           }}
         >
           <div 
             className={`w-6 h-6 border-2 rounded-md flex items-center justify-center shadow-lg ${
               selectedBookmarks.includes(bookmark.id) 
                 ? 'bg-blue-600 border-blue-600' 
                 : 'bg-white border-gray-400 hover:border-blue-500'
             }`}
           >
             {selectedBookmarks.includes(bookmark.id) && (
               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
               </svg>
             )}
           </div>
         </div>
       )}

      {/* Background Website Logo with 5% opacity - Custom background takes priority */}
      {(() => {
        if (bookmark.customBackground) {
          return (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${bookmark.customBackground})`,
                backgroundSize: (bookmark.customBackground && /logo\.clearbit\.com|faviconkit\.com|s2\/favicons/.test(bookmark.customBackground)) ? '140% 140%' : 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.10
              }}
            />
          );
        } else {
          const domain = extractDomain(bookmark.url);
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
          const bg = bookmark.customBackground || userDefaultLogo || faviconUrl;
          return (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: (bg && /logo\.clearbit\.com|faviconkit\.com|s2\/favicons/.test(bg)) ? '140% 140%' : 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.10
              }}
            />
          );
        }
      })()}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-transparent to-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      
      <CardContent className="p-6 relative z-10">
        {/* Top Section: Title and Category */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center ring-2 ring-gray-300/50 group-hover:ring-gray-400 transition-all duration-300 shadow-sm">
                {(() => {
                  const domain = extractDomain(bookmark.url);
                  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                  return (
                    <img 
                      src={bookmark.customBackground || faviconUrl} 
                      alt={`${bookmark.title} favicon`}
                      className="w-10 h-10 rounded-lg"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.onerror = null;
                        el.src = userDefaultLogo || "/placeholder.svg";
                      }}
                    />
                  );
                })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-1">
                  <h3 className="font-bold text-gray-900 font-audiowide uppercase text-lg group-hover:text-blue-900 transition-colors duration-300">{truncateTitle(bookmark.title, 25)}</h3>
                  <Badge className={`text-sm border-2 shadow-sm px-3 py-1 ${getPriorityColor(bookmark.priority)}`}>
                    {bookmark.priority}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <FolderIcon className={`h-4 w-4 ${getCategoryColor(bookmark.category)}`} />
                  <span className={`text-sm font-bold uppercase ${getCategoryColor(bookmark.category)}`}>
                    {bookmark.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Right: Profile Image */}
          <div className="flex-shrink-0">
            {(() => {
              const domain = extractDomain(bookmark.url);
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
              const globalLogo = userDefaultLogo && !/default-profile/i.test(userDefaultLogo) && userDefaultLogo.trim() !== '' ? userDefaultLogo : undefined;
              const src = globalLogo || faviconUrl;
              return (
                <img 
                  src={src}
                  alt={`${bookmark.title} image`}
                  className="w-16 h-16 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-2 ring-gray-200/50 group-hover:ring-blue-300/60 transition-all duration-300 shadow-md"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.onerror = null;
                    el.src = "/placeholder.svg";
                  }}
                />
              );
            })()}
          </div>
        </div>
        
        {/* Middle Section: URL and Description */}
        <div className="mb-4">
          <p className="text-sm text-blue-600 hover:underline font-medium mb-2">{extractDomain(bookmark.url)}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{bookmark.description}</p>
        </div>
        
        {/* Bottom Section: Visits and Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1.5">
              <Bookmark className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium uppercase">
                {(() => {
                  const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
                  return analytics ? analytics.visits : 0
                })()} VISITS
              </span>
              {/* Live indicator */}
              {!analyticsLoading && getBookmarkAnalytics(bookmark.id) && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live data" />
              )}
            </div>
          </div>
          
          {/* Bottom Right: Usage Hexagon */}
          <div className="flex items-center space-x-4">
            <UsageHexagon percentage={(() => {
              const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
              const visits = analytics ? analytics.visits : 0
              return getUsagePercentage(visits)
            })()} />
          </div>
        </div>
      </CardContent>
      
      {/* Drag Icon - Positioned at top right corner */}
      <div className="absolute top-2 right-2">
        <div className="opacity-50 hover:opacity-100 transition-opacity duration-200">
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </div>
      </div>
      
      {/* Action Icons - Positioned at bottom right corner */}
      <div className="absolute bottom-4 right-4">
        <BookmarkActionIcons bookmark={bookmark} />
      </div>
    </Card>
  )



  const SortableFolderCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <Card 
          className="p-4 hover:shadow-md transition-shadow cursor-pointer relative border border-gray-300" 
          style={{
            borderColor: 'rgb(209 213 219)', // gray-300
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = themeColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgb(209 213 219)';
          }}
          onClick={() => handleBookmarkClick(bookmark)}
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm font-audiowide uppercase">{truncateTitle(bookmark.title, 15)}</h3>
              <p className="text-xs text-gray-500 truncate">{bookmark.category}</p>
            </div>
          </div>
          
          {/* Action Icons */}
          <BookmarkActionIcons bookmark={bookmark} />
          
          {/* Usage Percentage Hexagon */}
          <UsageHexagon percentage={(() => {
            const analytics = getBookmarkAnalytics(bookmark.id)
            const visits = analytics ? analytics.visits : 0
            return getUsagePercentage(visits)
          })()} />
        </Card>
      </div>
    )
  }

  const SortableHierarchyCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div className="relative group">
          {/* Drag handle */}
          <div 
            {...listeners}
            className="absolute left-[-24px] top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full ml-1"></div>
            </div>
          </div>
          <Card 
            className="p-4 hover:shadow-md transition-shadow cursor-pointer relative border border-gray-300" 
            style={{
              borderColor: 'rgb(209 213 219)', // gray-300
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = themeColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgb(209 213 219)';
            }}
            onClick={() => handleBookmarkClick(bookmark)}
          >
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-blue-600 font-bold text-lg">{bookmark.favicon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm font-audiowide uppercase">{truncateTitle(bookmark.title, 15)}</h3>
                <p className="text-xs text-gray-500 truncate">{bookmark.ai_category || bookmark.category}</p>
                {(bookmark.ai_summary || bookmark.description) && (
                  <p className="text-xs text-gray-400 truncate mt-1" title={bookmark.ai_summary || bookmark.description}>
                    {(bookmark.ai_summary || bookmark.description).substring(0, 50)}...
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Icons */}
            <BookmarkActionIcons bookmark={bookmark} />
            
            {/* Usage Percentage Hexagon */}
            <UsageHexagon percentage={(() => {
              const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
              const visits = analytics ? analytics.visits : 0
              return getUsagePercentage(visits)
            })()} />
          </Card>
        </div>
      </div>
    )
  }

  // Sortable version of FolderCard for Folder 2.0
  const SortableFolderCard2 = ({ folder, bookmarkCount, onEdit, onDelete, onAddBookmark, onDrop, onDragOver, onClick }: {
    folder: Folder;
    bookmarkCount: number;
    onEdit: (folder: Folder) => void;
    onDelete: (folderId: string) => void;
    onAddBookmark: (folderId: string) => void;
    onDrop: (folderId: string, bookmark: BookmarkWithRelations) => void;
    onDragOver: (event: React.DragEvent) => void;
    onClick?: () => void;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: folder.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div className="relative group">
          {/* Drag handle */}
          <div 
            {...listeners}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 bg-white/80 rounded-md p-1 shadow-sm"
          >
            <div className="flex flex-col space-y-0.5">
              <div className="flex space-x-0.5">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <div className="flex space-x-0.5">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <FolderCard
            folder={folder}
            bookmarkCount={bookmarkCount}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddBookmark={onAddBookmark}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={onClick}
            disableLink={true}
          />
        </div>
      </div>
    )
  }

  // Goal Folder Card component (non-sortable)
  const GoalFolderCard = ({ folder, bookmarkCount, onEdit, onDelete, onAddBookmark, onDrop, onDragOver, onClick }: {
    folder: Folder;
    bookmarkCount: number;
    onEdit: (folder: Folder) => void;
    onDelete: (folderId: string) => void;
    onAddBookmark: (folderId: string) => void;
    onDrop: (folderId: string, bookmark: BookmarkWithRelations) => void;
    onDragOver: (event: React.DragEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
  }) => {
    return (
      <div 
        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
        onDrop={(e) => {
          e.preventDefault();
          // Handle bookmark drop logic here
        }}
        onDragOver={onDragOver}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: folder.color }}
            >
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{folder.name}</h3>
              <p className="text-sm text-gray-600">{folder.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(folder);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{folder.goal_progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${folder.goal_progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Deadline</span>
            <span className="font-medium">
              {folder.deadline_date ? new Date(folder.deadline_date).toLocaleDateString() : 'No deadline'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Priority</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              folder.goal_priority === 'high' ? 'bg-red-100 text-red-800' :
              folder.goal_priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {folder.goal_priority}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              folder.goal_status === 'completed' ? 'bg-green-100 text-green-800' :
              folder.goal_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              folder.goal_status === 'overdue' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {folder.goal_status?.replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Bookmarks</span>
            <span className="font-medium">{bookmarkCount}</span>
          </div>
        </div>
        
        {folder.goal_notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{folder.goal_notes}</p>
          </div>
        )}
      </div>
    )
  }

  // Sortable version of Goal Folder Card for Goal 2.0
  const SortableGoalFolderCard = ({ folder, bookmarkCount, onEdit, onDelete, onAddBookmark, onDrop, onDragOver, onClick }: {
    folder: Folder;
    bookmarkCount: number;
    onEdit: (folder: Folder) => void;
    onDelete: (folderId: string) => void;
    onAddBookmark: (folderId: string) => void;
    onDrop: (folderId: string, bookmark: BookmarkWithRelations) => void;
    onDragOver: (event: React.DragEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: folder.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    // Prevent click event when dragging
    const handleClick = (e: React.MouseEvent) => {
      if (isDragging) {
        return;
      }
      onClick?.(e);
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div className="relative group">
          {/* Drag handle - positioned with higher z-index and proper event handling */}
          <div 
            {...listeners}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-50 bg-white/90 rounded-md p-2 shadow-md border border-gray-200 hover:bg-white hover:shadow-lg"
            onMouseDown={(e) => {
              e.stopPropagation(); // Prevent card click when starting drag
            }}
          >
            <div className="flex flex-col space-y-0.5">
              <div className="flex space-x-0.5">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
              </div>
              <div className="flex space-x-0.5">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Use the separated GoalFolderCard component */}
          <GoalFolderCard
            folder={folder}
            bookmarkCount={bookmarkCount}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddBookmark={onAddBookmark}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={handleClick}
          />
        </div>
      </div>
    )
  }

  const renderBookmarks = () => {
    const bookmarkIds = filteredBookmarks.map(bookmark => bookmark.id)
    
    switch (viewMode) {
      case 'grid':
        return (
          <ClientOnlyDndProvider>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={bookmarkIds} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBookmarks.map((bookmark) => (
                    <SortableGridBookmarkCard key={bookmark.id} bookmark={bookmark} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ClientOnlyDndProvider>
        )
      case 'compact':
        if (compactViewMode === 'folders') {
          // Show folder view - group bookmarks by category
          const categories = folderCategories
          return (
            <ClientOnlyDndProvider>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={categories} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {categories.map((category) => {
                      const categoryBookmarks = bookmarks.filter(bookmark => bookmark.category === category)
                      return (
                        <SortableCompactFolderCard 
                          key={category} 
                          category={category} 
                          bookmarkCount={categoryBookmarks.length} 
                        />
                      )
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </ClientOnlyDndProvider>
          )
        } else {
          // Show bookmarks within selected folder
          const folderBookmarks = filteredBookmarks.filter(bookmark => bookmark.category === selectedFolder)
          const folderBookmarkIds = folderBookmarks.map(bookmark => bookmark.id)
          
          return (
            <div className="space-y-4">
              {/* Back Button */}
              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompactViewMode('folders')
                    setSelectedFolder(null)
                  }}
                  className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Folders</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <FolderIcon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 font-audiowide uppercase">{selectedFolder}</h2>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {folderBookmarks.length} bookmarks
                  </Badge>
                </div>
              </div>
              
              {/* Bookmarks Grid */}
              <ClientOnlyDndProvider>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={folderBookmarkIds} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {folderBookmarks.map((bookmark) => (
                        <SortableCompactBookmarkCard key={bookmark.id} bookmark={bookmark} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </ClientOnlyDndProvider>
            </div>
          )
        }
      case 'list':
        if (compactViewMode === 'folders') {
          // Show folder view for list - group bookmarks by category
          const categories = folderCategories
          return (
            <ClientOnlyDndProvider>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {categories.map((category) => {
                      const categoryBookmarks = bookmarks.filter(bookmark => bookmark.category === category)
                      return (
                        <SortableListFolderCard 
                          key={category} 
                          category={category} 
                          bookmarkCount={categoryBookmarks.length} 
                        />
                      )
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </ClientOnlyDndProvider>
          )
        }
        
        // Show individual bookmarks in selected folder or all bookmarks
        const bookmarksToShow = selectedFolder 
          ? filteredBookmarks.filter(bookmark => bookmark.category === selectedFolder)
          : filteredBookmarks
        const listBookmarkIds = bookmarksToShow.map(bookmark => bookmark.id)
        
        return (
          <div>
            {selectedFolder && (
              <div className="mb-6 flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFolder(null)
                    setCompactViewMode('folders')
                  }}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Folders</span>
                </Button>
                <h2 className="text-xl font-bold text-gray-900 font-audiowide uppercase">
                  {selectedFolder} ({bookmarksToShow.length} Bookmarks)
                </h2>
              </div>
            )}
            <ClientOnlyDndProvider>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={listBookmarkIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {bookmarksToShow.map((bookmark) => (
                      <SortableListBookmarkCard key={bookmark.id} bookmark={bookmark} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </ClientOnlyDndProvider>
          </div>
        )


      case 'hierarchy':
        return (
          <div className="density-gap">
            {['Development', 'Design', 'Productivity'].map((category) => {
              const categoryBookmarks = filteredBookmarks.filter((bookmark) => bookmark.category === category)
              const categoryBookmarkIds = categoryBookmarks.map(bookmark => bookmark.id)
              
              return (
                <div key={category} className="border border-gray-200/60 rounded-xl density-p bg-gradient-to-br from-white via-gray-50/20 to-white shadow-sm hover:shadow-lg transition-all duration-300">
                  <h3 className="font-bold text-2xl mb-6 flex items-center text-gray-900">
                    <GitBranch className="h-7 w-7 mr-4 text-gray-700" />
                    {category}
                  </h3>
                  <ClientOnlyDndProvider>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext items={categoryBookmarkIds} strategy={verticalListSortingStrategy}>
                        <div className="ml-11 space-y-4">
                          {categoryBookmarks.map((bookmark, index) => (
                            <SortableHierarchyCard key={bookmark.id} bookmark={bookmark} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </ClientOnlyDndProvider>
                </div>
              )
            })}
          </div>
        )
      case 'timeline':
        console.log('🕒 Rendering timeline view with SimpleBoardCanvas');
        return (
          <div className="w-full h-screen">
            <SimpleBoardCanvas 
              key="timeline-board" 
              onBookmarkClick={handleBookmarkClick} 
            />
          </div>
        )
      case 'hierarchyV1':
        return (
          <div className="density-gap">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hierarchy V1 - Simple View</h2>
              <p className="text-gray-600">Basic hierarchical organization of your bookmarks</p>
            </div>
            {['Development', 'Design', 'Productivity'].map((category) => {
              const categoryBookmarks = filteredBookmarks.filter((bookmark) => bookmark.category === category)
              const categoryBookmarkIds = categoryBookmarks.map(bookmark => bookmark.id)
              
              return (
                <div key={category} className="border border-gray-200/60 rounded-xl density-p bg-gradient-to-br from-white via-gray-50/20 to-white shadow-sm hover:shadow-lg transition-all duration-300">
                  <h3 className="font-bold text-2xl mb-6 flex items-center text-gray-900">
                    <GitBranch className="h-7 w-7 mr-4 text-gray-700" />
                    {category}
                    <Badge className="ml-3 bg-blue-50 text-blue-700 border-blue-200">
                      {categoryBookmarks.length} bookmarks
                    </Badge>
                  </h3>
                  <ClientOnlyDndProvider>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext items={categoryBookmarkIds} strategy={verticalListSortingStrategy}>
                        <div className="ml-11 space-y-4">
                          {categoryBookmarks.map((bookmark, index) => (
                            <SortableHierarchyCard key={bookmark.id} bookmark={bookmark} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </ClientOnlyDndProvider>
                </div>
              )
            })}
          </div>
        )
      case 'khV1':
        return (
          <ClientOnlyDndProvider>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="w-full h-screen">
                <KHV1InfinityBoard 
                  folders={foldersForHierarchyV1}
                  bookmarks={bookmarks}
                  onCreateFolder={() => setShowAddFolder(true)}
                  onAddBookmark={() => setShowAddBookmark(true)}
                  onOpenDetail={handleBookmarkClick}
                  isActive={true}
                  folderAssignments={folderAssignments}
                  onHierarchyAssignmentsChange={handleHierarchyAssignmentsChange}
                />
              </div>
            </DndContext>
          </ClientOnlyDndProvider>
        )
      case 'folder2':
        const handleFolderEdit = (folder: Folder) => {
          console.log('Edit folder:', folder);
          showNotification(`Edit folder: ${folder.name}`);
        };

        const handleFolderDelete = (folderId: string) => {
          console.log('Delete folder:', folderId);
          showNotification(`Delete folder: ${folderId}`);
        };

        const handleFolderAddBookmark = (folderId: string) => {
          console.log('Add bookmark to folder:', folderId);
          showNotification(`Add bookmark to folder: ${folderId}`);
        };

        const handleFolderDrop = (folderId: string, bookmark: BookmarkWithRelations) => {
          console.log('Drop bookmark to folder:', folderId, bookmark);
          showNotification(`Moved "${bookmark.title}" to folder`);
        };

        const handleFolderDragOver = (event: React.DragEvent) => {
          event.preventDefault();
        };

        return (
          <div className="space-y-6">
            {!openedFolder ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Folder 2.0</h2>
                  <p className="text-gray-600">Advanced folder management with drag-and-drop functionality</p>
                </div>
                
                <ClientOnlyDndProvider>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={dynamicFolders.map(f => f.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 density-gap">
                        {dynamicFolders.map((folder) => {
                          const folderBookmarks = bookmarks.filter(bookmark => 
                            bookmark.category.toLowerCase() === folder.name.toLowerCase()
                          );
                          
                          return (
                            <SortableFolderCard2
                              key={folder.id}
                              folder={folder}
                              bookmarkCount={folderBookmarks.length}
                              onEdit={handleFolderEdit}
                              onDelete={handleFolderDelete}
                              onAddBookmark={handleFolderAddBookmark}
                              onDrop={handleFolderDrop}
                              onDragOver={handleFolderDragOver}
                              onClick={() => {
                                console.log('Folder clicked:', folder);
                                setOpenedFolder(folder);
                                showNotification(`Opened folder: ${folder.name}`);
                              }}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </ClientOnlyDndProvider>
              </>
            ) : (
              <>
                {/* Opened folder view */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => setOpenedFolder(null)}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Folders</span>
                      </Button>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: openedFolder.color }}
                        >
                          <FolderIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{openedFolder.name}</h2>
                          <p className="text-gray-600 text-sm">{openedFolder.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bookmarks in the opened folder */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {bookmarks
                      .filter(bookmark => bookmark.category.toLowerCase() === openedFolder.name.toLowerCase())
                      .map((bookmark) => (
                        <GridBookmarkCard key={bookmark.id} bookmark={bookmark} />
                      ))}
                  </div>
                  
                  {bookmarks.filter(bookmark => bookmark.category.toLowerCase() === openedFolder.name.toLowerCase()).length === 0 && (
                    <div className="text-center py-12">
                      <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
                      <p className="text-gray-600 mb-4">This folder is empty. Add some bookmarks to get started!</p>
                      <Button
                        onClick={() => handleFolderAddBookmark(openedFolder.id)}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Bookmark</span>
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )
      case 'goal2':
        const handleGoalEdit = (folder: Folder) => {
          console.log('Edit goal folder:', folder);
          showNotification(`Edit goal folder: ${folder.name}`);
        };

        const handleGoalDelete = (folderId: string) => {
          console.log('Delete goal folder:', folderId);
          showNotification(`Delete goal folder: ${folderId}`);
        };

        const handleGoalAddBookmark = (folderId: string) => {
          console.log('Add bookmark to goal folder:', folderId);
          showNotification(`Add bookmark to goal folder: ${folderId}`);
        };

        const handleGoalDrop = (folderId: string, bookmark: BookmarkWithRelations) => {
          console.log('Drop bookmark to goal folder:', folderId, bookmark);
          showNotification(`Moved "${bookmark.title}" to goal folder`);
        };

        const handleGoalDragOver = (event: React.DragEvent) => {
          event.preventDefault();
        };

        const handleGoalSubmit = (data: { name: string; description?: string; color?: string; reminder_at?: string | null }) => {
          console.log('Goal folder submitted:', data);
          showNotification(`Goal folder "${data.name}" ${selectedGoalFolder ? 'updated' : 'created'} successfully!`);
          setSelectedGoalFolder(null);
        };

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Goal 2.0</h2>
              <p className="text-gray-600">Advanced goal management with deadline tracking and progress monitoring</p>
            </div>
            
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => {
                  setSelectedGoalFolder(null);
                  setGoalDialogOpen(true);
                }}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Goal</span>
              </Button>
            </div>
            
            <ClientOnlyDndProvider>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={mockGoalFolders.map(f => f.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockGoalFolders.map((folder) => {
                      const folderBookmarks = bookmarks.filter(bookmark => 
                        bookmark.category.toLowerCase().includes(folder.name.toLowerCase().split(' ')[0])
                      );
                      
                      return (
                        <SortableGoalFolderCard
                          key={folder.id}
                          folder={folder}
                          bookmarkCount={folderBookmarks.length}
                          onEdit={handleGoalEdit}
                          onDelete={handleGoalDelete}
                          onAddBookmark={handleGoalAddBookmark}
                          onDrop={handleGoalDrop}
                          onDragOver={handleGoalDragOver}
                          onClick={(e) => {
                            e.preventDefault();
                            handleGoalSubmit(folder);
                          }}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </ClientOnlyDndProvider>
            
            <FolderFormDialog
              open={goalDialogOpen}
              onOpenChange={setGoalDialogOpen}
              folder={selectedGoalFolder}
              onSubmit={handleGoalSubmit}
            />
          </div>
        )
      case 'kanban2':
        // Convert bookmarks to the format expected by TrelloBoard
        const bookmarkItems = filteredBookmarks.map(bookmark => ({
          id: bookmark.id.toString(),
          title: bookmark.title,
          url: bookmark.url,
          favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(bookmark.url)}&sz=64`
        }));

        return (
          <TrelloBoard />
        )
      default: // grid
        return (
          <ClientOnlyDndProvider>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={bookmarkIds} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBookmarks.map((bookmark) => (
                    <SortableGridBookmarkCard key={bookmark.id} bookmark={bookmark} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ClientOnlyDndProvider>
        )
    }
  }

  const totalBookmarks = bookmarks.length
  const favorites = bookmarks.filter(bookmark => bookmark.isFavorite).length

  // Chart data for different time periods
  const chartData = {
    '3months': {
      title: 'Total for the last 3 months',
      labels: ['Apr 1', 'Apr 7', 'Apr 13', 'Apr 19', 'Apr 26', 'May 2', 'May 8', 'May 14', 'May 21', 'May 28', 'Jun 3', 'Jun 9', 'Jun 15', 'Jun 21', 'Jun 29'],
      path: 'M 20 160 C 60 140, 100 150, 140 130 C 180 110, 220 120, 260 100 C 300 80, 340 90, 380 70 C 420 50, 460 60, 500 40 C 540 20, 580 30, 620 25 C 660 20, 700 30, 740 35 C 760 37, 780 40, 780 40',
      areaPath: 'M 20 160 C 60 140, 100 150, 140 130 C 180 110, 220 120, 260 100 C 300 80, 340 90, 380 70 C 420 50, 460 60, 500 40 C 540 20, 580 30, 620 25 C 660 20, 700 30, 740 35 C 760 37, 780 40, 780 40 L 780 180 L 20 180 Z'
    },
    '30days': {
      title: 'Total for the last 30 days',
      labels: ['Jun 1', 'Jun 3', 'Jun 5', 'Jun 7', 'Jun 9', 'Jun 11', 'Jun 13', 'Jun 15', 'Jun 17', 'Jun 19', 'Jun 21', 'Jun 23', 'Jun 25', 'Jun 27', 'Jun 29'],
      path: 'M 20 170 C 60 160, 100 165, 140 150 C 180 135, 220 140, 260 125 C 300 110, 340 115, 380 100 C 420 85, 460 90, 500 75 C 540 60, 580 65, 620 50 C 660 35, 700 40, 740 25 C 760 20, 780 22, 780 22',
      areaPath: 'M 20 170 C 60 160, 100 165, 140 150 C 180 135, 220 140, 260 125 C 300 110, 340 115, 380 100 C 420 85, 460 90, 500 75 C 540 60, 580 65, 620 50 C 660 35, 700 40, 740 25 C 760 20, 780 22, 780 22 L 780 180 L 20 180 Z'
    },
    '7days': {
      title: 'Total for the last 7 days',
      labels: ['Jun 23', 'Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29'],
      path: 'M 120 180 C 200 165, 280 170, 360 155 C 440 140, 520 145, 600 130 C 680 115, 680 115, 680 115',
      areaPath: 'M 120 180 C 200 165, 280 170, 360 155 C 440 140, 520 145, 600 130 C 680 115, 680 115, 680 115 L 680 180 L 120 180 Z'
    }
  }

  const currentChartData = chartData[chartTimePeriod as keyof typeof chartData]

  // Add bulk delete function
  const handleBulkDelete = async () => {
    if (selectedBookmarks.length === 0) {
      showNotification('No bookmarks selected for deletion')
      return
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedBookmarks.length} bookmark(s)? This action cannot be undone.`
    )

    if (!confirmDelete) return

    try {
      const response = await fetch('/api/bookmarks/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          bookmark_ids: selectedBookmarks,
          userId: 'dev-user-123'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Remove deleted bookmarks from local state
        setBookmarks(prev => prev.filter(b => !selectedBookmarks.includes(b.id)))
        setSelectedBookmarks([])
        setBulkMode(false)
        showNotification(`Successfully deleted ${data.deletedCount} bookmark(s)`)
      } else {
        showNotification('Failed to delete bookmarks: ' + data.error)
      }
    } catch (error) {
      showNotification('Error deleting bookmarks')
      console.error('Bulk delete error:', error)
    }
  }

  // Add bulk move function
  const handleBulkMove = async (newCategory: string) => {
    if (selectedBookmarks.length === 0) {
      showNotification('No bookmarks selected for moving')
      return
    }

    try {
      const response = await fetch('/api/bookmarks/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'move',
          bookmarkIds: selectedBookmarks,
          userId: 'dev-user-123',
          category: newCategory
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update bookmarks in local state
        setBookmarks(prev => prev.map(bookmark => 
          selectedBookmarks.includes(bookmark.id) 
            ? { ...bookmark, category: newCategory }
            : bookmark
        ))
        setSelectedBookmarks([])
        setBulkMode(false)
        showNotification(`Successfully moved ${data.updatedCount} bookmark(s) to "${newCategory}"`)
      } else {
        showNotification('Failed to move bookmarks: ' + data.error)
      }
    } catch (error) {
      showNotification('Error moving bookmarks')
      console.error('Bulk move error:', error)
    }
  }

  // Toggle all bookmarks selection
  const handleSelectAll = () => {
    if (selectedBookmarks.length === filteredBookmarks.length) {
      // Deselect all
      setSelectedBookmarks([])
    } else {
      // Select all visible bookmarks
      setSelectedBookmarks(filteredBookmarks.map(b => b.id))
    }
  }

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BOOKMARKHUB</h1>
              <p className="text-gray-600 mt-1">Your Digital Workspace</p>
              {selectedBookmarks.length > 0 && (
                <div className="mt-2">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    {selectedBookmarks.length} SELECTED
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Bulk Mode Toggle - Enhanced visibility */}
              <Button
                variant={bulkMode ? 'default' : 'outline'}
                onClick={() => {
                  setBulkMode(!bulkMode)
                  if (!bulkMode) {
                    setSelectedBookmarks([])
                  }
                }}
                className={`flex items-center space-x-2 ${bulkMode ? 'bg-blue-600 hover:bg-blue-700' : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'} font-semibold transition-all duration-200`}
              >
                {bulkMode ? <CheckCircle className="h-4 w-4 text-white" /> : <Check className="h-4 w-4" />}
                <span className={bulkMode ? 'text-white' : ''}>🗂️ BULK SELECT</span>
              </Button>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 border-gray-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <SyncButton />
              <Button 
                onClick={() => setShowAddBookmark(true)}
                className="text-white font-medium transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: themeColor
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                ADD BOOKMARK
              </Button>
            </div>
          </div>

          {/* Oracle Component */}
          <Oracle />

          {/* Bulk Actions Toolbar - Enhanced visibility */}
          {selectedBookmarks.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {selectedBookmarks.length === filteredBookmarks.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-blue-800 font-semibold">
                    ✅ {selectedBookmarks.length} of {filteredBookmarks.length} bookmarks selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={handleBulkMove}>
                    <SelectTrigger className="w-40 border-blue-300">
                      <SelectValue placeholder="📁 Move to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleBulkDelete}
                    variant="destructive"
                    size="sm"
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 font-semibold"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>🗑️ DELETE SELECTED</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 density-gap mb-8">
            {/* Learning Card - Spans 2 columns - Exact copy from screenshot */}





          </div>

          {/* Total Visitors Chart - Interactive with Proper Components */}
          <Card className="mb-8 bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">{username.toUpperCase()} ANALYTICS CHART</CardTitle>
                <p className="text-sm text-muted-foreground">{currentChartData.title}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant={chartTimePeriod === '3months' ? 'outline' : 'ghost'} 
                  size="sm" 
                  className="h-7 gap-1 text-sm"
                  onClick={() => setChartTimePeriod('3months')}
                >
                  LAST 3 MONTHS
                </Button>
                <Button 
                  variant={chartTimePeriod === '30days' ? 'outline' : 'ghost'} 
                  size="sm" 
                  className="h-7 gap-1 text-sm"
                  onClick={() => setChartTimePeriod('30days')}
                >
                  LAST 30 DAYS
                </Button>
                <Button 
                  variant={chartTimePeriod === '7days' ? 'outline' : 'ghost'} 
                  size="sm" 
                  className="h-7 gap-1 text-sm"
                  onClick={() => setChartTimePeriod('7days')}
                >
                  LAST 7 DAYS
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-xl font-semibold text-black">Analytics Chart</h3>
                      <p className="text-sm text-gray-500 mt-1">Last 28 days</p>
                    </div>
                    
                    {/* Metrics Dropdown */}
                    <DropdownMenu open={isMetricsDropdownOpen} onOpenChange={setIsMetricsDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center space-x-2">
                          <span>Metrics ({selectedMetrics.length})</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {availableMetrics.map((metric) => (
                          <DropdownMenuCheckboxItem
                            key={metric}
                            checked={selectedMetrics.includes(metric)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMetrics([...selectedMetrics, metric])
                              } else {
                                setSelectedMetrics(selectedMetrics.filter(m => m !== metric))
                              }
                            }}
                          >
                            {metric}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    {selectedMetrics.map((metric, index) => {
                      const getValue = () => {
                        switch (metric) {
                          case 'Total Visits':
                            return analyticsData ? Object.values(analyticsData).reduce((sum: number, data: any) => sum + data.visits, 0) : 0
                          case 'Engagement Score':
                            return analyticsData ? Math.round(Object.values(analyticsData).reduce((sum: number, data: any) => sum + (data.visits * data.timeSpent), 0) / Math.max(Object.values(analyticsData).length, 1)) : 0
                          case 'Click-through Rate':
                            return isBrowser ? Math.round(Math.random() * 15 + 5) + '%' : '12%'
                          case 'Session Duration':
                            return isBrowser ? Math.round(Math.random() * 300 + 120) + 's' : '240s'
                          case 'Bounce Rate':
                            return isBrowser ? Math.round(Math.random() * 40 + 20) + '%' : '30%'
                          case 'Page Views':
                            return isBrowser ? Math.round(Math.random() * 1000 + 500) : 750
                          case 'User Retention':
                            return isBrowser ? Math.round(Math.random() * 30 + 60) + '%' : '75%'
                          case 'Conversion Rate':
                            return isBrowser ? Math.round(Math.random() * 8 + 2) + '%' : '5%'
                          case 'Active Users':
                            return isBrowser ? Math.round(Math.random() * 200 + 100) : 150
                          case 'Revenue Generated':
                            return isBrowser ? '$' + Math.round(Math.random() * 5000 + 1000) : '$3000'
                          default:
                            return 0
                        }
                      }
                      
                      const getColor = (index: number) => {
                        const colors = ['blue', 'purple', 'green', 'orange', 'red', 'indigo', 'pink', 'teal', 'yellow', 'gray']
                        return colors[index % colors.length]
                      }
                      
                      const color = getColor(index)
                      
                      return (
                        <div key={metric} className={`text-right cursor-pointer hover:bg-${color}-50 p-2 rounded-lg transition-colors group`} onClick={() => {
                          toast.success(`📊 ${metric}: ${getValue()}`)
                        }}>
                          <p className={`text-sm text-gray-500 group-hover:text-${color}-600`}>{metric}</p>
                          <p className={`text-2xl font-bold text-black group-hover:text-${color}-700`}>
                            {getValue()}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Interactive Chart */}
                <div className="relative h-[300px] w-full group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 rounded-lg transition-all duration-500 group-hover:from-blue-50/50 group-hover:to-purple-50/30" />
                  {/* Dynamic date labels based on selected period */}
                  {(() => {
                    // build and store on window for reuse below
                    const now = new Date();
                    now.setHours(0,0,0,0)
                    const days = chartTimePeriod === '3months' ? 90 : chartTimePeriod === '30days' ? 30 : 7;
                    const points = chartTimePeriod === '7days' ? 7 : 10;
                    const labels: string[] = [];
                    for (let i = 0; i < points; i++) {
                      const t = points <= 1 ? 0 : i / (points - 1);
                      const offset = Math.round((days - 1) * t);
                      const d = new Date(now);
                      d.setDate(now.getDate() - ((days - 1) - offset));
                      labels.push(d.toLocaleString(undefined, { month: 'short', day: 'numeric' }));
                    }
                    // @ts-ignore
                    if (typeof window !== 'undefined') {
                      (window as any).__dashDateLabels = labels;
                    }
                    return null;
                  })()}
                  
                  {/* Interactive Bar Chart */}
                  <div className="relative h-full flex items-end justify-between px-4 pt-40 pb-40 overflow-hidden">
                    {/* Bars driven by dynamic date labels */}
                    {((typeof window !== 'undefined' && (window as any).__dashDateLabels) ? (window as any).__dashDateLabels : []).map((dayLabel: string, i: number) => {
                      
                      // Color function - define before use
                      const getColor = (index: number) => {
                        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6', '#eab308', '#6b7280'];
                        return colors[index % colors.length];
                      };
                      
                      // Generate data for each selected metric
                      const metricData = selectedMetrics.map((metric, metricIndex) => {
                        const getValue = () => {
                          switch (metric) {
                            case 'Total Visits':
                              return isBrowser ? Math.floor(Math.random() * 15) + 5 : 12; // 5-20
                            case 'Engagement Score':
                              return isBrowser ? Math.floor(Math.random() * 25) + 10 : 22; // 10-35
                            case 'Click-through Rate':
                              return isBrowser ? Math.floor(Math.random() * 15) + 5 : 12; // 5-20
                            case 'Session Duration':
                              return isBrowser ? Math.floor(Math.random() * 300) + 120 : 270; // 120-420
                            case 'Bounce Rate':
                              return isBrowser ? Math.floor(Math.random() * 40) + 20 : 40; // 20-60
                            case 'Page Views':
                              return isBrowser ? Math.floor(Math.random() * 50) + 20 : 45; // 20-70
                            case 'User Retention':
                              return isBrowser ? Math.floor(Math.random() * 30) + 60 : 75; // 60-90
                            case 'Conversion Rate':
                              return isBrowser ? Math.floor(Math.random() * 8) + 2 : 6; // 2-10
                            case 'Active Users':
                              return isBrowser ? Math.floor(Math.random() * 40) + 20 : 40; // 20-60
                            case 'Revenue Generated':
                              return isBrowser ? Math.floor(Math.random() * 50) + 10 : 35; // 10-60
                            default:
                              return isBrowser ? Math.floor(Math.random() * 20) + 5 : 12;
                          }
                        };
                        // Cap bar height so it never overlaps labels/text
                        const rawValue = getValue();
                        const MAX_BAR_PX = 72; // absolute ceiling inside chart area, keeps bars safely below text
                        const metricMaxMap: Record<string, number> = {
                          'Total Visits': 200,
                          'Engagement Score': 100,
                          'Click-through Rate': 40,
                          'Session Duration': 600,
                          'Bounce Rate': 100,
                          'Page Views': 2000,
                          'User Retention': 100,
                          'Conversion Rate': 20,
                          'Active Users': 500,
                          'Revenue Generated': 10000,
                        };
                        const metricMax = metricMaxMap[metric] ?? 100;
                        const scaledHeight = Math.max(12, Math.min(MAX_BAR_PX, (rawValue / metricMax) * MAX_BAR_PX));

                        return {
                          metric,
                          value: rawValue,
                          height: scaledHeight,
                          color: getColor(metricIndex)
                        };
                      });
                      
                      return (
                        <div key={i} className="flex flex-col items-center space-y-1 cursor-pointer group/bar relative">
                          {/* Hover tooltip */}
                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            <div className="text-center">
                              <div className="font-semibold">{dayLabel}</div>
                              {metricData.map((data, idx) => (
                                <div key={idx}>
                                  {data.metric}: {data.value}
                                  {data.metric.includes('Rate') || data.metric.includes('Retention') ? '%' : ''}
                                  {data.metric === 'Session Duration' ? 's' : ''}
                                  {data.metric === 'Revenue Generated' ? '$' : ''}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Side-by-side bars container */}
                          <div className="flex items-end space-x-1">
                            {metricData.map((data, metricIndex) => (
                              <div 
                                key={metricIndex}
                                className="w-2 rounded-sm opacity-70 hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                                style={{ 
                                  height: `${data.height}px`,
                                  backgroundColor: data.color
                                }}
                                onClick={() => {
                                  const displayValue = data.metric.includes('Rate') || data.metric.includes('Retention') ? `${data.value}%` :
                                                     data.metric === 'Session Duration' ? `${data.value}s` :
                                                     data.metric === 'Revenue Generated' ? `$${data.value}` : data.value;
                                  toast.success(`📅 ${dayLabel}: ${data.metric} - ${displayValue}`)
                                }}
                                title={`${dayLabel}: ${data.metric} - ${data.value}`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive X-axis labels */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-between px-4 text-xs text-gray-500">
                    {((typeof window !== 'undefined' && (window as any).__dashDateLabels) ? (window as any).__dashDateLabels : []).map((date: string, i: number) => (
                      <span 
                        key={i}
                        className="cursor-pointer hover:font-medium transition-all duration-200 px-1 py-1 rounded hover:bg-gray-50"
                        style={{
                          color: 'rgb(107, 114, 128)' // Default gray-500
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = themeColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgb(107, 114, 128)';
                        }}
                        onClick={() => {
                          toast.success(`📊 Filtering data for ${date}`)
                        }}
                      >
                        {date}
                      </span>
                    ))}
                  </div>

                  {/* Interactive Legend */}
                  <div className="absolute top-2 right-2 flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {selectedMetrics.map((metric, index) => {
                      const getColor = (index: number) => {
                        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6', '#eab308', '#6b7280'];
                        return colors[index % colors.length];
                      };
                      
                      return (
                        <div key={metric} className="flex items-center space-x-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getColor(index) }}
                          ></div>
                          <span className="text-xs font-medium text-gray-700">
                            {metric.length > 10 ? metric.substring(0, 10) + '...' : metric}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

      {/* View Controls */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center bg-gradient-to-r from-white via-gray-50/30 to-white rounded-xl border border-gray-200/60 p-3 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <Button
            size="lg"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => setViewMode('grid')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="font-medium">GRID</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'compact' ? 'default' : 'ghost'}
            onClick={() => setViewMode('compact')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="font-medium">COMPACT</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => setViewMode('list')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <List className="h-5 w-5" />
            <span className="font-medium">LIST</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            onClick={() => setViewMode('timeline')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Clock className="h-5 w-5" />
            <span className="font-medium">TIMELINE</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'khV1' ? 'default' : 'ghost'}
            onClick={() => setViewMode('khV1')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Building className="h-5 w-5" />
            <span className="font-medium">HIERARCHY</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'folder2' ? 'default' : 'ghost'}
            onClick={() => setViewMode('folder2')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <FolderIcon className="h-5 w-5" />
            <span className="font-medium">FOLDER 2.0</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'goal2' ? 'default' : 'ghost'}
            onClick={() => setViewMode('goal2')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Target className="h-5 w-5" />
            <span className="font-medium">GOAL 2.0</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'kanban2' ? 'default' : 'ghost'}
            onClick={() => setViewMode('kanban2')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Columns className="h-5 w-5" />
            <span className="font-medium">KANBAN 2.0</span>
          </Button>
        </div>
      </div>

      {/* Bookmarks */}
      {filteredBookmarks.length === 0 && !isLoadingBookmarks ? (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first bookmark.'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <div className="mt-6 flex space-x-4">
                <Button onClick={() => setShowAddBookmark(true)} className="inline-flex items-center">
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Bookmark
                </Button>
                <Button 
                  onClick={() => {
                    const bookmarkIds = bookmarks.map(b => b.id)
                    checkBookmarkHealth(bookmarkIds)
                  }}
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white"
                >
                  🔍 Check All Health
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        renderBookmarks()
      )}

      {/* Bookmark Detail Modal - Exact copy from reference website */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open)
        if (!open) {
          // End time tracking for bookmark viewing
          const storedSession = localStorage.getItem('bookmarkViewSession')
          if (storedSession) {
            try {
              const session = JSON.parse(storedSession)
              const sessionEndTime = Date.now()
              const timeSpentMinutes = Math.round((sessionEndTime - session.startTime) / (1000 * 60))
              
              console.log(`⏱️ Viewing session ended for bookmark ${session.bookmarkId}: ${timeSpentMinutes} minutes`)
              
              // Track time spent viewing the bookmark (minimum 1 minute for any interaction)
              if (timeSpentMinutes >= 0) {
                // Use client hook (optimistic) and also fire legacy endpoint for backwards-compat
                trackTimeSpentCombined(session.bookmarkId, Math.max(timeSpentMinutes, 1))
                fetch('/api/bookmarks/analytics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    bookmarkId: session.bookmarkId,
                    action: 'timeUpdate',
                    timeSpent: Math.max(timeSpentMinutes, 1),
                    sessionEndTime: new Date().toISOString()
                  })
                }).catch(() => {})
              }
              
              // Clear session data
              localStorage.removeItem('bookmarkViewSession')
            } catch (error) {
              console.error('Error processing viewing session end:', error)
              localStorage.removeItem('bookmarkViewSession')
            }
          }
          
          // Reset editing state when modal closes
          setEditingField(null)
          setEditingValue('')
          setActiveBookmarkTab('overview') // Reset tab when modal closes
          setHasVisitedMediaTab(false) // Reset media tab visit tracking
          console.log('Modal closed - reset hasVisitedMediaTab to false')
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 shadow-2xl">
          {selectedBookmark && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedBookmark.favicon} alt={selectedBookmark.title} />
                      <AvatarFallback className="bg-black text-white">{selectedBookmark.title[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {editingField === 'title' ? (
                          <div className="flex-1 space-y-2">
                            <Input
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={saveEdit}
                              className="text-2xl font-audiowide uppercase bg-transparent border-b-2 border-blue-500 outline-none"
                              placeholder="Enter title..."
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={saveEdit} className="h-7">
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEditing} className="h-7">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <DialogTitle 
                              className="text-2xl font-audiowide uppercase cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                              onClick={() => startEditing('title', selectedBookmark.title)}
                            >
                              {selectedBookmark.title}
                            </DialogTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing('title', selectedBookmark.title)}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <p className="text-base text-muted-foreground mt-1">{selectedBookmark.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleFavorite}
                      className={selectedBookmark.isFavorite ? "border-red-300 bg-red-50" : ""}
                    >
                      <Heart className={`h-4 w-4 ${selectedBookmark.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={shareBookmark}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyBookmarkUrl}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={visitSite}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      VISIT SITE
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <Tabs value={activeBookmarkTab} onValueChange={handleTabChange} className="mt-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
                  <TabsTrigger value="arp">ARP</TabsTrigger>
                  <TabsTrigger value="notification">NOTIFICATION</TabsTrigger>
                  <TabsTrigger value="timer">TASK</TabsTrigger>
                  <TabsTrigger value="media">MEDIA</TabsTrigger>
                  <TabsTrigger value="comment">COMMENT</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="relative">
                          <img
                            src={selectedBookmark.circularImage || "/placeholder.svg"}
                            alt={`${selectedBookmark.title} image`}
                            className="w-32 h-32 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-2 ring-gray-200/50 shadow-lg"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-white shadow-md"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  // Validate file size (max 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert('File size must be less than 5MB');
                                    return;
                                  }
                                  
                                  // Validate file type
                                  if (!file.type.startsWith('image/')) {
                                    alert('Please select a valid image file');
                                    return;
                                  }
                                  
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const imageDataUrl = event.target?.result as string;
                                    
                                    // Update the bookmark in the bookmarks array
                                    setBookmarks(prev => prev.map(bookmark => 
                                      bookmark.id === selectedBookmark.id 
                                        ? { ...bookmark, circularImage: imageDataUrl }
                                        : bookmark
                                    ));
                                    
                                    // Update the selected bookmark for immediate UI update
                                    setSelectedBookmark(prev => prev ? { ...prev, circularImage: imageDataUrl } : prev);
                                    
                                    console.log('Image updated successfully for bookmark:', selectedBookmark.id);
                                  };
                                  reader.onerror = () => {
                                    alert('Error reading file. Please try again.');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Click the camera icon to update image</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openDefaultLogoModal}
                          className="text-xs"
                        >
                          <ImageIcon className="h-3 w-3 mr-2" />
                          Set Default Logo
                        </Button>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleReplaceFront}
                            disabled={uploadingBackground}
                            className="text-xs"
                          >
                            Front Background
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!selectedBookmark) return;
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (!file) return;
                                setUploadingBackground(true)
                                try {
                                  const reader = new FileReader()
                                  reader.onload = async (e) => {
                                    const imageDataUrl = e.target?.result as string
                                    const response = await fetch('/api/bookmarks', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        id: selectedBookmark.id,
                                        faviconOverride: imageDataUrl,
                                        // carry along safe fields
                                        title: selectedBookmark.title,
                                        url: selectedBookmark.url,
                                      })
                                    })
                                    if (!response.ok) {
                                      const t = await response.text();
                                      throw new Error(t)
                                    }
                                    // update UI favicon only (top-left small avatar)
                                    setBookmarks(prev => prev.map(b => String(b.id) === String(selectedBookmark.id) ? { ...b, faviconOverride: imageDataUrl } as any : b))
                                    setSelectedBookmark(prev => prev ? ({ ...prev, faviconOverride: imageDataUrl } as any) : prev)
                                    toast.success('✅ Favicon updated!')
                                  }
                                  reader.readAsDataURL(file)
                                } catch (err) {
                                  console.error(err)
                                  toast.error('Failed to update favicon')
                                } finally {
                                  setUploadingBackground(false)
                                }
                              }
                              input.click();
                            }}
                            disabled={uploadingBackground}
                            className="text-xs"
                          >
                            Favicon
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">DESCRIPTION</h3>
                          {editingField !== 'description' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing('description', selectedBookmark.ai_summary || selectedBookmark.description)}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {editingField === 'description' ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="min-h-[60px]"
                              placeholder="Enter description..."
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={saveEdit} className="h-7">
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEditing} className="h-7">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">{selectedBookmark.ai_summary || selectedBookmark.description}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">TAGS</h3>
                          {editingField !== 'tags' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing('tags', selectedBookmark.tags)}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {editingField === 'tags' ? (
                          <div className="space-y-2">
                            <Input
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Enter tags separated by commas..."
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={saveEdit} className="h-7">
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEditing} className="h-7">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(selectedBookmark.tags && selectedBookmark.tags.length > 0
                              ? selectedBookmark.tags
                              : (selectedBookmark.ai_tags || [])).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {String(tag).toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">NOTES</h3>
                          {editingField !== 'notes' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing('notes', selectedBookmark.notes)}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {editingField === 'notes' ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="min-h-[80px]"
                              placeholder="Enter notes..."
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={saveEdit} className="h-7">
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEditing} className="h-7">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                            {selectedBookmark.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-white via-blue-50/20 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Eye className="h-7 w-7 mx-auto mb-3 text-blue-600" />
                        <p className="text-3xl font-bold text-gray-900">
                          {getSelectedBookmarkAnalytics(selectedBookmark.id)?.visits || selectedBookmark.visits || 0}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">TOTAL VISITS</p>
                        {/* Live indicator */}
                        {!selectedBookmarkAnalyticsLoading && getSelectedBookmarkAnalytics(selectedBookmark.id) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-1 mx-auto" title="Live data" />
                        )}
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white via-green-50/20 to-white border border-gray-200/60 hover:border-green-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Clock className="h-7 w-7 mx-auto mb-3 text-green-600" />
                        <p className="text-3xl font-bold text-gray-900">
                          {(() => {
                            const timeSpent = getSelectedBookmarkAnalytics(selectedBookmark.id)?.timeSpent || selectedBookmark.timeSpent || 0;
                            return timeSpent > 0 ? `${timeSpent}m` : '0m';
                          })()}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">TIME SPENT</p>
                        {/* Live indicator */}
                        {!selectedBookmarkAnalyticsLoading && getSelectedBookmarkAnalytics(selectedBookmark.id) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-1 mx-auto" title="Live data" />
                        )}
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white via-purple-50/20 to-white border border-gray-200/60 hover:border-purple-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Activity className="h-7 w-7 mx-auto mb-3 text-purple-600" />
                        <p className="text-3xl font-bold text-gray-900">
                          {getSelectedBookmarkAnalytics(selectedBookmark.id)?.weeklyVisits || selectedBookmark.weeklyVisits || 0}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">THIS WEEK</p>
                        {/* Live indicator */}
                        {!selectedBookmarkAnalyticsLoading && getSelectedBookmarkAnalytics(selectedBookmark.id) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-1 mx-auto" title="Live data" />
                        )}
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white via-green-50/20 to-white border border-gray-200/60 hover:border-green-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <SiteHealthComponent 
                          bookmark={selectedBookmark}
                          onClick={() => checkBookmarkHealth([selectedBookmark.id])}
                          isLoading={healthCheckLoading[selectedBookmark.id] || false}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* View Full Analytics Button */}
                  <div className="flex justify-center mt-6 space-x-4">
                    <Button 
                      onClick={() => window.location.href = '/analytics'}
                      className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      VIEW FULL ANALYTICS
                    </Button>
                    <Button 
                      onClick={() => checkBookmarkHealth([selectedBookmark.id])}
                      disabled={healthCheckLoading[selectedBookmark.id] || false}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {healthCheckLoading[selectedBookmark.id] ? (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                          CHECKING...
                        </>
                      ) : (
                        <>
                          🔍 CHECK HEALTH
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Related Bookmarks Section */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">RELATED BOOKMARKS</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('Opening browse all bookmarks modal');
                          // Open the add bookmark modal and switch to existing bookmarks tab
                          setShowAddBookmark(true);
                          setAddBookmarkTab('existing');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        BROWSE ALL BOOKMARKS TO ADD MORE
                      </Button>
                    </div>

                    {/* Related Bookmarks Grid with Drag and Drop */}
                    <ClientOnlyDndProvider>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => {
                          // Handle drag end for related bookmarks
                          const { active, over } = event
                          if (active.id !== over?.id) {
                            showNotification('Related bookmark reordered!')
                          }
                        }}
                      >
                        <SortableContext items={(selectedBookmark?.relatedBookmarks || []).map(id => `related-${id}`)} strategy={rectSortingStrategy}>
                          {(selectedBookmark?.relatedBookmarks || []).length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <p>No related bookmarks yet.</p>
                              <p className="text-sm mt-2">Click "Browse All Bookmarks to add more" to add related bookmarks.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(selectedBookmark?.relatedBookmarks || []).map((relatedId) => {
                                const bookmark = bookmarks.find(b => b.id === relatedId)
                                if (!bookmark) return null
                                return (
                              <div key={`related-${bookmark.id}`} className="relative group">
                                {/* Drag Handle for Related Bookmarks */}
                                <div className="absolute top-2 left-2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105">
                                  <GripVertical className="h-4 w-4 text-gray-700" />
                                </div>
                                
                                <Card
                                  className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-300 hover:border-blue-400 bg-gradient-to-br from-white via-gray-50/20 to-white backdrop-blur-sm shadow-sm hover:shadow-blue-500/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBookmark(bookmark);
                                    // Track visit after setting selected bookmark
                                    setTimeout(() => {
                                      try { trackVisitCombined(bookmark.id); } catch {}
                                    }, 100);
                                  }}
                                >
                                  <div className="flex items-start space-x-3">
                                    {/* Circular Image */}
                                    <div className="flex-shrink-0">
                                      {(() => {
                                        const domain = extractDomain(bookmark.url);
                                        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                                        const globalLogo = userDefaultLogo && !/default-profile/i.test(userDefaultLogo) && userDefaultLogo.trim() !== '' ? userDefaultLogo : undefined;
              const src = globalLogo || faviconUrl;
                                        return (
                                          <img
                                            src={src}
                                            alt={`${bookmark.title} image`}
                                            className="w-10 h-10 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-gray-200/50"
                                            onError={(e) => {
                                              const el = e.target as HTMLImageElement;
                                              el.onerror = null;
                                              el.src = "/placeholder.svg";
                                            }}
                                          />
                                        );
                                      })()}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-sm text-gray-900 truncate font-audiowide uppercase mb-1">
                                        {bookmark.title}
                                      </h4>
                                      <p className="text-xs text-gray-600 truncate mb-2">
                                        {bookmark.description}
                                      </p>
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs bg-white/50 border-gray-300/50">
                                          {bookmark.category}
                                        </Badge>
                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                          <Eye className="h-3 w-3" />
                                          <span>{(() => {
                                            const analytics = getUnifiedBookmarkAnalytics(bookmark.id)
                                            return analytics ? analytics.visits : 0
                                          })()}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                      onClick={async (e) => {
                                        e.stopPropagation()
                                        if (selectedBookmark) {
                                          const updatedBookmark = {
                                            ...selectedBookmark,
                                            relatedBookmarks: (selectedBookmark.relatedBookmarks || []).filter(id => id !== bookmark.id)
                                          }
                                          setBookmarks(prev => prev.map(b => 
                                            b.id === selectedBookmark.id ? updatedBookmark : b
                                          ))
                                          setSelectedBookmark(updatedBookmark)
                                          
                                          // Save the updated bookmark to the backend
                                          try {
                                            const response = await fetch('/api/bookmarks', {
                                              method: 'POST',
                                              headers: {
                                                'Content-Type': 'application/json',
                                              },
                                              body: JSON.stringify({
                                                id: updatedBookmark.id,
                                                title: updatedBookmark.title,
                                                url: updatedBookmark.url,
                                                description: updatedBookmark.description || '',
                                                category: updatedBookmark.category || '',
                                                tags: Array.isArray(updatedBookmark.tags) ? updatedBookmark.tags : [],
                                                notes: updatedBookmark.notes || '',
                                                ai_summary: updatedBookmark.ai_summary || '',
                                                ai_tags: updatedBookmark.ai_tags || [],
                                                ai_category: updatedBookmark.ai_category || updatedBookmark.category || '',
                                                relatedBookmarks: updatedBookmark.relatedBookmarks || []
                                              })
                                            })

                                            const result = await response.json()
                                            
                                            if (result.success) {
                                              showNotification('Related bookmark removed!')
                                            } else {
                                              showNotification('Failed to remove related bookmark')
                                              console.error('Save failed:', result.error)
                                            }
                                          } catch (error) {
                                            showNotification('Error removing related bookmark')
                                            console.error('Save error:', error)
                                          }
                                        }
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </Card>
                              </div>
                                )})}
                              </div>
                            )}
                          </SortableContext>
                      </DndContext>
                    </ClientOnlyDndProvider>

                    {/* Add More Related Bookmarks */}
                    <div className="mt-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => {
                          console.log('Opening browse all bookmarks modal');
                          // Open the add bookmark modal and switch to existing bookmarks tab
                          setShowAddBookmark(true);
                          setAddBookmarkTab('existing');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        BROWSE ALL BOOKMARKS TO ADD MORE
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="arp" className="space-y-6">
                  {(() => {
                    // Analyze bookmark URL to determine website type and suggest appropriate workflow
                    const getWebsiteType = (url: string): string => {
                      const domain = url.toLowerCase();
                      
                      // Development & Technical
                      if (domain.includes('github.com') || domain.includes('stackoverflow.com') || 
                          domain.includes('developer.mozilla.org') || domain.includes('docs.') ||
                          domain.includes('api.') || domain.includes('codepen.io') ||
                          domain.includes('jsfiddle.net') || domain.includes('replit.com')) {
                        return 'developer';
                      }
                      
                      // Design & Creative
                      if (domain.includes('dribbble.com') || domain.includes('behance.net') ||
                          domain.includes('figma.com') || domain.includes('adobe.com') ||
                          domain.includes('canva.com') || domain.includes('unsplash.com') ||
                          domain.includes('pexels.com') || domain.includes('pinterest.com')) {
                        return 'creative';
                      }
                      
                      // Business & Analytics
                      if (domain.includes('linkedin.com') || domain.includes('crunchbase.com') ||
                          domain.includes('bloomberg.com') || domain.includes('forbes.com') ||
                          domain.includes('analytics.google.com') || domain.includes('salesforce.com') ||
                          domain.includes('hubspot.com') || domain.includes('tableau.com')) {
                        return 'business';
                      }
                      
                      // Learning & Education
                      if (domain.includes('coursera.org') || domain.includes('udemy.com') ||
                          domain.includes('edx.org') || domain.includes('khanacademy.org') ||
                          domain.includes('pluralsight.com') || domain.includes('youtube.com') ||
                          domain.includes('wikipedia.org') || domain.includes('medium.com')) {
                        return 'learning';
                      }
                      
                      // Sync & Development Infrastructure
                      if (domain.includes('supabase.com') || domain.includes('github.com') ||
                          domain.includes('gitlab.com') || domain.includes('bitbucket.org') ||
                          domain.includes('vercel.com') || domain.includes('netlify.com') ||
                          domain.includes('firebase.google.com') || domain.includes('aws.amazon.com') ||
                          domain.includes('heroku.com') || domain.includes('digitalocean.com')) {
                        return 'sync';
                      }
                      
                      // Default to productivity for general websites
                      return 'productivity';
                    };

                    const websiteType = getWebsiteType(selectedBookmark.url);

                    // Define the 5 professional bookmark workflow templates
                    const templates = {
                      'developer': {
                        title: '💻 Developer Resource Workflow',
                        description: 'Optimize how you save and organize development resources',
                        color: 'from-blue-500 to-purple-600',
                        icon: Code,
                        steps: [
                          {
                            id: 'categorize-resource',
                            title: 'Categorize This Resource',
                            description: 'Tag this bookmark with relevant development categories',
                            icon: Tag,
                            time: '1 min',
                            action: 'Add Tags',
                            details: [
                              'Add programming language tags (JavaScript, Python, etc.)',
                              'Include framework/library tags (React, Node.js, etc.)',
                              'Mark resource type (documentation, tutorial, tool)'
                            ]
                          },
                          {
                            id: 'set-priority',
                            title: 'Set Learning Priority',
                            description: 'Prioritize this resource in your learning queue',
                            icon: Target,
                            time: '30 sec',
                            action: 'Set Priority',
                            details: [
                              'High: Need to learn immediately',
                              'Medium: Learn within this month',
                              'Low: Reference for future projects'
                            ]
                          },
                          {
                            id: 'create-project-folder',
                            title: 'Organize by Project',
                            description: 'Link this resource to relevant projects',
                            icon: FolderIcon,
                            time: '1 min',
                            action: 'Organize',
                            details: [
                              'Create project-specific folders',
                              'Group by technology stack',
                              'Separate learning vs reference materials'
                            ]
                          },
                          {
                            id: 'schedule-review',
                            title: 'Schedule Review Time',
                            description: 'Set reminders to revisit this resource',
                            icon: Clock,
                            time: '30 sec',
                            action: 'Set Reminder',
                            details: [
                              'Daily: For current learning materials',
                              'Weekly: For important references',
                              'Monthly: For general resources'
                            ]
                          }
                        ]
                      },
                      'productivity': {
                        title: '⚡ Productivity Resource Workflow',
                        description: 'Maximize efficiency with this productivity resource',
                        color: 'from-green-500 to-emerald-600',
                        icon: Zap,
                        steps: [
                          {
                            id: 'assess-usefulness',
                            title: 'Assess Resource Value',
                            description: 'Evaluate how this tool/resource fits your workflow',
                            icon: CheckCircle,
                            time: '2 min',
                            action: 'Evaluate',
                            details: [
                              'Rate usefulness (1-5 stars)',
                              'Identify specific use cases',
                              'Compare with current tools'
                            ]
                          },
                          {
                            id: 'integration-plan',
                            title: 'Plan Integration',
                            description: 'Determine how to incorporate this into daily routine',
                            icon: Workflow,
                            time: '3 min',
                            action: 'Plan Usage',
                            details: [
                              'Schedule trial period',
                              'Define success metrics',
                              'Set implementation timeline'
                            ]
                          },
                          {
                            id: 'track-results',
                            title: 'Track Results',
                            description: 'Monitor impact on your productivity',
                            icon: BarChart3,
                            time: '1 min',
                            action: 'Set Tracking',
                            details: [
                              'Create productivity metrics',
                              'Schedule periodic reviews',
                              'Document improvements'
                            ]
                          },
                          {
                            id: 'share-insights',
                            title: 'Share with Team',
                            description: 'Share valuable tools with colleagues',
                            icon: Users2,
                            time: '2 min',
                            action: 'Share Resource',
                            details: [
                              'Write brief review',
                              'Tag team members',
                              'Create usage guidelines'
                            ]
                          }
                        ]
                      },
                      'creative': {
                        title: '🎨 Creative Resource Workflow',
                        description: 'Organize and utilize creative inspiration effectively',
                        color: 'from-purple-500 to-pink-600',
                        icon: Palette,
                        steps: [
                          {
                            id: 'inspiration-category',
                            title: 'Categorize Inspiration',
                            description: 'Tag this creative resource appropriately',
                            icon: Tag,
                            time: '1 min',
                            action: 'Categorize',
                            details: [
                              'Add style tags (minimalist, vintage, modern)',
                              'Include medium type (web, print, illustration)',
                              'Mark inspiration level (high, medium, reference)'
                            ]
                          },
                          {
                            id: 'mood-board',
                            title: 'Add to Mood Board',
                            description: 'Organize into project-specific collections',
                            icon: Layers,
                            time: '2 min',
                            action: 'Organize',
                            details: [
                              'Create project mood boards',
                              'Group by color palette',
                              'Separate by design phase'
                            ]
                          },
                          {
                            id: 'analyze-elements',
                            title: 'Analyze Design Elements',
                            description: 'Document what makes this design effective',
                            icon: Eye,
                            time: '3 min',
                            action: 'Analyze',
                            details: [
                              'Note color schemes',
                              'Identify typography choices',
                              'Document layout principles'
                            ]
                          },
                          {
                            id: 'apply-learnings',
                            title: 'Plan Application',
                            description: 'Schedule how to use this inspiration',
                            icon: CheckCircle,
                            time: '2 min',
                            action: 'Plan Usage',
                            details: [
                              'Link to current projects',
                              'Set review reminders',
                              'Share with design team'
                            ]
                          }
                        ]
                      },
                      'business': {
                        title: '📊 Business Resource Workflow',
                        description: 'Strategic approach to business resource management',
                        color: 'from-orange-500 to-red-600',
                        icon: Building,
                        steps: [
                          {
                            id: 'business-value',
                            title: 'Assess Business Value',
                            description: 'Evaluate strategic importance of this resource',
                            icon: TrendingUp,
                            time: '2 min',
                            action: 'Evaluate',
                            details: [
                              'Rate strategic importance (1-5)',
                              'Identify business impact areas',
                              'Assess implementation complexity'
                            ]
                          },
                          {
                            id: 'stakeholder-relevance',
                            title: 'Identify Stakeholders',
                            description: 'Determine who should know about this resource',
                            icon: Users,
                            time: '2 min',
                            action: 'Tag Stakeholders',
                            details: [
                              'Tag relevant team members',
                              'Identify decision makers',
                              'Note permission levels needed'
                            ]
                          },
                          {
                            id: 'implementation-plan',
                            title: 'Create Action Plan',
                            description: 'Develop implementation or usage strategy',
                            icon: ClipboardCheck,
                            time: '3 min',
                            action: 'Plan Implementation',
                            details: [
                              'Define next steps',
                              'Set timeline milestones',
                              'Allocate required resources'
                            ]
                          },
                          {
                            id: 'track-outcomes',
                            title: 'Monitor Results',
                            description: 'Track business impact and ROI',
                            icon: BarChart3,
                            time: '1 min',
                            action: 'Set Tracking',
                            details: [
                              'Define success metrics',
                              'Schedule progress reviews',
                              'Document lessons learned'
                            ]
                          }
                        ]
                      },
                      'learning': {
                        title: '📚 Learning Resource Workflow',
                        description: 'Systematic approach to educational content',
                        color: 'from-indigo-500 to-purple-600',
                        icon: BookOpen,
                        steps: [
                          {
                            id: 'assess-difficulty',
                            title: 'Assess Learning Level',
                            description: 'Determine complexity and prerequisites',
                            icon: GraduationCap,
                            time: '2 min',
                            action: 'Assess Level',
                            details: [
                              'Rate difficulty (Beginner/Intermediate/Advanced)',
                              'Identify prerequisites needed',
                              'Estimate time investment required'
                            ]
                          },
                          {
                            id: 'create-learning-path',
                            title: 'Build Learning Path',
                            description: 'Structure this resource in your learning journey',
                            icon: GitBranch,
                            time: '3 min',
                            action: 'Plan Learning',
                            details: [
                              'Link to related resources',
                              'Set learning sequence order',
                              'Define completion criteria'
                            ]
                          },
                          {
                            id: 'schedule-study',
                            title: 'Schedule Study Time',
                            description: 'Block time for focused learning',
                            icon: Clock,
                            time: '1 min',
                            action: 'Schedule',
                            details: [
                              'Set dedicated study sessions',
                              'Create progress checkpoints',
                              'Plan review intervals'
                            ]
                          },
                          {
                            id: 'track-progress',
                            title: 'Track Learning Progress',
                            description: 'Monitor understanding and retention',
                            icon: CheckCircle,
                            time: '2 min',
                            action: 'Track Progress',
                            details: [
                              'Mark completion status',
                              'Note key takeaways',
                              'Rate understanding level'
                            ]
                          }
                        ]
                      },
                      'sync': {
                        title: '🔄 Data Sync & Backup Workflow',
                        description: 'Set up comprehensive sync with Supabase, GitHub, and localStorage',
                        color: 'from-cyan-500 to-blue-600',
                        icon: Cloud,
                        steps: [
                          {
                            id: 'supabase-setup',
                            title: 'Configure Supabase Integration',
                            description: 'Set up cloud database storage and real-time sync',
                            icon: Database,
                            time: '8 min',
                            action: 'Setup Supabase',
                            details: [
                              'Create Supabase project',
                              'Configure database schema',
                              'Set up authentication',
                              'Enable real-time subscriptions'
                            ]
                          },
                          {
                            id: 'github-sync',
                            title: 'GitHub Repository Sync',
                            description: 'Connect to GitHub for version control and backup',
                            icon: GitBranch,
                            time: '6 min',
                            action: 'Connect GitHub',
                            details: [
                              'Create GitHub repository',
                              'Set up automated commits (every 5 min)',
                              'Configure push/pull workflows with hooks',
                              'Enable branch protection and CI/CD'
                            ]
                          },
                          {
                            id: 'local-storage',
                            title: 'localStorage Optimization',
                            description: 'Implement efficient local caching and offline support',
                            icon: Smartphone,
                            time: '5 min',
                            action: 'Setup Local Cache',
                            details: [
                              'Configure localStorage strategy',
                              'Implement data compression',
                              'Set up offline fallbacks',
                              'Optimize storage limits'
                            ]
                          },
                          {
                            id: 'sync-automation',
                            title: 'Automated Sync Pipeline',
                            description: 'Create seamless three-way sync between all platforms',
                            icon: RotateCcw,
                            time: '10 min',
                            action: 'Automate Sync',
                            details: [
                              'Set up conflict resolution',
                              'Configure sync intervals (every 5 min)',
                              'Implement real-time change detection',
                              'Add sync status monitoring dashboard'
                            ]
                          },
                          {
                            id: 'backup-strategy',
                            title: 'Backup & Recovery Strategy',
                            description: 'Implement comprehensive backup and disaster recovery',
                            icon: Shield,
                            time: '7 min',
                            action: 'Setup Backups',
                            details: [
                              'Schedule automated backups',
                              'Create recovery procedures',
                              'Test restore processes',
                              'Monitor backup integrity'
                            ]
                          }
                        ]
                      }
                    };

                    const currentTemplate = templates[arpSelectedTemplate as keyof typeof templates];
                    const IconComponent = currentTemplate.icon;

                    const markStepComplete = (stepId: string) => {
                      if (!arpCompletedSteps.includes(stepId)) {
                        setArpCompletedSteps([...arpCompletedSteps, stepId]);
                      }
                    };

                    const getStepStatus = (stepId: string) => {
                      return arpCompletedSteps.includes(stepId);
                    };

                    return (
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-4">
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${currentTemplate.color} text-white shadow-lg`}>
                            <IconComponent className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{currentTemplate.title}</h3>
                            <p className="text-gray-600 mt-1">{currentTemplate.description}</p>
                          </div>
                        </div>

                        {/* Smart Template Suggestion */}
                        {selectedBookmark && (() => {
                          const suggestedTemplate = getWebsiteType(selectedBookmark.url);
                          const suggestion = templates[suggestedTemplate as keyof typeof templates];
                          
                          if (suggestedTemplate !== arpSelectedTemplate && suggestion) {
                            return (
                              <Card className="border-2 border-blue-200 bg-blue-50">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${suggestion.color} text-white`}>
                                        <suggestion.icon className="h-5 w-5" />
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-blue-900">Suggested Workflow</h4>
                                      <p className="text-sm text-blue-700">
                                        Based on <span className="font-medium">{extractDomain(selectedBookmark.url)}</span>, 
                                        we recommend the <span className="font-medium">{suggestion.title}</span>
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setArpSelectedTemplate(suggestedTemplate);
                                        setArpCurrentStep(0);
                                        setArpCompletedSteps([]);
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Use This
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          }
                          return null;
                        })()}

                        {/* Template Selector */}
                        <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              {Object.entries(templates).map(([key, template]) => {
                                const TemplateIcon = template.icon;
                                const isSelected = arpSelectedTemplate === key;
                                return (
                                  <button
                                    key={key}
                                    onClick={() => {
                                      setArpSelectedTemplate(key);
                                      setArpCurrentStep(0);
                                      setArpCompletedSteps([]);
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                      isSelected 
                                        ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${template.color} text-white mb-3`}>
                                      <TemplateIcon className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-semibold text-sm mb-1">{template.title.replace(/^[^\s]+ /, '')}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Real-time Sync Status (only for sync template) */}
                        {arpSelectedTemplate === 'sync' && (
                          <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="font-semibold text-green-800">Sync Status</span>
                                  </div>
                                  <div className="flex gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-600">Supabase: Connected</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-600">GitHub: Synced</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-600">Local: Cached</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // Trigger manual sync
                                      showNotification('Manual sync initiated...');
                                    }}
                                    className="text-green-700 border-green-300 hover:bg-green-100"
                                  >
                                    Sync Now
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      // Quick commit and push
                                      showNotification('Committing and pushing changes...');
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Commit & Push
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-3 text-xs text-green-700">
                                Last sync: Just now • Next auto-sync in 4:32 • 
                                <span className="font-medium"> Changes detected: 3 files</span>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Progress Overview */}
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-semibold text-lg">Your Progress</h4>
                                <p className="text-sm text-gray-600">
                                  {arpCompletedSteps.length} of {currentTemplate.steps.length} steps completed
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                  {Math.round((arpCompletedSteps.length / currentTemplate.steps.length) * 100)}%
                                </div>
                                <div className="text-xs text-gray-500">Complete</div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full bg-gradient-to-r ${currentTemplate.color} transition-all duration-500`}
                                style={{ width: `${(arpCompletedSteps.length / currentTemplate.steps.length) * 100}%` }}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Steps */}
                        <div className="space-y-4">
                          {currentTemplate.steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = getStepStatus(step.id);
                            const isCurrent = index === arpCurrentStep;
                            const isLocked = index > arpCurrentStep && !arpShowAllSteps;

                            return (
                              <Card key={step.id} className={`transition-all duration-200 ${
                                isCompleted ? 'bg-green-50 border-green-200' :
                                isCurrent ? 'bg-blue-50 border-blue-200 shadow-md' :
                                isLocked ? 'bg-gray-50 border-gray-200 opacity-60' :
                                'hover:shadow-sm'
                              }`}>
                                <CardContent className="p-6">
                                  <div className="flex items-start gap-4">
                                    {/* Step Icon */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                      isCompleted ? 'bg-green-500 text-white' :
                                      isCurrent ? `bg-gradient-to-r ${currentTemplate.color} text-white` :
                                      isLocked ? 'bg-gray-300 text-gray-500' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {isCompleted ? (
                                        <CheckCircle className="h-6 w-6" />
                                      ) : (
                                        <StepIcon className="h-6 w-6" />
                                      )}
                                    </div>

                                    {/* Step Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-semibold text-lg">{step.title}</h5>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="secondary" className="text-xs">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {step.time}
                                          </Badge>
                                          {isCompleted && (
                                            <Badge className="bg-green-500 text-white text-xs">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Complete
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <p className="text-gray-600 mb-4">{step.description}</p>
                                      
                                      {/* Step Details */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                          <h6 className="font-medium text-sm mb-2">What you'll learn:</h6>
                                          <ul className="space-y-1">
                                            {step.details.map((detail, idx) => (
                                              <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                                                {detail}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-3">
                                        {!isLocked && !isCompleted && (
                                          <>
                                            <Button 
                                              className={`bg-gradient-to-r ${currentTemplate.color} hover:opacity-90`}
                                              onClick={() => {
                                                markStepComplete(step.id);
                                                if (index === arpCurrentStep) {
                                                  setArpCurrentStep(Math.min(index + 1, currentTemplate.steps.length - 1));
                                                }
                                              }}
                                            >
                                              <PlayCircle className="h-4 w-4 mr-2" />
                                              {step.action}
                                            </Button>
                                            <Button variant="outline" size="sm">
                                              <Eye className="h-4 w-4 mr-2" />
                                              Preview
                                            </Button>
                                          </>
                                        )}
                                        
                                        {isCompleted && (
                                          <Button variant="outline" disabled>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Completed
                                          </Button>
                                        )}
                                        
                                        {isLocked && (
                                          <Button variant="outline" disabled>
                                            Complete previous steps first
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>

                        {/* Action Bar */}
                        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setArpShowAllSteps(!arpShowAllSteps)}
                                >
                                  {arpShowAllSteps ? 'Lock Future Steps' : 'Show All Steps'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setArpCompletedSteps([]);
                                    setArpCurrentStep(0);
                                  }}
                                >
                                  Reset Progress
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {arpCompletedSteps.length === currentTemplate.steps.length && (
                                  <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-semibold">Template Complete!</span>
                                  </div>
                                )}
                                <Button className={`bg-gradient-to-r ${currentTemplate.color} hover:opacity-90`}>
                                  <Rocket className="h-4 w-4 mr-2" />
                                  Continue Journey
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="notification" className="h-[600px]">
                  <NotificationTab 
                    bookmarkId={selectedBookmark.id.toString()} 
                    bookmarkTitle={selectedBookmark.title} 
                  />
                </TabsContent>

                <TabsContent value="timer" className="h-[600px]">
                  <TimerTab />
                </TabsContent>

                <TabsContent value="media" className="h-[600px]">
                  {hasVisitedMediaTab ? (
                    <MediaHub />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Click the MEDIA tab to load media library</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comment" className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Comments</h3>
                      <Button size="sm">Add Comment</Button>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">You</span>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                        <p className="text-sm">This is a great resource for learning React hooks!</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Bookmark Modal */}
      <Dialog open={showAddBookmark} onOpenChange={(open) => {
        setShowAddBookmark(open)
        if (!open) resetAddBookmarkModal()
      }}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle>ADD BOOKMARKS</DialogTitle>
          </DialogHeader>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={addBookmarkTab === 'new' ? 'default' : 'ghost'}
              onClick={() => setAddBookmarkTab('new')}
              className="flex-1"
            >
              New Bookmark
            </Button>
            <Button
              variant={addBookmarkTab === 'existing' ? 'default' : 'ghost'}
              onClick={() => setAddBookmarkTab('existing')}
              className="flex-1"
            >
              Existing Bookmarks
            </Button>
          </div>

          {/* Tab Content */}
          {addBookmarkTab === 'new' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">TITLE</label>
                <Input
                  placeholder="Enter Bookmark Title"
                  value={newBookmark.title}
                  onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">URL</label>
                <Input
                  placeholder="https://example.com"
                  value={newBookmark.url}
                  onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">DESCRIPTION</label>
                <Textarea
                  placeholder="Enter Description"
                  value={newBookmark.description}
                  onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">CATEGORY</label>
                <Select value={newBookmark.category} onValueChange={(value) => setNewBookmark({ ...newBookmark, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="Learning">Learning</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">TAGS</label>
                <Input
                  placeholder="Enter Tags Separated By Commas"
                  value={newBookmark.tags}
                  onChange={(e) => setNewBookmark({ ...newBookmark, tags: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">PRIORITY</label>
                <Select value={newBookmark.priority} onValueChange={(value) => setNewBookmark({ ...newBookmark, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">IMAGE</label>
                <div className="space-y-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size must be less than 5MB');
                          e.target.value = ''; // Clear the input
                          return;
                        }
                        
                        // Validate file type
                        if (!file.type.startsWith('image/')) {
                          alert('Please select a valid image file');
                          e.target.value = ''; // Clear the input
                          return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewBookmark({ ...newBookmark, circularImage: event.target?.result as string });
                        };
                        reader.onerror = () => {
                          alert('Error reading file. Please try again.');
                          e.target.value = ''; // Clear the input
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {newBookmark.circularImage && (
                    <div className="flex items-center space-x-3">
                      <img
                        src={newBookmark.circularImage}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-green-600">✓ Image uploaded successfully</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewBookmark({ ...newBookmark, circularImage: '' })}
                          className="mt-1 h-7 text-xs"
                        >
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Upload a circular image for this bookmark (optional - will auto-fetch from website if not provided). Max file size: 5MB</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">NOTES</label>
                <Textarea
                  placeholder="Enter Any Notes"
                  value={newBookmark.notes}
                  onChange={(e) => setNewBookmark({ ...newBookmark, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddBookmark(false)}>
                  CANCEL
                </Button>
                <Button onClick={handleAddBookmark}>
                  ADD BOOKMARK
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <label className="text-sm font-medium">SEARCH YOUR EXISTING BOOKMARKS</label>
                <Input
                  placeholder="Search by name, description, or category..."
                  value={existingBookmarksSearch}
                  onChange={(e) => setExistingBookmarksSearch(e.target.value)}
                />
              </div>
              
              {/* Existing Bookmarks List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredExistingBookmarks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {existingBookmarksSearch ? 'No bookmarks match your search' : 'No existing bookmarks to add'}
                  </div>
                ) : (
                  filteredExistingBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedExistingBookmarks.includes(bookmark.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleExistingBookmarkSelect(bookmark.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {bookmark.favicon ? (
                            <img
                              src={bookmark.favicon}
                              alt={bookmark.title}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-medium text-blue-600 ${bookmark.favicon ? 'hidden' : ''}`}>
                            {bookmark.title.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-sm">{bookmark.title}</h3>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {bookmark.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{bookmark.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            {bookmark.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 rounded border-2 ${
                            selectedExistingBookmarks.includes(bookmark.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          } flex items-center justify-center`}>
                            {selectedExistingBookmarks.includes(bookmark.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectedExistingBookmarks.length} bookmark(s) selected
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowAddBookmark(false)}>
                    CANCEL
                  </Button>
                  <Button 
                    onClick={handleAddExistingBookmarks}
                    disabled={selectedExistingBookmarks.length === 0}
                  >
                    ADD SELECTED ({selectedExistingBookmarks.length})
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Folder Modal */}
      <Dialog open={showAddFolder} onOpenChange={setShowAddFolder}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle>ADD NEW FOLDER</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your bookmarks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">FOLDER NAME</label>
              <Input
                placeholder="Enter folder name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium">FOLDER COLOR</label>
              <div className="flex items-center space-x-3">
                <Input
                  type="color"
                  value={newFolder.color}
                  onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                  className="w-16 h-10 p-1 rounded-lg"
                />
                <div className="flex-1">
                  <Input
                    placeholder="#3b82f6"
                    value={newFolder.color}
                    onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">DESCRIPTION (OPTIONAL)</label>
              <Textarea
                placeholder="Enter folder description"
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                rows={3}
              />
            </div>
            
            {/* Preview */}
            {newFolder.name && (
              <div className="space-y-2">
                <label className="text-sm font-medium">PREVIEW</label>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: newFolder.color + '20' }}
                  >
                    <FolderIcon className="h-6 w-6" style={{ color: newFolder.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{newFolder.name}</p>
                    {newFolder.description && (
                      <p className="text-xs text-gray-500">{newFolder.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowAddFolder(false)
                resetAddFolderForm()
              }}>
                CANCEL
              </Button>
              <Button onClick={handleAddFolder} disabled={!newFolder.name.trim()}>
                CREATE FOLDER
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Default Logo Modal */}
      <Dialog open={showDefaultLogoModal} onOpenChange={setShowDefaultLogoModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle>SET DEFAULT LOGO</DialogTitle>
            <DialogDescription>
              Set a default logo that will be used as placeholder for all bookmarks instead of letters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">LOGO URL</label>
              <Input
                placeholder="https://example.com/logo.png"
                value={newDefaultLogo}
                onChange={(e) => setNewDefaultLogo(e.target.value)}
              />
            </div>
            
            {/* Preview */}
            {newDefaultLogo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">PREVIEW</label>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-300/50 transition-all duration-300 shadow-sm overflow-hidden">
                    <img 
                      src={newDefaultLogo} 
                      alt="Default logo preview" 
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = 'ERROR';
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">This logo will appear on all bookmark cards</p>
                    <p className="text-xs text-gray-500">Individual bookmarks can still override this default</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Current Default */}
            {userDefaultLogo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">CURRENT DEFAULT</label>
                <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-300/50 transition-all duration-300 shadow-sm overflow-hidden">
                    <img 
                      src={userDefaultLogo} 
                      alt="Current default logo" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Currently active default logo</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserDefaultLogo('')
                        localStorage.removeItem('userDefaultLogo')
                        setShowDefaultLogoModal(false)
                        showNotification('Default logo removed!')
                      }}
                      className="mt-1 h-7 text-xs"
                    >
                      Remove Default
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDefaultLogoModal(false)}>
                CANCEL
              </Button>
              <Button onClick={handleSetDefaultLogo} disabled={!newDefaultLogo}>
                SET DEFAULT
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-300">
          {notification}
        </div>
      )}
        </div>
      </div>
    </div>
  )
}        