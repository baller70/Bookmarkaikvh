'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bookmark, 
  Eye, 
  Heart, 
  Share2, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Copy,
  Users,
  Globe,
  Lock,
  Star,
  Play,
  Calendar
} from 'lucide-react';
import { Collection } from '@/hooks/use-collections';
import { formatDistanceToNow } from 'date-fns';

interface CollectionCardProps {
  collection: Collection;
  viewMode: 'grid' | 'list';
  onSelect: (collection: Collection) => void;
  onShare: (collectionId: string, permissions: any) => void;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collectionId: string) => void;
  onLike?: (collectionId: string) => void;
  onDuplicate?: (collection: Collection) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  viewMode,
  onSelect,
  onShare,
  onEdit,
  onDelete,
  onLike,
  onDuplicate
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(collection.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(collection.id, { isPublic: !collection.isPublic });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(collection);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
      onDelete?.(collection.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(collection);
  };

  const getCollectionIcon = () => {
    const colors = {
      development: 'from-blue-500 to-cyan-500',
      design: 'from-purple-500 to-pink-500',
      research: 'from-green-500 to-emerald-500',
      business: 'from-orange-500 to-red-500',
      personal: 'from-indigo-500 to-purple-500',
      default: 'from-gray-500 to-gray-600'
    };

    const gradient = colors[collection.template as keyof typeof colors] || colors.default;

    return (
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
        <Bookmark className="h-6 w-6 text-white" />
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500"
        onClick={() => onSelect(collection)}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {getCollectionIcon()}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{collection.name}</h3>
                  <div className="flex items-center gap-2">
                    {collection.isPublic ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Badge>
                    )}
                    {collection.collaborators.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {collection.collaborators.length}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{collection.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" />
                    {collection.stats.bookmarkCount} bookmarks
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {collection.stats.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {collection.stats.likes} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Updated {formatDate(collection.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={collection.owner.avatar} />
                  <AvatarFallback className="text-xs">
                    {collection.owner.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{collection.owner.name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onSelect(collection)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getCollectionIcon()}
            <div>
              <CardTitle className="text-base">{collection.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {collection.isPublic ? (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <Globe className="h-3 w-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
                {collection.collaborators.length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <Users className="h-3 w-3" />
                    {collection.collaborators.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-2">
          {collection.description}
        </CardDescription>
        
        {/* Tags */}
        {collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {collection.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {collection.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{collection.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Preview of bookmarks */}
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Play className="h-4 w-4" />
            <span>{collection.stats.bookmarkCount} bookmarks</span>
          </div>
          <div className="space-y-1">
            {collection.bookmarks.slice(0, 3).map((bookmarkId, index) => (
              <div key={bookmarkId} className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-medium">
                  {index + 1}
                </div>
                <span>Sample Bookmark {index + 1}</span>
              </div>
            ))}
            {collection.bookmarks.length > 3 && (
              <div className="text-xs text-gray-400 ml-6">
                +{collection.bookmarks.length - 3} more
              </div>
            )}
          </div>
        </div>
        
        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {collection.stats.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {collection.stats.likes}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Owner */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Avatar className="h-6 w-6">
            <AvatarImage src={collection.owner.avatar} />
            <AvatarFallback className="text-xs">
              {collection.owner.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{collection.owner.name}</span>
          <span className="text-xs text-gray-400 ml-auto">
            {formatDate(collection.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}; 