'use client';

import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { 
  MediaFile, 
  MediaFolder, 
  RichDocument, 
  MediaLibraryState, 
  UploadProgress,
  MediaType 
} from '../types';

// Mock data for demonstration
const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    name: 'project-screenshot.png',
    originalName: 'Screenshot 2024-01-15 at 10.30.45.png',
    type: 'image',
    mimeType: 'image/png',
    size: 2048000,
    url: '/placeholder.svg?height=400&width=600',
    thumbnailUrl: '/placeholder.svg?height=150&width=150',
    uploadedAt: new Date('2024-01-15'),
    uploadedBy: 'user-1',
    tags: ['screenshot', 'project'],
    description: 'Main project dashboard screenshot'
  },
  {
    id: '2',
    name: 'demo-video.mp4',
    originalName: 'Product Demo Recording.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    size: 15728640,
    url: '/placeholder-video.mp4',
    thumbnailUrl: '/placeholder.svg?height=150&width=150',
    uploadedAt: new Date('2024-01-14'),
    uploadedBy: 'user-1',
    tags: ['demo', 'video'],
    description: 'Product demonstration video',
    metadata: { duration: 120, width: 1920, height: 1080 }
  },
  {
    id: '3',
    name: 'requirements.pdf',
    originalName: 'Project Requirements Document.pdf',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 1024000,
    url: '/placeholder-document.pdf',
    uploadedAt: new Date('2024-01-13'),
    uploadedBy: 'user-1',
    tags: ['document', 'requirements'],
    description: 'Project requirements and specifications',
    metadata: { pageCount: 15 }
  }
];

const mockFolders: MediaFolder[] = [
  {
    id: 'folder-1',
    name: 'Screenshots',
    createdAt: new Date('2024-01-10'),
    createdBy: 'user-1',
    color: '#3B82F6'
  },
  {
    id: 'folder-2',
    name: 'Documents',
    createdAt: new Date('2024-01-11'),
    createdBy: 'user-1',
    color: '#10B981'
  },
  {
    id: 'folder-3',
    name: 'Videos',
    createdAt: new Date('2024-01-12'),
    createdBy: 'user-1',
    color: '#F59E0B'
  }
];

