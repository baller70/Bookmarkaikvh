'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronRight, 
  ChevronDown, 
  GripVertical, 
  Folder, 
  FolderOpen,
  Hash,
  Brain,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  parent_id?: string;
  order: number;
  bookmark_count: number;
  is_ai_suggested?: boolean;
  ai_confidence?: number;
  children?: Category[];
}

interface CategoryTreeViewProps {
  categories: Category[];
  expandedCategories: Set<string>;
  onToggleExpanded: (categoryId: string) => void;
  onDragEnd: (result: DropResult) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  onAddChild?: (parentId: string) => void;
  selectedCategoryId?: string;
  onSelect?: (categoryId: string) => void;
  showActions?: boolean;
  showBookmarkCounts?: boolean;
  showAIBadges?: boolean;
  maxDepth?: number;
  className?: string;
}

interface CategoryNodeProps {
  category: Category;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpanded: (categoryId: string) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  onAddChild?: (parentId: string) => void;
  onSelect?: (categoryId: string) => void;
  showActions: boolean;
  showBookmarkCounts: boolean;
  showAIBadges: boolean;
  maxDepth: number;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  level,
  isExpanded,
  isSelected,
  onToggleExpanded,
  onEdit,
  onDelete,
  onAddChild,
  onSelect,
  showActions,
  showBookmarkCounts,
  showAIBadges,
  maxDepth
}) => {
  const hasChildren = category.children && category.children.length > 0;
  const canExpand = hasChildren && level < maxDepth;
  const indentWidth = level * 24; // 24px per level

  return (
    <Draggable draggableId={category.id} index={category.order}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-1 ${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <Card 
            className={`
              transition-all duration-200 hover:shadow-md cursor-pointer
              ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
            `}
            onClick={() => onSelect?.(category.id)}
          >
            <CardContent className="p-3">
              <div 
                className="flex items-center space-x-2"
                style={{ paddingLeft: `${indentWidth}px` }}
              >
                {/* Drag Handle */}
                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </div>

                {/* Expand/Collapse Button */}
                {canExpand ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpanded(category.id);
                    }}
                    className="p-1 h-6 w-6"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                ) : (
                  <div className="w-6" /> // Spacer for alignment
                )}

                {/* Folder Icon */}
                <div className="flex items-center">
                  {hasChildren ? (
                    isExpanded ? (
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Folder className="h-4 w-4 text-blue-600" />
                    )
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-sm truncate">{category.name}</h3>
                    
                    {/* AI Badge */}
                    {showAIBadges && category.is_ai_suggested && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        <Brain className="h-2 w-2 mr-1" />
                        {Math.round((category.ai_confidence || 0) * 100)}%
                      </Badge>
                    )}
                    
                    {/* Bookmark Count */}
                    {showBookmarkCounts && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        <Hash className="h-2 w-2 mr-1" />
                        {category.bookmark_count}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Description */}
                  {category.description && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onAddChild && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddChild(category.id);
                        }}
                        className="p-1 h-6 w-6 text-green-600 hover:text-green-700"
                        title="Add subcategory"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(category);
                        }}
                        className="p-1 h-6 w-6 text-blue-600 hover:text-blue-700"
                        title="Edit category"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(category.id);
                        }}
                        className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
                        title="Delete category"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Render Children */}
          {isExpanded && hasChildren && level < maxDepth && (
            <div className="mt-1">
              <Droppable droppableId={category.id} type="CATEGORY">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-1"
                  >
                    {category.children!.map(child => (
                      <CategoryNode
                        key={child.id}
                        category={child}
                        level={level + 1}
                        isExpanded={isExpanded}
                        isSelected={child.id === category.id}
                        onToggleExpanded={onToggleExpanded}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddChild={onAddChild}
                        onSelect={onSelect}
                        showActions={showActions}
                        showBookmarkCounts={showBookmarkCounts}
                        showAIBadges={showAIBadges}
                        maxDepth={maxDepth}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({
  categories,
  expandedCategories,
  onToggleExpanded,
  onDragEnd,
  onEdit,
  onDelete,
  onAddChild,
  selectedCategoryId,
  onSelect,
  showActions = true,
  showBookmarkCounts = true,
  showAIBadges = true,
  maxDepth = 5,
  className = ''
}) => {
  return (
    <div className={`category-tree-view ${className}`}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="root" type="CATEGORY">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-1"
            >
              {categories.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No categories found
                    </h3>
                    <p className="text-gray-600">
                      Create your first category to get started organizing your bookmarks.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                categories.map(category => (
                  <CategoryNode
                    key={category.id}
                    category={category}
                    level={0}
                    isExpanded={expandedCategories.has(category.id)}
                    isSelected={selectedCategoryId === category.id}
                    onToggleExpanded={onToggleExpanded}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                    onSelect={onSelect}
                    showActions={showActions}
                    showBookmarkCounts={showBookmarkCounts}
                    showAIBadges={showAIBadges}
                    maxDepth={maxDepth}
                  />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CategoryTreeView; 