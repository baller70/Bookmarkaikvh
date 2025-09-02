"use client"

import React, { useState } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { FolderHierarchyAssignment } from '../../components/hierarchy/Hierarchy'
import { FolderOrgChartView } from '../../components/ui/folder-org-chart-view'

export const InfinityBoardBackground = ({ isActive }: { isActive: boolean }) => {
  const [nodes] = useNodesState([])
  const [edges] = useEdgesState([])

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
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
      >
        <Background gap={12} color="#e5e7eb" />
        <MiniMap position="bottom-left" />
        <Controls position="bottom-right" />
      </ReactFlow>
    </ReactFlowProvider>
  ) : null
}

export const KHV1InfinityBoard = ({
  folders,
  bookmarks,
  onCreateFolder,
  onAddBookmark,
  onOpenDetail,
  isActive,
  folderAssignments,
  onHierarchyAssignmentsChange,
}: {
  folders: any[]
  bookmarks: any[]
  onCreateFolder: () => void
  onAddBookmark: () => void
  onOpenDetail: (bookmark: any) => void
  isActive: boolean
  folderAssignments: FolderHierarchyAssignment[]
  onHierarchyAssignmentsChange: (assignments: FolderHierarchyAssignment[]) => void
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 })
  if (!isActive) return null

  return (
    <div className="relative w-full min-h-screen overflow-auto">
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
            panOnDrag
            zoomOnScroll
            zoomOnPinch
            zoomOnDoubleClick
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            onMove={(_, viewport) => {
              setTransform({ x: viewport.x, y: viewport.y, zoom: viewport.zoom })
            }}
          >
            <Background gap={12} color="#e5e7eb" />
            <Controls position="bottom-right" />
            <MiniMap position="bottom-left" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <div
        className="relative w-full pointer-events-auto z-10"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
          transformOrigin: '0 0',
          transition: 'none',
          paddingTop: '40px',
          paddingLeft: '40px',
          paddingBottom: '40px',
          minHeight: 'calc(100vh + 80px)',
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
  )
}
