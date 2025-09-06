'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronDown, Folder as FolderIcon, Bookmark as BookmarkIcon, ArrowLeft, FolderOpen, Crown, Users, User, Settings, Search, SortAsc, SortDesc, Filter, ChevronLeft, ChevronRight, GripVertical, Edit3, X, Briefcase, Target, Star, Building, Lightbulb, Zap, Clock, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Input } from './input';
import { Badge } from './badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from './dropdown-menu';
import { FolderHierarchyManager, type FolderHierarchyAssignment as HierarchyAssignment } from '../hierarchy/Hierarchy';
import { EnhancedFolderHierarchyManager } from '../hierarchy/EnhancedHierarchy';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

// Simplified types for this component
interface SimpleFolder {
  id: string;
  name: string;
  created_at?: string;
}

interface SimpleBookmark {
  id: number;
  title: string;
  category?: string;
}

interface FolderOrgChartViewProps {
  folders: SimpleFolder[];
  bookmarks: SimpleBookmark[];
  userDefaultLogo?: string;
  onCreateFolder: () => void;
  onEditFolder: (folder: SimpleFolder) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddBookmarkToFolder: (folderId: string) => void;
  onDropBookmarkToFolder: (folderId: string, bookmark: SimpleBookmark) => void;
  onBookmarkUpdated: (bookmark: SimpleBookmark) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
  onOpenDetail: (bookmark: SimpleBookmark) => void;
  currentFolderId?: string | null;
  onFolderNavigate: (folderId: string | null) => void;
  selectedFolder?: SimpleFolder | null;
  onAddBookmark?: () => void;
  hierarchyAssignments?: FolderHierarchyAssignment[];
  onHierarchyAssignmentsChange?: (assignments: FolderHierarchyAssignment[]) => void;
}

interface HierarchySection {
  id: string;
  title: string;
  iconName: string;
  colorName: string;
  order: number;
}

