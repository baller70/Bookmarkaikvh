'use client'

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  BookmarkIcon as BookmarkIconLucide,
  Building,
  Columns
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
import { NotificationTab } from '@/src/features/notifications'
import { TimerTab } from '@/src/features/pomodoro'
import { MediaHub } from '@/src/features/media'
import { SimpleBoardCanvas } from '@/src/features/simpleBoard/SimpleBoardCanvas'
import { FolderHierarchyManager, FolderHierarchyAssignment } from '@/src/components/hierarchy/Hierarchy'
import { FolderOrgChartView } from '@/src/components/ui/folder-org-chart-view'
import { FolderCard, type BookmarkWithRelations } from '@/src/components/ui/FolderCard'
import { FolderFormDialog, type Folder } from '@/src/components/ui/FolderFormDialog'
import { KanbanView } from '@/src/components/ui/BookmarkKanban'
import { SyncButton } from '@/components/SyncButton'

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

// Custom Infinity Board Background Component (no nodes, just background)
const InfinityBoardBackground = ({ isActive }: { isActive: boolean }) => {
  const [nodes] = useNodesState([]);
  const [edges] = useEdgesState([]);

  if (!isActive) return null;

  return (
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
  );
};

// HIERARCHY Infinity Board with Full Editing Capabilities - DEFINITIVE SOLUTION
const KHV1InfinityBoard = ({ folders, bookmarks, onCreateFolder, onAddBookmark, onOpenDetail, isActive }: {
  folders: any[];
  bookmarks: any[];
  onCreateFolder: () => void;
  onAddBookmark: () => void;
  onOpenDetail: (bookmark: any) => void;
  isActive: boolean;
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 });
  
  if (!isActive) return null;
  
  return (
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
            />
          </div>
        </div>
      </div>
    </div>
  );
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
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact' | 'infinity'>('grid')
  const [compactViewMode, setCompactViewMode] = useState<'folders' | 'bookmarks'>('folders')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false)
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false)
  const [isAddExistingBookmarksModalOpen, setIsAddExistingBookmarksModalOpen] = useState(false)
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('')
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('')
  const [newBookmarkDescription, setNewBookmarkDescription] = useState('')
  const [newBookmarkTags, setNewBookmarkTags] = useState('')
  const [newBookmarkCategory, setNewBookmarkCategory] = useState('')
  const [newBookmarkPriority, setNewBookmarkPriority] = useState('medium')
  const [enableAIAnalysis, setEnableAIAnalysis] = useState(true)
  const [aiAnalysisLoading, setAIAnalysisLoading] = useState(false)
  const [aiAnalysisResult, setAIAnalysisResult] = useState<any>(null)
  const [newBookmarkImage, setNewBookmarkImage] = useState('')
  const [newBookmarkNotes, setNewBookmarkNotes] = useState('')
  const [addBookmarkTab, setAddBookmarkTab] = useState<'new' | 'existing'>('new')
  const [existingBookmarksSearch, setExistingBookmarksSearch] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')
  const [existingBookmarks, setExistingBookmarks] = useState<any[]>([])
  const [selectedExistingBookmarks, setSelectedExistingBookmarks] = useState<number[]>([])
  const [selectedBookmarks, setSelectedBookmarks] = useState<number[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [userDefaultLogo, setUserDefaultLogo] = useState<string | null>(null)
  const [isDefaultLogoModalOpen, setIsDefaultLogoModalOpen] = useState(false)
  const [newDefaultLogoUrl, setNewDefaultLogoUrl] = useState('')
  const [activeBookmarkTab, setActiveBookmarkTab] = useState('overview')
  const [isSharing, setIsSharing] = useState<Record<number, boolean>>({})

  // Dynamic folders based on real bookmark categories
  const [dynamicFolders, setDynamicFolders] = useState<any[]>([]);

  const [mockGoalFolders, setMockGoalFolders] = useState([
    {
      id: '1',
      name: 'Project Management',
      description: 'Tools and resources for project management',
      color: '#ff7b7b',
      goal_progress: 75,
      goal_priority: 'high',
      goal_status: 'in_progress',
      deadline_date: '2026-06-30',
      goal_notes: 'Complete project management tools and resources'
    },
    {
      id: '2',
      name: 'Learning Development',
      description: 'Resources for learning new skills',
      color: '#7bff7b',
      goal_progress: 60,
      goal_priority: 'medium',
      goal_status: 'completed',
      deadline_date: '2026-05-31',
      goal_notes: 'Complete learning resources'
    },
    {
      id: '3',
      name: 'Entertainment',
      description: 'Entertainment resources and tools',
      color: '#7b7bff',
      goal_progress: 80,
      goal_priority: 'high',
      goal_status: 'overdue',
      deadline_date: '2026-06-15',
      goal_notes: 'Complete entertainment resources and tools'
    }
  ]);

  // Load user profile picture from Supabase
  useEffect(() => {
    const loadProfileAvatar = async () => {
      try {
        // Skip Supabase authentication entirely - use localStorage only
        console.log('Supabase authentication bypassed - loading profile from localStorage only')
        
        // Try all localStorage formats
        const localAvatar = localStorage.getItem('dna_profile_avatar') || 
                           localStorage.getItem('profilePicture')
        
        if (localAvatar) {
          setUserDefaultLogo(localAvatar)
          console.log('Profile avatar loaded from localStorage:', localAvatar)
          return
        }
        
        // Try userSettings format as well
        const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
        if (userSettings.profile?.avatar || userSettings.profile?.avatarUrl) {
          const avatar = userSettings.profile.avatar || userSettings.profile.avatarUrl
          setUserDefaultLogo(avatar)
          console.log('Profile avatar loaded from userSettings:', avatar)
          return
        }
        
        console.log('No profile avatar found in localStorage')
      } catch (error) {
        console.log('Error loading profile avatar from localStorage:', error)
      }
    }
    
    loadProfileAvatar()
    
    // Poll for updates every 5 seconds to catch changes from DNA profile
    const interval = setInterval(loadProfileAvatar, 5000)
    return () => clearInterval(interval)
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

  // Load bookmarks from database
  const loadBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks?user_id=dev-user-fixed-id')
      const result = await response.json()
      
      if (result.success && result.bookmarks) {
        console.log('✅ Loaded bookmarks from database:', result.bookmarks.length)
        setBookmarks(result.bookmarks)
      } else {
        console.log('⚠️ No bookmarks found, starting with empty array')
        setBookmarks([])
      }
    } catch (error) {
      console.error('❌ Error loading bookmarks:', error)
      setBookmarks([])
    }
  }

  // Load bookmarks from database on component mount
  useEffect(() => {
    loadBookmarks()
  }, [])

  // Ensure any legacy bookmark objects that may still contain tags don't render them on the cards
  useEffect(() => {
    setBookmarks(prev => prev.map(b => ({ ...b, tags: Array.isArray(b.tags) ? b.tags : [] })))
  }, [])

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
                         bookmark.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || bookmark.category.toLowerCase() === filterCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

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
    if (!newBookmarkTitle.trim()) {
      alert('Please enter a bookmark title');
      return;
    }
    
    if (!newBookmarkUrl.trim()) {
      alert('Please enter a bookmark URL');
      return;
    }
    
    // Validate URL format
    try {
      new URL(newBookmarkUrl);
    } catch {
      alert('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    try {
      setAIAnalysisLoading(true)
      setAIAnalysisResult(null)
      
      // Save to bookmarks API endpoint with AI analysis enabled
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newBookmarkTitle,
          url: newBookmarkUrl,
          description: enableAIAnalysis ? null : (newBookmarkDescription || 'No description provided'),
          category: enableAIAnalysis ? null : (newBookmarkCategory || 'General'),
          tags: enableAIAnalysis ? null : (newBookmarkTags ? newBookmarkTags.split(',').map(tag => tag.trim()) : []),
          notes: newBookmarkNotes || 'No notes added',
          enableAI: enableAIAnalysis
        })
      })

      const result = await response.json()
      
      if (result.success && result.bookmark) {
        console.log('✅ Bookmark saved successfully:', result.bookmark)
        
        // Store AI analysis result for display
        if (result.aiAnalysis) {
          setAIAnalysisResult(result.aiAnalysis)
          console.log('🤖 AI Analysis completed:', result.aiAnalysis)
        }
        
        // Reload all bookmarks from database to ensure UI is in sync
        await loadBookmarks()
        
        showNotification(
          enableAIAnalysis && result.aiAnalysis 
            ? 'Bookmark added successfully with AI analysis!' 
            : 'Bookmark added successfully!'
        )
        setIsAddBookmarkModalOpen(false)
        resetAddBookmarkForm()
        console.log('✅ Bookmarks reloaded from database after adding new bookmark')
      } else {
        alert('Failed to save bookmark: ' + (result.error || 'Unknown error'))
        console.error('Save failed:', result.error)
      }
    } catch (error) {
      alert('Error saving bookmark: ' + error.message)
      console.error('Save error:', error)
    } finally {
      setAIAnalysisLoading(false)
    }
  }

  const resetAddBookmarkForm = () => {
    setNewBookmarkTitle('')
    setNewBookmarkUrl('')
    setNewBookmarkDescription('')
    setNewBookmarkTags('')
    setNewBookmarkCategory('')
    setNewBookmarkPriority('medium')
    setNewBookmarkImage('')
    setNewBookmarkNotes('')
    setAIAnalysisResult(null)
    setAIAnalysisLoading(false)
  }

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      // For now, we'll just show a notification that the folder was created
      // In a real app, this would save to a database
      showNotification(`Folder "${newFolderName}" created successfully!`)
      
      // Reset the form
      setNewFolder({
        name: '',
        color: '#3b82f6',
        description: ''
      })
      
      // Close the modal
      setIsAddFolderModalOpen(false)
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

  const handleAddExistingBookmarks = () => {
    if (selectedExistingBookmarks.length === 0) {
      showNotification('Please select at least one bookmark to add')
      return
    }

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
    setSelectedExistingBookmarks([])
    setIsAddBookmarkModalOpen(false)
    showNotification(`Added ${bookmarksToAdd.length} bookmark(s) successfully!`)
  }

  const resetAddBookmarkModal = () => {
    setIsAddBookmarkModalOpen(false)
    setSelectedExistingBookmarks([])
    setNewBookmarkUrl('')
    setNewBookmarkTitle('')
    setNewBookmarkDescription('')
    setNewBookmarkTags('')
    setNewBookmarkCategory('')
    setNewBookmarkPriority('medium')
    setNewBookmarkImage('')
    setNewBookmarkNotes('')
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

  const handleBookmarkSelect = (bookmarkId: number) => {
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    )
  }

  const handleBookmarkClick = (bookmark: any) => {
    setSelectedBookmark(bookmark)
    setIsModalOpen(true)
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
        console.log('✅ Bookmark saved successfully:', result.bookmark)
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
        console.log('✅ Bookmark favorite status updated:', result.bookmark)
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

    // Prevent multiple simultaneous share operations for the selected bookmark
    if (isSharing[selectedBookmark.id]) {
      showNotification('Please wait for the previous share to complete')
      return
    }

    setIsSharing(prev => ({ ...prev, [selectedBookmark.id]: true }))

    const shareData = {
      title: selectedBookmark.title,
      text: selectedBookmark.description,
      url: selectedBookmark.url,
    }

    try {
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData)
        showNotification('Bookmark shared successfully!')
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${selectedBookmark.title}\n${selectedBookmark.description}\n${selectedBookmark.url}`)
        showNotification('Bookmark details copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      if (error instanceof Error && error.name === 'InvalidStateError') {
        showNotification('Please wait for the previous share to complete')
      } else {
        // Fallback to copying URL only
        try {
          await navigator.clipboard.writeText(selectedBookmark.url)
          showNotification('Bookmark URL copied to clipboard!')
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError)
          showNotification('Unable to share or copy bookmark')
        }
      }
    } finally {
      // Reset sharing state after a delay to prevent rapid clicking
      setTimeout(() => {
        setIsSharing(prev => ({ ...prev, [selectedBookmark.id]: false }))
      }, 1000)
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
    window.open(selectedBookmark.url, '_blank', 'noopener,noreferrer')
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const deleteBookmark = async (bookmarkId: number) => {
    try {
      console.log('🗑️ Deleting bookmark with ID:', bookmarkId);
      
      const response = await fetch(`/api/bookmarks?id=${bookmarkId}&user_id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove bookmark from local state
        setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        showNotification('Bookmark deleted successfully!');
        console.log('✅ Bookmark deleted successfully');
      } else {
        showNotification('Failed to delete bookmark: ' + (data.error || 'Unknown error'));
        console.error('Delete failed:', data.error);
      }
    } catch (error) {
      showNotification('Error deleting bookmark: ' + (error as Error).message);
      console.error('Delete error:', error);
    }
  }

  const handleSetDefaultLogo = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userDefaultLogo', newDefaultLogoUrl)
      setUserDefaultLogo(newDefaultLogoUrl)
      setIsDefaultLogoModalOpen(false)
      setNewDefaultLogoUrl('')
      showNotification('Default logo updated successfully!')
    }
  }

  const openDefaultLogoModal = () => {
    setNewDefaultLogoUrl(userDefaultLogo || '')
    setIsDefaultLogoModalOpen(true)
  }

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value)
    setActiveTab(value)
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

      // Handle mockFolders reordering (Folder 2.0)
      const activeFolderIndex = mockFolders.findIndex((item) => item.id === active.id)
      const overFolderIndex = mockFolders.findIndex((item) => item.id === over.id)
      
      if (activeFolderIndex !== -1 && overFolderIndex !== -1) {
        setMockFolders((items) => arrayMove(items, activeFolderIndex, overFolderIndex))
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
      case 'fair':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Calculate total visits across all bookmarks for percentage calculation
  const totalVisits = bookmarks.reduce((sum, bookmark) => sum + bookmark.visits, 0)

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
      <div className="absolute top-12 right-2 flex flex-col items-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                showNotification(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!')
              }}
            >
              <Heart className={`h-4 w-4 ${bookmark.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Open bookmark details modal
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
                
                // Prevent multiple simultaneous share operations
                if (isSharing[bookmark.id]) {
                  return
                }
                
                setIsSharing(prev => ({ ...prev, [bookmark.id]: true }))
                
                try {
                  const shareData = {
                    title: bookmark.title,
                    text: bookmark.description,
                    url: bookmark.url,
                  }
                  
                  if (navigator.share) {
                    await navigator.share(shareData)
                    showNotification('Bookmark shared successfully!')
                  } else {
                    await navigator.clipboard.writeText(`${bookmark.title}\n${bookmark.description}\n${bookmark.url}`)
                    showNotification('Bookmark details copied to clipboard!')
                  }
                                 } catch (error) {
                   console.error('Error sharing:', error)
                   if (error instanceof Error && error.name === 'InvalidStateError') {
                     showNotification('Please wait for the previous share to complete')
                   } else {
                     showNotification('Failed to share bookmark')
                   }
                 } finally {
                  // Reset sharing state after a delay to prevent rapid clicking
                  setTimeout(() => {
                    setIsSharing(prev => ({ ...prev, [bookmark.id]: false }))
                  }, 1000)
                }
              }}
              disabled={isSharing[bookmark.id]}
            >
              <Share2 className={`h-4 w-4 ${isSharing[bookmark.id] ? 'text-gray-300' : 'text-gray-400 hover:text-green-500'}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isSharing[bookmark.id] ? 'Sharing...' : 'Share bookmark'}</p>
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
      className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer bg-white border border-gray-300 hover:border-blue-600 backdrop-blur-sm relative overflow-hidden"
      onClick={(e) => {
        // Don't open modal if we're currently editing this bookmark
        if (editingField && selectedBookmark?.id === bookmark.id) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        handleBookmarkClick(bookmark)
      }}
    >
      {/* Background Website Logo with 5% opacity */}
      {(() => {
        const domain = extractDomain(bookmark.url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        return (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: `url(${faviconUrl})`,
              opacity: 0.10
            }}
          />
        );
      })()}
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative z-20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-300/50 group-hover:ring-gray-400 transition-all duration-300 shadow-sm">
              {bookmark.favicon}
            </div>
            <div className="flex-1 min-w-0">
              {editingField === 'title' && selectedBookmark?.id === bookmark.id ? (
                <div 
                  className="flex items-center space-x-2"
                  onClick={(e) => {
                    // Completely stop any event propagation when editing
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onMouseDown={(e) => {
                    // Also prevent mouse events from propagating
                    e.stopPropagation()
                  }}
                >
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => {
                      // Stop propagation on input click
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      // Stop propagation on input mouse down
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
            <img 
              src={userDefaultLogo || bookmark.circularImage || "/placeholder.svg"} 
              alt={`${bookmark.title} image`}
              className="w-24 h-24 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-2 ring-gray-200/50 group-hover:ring-blue-300/60 transition-all duration-300 shadow-md group-hover:shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-transparent to-black/5 group-hover:to-blue-500/10 transition-all duration-300"></div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{bookmark.description}</p>

        <div className="flex items-center justify-between mb-4">
          <Badge className={`text-xs border shadow-sm ${getPriorityColor(bookmark.priority)}`}>
            {bookmark.priority}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200/50 hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300">
            {bookmark.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100/80 mb-6 relative">
          <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1.5">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">{bookmark.visits} VISITS</span>
          </div>
          {/* Usage Percentage Hexagon - Moved here to be even with visits */}
          <div className="flex items-center justify-center">
            <svg width="70" height="62" viewBox="0 0 70 62" className="drop-shadow-sm">
              <path
                d="M35 4 L55 15 L55 40 L35 51 L15 40 L15 15 Z"
                fill="white"
                stroke={getPercentageColor(getUsagePercentage(bookmark.visits))}
                strokeWidth="2"
              />
              <text
                x="35"
                y="30"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getPercentageColor(getUsagePercentage(bookmark.visits))}
                fontSize="16"
                fontWeight="bold"
              >
                {getUsagePercentage(bookmark.visits)}%
              </text>
            </svg>
          </div>
        </div>

        {/* Project Information Section - Moved to bottom and separated */}
        <div className="border-t border-gray-200/60 pt-3 mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{bookmark.project?.name || "PROJECT"}</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">{bookmark.project?.status || "Active"}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${bookmark.project?.progress || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-semibold text-green-600">{bookmark.project?.progress || 0}%</span>
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
        // Don't open modal if we're currently editing this bookmark
        if (editingField && selectedBookmark?.id === bookmark.id) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        handleBookmarkClick(bookmark)
      }}
    >
      {/* Square Box Design matching folder cards - SAME SIZE */}
      <div className="aspect-square w-full bg-white border border-black relative overflow-hidden rounded-lg">
        {/* Background Website Logo with 5% opacity */}
        {(() => {
          const domain = extractDomain(bookmark.url);
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
          return (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${faviconUrl})`,
                opacity: 0.10
              }}
            />
          );
        })()}
        <div className="p-2 h-full flex flex-col justify-between relative z-10">
          {/* Top section with favicon and title */}
          <div>
            <div className="mb-1">
              <div className="w-12 h-12">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white font-bold text-sm ring-1 ring-gray-300/50 group-hover:ring-gray-400 transition-all duration-300 shadow-sm m-1">
                  {bookmark.favicon}
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
                {bookmark.visits}
              </p>
              <span className="text-sm text-gray-500 font-medium uppercase">Visits</span>
            </div>
            <img 
              src={userDefaultLogo || bookmark.circularImage || "/placeholder.svg"} 
              alt={`${bookmark.title} image`}
              className="w-16 h-16 object-cover rounded-full border border-gray-300"
            />
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
              stroke={getPercentageColor(getUsagePercentage(bookmark.visits))}
              strokeWidth="3"
            />
            <text
              x="35"
              y="26"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={getPercentageColor(getUsagePercentage(bookmark.visits))}
              fontSize="16"
              fontWeight="bold"
            >
              {getUsagePercentage(bookmark.visits)}%
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
      className="group hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-400 cursor-pointer bg-white border border-black hover:border-blue-600 backdrop-blur-sm relative overflow-hidden rounded-lg"
      onClick={(e) => {
        // Don't open modal if we're currently editing this bookmark
        if (editingField && selectedBookmark?.id === bookmark.id) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        handleBookmarkClick(bookmark)
      }}
    >
      {/* Background Website Logo with 5% opacity */}
      {(() => {
        const domain = extractDomain(bookmark.url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        return (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${faviconUrl})`,
              opacity: 0.10
            }}
          />
        );
      })()}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-transparent to-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      
      <CardContent className="p-6 relative z-10">
        {/* Top Section: Title and Category */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-300/50 group-hover:ring-gray-400 transition-all duration-300 shadow-sm">
                {bookmark.favicon}
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
            <img 
              src={userDefaultLogo || bookmark.circularImage || "/placeholder.svg"} 
              alt={`${bookmark.title} image`}
              className="w-16 h-16 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-2 ring-gray-200/50 group-hover:ring-blue-300/60 transition-all duration-300 shadow-md"
            />
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
              <span className="text-sm text-gray-600 font-medium uppercase">{bookmark.visits} VISITS</span>
            </div>
          </div>
          
          {/* Bottom Right: Usage Hexagon */}
          <div className="flex items-center space-x-4">
            <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
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
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer relative border border-gray-300 hover:border-blue-600" onClick={() => handleBookmarkClick(bookmark)}>
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
          <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
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
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer relative border border-gray-300 hover:border-blue-600" onClick={() => handleBookmarkClick(bookmark)}>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-blue-600 font-bold text-lg">{bookmark.favicon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm font-audiowide uppercase">{truncateTitle(bookmark.title, 15)}</h3>
                <p className="text-xs text-gray-500 truncate">{bookmark.category}</p>
              </div>
            </div>
            
            {/* Action Icons */}
            <BookmarkActionIcons bookmark={bookmark} />
            
            {/* Usage Percentage Hexagon */}
            <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
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
                  onCreateFolder={() => setIsAddFolderModalOpen(true)}
                  onAddBookmark={() => setIsAddBookmarkModalOpen(true)}
                  onOpenDetail={handleBookmarkClick}
                  isActive={true}
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
                <SortableContext items={mockFolders.map(f => f.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 density-gap">
                    {mockFolders.map((folder) => {
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
                            showNotification(`Opened folder: ${folder.name}`);
                          }}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </ClientOnlyDndProvider>
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
                  setIsAddExistingBookmarksModalOpen(true);
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
              open={isAddExistingBookmarksModalOpen}
              onOpenChange={setIsAddExistingBookmarksModalOpen}
              folder={selectedGoalFolder}
              onSubmit={handleGoalSubmit}
            />
          </div>
        )
      case 'kanban2':
        // Create mock folders for kanban demo
        const kanbanFolders: Folder[] = [
          {
            id: '1',
            name: 'Development',
            description: 'All development related bookmarks and resources',
            color: '#3b82f6'
          },
          {
            id: '2', 
            name: 'Design',
            description: 'Design tools, inspiration, and creative resources',
            color: '#ef4444'
          },
          {
            id: '3',
            name: 'Productivity',
            description: 'Tools and apps to boost productivity',
            color: '#10b981'
          }
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kanban 2.0</h2>
              <p className="text-gray-600">Advanced drag-and-drop kanban board for bookmark organization</p>
            </div>
            
            <KanbanView
              bookmarks={filteredBookmarks as any}
              onBookmarkClick={(bookmark) => {
                setSelectedBookmark(bookmark as any);
                setIsModalOpen(true);
              }}
              onFavorite={(bookmark) => {
                const updatedBookmark = { ...bookmark };
                setBookmarks(prev => prev.map(b => b.id === (bookmark as any).id ? updatedBookmark as any : b));
                showNotification('Bookmark updated successfully!');
              }}
              loading={false}
              selectedCategory={undefined}
              selectedFolder={undefined}
              onCategoryChange={undefined}
            />
          </div>
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

  // Health check loading state for individual bookmarks
  const [healthCheckLoading, setHealthCheckLoading] = useState<{ [key: number]: boolean }>({});

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BOOKMARKHUB</h1>
              <p className="text-gray-600 mt-1">Your Digital Workspace</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookmarks..."
                  className="pl-10 w-64 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 border-gray-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
              <SyncButton />
              <Button 
                onClick={() => setIsAddBookmarkModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                ADD BOOKMARK
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 density-gap mb-8">
            {/* Learning Card - Spans 2 columns - Exact copy from screenshot */}
            <Card className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-white via-blue-50/10 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
              <CardContent className="density-p relative">
                {/* Decorative elements scattered around */}
                <div className="absolute top-4 left-8">
                  <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
                </div>
                <div className="absolute top-12 left-1/3">
                  <div className="w-2 h-2 bg-blue-600 rotate-45"></div>
                </div>
                <div className="absolute top-6 right-16">
                  <div className="w-2 h-2 bg-orange-500 rotate-45"></div>
                </div>
                <div className="absolute top-20 right-8">
                  <div className="w-2 h-2 bg-teal-500 rotate-45"></div>
                </div>
                <div className="absolute top-32 right-1/4">
                  <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
                </div>
                <div className="absolute bottom-20 left-12">
                  <div className="w-2 h-2 bg-teal-400 rotate-45"></div>
                </div>
                <div className="absolute bottom-12 left-1/3">
                  <div className="w-2 h-2 bg-blue-400 rotate-45"></div>
                </div>
                <div className="absolute bottom-8 right-12">
                  <div className="w-2 h-2 bg-red-500 rotate-45"></div>
                </div>
                <div className="absolute bottom-16 right-1/3">
                  <div className="w-2 h-2 bg-orange-400 rotate-45"></div>
                </div>
                <div className="absolute top-1/2 left-4">
                  <div className="w-2 h-2 bg-teal-500 rotate-45"></div>
                </div>
                <div className="absolute top-3/4 right-4">
                  <div className="w-2 h-2 bg-blue-600 rotate-45"></div>
                </div>

              </CardContent>
            </Card>

            {/* Bookmark Overview Card - Exact copy from screenshot */}
            <Card className="density-p bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
              <CardContent className="p-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">BOOKMARK OVERVIEW</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Here Are Some Year-Long Metrics You Could Surface In Your BookmarkHub Dashboard
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Saved Bookmarks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-gray-900">{totalBookmarks}</span>
                        <span className="text-sm text-gray-500">bookmarks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                        <div className="bg-black h-3 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">SAVED BOOKMARKS</span>
                    </div>

                    {/* Favorite Bookmarks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-gray-900">{favorites}</span>
                        <span className="text-sm text-gray-500">bookmarks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                        <div className="bg-gray-500 h-3 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">FAVORITE BOOKMARKS</span>
                    </div>

                    {/* Clicks/Opens */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-gray-900">{totalVisits}</span>
                        <span className="text-sm text-gray-500">clicks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                        <div className="bg-black h-3 rounded-full" style={{width: '75%'}}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">CLICKS/OPENS</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Efficiency Card with Bigger Donut Chart */}
            <Card className="density-p bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
              <CardContent className="p-0">
                <div className="space-y-6">
                  {/* Header with date range and dropdown */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">January - June 2026</span>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">April</span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900">PROJECT EFFICIENCY</h3>
                  
                  {/* Bigger Donut Chart */}
                  <div className="flex items-center justify-center pt-4">
                    <div className="relative w-64 h-64">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                        {/* Donut chart with multiple segments - bigger size */}
                        {/* Large dark gray segment (top-right) */}
                        <path
                          d="M 128 16 A 112 112 0 0 1 222.63 94 L 194.18 94 A 84 84 0 0 0 128 44 Z"
                          fill="#4b5563"
                        />
                        {/* Black segment (right) */}
                        <path
                          d="M 222.63 94 A 112 112 0 0 1 222.63 162 L 194.18 162 A 84 84 0 0 0 194.18 94 Z"
                          fill="#1f2937"
                        />
                        {/* Light gray segment (bottom-right) */}
                        <path
                          d="M 222.63 162 A 112 112 0 0 1 128 240 L 128 212 A 84 84 0 0 0 194.18 162 Z"
                          fill="#d1d5db"
                        />
                        {/* Medium gray segment (bottom-left) */}
                        <path
                          d="M 128 240 A 112 112 0 0 1 33.37 162 L 61.82 162 A 84 84 0 0 0 128 212 Z"
                          fill="#9ca3af"
                        />
                        {/* Dark segment (left) */}
                        <path
                          d="M 33.37 162 A 112 112 0 0 1 33.37 94 L 61.82 94 A 84 84 0 0 0 61.82 162 Z"
                          fill="#374151"
                        />
                        {/* Black segment (top-left) */}
                        <path
                          d="M 33.37 94 A 112 112 0 0 1 128 16 L 128 44 A 84 84 0 0 0 61.82 94 Z"
                          fill="#111827"
                        />
                        
                        {/* Small disconnected segment at bottom - bigger */}
                        <path
                          d="M 108 248 A 16 16 0 0 1 148 248 L 148 240 A 8 8 0 0 0 108 240 Z"
                          fill="#9ca3af"
                        />
                      </svg>
                      
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-gray-900">173</span>
                        <span className="text-base text-gray-600">Visitors</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Total Visitors Chart - Interactive with Proper Components */}
          <Card className="mb-8 bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">TOTAL VISITORS</CardTitle>
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
            <CardContent className="pb-4">
              <div className="h-[200px] w-full">
                <svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Area fill - Dynamic based on selected time period */}
                  <path
                    d={currentChartData.areaPath}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Main line - Dynamic based on selected time period */}
                  <path
                    d={currentChartData.path}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* X-axis labels INSIDE the chart area */}
                  <g className="text-xs" fill="hsl(var(--muted-foreground))">
                    {currentChartData.labels.map((label, index) => {
                      const x = 20 + (index * (760 / (currentChartData.labels.length - 1)))
                      return (
                        <text 
                          key={index} 
                          x={x} 
                          y="185" 
                          textAnchor="middle" 
                          fontSize="10"
                          fill="hsl(var(--muted-foreground))"
                        >
                          {label}
                        </text>
                      )
                    })}
                  </g>
                </svg>
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
      {renderBookmarks()}

      {/* Bookmark Detail Modal - Exact copy from reference website */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open)
        if (!open) {
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
                      disabled={selectedBookmark && isSharing[selectedBookmark.id]}
                    >
                      <Share2 className={`h-4 w-4 ${selectedBookmark && isSharing[selectedBookmark.id] ? 'text-gray-300' : ''}`} />
                      {selectedBookmark && isSharing[selectedBookmark.id] && <span className="ml-1 text-xs">Sharing...</span>}
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
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
                  <TabsTrigger value="notification">NOTIFICATION</TabsTrigger>
                  <TabsTrigger value="timer">TIMER</TabsTrigger>
                  <TabsTrigger value="media">MEDIA</TabsTrigger>
                  <TabsTrigger value="comment">COMMENT</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="relative">
                          <img
                            src={userDefaultLogo || selectedBookmark.circularImage || "/placeholder.svg"}
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
                              onClick={() => startEditing('description', selectedBookmark.description)}
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
                          <p className="text-muted-foreground">{selectedBookmark.description}</p>
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
                            {selectedBookmark.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag.toUpperCase()}
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
                        <p className="text-3xl font-bold text-gray-900">{selectedBookmark.visits}</p>
                        <p className="text-xs text-muted-foreground font-medium">TOTAL VISITS</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white via-green-50/20 to-white border border-gray-200/60 hover:border-green-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Clock className="h-7 w-7 mx-auto mb-3 text-green-600" />
                        <p className="text-3xl font-bold text-gray-900">{selectedBookmark.timeSpent}</p>
                        <p className="text-xs text-muted-foreground font-medium">TIME SPENT</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white via-purple-50/20 to-white border border-gray-200/60 hover:border-purple-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Activity className="h-7 w-7 mx-auto mb-3 text-purple-600" />
                        <p className="text-3xl font-bold text-gray-900">{selectedBookmark.weeklyVisits}</p>
                        <p className="text-xs text-muted-foreground font-medium">THIS WEEK</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 hover:border-gray-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Badge className={`${getSiteHealthColor(selectedBookmark.siteHealth)} border-transparent hover:bg-primary/80 shadow-sm`}>
                          {selectedBookmark.siteHealth}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">SITE HEALTH</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* View Full Analytics Button */}
                  <div className="flex justify-center mt-6">
                    <Button className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      VIEW FULL ANALYTICS
                    </Button>
                  </div>

                  {/* Related Bookmarks Section */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">RELATED BOOKMARKS</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-2 hover:bg-gray-50"
                        onClick={() => {
                          // Add functionality to add new related bookmark
                          showNotification('Add related bookmark functionality coming soon!')
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span>ADD RELATED</span>
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
                        <SortableContext items={filteredBookmarks.slice(0, 4).map(b => `related-${b.id}`)} strategy={rectSortingStrategy}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredBookmarks.slice(0, 4).map((bookmark) => (
                              <div key={`related-${bookmark.id}`} className="relative group">
                                {/* Drag Handle for Related Bookmarks */}
                                <div className="absolute top-2 left-2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105">
                                  <GripVertical className="h-4 w-4 text-gray-700" />
                                </div>
                                
                                <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-300 hover:border-blue-400 bg-gradient-to-br from-white via-gray-50/20 to-white backdrop-blur-sm shadow-sm hover:shadow-blue-500/10">
                                  <div className="flex items-start space-x-3">
                                    {/* Circular Image */}
                                    <div className="flex-shrink-0">
                                      <img
                                        src={userDefaultLogo || bookmark.circularImage || "/placeholder.svg"}
                                        alt={`${bookmark.title} image`}
                                        className="w-10 h-10 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-gray-200/50"
                                      />
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
                                          <span>{bookmark.visits}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        showNotification('Related bookmark removed!')
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </Card>
                              </div>
                            ))}
                          </div>
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
                          setIsAddBookmarkModalOpen(true);
                          setAddBookmarkTab('existing');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        BROWSE ALL BOOKMARKS TO ADD MORE
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notification" className="space-y-6">
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

                <TabsContent value="comment" className="space-y-6">
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">COMMENTS & NOTES</h3>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        ADD COMMENT
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            A
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">Andrew</span>
                              <span className="text-xs text-gray-500">2 hours ago</span>
                            </div>
                            <p className="text-sm text-gray-700">
                              This bookmark is really useful for my daily workflow. The interface is clean and easy to navigate.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            A
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">Andrew</span>
                              <span className="text-xs text-gray-500">1 day ago</span>
                            </div>
                            <p className="text-sm text-gray-700">
                              Added this to my favorites. Will definitely be using this frequently for my projects.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 border-t pt-4">
                      <Textarea 
                        placeholder="Add a comment or note..."
                        className="mb-3"
                      />
                      <div className="flex justify-end">
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          POST COMMENT
                        </Button>
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
      <Dialog open={isAddBookmarkModalOpen} onOpenChange={(open) => {
        setIsAddBookmarkModalOpen(open)
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
                  value={newBookmarkTitle}
                  onChange={(e) => setNewBookmarkTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">URL</label>
                <Input
                  placeholder="https://example.com"
                  value={newBookmarkUrl}
                  onChange={(e) => setNewBookmarkUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">DESCRIPTION</label>
                <Textarea
                  placeholder="Enter Description"
                  value={newBookmarkDescription}
                  onChange={(e) => setNewBookmarkDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">CATEGORY</label>
                <Select value={newBookmarkCategory} onValueChange={(value) => setNewBookmarkCategory(value)}>
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
                  value={newBookmarkTags}
                  onChange={(e) => setNewBookmarkTags(e.target.value)}
                />
              </div>
              
              {/* AI Analysis Toggle */}
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="enableAI"
                  checked={enableAIAnalysis}
                  onChange={(e) => setEnableAIAnalysis(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="enableAI" className="text-sm font-medium text-blue-800">
                  🤖 Enable AI Analysis (Auto-categorize, generate tags & description)
                </label>
              </div>
              
              {/* AI Analysis Loading */}
              {aiAnalysisLoading && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <span className="text-sm text-yellow-800">AI is analyzing the URL...</span>
                </div>
              )}
              
              {/* AI Analysis Results */}
              {aiAnalysisResult && (
                <div className="p-3 bg-green-50 rounded-lg space-y-2">
                  <div className="text-sm font-medium text-green-800">🎯 AI Analysis Results:</div>
                  <div className="text-xs space-y-1">
                    <div><strong>Category:</strong> {aiAnalysisResult.category}</div>
                    <div><strong>Tags:</strong> {aiAnalysisResult.tags?.join(', ')}</div>
                    <div><strong>Summary:</strong> {aiAnalysisResult.summary?.substring(0, 100)}...</div>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">PRIORITY</label>
                <Select value={newBookmarkPriority} onValueChange={(value) => setNewBookmarkPriority(value)}>
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
                          setNewBookmarkImage(event.target?.result as string);
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
                  {newBookmarkImage && (
                    <div className="flex items-center space-x-3">
                      <img
                        src={newBookmarkImage}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-green-600">✓ Image uploaded successfully</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewBookmarkImage('')}
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
                  value={newBookmarkNotes}
                  onChange={(e) => setNewBookmarkNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddBookmarkModalOpen(false)}>
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
                <label className="text-sm font-medium">SEARCH AVAILABLE BOOKMARKS</label>
                <Input
                  placeholder="Search by name, description, or category..."
                  value={existingBookmarksSearch}
                  onChange={(e) => setExistingBookmarksSearch(e.target.value)}
                />
              </div>
              
              {/* Available Bookmarks List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredAvailableBookmarks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {existingBookmarksSearch ? 'No bookmarks match your search' : 'All available bookmarks have been added'}
                  </div>
                ) : (
                  filteredAvailableBookmarks.map((bookmark) => (
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
                          {bookmark.logo ? (
                            <img
                              src={bookmark.logo}
                              alt={bookmark.title}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-medium text-blue-600 ${bookmark.logo ? 'hidden' : ''}`}>
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
                  <Button variant="outline" onClick={() => setIsAddBookmarkModalOpen(false)}>
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
      <Dialog open={isAddFolderModalOpen} onOpenChange={setIsAddFolderModalOpen}>
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
                setIsAddFolderModalOpen(false)
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
      <Dialog open={isDefaultLogoModalOpen} onOpenChange={setIsDefaultLogoModalOpen}>
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
                value={newDefaultLogoUrl}
                onChange={(e) => setNewDefaultLogoUrl(e.target.value)}
              />
            </div>
            
            {/* Preview */}
            {newDefaultLogoUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">PREVIEW</label>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-300/50 transition-all duration-300 shadow-sm overflow-hidden">
                    <img 
                      src={newDefaultLogoUrl} 
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
                        setIsDefaultLogoModalOpen(false)
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
              <Button variant="outline" onClick={() => setIsDefaultLogoModalOpen(false)}>
                CANCEL
              </Button>
              <Button onClick={handleSetDefaultLogo} disabled={!newDefaultLogoUrl}>
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