const mockDocuments: RichDocument[] = [
  {
    id: 'doc-1',
    title: 'Project Overview',
    content: [
      {
        id: 'block-1',
        type: 'heading',
        data: { text: 'Project Overview', level: 1 },
        order: 0
      },
      {
        id: 'block-2',
        type: 'paragraph',
        data: { text: 'This document outlines the key objectives and milestones for our upcoming project.' },
        order: 1
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user-1',
    lastEditedBy: 'user-1',
    tags: ['project', 'overview'],
    isPublic: false,
    collaborators: [
      {
        userId: 'user-1',
        userName: 'John Doe',
        role: 'owner',
        joinedAt: new Date('2024-01-15')
      }
    ],
    versions: []
  }
];

export function useMediaLibrary() {
  const [state, setState] = useState<MediaLibraryState>({
    files: mockMediaFiles,
    folders: mockFolders,
    documents: mockDocuments,
    selectedFiles: [],
    viewMode: 'grid',
    sortBy: 'date',
    sortOrder: 'desc',
    searchQuery: '',
  });

  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // File operations
  const uploadFiles = useCallback(async (files: FileList) => {
    setIsUploading(true);
    const newUploads: UploadProgress[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `upload-${Date.now()}-${i}`;
      
      newUploads.push({
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });
    }

    setUploadProgress(newUploads);

    // Simulate upload progress
    for (const upload of newUploads) {
      const file = Array.from(files).find(f => f.name === upload.fileName);
      if (!file) continue;

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => 
          prev.map(u => u.fileId === upload.fileId ? { ...u, progress } : u)
        );
      }

      // Create media file object
      const mediaFile: MediaFile = {
        id: upload.fileId,
        name: file.name.toLowerCase().replace(/\s+/g, '-'),
        originalName: file.name,
        type: getFileType(file.type),
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        uploadedAt: new Date(),
        uploadedBy: 'user-1',
        folderId: state.selectedFolder,
        tags: [],
        description: ''
      };

      setState(prev => ({
        ...prev,
        files: [...prev.files, mediaFile]
      }));

      setUploadProgress(prev => 
        prev.map(u => u.fileId === upload.fileId ? { ...u, status: 'completed' } : u)
      );
    }

    setIsUploading(false);
    setTimeout(() => setUploadProgress([]), 3000);
  }, [state.selectedFolder]);

  const deleteFiles = useCallback((fileIds: string[]) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter(file => !fileIds.includes(file.id)),
      selectedFiles: prev.selectedFiles.filter(id => !fileIds.includes(id))
    }));
  }, []);

  const updateFile = useCallback((fileId: string, updates: Partial<MediaFile>) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    }));
  }, []);

  // Folder operations
  const createFolder = useCallback((name: string, color?: string) => {
    const newFolder: MediaFolder = {
      id: `folder-${Date.now()}`,
      name,
      parentId: state.selectedFolder,
      createdAt: new Date(),
      createdBy: 'user-1',
      color: color || '#6B7280'
    };

    setState(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder]
    }));

    return newFolder;
  }, [state.selectedFolder]);

  const deleteFolder = useCallback((folderId: string) => {
    setState(prev => ({
      ...prev,
      folders: prev.folders.filter(folder => folder.id !== folderId),
      files: prev.files.filter(file => file.folderId !== folderId)
    }));
  }, []);

  // Document operations
  const createDocument = useCallback((title: string) => {
    const newDocument: RichDocument = {
      id: `doc-${Date.now()}`,
      title,
      content: [
        {
          id: `block-${Date.now()}`,
          type: 'paragraph',
          data: { text: '' },
          order: 0
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      lastEditedBy: 'user-1',
      folderId: state.selectedFolder,
      tags: [],
      isPublic: false,
      collaborators: [
        {
          userId: 'user-1',
          userName: 'Current User',
          role: 'owner',
          joinedAt: new Date()
        }
      ],
      versions: []
    };

    setState(prev => ({
      ...prev,
      documents: [...prev.documents, newDocument]
    }));

    return newDocument;
  }, [state.selectedFolder]);

  const updateDocument = useCallback((docId: string, updates: Partial<RichDocument>) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.map(doc => 
        doc.id === docId ? { ...doc, ...updates, updatedAt: new Date() } : doc
      )
    }));
  }, []);

  const deleteDocument = useCallback((docId: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== docId)
    }));
  }, []);

  // Selection and view operations
  const toggleFileSelection = useCallback((fileId: string) => {
    setState(prev => ({
      ...prev,
      selectedFiles: prev.selectedFiles.includes(fileId)
        ? prev.selectedFiles.filter(id => id !== fileId)
        : [...prev.selectedFiles, fileId]
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedFiles: [] }));
  }, []);

  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setFilterType = useCallback((type?: MediaType) => {
    setState(prev => ({ ...prev, filterType: type }));
  }, []);

  const setSortBy = useCallback((sortBy: 'name' | 'date' | 'size' | 'type') => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  const setSelectedFolder = useCallback((folderId?: string) => {
    setState(prev => ({ ...prev, selectedFolder: folderId }));
  }, []);

  // Filtered and sorted data
  const filteredFiles = state.files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()));
    const matchesType = !state.filterType || file.type === state.filterType;
    const matchesFolder = !state.selectedFolder || file.folderId === state.selectedFolder;
    
    return matchesSearch && matchesType && matchesFolder;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (state.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return state.sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredFolders = state.folders.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesParent = !state.selectedFolder || folder.parentId === state.selectedFolder;
    
    return matchesSearch && matchesParent;
  });

  const filteredDocuments = state.documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase()));
    const matchesFolder = !state.selectedFolder || doc.folderId === state.selectedFolder;
    
    return matchesSearch && matchesFolder;
  });

  return {
    // State
    ...state,
    uploadProgress,
    isUploading,
    
    // Computed data
    filteredFiles,
    filteredFolders,
    filteredDocuments,
    
    // File operations
    uploadFiles,
    deleteFiles,
    updateFile,
    
    // Folder operations
    createFolder,
    deleteFolder,
    
    // Document operations
    createDocument,
    updateDocument,
    deleteDocument,
    
    // Selection and view
    toggleFileSelection,
    clearSelection,
    setViewMode,
    setSearchQuery,
    setFilterType,
    setSortBy,
    setSelectedFolder,
  };
}

// Helper function to determine file type
function getFileType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'document';
} 