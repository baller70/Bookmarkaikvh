'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Search, 
  Grid, 
  List, 
  Filter, 
  FolderPlus, 
  FileText,
  Image,
  Video,
  Music,
  FileIcon,
  Folder as FolderIcon,
  MoreVertical,
  Download,
  Trash2,
  Edit3,
  Eye,
  Share2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { MediaFile, MediaType } from '../types';
import { formatFileSize, formatDate } from '../utils';
import { userDataService } from '@/lib/user-data-service';
import { UserMediaFile } from '@/types/database';
import { toast } from 'sonner';

interface MediaLibraryProps {
  onDocumentOpen?: (documentId: string) => void;
}

export function MediaLibrary({ onDocumentOpen }: MediaLibraryProps = {}) {
  const {
    filteredFiles,
    filteredFolders,
    filteredDocuments,
    selectedFiles,
    viewMode,
    searchQuery,
    filterType,
    uploadProgress,
    isUploading,
    uploadFiles,
    deleteFiles,
    createFolder,
    createDocument,
    toggleFileSelection,
    setViewMode,
    setSearchQuery,
    setFilterType,
    setSelectedFolder,
  } = useMediaLibrary();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingRef = useRef(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [persistentFiles, setPersistentFiles] = useState<UserMediaFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isUploadingToPersistent, setIsUploadingToPersistent] = useState(false);

  // Load persistent files on component mount
  useEffect(() => {
    loadPersistentFiles();
  }, []);

  const loadPersistentFiles = async () => {
    // Prevent multiple simultaneous calls using ref (works better than state for race conditions)
    if (loadingRef.current) {
      return;
    }
    
    try {
      loadingRef.current = true;
      setIsLoadingFiles(true);
      const response = await userDataService.getMediaFiles();
      setPersistentFiles(response.data);
    } catch (error) {
      // Check if it's an authentication error (401)
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        // Silently handle auth errors when user is not logged in
        console.warn('User not authenticated - skipping persistent files load');
        setPersistentFiles([]);
        return;
      }
      
      console.error('Failed to load persistent files:', error);
      // Don't show toast error for initial load failures to avoid disrupting the user experience
      // toast.error('Failed to load saved files');
      setPersistentFiles([]); // Set empty array as fallback
    } finally {
      setIsLoadingFiles(false);
      loadingRef.current = false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Upload to temporary storage first (existing functionality)
      uploadFiles(files);
      
      // Also upload to persistent storage
      await handlePersistentUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePersistentUpload = async (files: FileList) => {
    setIsUploadingToPersistent(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Determine file type based on MIME type
        let fileType: 'image' | 'video' | 'document' | 'logo' = 'document';
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
        } else if (file.name.toLowerCase().includes('logo')) {
          fileType = 'logo';
        }

        const uploadedFile = await userDataService.uploadFile(file, fileType);
        
        // Add to persistent files list
        setPersistentFiles(prev => [uploadedFile, ...prev]);
        
        toast.success(`${file.name} saved successfully`);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        toast.error(`Failed to save ${file.name}`);
      }
    }
    
    setIsUploadingToPersistent(false);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      // Upload to temporary storage first (existing functionality)
      uploadFiles(files);
      
      // Also upload to persistent storage
      await handlePersistentUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const getFileIcon = (type: MediaType) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      default: return <FileIcon className="h-4 w-4" />;
    }
  };

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createFolder(folderName.trim());
      setFolderName('');
      setShowCreateFolder(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files, folders, and documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filterType ? filterType.charAt(0).toUpperCase() + filterType.slice(1) : 'All'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType(undefined)}>
                All Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('image')}>
                Images
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('video')}>
                Videos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('audio')}>
                Audio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('pdf')}>
                PDFs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('document')}>
                Documents
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <Button variant="outline" onClick={() => setShowCreateFolder(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button variant="outline" onClick={() => createDocument('Untitled Document')}>
            <FileText className="h-4 w-4 mr-2" />
            New Document
          </Button>
          {selectedFiles.length > 0 && (
            <Button variant="destructive" onClick={() => deleteFiles(selectedFiles)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedFiles.length})
            </Button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Uploading Files</h3>
          <div className="space-y-2">
            {uploadProgress.map((upload) => (
              <div key={upload.fileId} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{upload.fileName}</span>
                    <span className="text-gray-500">{upload.progress}%</span>
                  </div>
                  <Progress value={upload.progress} className="h-2 mt-1" />
                </div>
                <Badge variant={upload.status === 'completed' ? 'default' : 'secondary'}>
                  {upload.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <Button onClick={handleCreateFolder}>Create</Button>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Upload Status */}
      {(isUploadingToPersistent || isLoadingFiles) && (
        <div className="border-b border-gray-200 p-4 bg-blue-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-blue-700">
              {isUploadingToPersistent ? 'Saving files to your account...' : 'Loading your saved files...'}
            </span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div 
        className="flex-1 p-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Persistent Files Section */}
        {persistentFiles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Saved Files</h2>
              <Badge variant="secondary">{persistentFiles.length} files</Badge>
            </div>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
              {persistentFiles.map((file) => (
                <PersistentFileCard 
                  key={file.id} 
                  file={file} 
                  viewMode={viewMode}
                  onDelete={async (id) => {
                    try {
                      await userDataService.deleteMediaFile(id);
                      setPersistentFiles(prev => prev.filter(f => f.id !== id));
                      toast.success('File deleted successfully');
                    } catch (error) {
                      toast.error('Failed to delete file');
                    }
                  }}
                  getFileIcon={getFileIcon}
                />
              ))}
            </div>
          </div>
        )}

        {filteredFolders.length === 0 && filteredFiles.length === 0 && filteredDocuments.length === 0 && persistentFiles.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-500 mb-6">
              Upload your first files or create a folder to get started
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
            {/* Folders */}
            {filteredFolders.map((folder) => (
              <FolderCard 
                key={folder.id} 
                folder={folder} 
                viewMode={viewMode}
                onSelect={() => setSelectedFolder(folder.id)}
              />
            ))}

            {/* Documents */}
            {filteredDocuments.map((document) => (
              <DocumentCard 
                key={document.id} 
                document={document} 
                viewMode={viewMode}
                onSelect={() => onDocumentOpen?.(document.id)}
              />
            ))}

            {/* Files */}
            {filteredFiles.map((file) => (
              <FileCard 
                key={file.id} 
                file={file} 
                viewMode={viewMode}
                isSelected={selectedFiles.includes(file.id)}
                onSelect={() => toggleFileSelection(file.id)}
                getFileIcon={getFileIcon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Folder Card Component
interface FolderCardProps {
  folder: any;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
}

function FolderCard({ folder, viewMode, onSelect }: FolderCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
        <div className="flex items-center space-x-3">
          <div 
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: folder.color + '20' }}
          >
            <FolderIcon className="h-4 w-4" style={{ color: folder.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{folder.name}</h3>
            <p className="text-xs text-gray-500">{formatDate(folder.createdAt)}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="text-center">
        <div 
          className="h-12 w-12 mx-auto rounded-lg flex items-center justify-center mb-2"
          style={{ backgroundColor: folder.color + '20' }}
        >
          <FolderIcon className="h-6 w-6" style={{ color: folder.color }} />
        </div>
        <h3 className="font-medium text-sm truncate">{folder.name}</h3>
        <p className="text-xs text-gray-500">{formatDate(folder.createdAt)}</p>
      </div>
    </Card>
  );
}

// Document Card Component
interface DocumentCardProps {
  document: any;
  viewMode: 'grid' | 'list';
  onSelect?: () => void;
}

function DocumentCard({ document, viewMode, onSelect }: DocumentCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{document.title}</h3>
            <p className="text-xs text-gray-500">
              Updated {formatDate(document.updatedAt)}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            {document.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="text-center">
        <div className="h-12 w-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-2">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="font-medium text-sm truncate">{document.title}</h3>
        <p className="text-xs text-gray-500">Updated {formatDate(document.updatedAt)}</p>
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {document.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// File Card Component
interface FileCardProps {
  file: MediaFile;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: () => void;
  getFileIcon: (type: MediaType) => React.ReactNode;
}

function FileCard({ file, viewMode, isSelected, onSelect, getFileIcon }: FileCardProps) {
  if (viewMode === 'list') {
    return (
      <Card 
        className={`p-3 hover:shadow-md transition-shadow cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={onSelect}
      >
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
            {file.type === 'image' && file.thumbnailUrl ? (
              <img 
                src={file.thumbnailUrl} 
                alt={file.name}
                className="h-8 w-8 object-cover rounded-lg"
              />
            ) : (
              getFileIcon(file.type)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{file.name}</h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            {file.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit3 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="text-center">
        <div className="h-16 w-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
          {file.type === 'image' && file.thumbnailUrl ? (
            <img 
              src={file.thumbnailUrl} 
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-gray-600">
              {getFileIcon(file.type)}
            </div>
          )}
        </div>
        <h3 className="font-medium text-sm truncate">{file.name}</h3>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {file.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// Persistent File Card Component
interface PersistentFileCardProps {
  file: UserMediaFile;
  viewMode: 'grid' | 'list';
  onDelete: (id: string) => void;
  getFileIcon: (type: string) => React.ReactNode;
}

function PersistentFileCard({ file, viewMode, onDelete, getFileIcon }: PersistentFileCardProps) {
  const handleDownload = () => {
    window.open(file.url, '_blank');
  };

  if (viewMode === 'list') {
    return (
      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
            {file.type === 'image' ? (
              <img 
                src={file.url} 
                alt={file.name}
                className="h-8 w-8 object-cover rounded-lg"
              />
            ) : (
              getFileIcon(file.type)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{file.name}</h3>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)} • {formatDate(new Date(file.created_at))}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            {file.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              {file.type}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(file.url)}>
                <Share2 className="h-4 w-4 mr-2" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(file.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
          {file.type === 'image' ? (
            <img 
              src={file.url} 
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-gray-600">
              {getFileIcon(file.type)}
            </div>
          )}
        </div>
        <h3 className="font-medium text-sm truncate">{file.name}</h3>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        <div className="flex flex-wrap gap-1 mt-2 justify-center">
          <Badge variant="outline" className="text-xs">
            {file.type}
          </Badge>
          {file.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex justify-center space-x-1 mt-2">
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(file.url)}>
            <Share2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(file.id)} className="text-red-600">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
} 