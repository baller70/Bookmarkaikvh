'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Save, 
  Share2, 
  Users, 
  Clock, 
  Tag, 
  ArrowLeft,
  MoreVertical,
  Eye,
  EyeOff,
  History,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RichTextEditor } from './RichTextEditor';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
// import { CommentSection } from '../../comments';
import { RichDocument, DocumentCollaborator } from '../types';
import { formatDate } from '../utils';

interface DocumentEditorProps {
  documentId: string;
  onBack: () => void;
}

export function DocumentEditor({ documentId, onBack }: DocumentEditorProps) {
  const { documents, updateDocument, filteredFiles } = useMediaLibrary();
  const [document, setDocument] = useState<RichDocument | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    console.log('DocumentEditor: Looking for document with ID:', documentId);
    console.log('DocumentEditor: Available documents:', documents.map(d => ({ id: d.id, title: d.title })));
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      console.log('DocumentEditor: Found document:', doc.title);
      setDocument(doc);
      setTitle(doc.title);
      setTags(doc.tags);
      setIsPublic(doc.isPublic);
      setLastSaved(doc.updatedAt);
    } else {
      console.log('DocumentEditor: Document not found!');
    }
  }, [documentId, documents]);

  const handleSave = async () => {
    if (!document) return;

    setIsSaving(true);
    
    // Simulate saving delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const saveTime = new Date();
    updateDocument(document.id, {
      title,
      tags,
      isPublic,
      content: document.content,
      updatedAt: saveTime
    });

    setLastSaved(saveTime);
    setIsSaving(false);
  };

  const handleContentChange = (content: any[]) => {
    console.log('Content changed:', content);
    if (document) {
      const updatedDocument = { ...document, content };
      setDocument(updatedDocument);
      
      // Auto-save the content immediately
      updateDocument(document.id, {
        content: content,
        updatedAt: new Date()
      });
      
      console.log('Document updated with new content');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleShare = () => {
    // Implement sharing logic
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Document not found</h3>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0"
                  placeholder="Untitled Document"
                />
                {isPublic ? (
                  <Badge variant="default">
                    <Eye className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Saved {formatDate(lastSaved)}
                </span>
              )}
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsPublic(!isPublic)}>
                    {isPublic ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    Make {isPublic ? 'Private' : 'Public'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <History className="h-4 w-4 mr-2" />
                    Version History
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Document Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Document Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Tags */}
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <div className="flex items-center space-x-1">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    className="w-24 h-6 text-xs border-none p-1 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Collaborators */}
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div className="flex items-center -space-x-2">
                {document.collaborators.map((collaborator) => (
                  <Avatar key={collaborator.userId} className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={`/placeholder-avatar.jpg`} />
                    <AvatarFallback className="text-xs">
                      {collaborator.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <RichTextEditor
              content={document.content}
              onChange={handleContentChange}
              mediaFiles={filteredFiles}
              onMediaEmbed={(type) => {
                // Handle media embedding from media library
                console.log('Embed media type:', type);
              }}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="border-t border-gray-200 px-6 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{document.content.length} blocks</span>
              <span>Created {formatDate(document.createdAt)}</span>
              <span>Last edited by {document.lastEditedBy}</span>
            </div>
            <div className="flex items-center space-x-2">
              {document.versions.length > 0 && (
                <span>{document.versions.length} versions</span>
              )}
              <span>Auto-save enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Sidebar */}
      <div className="w-96 border-l border-gray-200 flex flex-col">
        <div className="flex-1 overflow-hidden">
          {/* Temporarily disabled CommentSection
          <CommentSection
            entityType="document"
            entityId={document.id}
            title="Document Comments"
            showHeader={true}
            allowNewComments={true}
          />
          */}
          <div className="p-4 text-center text-gray-500">
            Comments temporarily disabled
          </div>
        </div>
      </div>
    </div>
  );
}

// Collaborator presence indicator
interface CollaboratorPresenceProps {
  collaborators: DocumentCollaborator[];
}

function CollaboratorPresence({ collaborators }: CollaboratorPresenceProps) {
  const activeCollaborators = collaborators.filter(c => c.isActive);

  if (activeCollaborators.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <div className="flex items-center -space-x-1">
        {activeCollaborators.slice(0, 3).map((collaborator) => (
          <div
            key={collaborator.userId}
            className="h-2 w-2 rounded-full bg-green-500 border border-white"
            title={`${collaborator.userName} is editing`}
          />
        ))}
      </div>
      <span>
        {activeCollaborators.length === 1
          ? `${activeCollaborators[0].userName} is editing`
          : `${activeCollaborators.length} people editing`
        }
      </span>
    </div>
  );
} 