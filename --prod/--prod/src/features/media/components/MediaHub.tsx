'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  FolderOpen, 
  Image, 
  Video, 
  Music,
  Upload,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';
import { DocumentEditor } from './DocumentEditor';
import { useMediaLibrary } from '../hooks/useMediaLibrary';

type ActiveView = 'library' | 'document';

export function MediaHub() {
  const [activeView, setActiveView] = useState<ActiveView>('library');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { filteredFiles, filteredDocuments, filteredFolders, createDocument } = useMediaLibrary();

  const handleDocumentOpen = (documentId: string) => {
    console.log('Opening document:', documentId);
    console.log('Available documents:', filteredDocuments.map(d => ({ id: d.id, title: d.title })));
    setSelectedDocumentId(documentId);
    setActiveView('document');
    console.log('Active view set to document');
  };

  const handleCreateNewDocument = () => {
    const newDocument = createDocument('Untitled Document');
    handleDocumentOpen(newDocument.id);
  };

  const handleBackToLibrary = () => {
    setActiveView('library');
    setSelectedDocumentId(null);
  };

  const getMediaStats = () => {
    const imageCount = filteredFiles.filter(f => f.type === 'image').length;
    const videoCount = filteredFiles.filter(f => f.type === 'video').length;
    const audioCount = filteredFiles.filter(f => f.type === 'audio').length;
    const documentCount = filteredFiles.filter(f => f.type === 'document' || f.type === 'pdf').length;
    
    return { imageCount, videoCount, audioCount, documentCount };
  };

  const stats = getMediaStats();

  if (activeView === 'document' && selectedDocumentId) {
    return (
      <DocumentEditor
        documentId={selectedDocumentId}
        onBack={handleBackToLibrary}
      />
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Media Hub</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage your files, documents, and rich content
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Image className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.imageCount}</p>
                <p className="text-sm text-gray-500">Images</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.videoCount}</p>
                <p className="text-sm text-gray-500">Videos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Music className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.audioCount}</p>
                <p className="text-sm text-gray-500">Audio</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.documentCount}</p>
                <p className="text-sm text-gray-500">Documents</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredFolders.length}</p>
                <p className="text-sm text-gray-500">Folders</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex-1">
        <Tabs defaultValue="all" className="flex flex-col">
          <div className="border-b border-gray-200 px-4 flex-shrink-0">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">All Media</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="flex-1 m-0">
            <MediaLibrary onDocumentOpen={handleDocumentOpen} />
          </TabsContent>

          <TabsContent value="images" className="flex-1 m-0">
            <MediaLibrary onDocumentOpen={handleDocumentOpen} />
          </TabsContent>

          <TabsContent value="videos" className="flex-1 m-0">
            <MediaLibrary onDocumentOpen={handleDocumentOpen} />
          </TabsContent>

          <TabsContent value="documents" className="flex-1 m-0">
            <div className="p-4">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Rich Documents</h2>
                <p className="text-gray-500">
                  Create and edit rich documents with media embedding capabilities
                </p>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-500 mb-6">
                    Create your first rich document to get started
                  </p>
                  <Button onClick={handleCreateNewDocument}>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button onClick={handleCreateNewDocument}>
                    <FileText className="h-4 w-4 mr-2" />
                    New Document
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((doc) => (
                    <Card 
                      key={doc.id} 
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleDocumentOpen(doc.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {doc.content.length} blocks • Updated {new Date(doc.updatedAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            {doc.tags.slice(0, 2).map((tag) => (
                              <span 
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{doc.tags.length - 2} more
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-2 space-x-2">
                            <div className="flex items-center -space-x-1">
                              {doc.collaborators.slice(0, 3).map((collaborator) => (
                                <div
                                  key={collaborator.userId}
                                  className="h-5 w-5 bg-gray-300 rounded-full border border-white flex items-center justify-center text-xs font-medium text-gray-600"
                                  title={collaborator.userName}
                                >
                                  {collaborator.userName.charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                            {doc.collaborators.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{doc.collaborators.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 