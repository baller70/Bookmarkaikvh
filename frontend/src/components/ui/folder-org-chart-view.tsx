'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronDown, Folder as FolderIcon, Bookmark as BookmarkIcon, ArrowLeft, FolderOpen, Crown, Users, User, Settings, Search, SortAsc, SortDesc, Filter, ChevronLeft, ChevronRight, GripVertical, Edit3, X, Briefcase, Target, Star, Building, Lightbulb, Zap, Clock } from 'lucide-react';
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

export function FolderOrgChartView({
  folders,
  bookmarks,
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
}: FolderOrgChartViewProps) {
  
  // Hierarchy management state
  const [hierarchyAssignments, setHierarchyAssignments] = useState<FolderHierarchyAssignment[]>([]);
  const [isHierarchyManagerOpen, setIsHierarchyManagerOpen] = useState(false);
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

  const [hierarchySections, setHierarchySections] = useState<HierarchySection[]>(defaultHierarchySections);
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

  // Initialize hierarchy assignments from folders
  useEffect(() => {
    const assignments: FolderHierarchyAssignment[] = folders.map(folder => ({
      folderId: folder.id,
      level: 'collaborators' as const,
      order: 0,
    }));
    setHierarchyAssignments(assignments);
  }, [folders]);

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
          comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [folders, searchTerm, filterLevel, hierarchyAssignments, sortBy, sortOrder, bookmarks]);

  // Get folders by hierarchy level
  const getFoldersByLevel = (level: string) => {
    const levelAssignments = hierarchyAssignments.filter(a => a.level === level);
    return filteredAndSortedFolders.filter(folder =>
      levelAssignments.some(a => a.folderId === folder.id)
    );
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

  // Render folder card
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
        className={`${colorClasses.bg} ${colorClasses.border} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer`}
        onClick={() => onFolderNavigate(folder.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <IconComponent className={`h-5 w-5 ${colorClasses.text}`} />
              <span className={`font-semibold ${colorClasses.text}`}>{folder.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddBookmark) {
                        onAddBookmark();
                      } else {
                        onAddBookmarkToFolder(folder.id);
                      }
                    }}
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
                    Rename Card
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement color change functionality
                      console.log('Change color for folder:', folder.id);
                    }}
                  >
                    <div className="h-4 w-4 mr-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    Change Color
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                }}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{totalBookmarks} bookmarks</span>
              {totalPages > 1 && (
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
                  <span className="text-xs">{currentPage + 1}/{totalPages}</span>
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
              )}
            </div>
            
            {folderBookmarks.length > 0 && (
              <div className="space-y-1">
                {folderBookmarks.map(bookmark => (
                  <div
                    key={bookmark.id}
                    className="flex items-center space-x-2 p-1 rounded text-xs hover:bg-white/50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(bookmark);
                    }}
                  >
                    <BookmarkIcon className="h-3 w-3 text-gray-500" />
                    <span className="truncate flex-1">{bookmark.title}</span>
                  </div>
                ))}
              </div>
            )}
            
            {totalBookmarks === 0 && (
              <div className="text-xs text-gray-500 italic text-center py-2">
                No bookmarks yet
              </div>
            )}
          </div>
          

        </CardContent>
      </Card>
    );
  };

  // Handle adding a new hierarchy level
  const handleAddLevel = () => {
    if (newLevel.title.trim()) {
      const newSection: HierarchySection = {
        id: newLevel.title.toLowerCase().replace(/\s+/g, '-'),
        title: newLevel.title,
        iconName: newLevel.iconName,
        colorName: newLevel.colorName,
        order: hierarchySections.length + 1
      };
      
      setHierarchySections([...hierarchySections, newSection]);
      setShowAddLevel(false);
      setNewLevel({
        title: '',
        iconName: 'Users',
        colorName: 'blue'
      });
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
          {hierarchySections
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
            })}
        </div>
      </DndContext>

      {/* Hierarchy Manager */}
      {isHierarchyManagerOpen && (
        <FolderHierarchyManager
          folders={folders}
          assignments={hierarchyAssignments}
          onAssignmentsChange={setHierarchyAssignments}
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
    </div>
  );
} 