// Use the type from the hierarchy component
type FolderHierarchyAssignment = HierarchyAssignment;

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export function FolderOrgChartView({
  folders,
  bookmarks,
  userDefaultLogo,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onAddBookmarkToFolder,
  onDropBookmarkToFolder,
  onBookmarkUpdated,
  onBookmarkDeleted,
  onOpenDetail,
  currentFolderId,
  onFolderNavigate,
  selectedFolder,
  onAddBookmark,
  hierarchyAssignments: propHierarchyAssignments,
  onHierarchyAssignmentsChange,
}: FolderOrgChartViewProps) {
  
  // Hierarchy management state
  const [internalHierarchyAssignments, setInternalHierarchyAssignments] = useState<FolderHierarchyAssignment[]>([]);
  const [isHierarchyManagerOpen, setIsHierarchyManagerOpen] = useState(false);
  
  // Hierarchy sections state
  const [managedHierarchySections, setManagedHierarchySections] = useState(null);
  const [isLoadingHierarchySections, setIsLoadingHierarchySections] = useState(true);

  // Load hierarchy sections from API
  useEffect(() => {
    const loadHierarchySections = async () => {
      try {
        setIsLoadingHierarchySections(true);
        const response = await fetch('/api/hierarchy-sections');
        if (response.ok) {
          const data = await response.json();
          if (data.hierarchySections && Array.isArray(data.hierarchySections)) {
            setManagedHierarchySections(data.hierarchySections);
          } else {
            console.warn('Invalid hierarchy sections data received, using defaults');
            setManagedHierarchySections([]);
          }
        } else {
          console.error('Failed to load hierarchy sections, using defaults');
          setManagedHierarchySections([]);
        }
      } catch (error) {
        console.error('Error loading hierarchy sections, using defaults:', error);
        setManagedHierarchySections([]);
      } finally {
        setIsLoadingHierarchySections(false);
      }
    };

    loadHierarchySections();
  }, []);

  const handleHierarchySectionsChange = async (sections: any[]) => {
    setManagedHierarchySections(sections);
    
    try {
      const response = await fetch('/api/hierarchy-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hierarchySections: sections }),
      });

      if (!response.ok) {
        console.error('Failed to save hierarchy sections');
        // Optionally show an error message to the user
      } else {
        console.log('Hierarchy sections saved successfully');
        // Force a re-render by updating the key or triggering state change
      }
    } catch (error) {
      console.error('Error saving hierarchy sections:', error);
    }
  };
  
  // Use prop assignments if provided, otherwise use internal state
  const hierarchyAssignments = propHierarchyAssignments || internalHierarchyAssignments;
  const setHierarchyAssignments = onHierarchyAssignmentsChange || setInternalHierarchyAssignments;
  const [bookmarkPages, setBookmarkPages] = useState<Record<string, number>>({});
  
  const BOOKMARKS_PER_PAGE = 5;
  
  // Available icons for hierarchy sections
  const availableIcons = [
    { name: 'Crown', icon: Crown },
    { name: 'Users', icon: Users },
    { name: 'User', icon: User },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Target', icon: Target },
    { name: 'Star', icon: Star },
    { name: 'Building', icon: Building },
    { name: 'Lightbulb', icon: Lightbulb },
    { name: 'Zap', icon: Zap },
  ];

  // Available colors for hierarchy sections (subtle colors)
  const availableColors = [
    { name: 'Purple-Blue', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    { name: 'Blue-Cyan', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    { name: 'Green-Emerald', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    { name: 'Orange-Amber', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    { name: 'Red-Rose', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    { name: 'Gray-Slate', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
  ];

  // Default hierarchy sections
  const defaultHierarchySections: HierarchySection[] = [
    { id: 'director', title: 'DIRECTOR', iconName: 'Crown', colorName: 'Purple-Blue', order: 1 },
    { id: 'teams', title: 'TEAMS', iconName: 'Users', colorName: 'Blue-Cyan', order: 2 },
    { id: 'collaborators', title: 'COLLABORATORS', iconName: 'User', colorName: 'Green-Emerald', order: 3 },
  ];

  // Convert API hierarchy sections format to local format
  const convertApiSectionsToLocal = (apiSections: any[]): HierarchySection[] => {
    if (!apiSections || apiSections.length === 0) return defaultHierarchySections;

    return apiSections.map((section, index) => ({
      id: section.id || section.section_id,
      title: section.title,
      iconName: section.icon, // API uses 'icon', local uses 'iconName'
      colorName: getColorNameFromApiColor(section.color), // Convert color format
      order: section.position !== undefined ? section.position : index
    }));
  };
  
  // Helper function to convert API color names to local color names
  const getColorNameFromApiColor = (apiColor: string): string => {
    const colorMap: Record<string, string> = {
      'purple': 'Purple-Blue',
      'emerald': 'Blue-Cyan', 
      'orange': 'Green-Emerald',
      'blue': 'Blue-Cyan',
      'green': 'Green-Emerald',
      'red': 'Red-Pink',
      'gray': 'Gray-Slate'
    };
    return colorMap[apiColor] || 'Gray-Slate';
  };

  // Use managedHierarchySections from API, fallback to default if not loaded
  const hierarchySections = convertApiSectionsToLocal(managedHierarchySections);

  // Debug logging
  console.log('🔍 FolderOrgChartView Debug:', {
    managedHierarchySections,
    hierarchySections,
    folders: folders.length,
    hierarchyAssignments: hierarchyAssignments.length,
    isLoadingHierarchySections
  });

  // Force render with default sections if empty
  if (hierarchySections.length === 0) {
    console.log('⚠️ hierarchySections is empty, using default sections');
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'bookmarks' | 'recent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [newLevel, setNewLevel] = useState({
    title: '',
    iconName: 'Users',
    colorName: 'blue'
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedFolderForColor, setSelectedFolderForColor] = useState<SimpleFolder | null>(null);

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
  );

  // Handle drag end for folder reordering and cross-level movement
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      // Find which folder is being dragged
      const activeFolder = folders.find(f => f.id === active.id);
      const overFolder = folders.find(f => f.id === over.id);
      
      if (activeFolder) {
        const activeAssignment = hierarchyAssignments.find(a => a.folderId === activeFolder.id);
        
        if (activeAssignment) {
          const newAssignments = [...hierarchyAssignments];
          
          if (overFolder) {
            // Dragging over another folder - move to the same level as the target folder
            const overAssignment = hierarchyAssignments.find(a => a.folderId === overFolder.id);
            
            if (overAssignment) {
              if (activeAssignment.level === overAssignment.level) {
                // Same level - reorder within level
                const levelFolders = getFoldersByLevel(activeAssignment.level);
                const oldIndex = levelFolders.findIndex(f => f.id === active.id);
                const newIndex = levelFolders.findIndex(f => f.id === over.id);
                
                if (oldIndex !== -1 && newIndex !== -1) {
                  const reorderedFolders = arrayMove(levelFolders, oldIndex, newIndex);
                  
                  // Update the order property for all folders in this level
                  reorderedFolders.forEach((folder, index) => {
                    const assignment = newAssignments.find(a => a.folderId === folder.id);
                    if (assignment) {
                      assignment.order = index;
                    }
                  });
                }
              } else {
                // Different level - move folder to target level
                const targetAssignment = newAssignments.find(a => a.folderId === activeFolder.id);
                if (targetAssignment) {
                  targetAssignment.level = overAssignment.level;
                  
                  // Set order to be after the target folder
                  const targetLevelFolders = getFoldersByLevel(overAssignment.level);
                  const targetIndex = targetLevelFolders.findIndex(f => f.id === over.id);
                  targetAssignment.order = targetIndex + 1;
                  
                  // Adjust orders for other folders in the target level
                  targetLevelFolders.forEach((folder, index) => {
                    if (folder.id !== activeFolder.id) {
                      const assignment = newAssignments.find(a => a.folderId === folder.id);
                      if (assignment && index >= targetIndex + 1) {
                        assignment.order = index + 1;
                      }
                    }
                  });
                }
              }
            }
          } else {
            // Dragging over a level section header - check if it's a droppable area
            const levelSectionId = over.id as string;
            if (['director', 'teams', 'collaborators'].includes(levelSectionId)) {
              // Move folder to this level
              const targetAssignment = newAssignments.find(a => a.folderId === activeFolder.id);
              if (targetAssignment && targetAssignment.level !== levelSectionId) {
                targetAssignment.level = levelSectionId as 'director' | 'teams' | 'collaborators';
                
                // Set order to be last in the target level
                const targetLevelFolders = getFoldersByLevel(levelSectionId);
                targetAssignment.order = targetLevelFolders.length;
              }
            }
          }
          
          setHierarchyAssignments(newAssignments);
        }
      }
    }
  };

  // Initialize hierarchy assignments from folders (only when folders change significantly)
  useEffect(() => {
    // Only update if we don't have assignments or folder count changed
    if (hierarchyAssignments.length !== folders.length) {
      const assignments: FolderHierarchyAssignment[] = folders.map(folder => ({
        folderId: folder.id,
        level: 'collaborators' as const,
        order: 0,
      }));
      setHierarchyAssignments(assignments);
    }
  }, [folders.length, hierarchyAssignments.length]); // Only depend on length, not full folders array

  // Filter and sort folders based on current criteria
  const filteredAndSortedFolders = useMemo(() => {
    let filtered = folders.filter(folder => 
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterLevel) {
      const levelAssignments = hierarchyAssignments.filter(a => a.level === filterLevel);
      filtered = filtered.filter(folder => 
        levelAssignments.some(a => a.folderId === folder.id)
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'bookmarks':
          const aBookmarks = bookmarks.filter(bookmark => bookmark.category === a.id).length;
          const bBookmarks = bookmarks.filter(bookmark => bookmark.category === b.id).length;
          comparison = aBookmarks - bBookmarks;
          break;
        case 'recent':
          const aDate = a.created_at ? new Date(a.created_at) : new Date(0);
          const bDate = b.created_at ? new Date(b.created_at) : new Date(0);
          comparison = (isNaN(aDate.getTime()) ? 0 : aDate.getTime()) - (isNaN(bDate.getTime()) ? 0 : bDate.getTime());
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [folders, searchTerm, filterLevel, hierarchyAssignments, sortBy, sortOrder, bookmarks]);

  // Get folders by hierarchy level
  const getFoldersByLevel = (level: string) => {
    const levelAssignments = hierarchyAssignments.filter(a => a.level === level);
    const assignedFolders = filteredAndSortedFolders.filter(folder =>
      levelAssignments.some(a => a.folderId === folder.id)
    );

    // If this is the first level (director) and there are unassigned folders, show them here
    if (level === 'director' || level === hierarchySections[0]?.id) {
      const assignedFolderIds = hierarchyAssignments.map(a => a.folderId);
      const unassignedFolders = filteredAndSortedFolders.filter(folder =>
        !assignedFolderIds.includes(folder.id)
      );
      const result = [...assignedFolders, ...unassignedFolders];

      console.log(`🔍 getFoldersByLevel(${level}):`, {
        levelAssignments: levelAssignments.length,
        assignedFolders: assignedFolders.length,
        unassignedFolders: unassignedFolders.length,
        totalResult: result.length,
        filteredAndSortedFolders: filteredAndSortedFolders.length,
        isFirstLevel: level === 'director' || level === hierarchySections[0]?.id,
        hierarchySections0Id: hierarchySections[0]?.id
      });

      return result;
    }

    console.log(`🔍 getFoldersByLevel(${level}):`, {
      levelAssignments: levelAssignments.length,
      assignedFolders: assignedFolders.length
    });

    return assignedFolders;
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      Crown, Users, User, Briefcase, Target, Star, Building, Lightbulb, Zap
    };
    return iconMap[iconName] || User;
  };

  // Get color classes by name
  const getColorClasses = (colorName: string) => {
    const color = availableColors.find(c => c.name === colorName);
    return color || availableColors[0];
  };

  // Handle bookmark pagination
  const getBookmarksForFolder = (folderId: string) => {
    const folderBookmarks = bookmarks.filter(b => b.category === folderId);
    const currentPage = bookmarkPages[folderId] || 0;
    const startIndex = currentPage * BOOKMARKS_PER_PAGE;
    return {
      bookmarks: folderBookmarks.slice(startIndex, startIndex + BOOKMARKS_PER_PAGE),
      totalPages: Math.ceil(folderBookmarks.length / BOOKMARKS_PER_PAGE),
      currentPage,
      totalBookmarks: folderBookmarks.length
    };
  };

  const handleBookmarkPageChange = (folderId: string, direction: 'next' | 'prev') => {
    const { totalPages, currentPage } = getBookmarksForFolder(folderId);
    let newPage = currentPage;
    
    if (direction === 'next' && currentPage < totalPages - 1) {
      newPage = currentPage + 1;
    } else if (direction === 'prev' && currentPage > 0) {
      newPage = currentPage - 1;
    }
    
    setBookmarkPages(prev => ({ ...prev, [folderId]: newPage }));
  };

  // Droppable section header component
  const DroppableSectionHeader = ({ section }: { section: HierarchySection }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: section.id,
    });

    const IconComponent = getIconComponent(section.iconName);
    const colorClasses = getColorClasses(section.colorName);
    const levelFolders = getFoldersByLevel(section.id);

    return (
      <div 
        ref={setNodeRef}
        className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 ${
          isOver 
            ? 'bg-blue-50 border-2 border-blue-300 border-dashed' 
            : 'bg-transparent'
        }`}
      >
        <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.border} border`}>
          <IconComponent className={`h-6 w-6 ${colorClasses.text}`} />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <p className="text-sm text-gray-600">
            {levelFolders.length} folders
            {isOver && (
              <span className="ml-2 text-blue-600 font-medium">
                • Drop here to move folder
              </span>
            )}
          </p>
        </div>
      </div>
    );
  };

  // Sortable folder card component
  const SortableFolderCard = ({ folder }: { folder: SimpleFolder }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: folder.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Top Right Corner */}
        <div 
          {...listeners} 
          className="absolute top-2 right-2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        {renderFolderCard(folder)}
      </div>
    );
  };

  // Enhanced folder card with modern design
  const renderFolderCard = (folder: SimpleFolder) => {
    const assignment = hierarchyAssignments.find(a => a.folderId === folder.id);
    const level = assignment?.level || 'collaborators';
    const section = hierarchySections.find(s => s.id === level);
    const IconComponent = getIconComponent(section?.iconName || 'User');
    const colorClasses = getColorClasses(section?.colorName || 'Gray-Slate');
    const { bookmarks: folderBookmarks, totalPages, currentPage, totalBookmarks } = getBookmarksForFolder(folder.id);

    return (
      <Card 
        key={folder.id}
        className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 bg-gradient-to-r from-white to-gray-50/50 hover:scale-[1.02]"
        style={{ borderLeftColor: folder.color || '#6b7280' }}
        onClick={() => onFolderNavigate(folder.id)}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Folder Avatar */}
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: folder.color || '#6b7280' }}
                >
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                {level && (
                  <div className="absolute -top-1 -right-1">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-white border shadow-sm">
                      {level.charAt(0).toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Folder Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate mb-1">{folder.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {level.toUpperCase()}
                  </Badge>
                  {folder.created_at && (
                    <span className="text-xs text-gray-500">
                      {new Date(folder.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (onAddBookmark) {
                        onAddBookmark();
                      } else {
                        onAddBookmarkToFolder(folder.id);
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bookmark
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditFolder(folder);
                    }}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange(folder);
                    }}
                  >
                    <div className="h-4 w-4 mr-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    Change Color
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.id);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">{totalBookmarks} bookmarks</span>
              <span className="text-gray-500">Progress</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (totalBookmarks / 10) * 100)}%`,
                  backgroundColor: folder.color || '#6b7280'
                }}
              ></div>
            </div>
          </div>
          
          {/* Bookmarks Preview */}
          <div className="space-y-2">
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Page {currentPage + 1} of {totalPages}</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkPageChange(folder.id, 'prev');
                    }}
                    disabled={currentPage === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkPageChange(folder.id, 'next');
                    }}
                    disabled={currentPage >= totalPages - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            {folderBookmarks.length > 0 ? (
              <div className="space-y-2">
                {folderBookmarks.map(bookmark => {
                  // Theme color for hover effects
                  const themeColor = '#3b82f6'; // blue-500

                  return (
                    <div
                      key={bookmark.id}
                      className="group/bookmark hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white border border-gray-300 backdrop-blur-sm relative overflow-hidden rounded-lg"
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
                        e.stopPropagation();
                        onOpenDetail(bookmark);
                      }}
                    >
                      {/* Background Website Logo with 10% opacity - Custom background takes priority */}
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
                          const domain = extractDomain(bookmark.url || '');
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
                      
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 opacity-0 group-hover/bookmark:opacity-100 transition-opacity duration-500" />
                      
                      <div className="flex items-center space-x-3 p-2 relative z-20">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <BookmarkIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover/bookmark:text-blue-600">
                            {bookmark.title}
                          </p>
                          {bookmark.category && (
                            <p className="text-xs text-gray-500 truncate">
                              {bookmark.category}
                            </p>
                          )}
                        </div>
                        <div className="opacity-0 group-hover/bookmark:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <BookmarkIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No bookmarks yet</p>
                <p className="text-xs text-gray-400 mt-1">Add bookmarks to get started</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddBookmark) {
                      onAddBookmark();
                    } else {
                      onAddBookmarkToFolder(folder.id);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Bookmark
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Handle adding a new hierarchy level
  const handleAddLevel = async () => {
    if (newLevel.title.trim()) {
      console.log('🔧 Adding new hierarchy level:', newLevel);

      try {
        const newSection = {
          id: newLevel.title.toLowerCase().replace(/\s+/g, '-'),
          title: newLevel.title,
          iconName: newLevel.iconName,
          colorName: newLevel.colorName,
          order: (managedHierarchySections?.length || 0) + 1
        };

        console.log('🔧 New section created:', newSection);

        // Add to managed sections through the API handler
        const updatedSections = [...(managedHierarchySections || []), newSection];
        console.log('🔧 Updated sections:', updatedSections);

        await handleHierarchySectionsChange(updatedSections);
        console.log('✅ Hierarchy sections updated successfully');

        setShowAddLevel(false);
        setNewLevel({
          title: '',
          iconName: 'Users',
          colorName: 'blue'
        });
      } catch (error) {
        console.error('❌ Error adding hierarchy level:', error);
        // Don't close the modal on error so user can retry
      }
    } else {
      console.warn('⚠️ Cannot add level: title is empty');
    }
  };

  // Reset add level form
  const resetAddLevelForm = () => {
    setNewLevel({
      title: '',
      iconName: 'Users',
      colorName: 'blue'
    });
    setShowAddLevel(false);
  };

  // Handle folder color change
  const handleColorChange = (folder: SimpleFolder) => {
    setSelectedFolderForColor(folder);
    setShowColorPicker(true);
  };

  // Apply color change to folder
  const applyColorChange = (colorName: string) => {
    if (selectedFolderForColor) {
      console.log(`Changing color of folder ${selectedFolderForColor.name} to ${colorName}`);
      // TODO: Implement actual color change logic
      alert(`Color changed to ${colorName} for folder: ${selectedFolderForColor.name}`);
      setShowColorPicker(false);
      setSelectedFolderForColor(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">FOLDER ORGANIZATION CHART</h1>
          <Badge variant="secondary">{folders.length} folders</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAddLevel(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Level</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsHierarchyManagerOpen(true)}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Manage Hierarchy</span>
          </Button>
          <Button onClick={onCreateFolder} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Folder</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              {sortBy === 'name' && <SortAsc className="h-4 w-4" />}
              {sortBy === 'bookmarks' && <Target className="h-4 w-4" />}
              {sortBy === 'recent' && <Clock className="h-4 w-4" />}
              <span>Sort</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('name')}>
              <SortAsc className="h-4 w-4 mr-2" />
              Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('bookmarks')}>
              <Target className="h-4 w-4 mr-2" />
              Bookmark Count
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('recent')}>
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
              {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={filterLevel === null}
              onCheckedChange={() => setFilterLevel(null)}
            >
              All Levels
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {hierarchySections.map(section => {
              const IconComponent = getIconComponent(section.iconName);
              return (
                <DropdownMenuCheckboxItem
                  key={section.id}
                  checked={filterLevel === section.id}
                  onCheckedChange={() => setFilterLevel(filterLevel === section.id ? null : section.id)}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {section.title}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hierarchy Sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          {hierarchySections.length > 0 ? (
            hierarchySections
              .sort((a, b) => a.order - b.order)
              .map(section => {
                const levelFolders = getFoldersByLevel(section.id);

                return (
                  <div key={section.id} className="space-y-4">
                    <DroppableSectionHeader section={section} />

                    {levelFolders.length > 0 ? (
                      <SortableContext items={levelFolders.map(f => f.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {levelFolders.map(folder => (
                            <SortableFolderCard key={folder.id} folder={folder} />
                          ))}
                        </div>
                      </SortableContext>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FolderIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No folders in this level yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onCreateFolder}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Folder
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FolderIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Hierarchy Sections</h3>
              <p className="mb-4">No hierarchy sections are configured. The folder hierarchy view requires hierarchy sections to organize folders.</p>
              <Button
                variant="outline"
                onClick={onCreateFolder}
                className="mr-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Folder
              </Button>
            </div>
          )}
        </div>
      </DndContext>

      {/* Enhanced Hierarchy Manager */}
      {isHierarchyManagerOpen && !isLoadingHierarchySections && (
        <EnhancedFolderHierarchyManager
          folders={folders}
          assignments={hierarchyAssignments}
          onAssignmentsChange={setHierarchyAssignments}
          hierarchySections={managedHierarchySections}
          onHierarchySectionsChange={handleHierarchySectionsChange}
          isOpen={isHierarchyManagerOpen}
          onToggle={() => setIsHierarchyManagerOpen(false)}
        />
      )}

      {/* Add Level Modal */}
      {showAddLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add New Hierarchy Level</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAddLevelForm}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Level Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Level Name</label>
                <Input
                  placeholder="e.g., Managers, Interns, Contractors"
                  value={newLevel.title}
                  onChange={(e) => setNewLevel(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full"
                  autoFocus
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableIcons.map(({ name, icon: IconComponent }) => (
                    <Button
                      key={name}
                      variant={newLevel.iconName === name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewLevel(prev => ({ ...prev, iconName: name }))}
                      className="flex items-center space-x-1 h-10"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-xs">{name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Color Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableColors.map((color) => (
                    <Button
                      key={color.name}
                      variant={newLevel.colorName === color.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewLevel(prev => ({ ...prev, colorName: color.name }))}
                      className={`flex items-center space-x-2 h-10 ${color.bg} ${color.border} border`}
                    >
                      <div className={`w-3 h-3 rounded-full ${color.bg.replace('bg-', 'bg-').replace('-50', '-400')}`}></div>
                      <span className={`text-xs ${color.text}`}>{color.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium mb-2">Preview</label>
                <div className={`p-3 rounded-lg border-2 ${getColorClasses(newLevel.colorName).bg} ${getColorClasses(newLevel.colorName).border}`}>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const IconComponent = getIconComponent(newLevel.iconName);
                      const colorClasses = getColorClasses(newLevel.colorName);
                      return (
                        <>
                          <div className={`p-1.5 rounded-md ${colorClasses.bg} ${colorClasses.border} border`}>
                            <IconComponent className={`h-4 w-4 ${colorClasses.text}`} />
                          </div>
                          <span className={`font-medium ${colorClasses.text}`}>
                            {newLevel.title || 'New Level'}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={resetAddLevelForm}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddLevel}
                disabled={!newLevel.title.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Level
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {showColorPicker && selectedFolderForColor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Change Folder Color</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowColorPicker(false);
                  setSelectedFolderForColor(null);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Choose a new color for "{selectedFolderForColor.name}"
            </p>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {availableColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => applyColorChange(color.name)}
                  className={`w-12 h-12 rounded-lg ${color.gradient} hover:scale-110 transition-transform shadow-md hover:shadow-lg`}
                  title={color.name}
                />
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowColorPicker(false);
                  setSelectedFolderForColor(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}