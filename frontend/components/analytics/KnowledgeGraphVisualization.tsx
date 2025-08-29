'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Network,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Download,
  Share,
  Play,
  Pause,
  Maximize,
  Info,
  BookOpen,
  Tag,
  Folder,
  Globe,
  User,
  Link as LinkIcon,
  Cpu
} from 'lucide-react'
import { KnowledgeGraph, KnowledgeGraphNode, KnowledgeGraphEdge, GraphFilters } from '@/features/analytics/types'

interface KnowledgeGraphVisualizationProps {
  userId: string
  initialFilters?: Partial<GraphFilters>
  onNodeClick?: (node: KnowledgeGraphNode) => void
  onEdgeClick?: (edge: KnowledgeGraphEdge) => void
  className?: string
}

interface NodePosition {
  x: number
  y: number
  vx?: number
  vy?: number
}

interface SimulationNode extends KnowledgeGraphNode {
  x: number
  y: number
  vx?: number
  vy?: number
  fx?: number
  fy?: number
}

interface SimulationEdge extends KnowledgeGraphEdge {
  source: SimulationNode
  target: SimulationNode
}

export function KnowledgeGraphVisualization({
  userId,
  initialFilters,
  onNodeClick,
  onEdgeClick,
  className
}: KnowledgeGraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null)
  const [simulationNodes, setSimulationNodes] = useState<SimulationNode[]>([])
  const [simulationEdges, setSimulationEdges] = useState<SimulationEdge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<KnowledgeGraphNode | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isSimulating, setIsSimulating] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showClusters, setShowClusters] = useState(true)
  const [filters, setFilters] = useState<GraphFilters>({
    nodeTypes: ['bookmark', 'category', 'tag'],
    edgeTypes: ['related', 'tagged', 'categorized'],
    minConnections: 1,
    maxConnections: 100,
    timeRange: { 
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 
      end: new Date() 
    },
    categories: [],
    tags: [],
    users: [userId],
    ...initialFilters
  })

  // Mock data generation
  const generateMockGraph = useCallback((): KnowledgeGraph => {
    const nodes: KnowledgeGraphNode[] = []
    const edges: KnowledgeGraphEdge[] = []

    // Create category nodes
    const categories = ['Technology', 'Design', 'Business', 'Education', 'Science']
    categories.forEach((cat, i) => {
      nodes.push({
        id: `cat-${i}`,
        type: 'category',
        label: cat,
        size: 30 + Math.random() * 20,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i],
        connections: 0,
        importance: 0.8 + Math.random() * 0.2,
        cluster: `cluster-${i}`,
        metadata: { type: 'category', count: Math.floor(Math.random() * 50) + 10 }
      })
    })

    // Create tag nodes
    const tags = ['react', 'design', 'typescript', 'ui-ux', 'javascript', 'css', 'node', 'python', 'ai', 'ml']
    tags.forEach((tag, i) => {
      nodes.push({
        id: `tag-${i}`,
        type: 'tag',
        label: tag,
        size: 15 + Math.random() * 15,
        color: '#64748b',
        connections: 0,
        importance: 0.4 + Math.random() * 0.4,
        cluster: `cluster-${Math.floor(i / 2)}`,
        metadata: { type: 'tag', frequency: Math.random() }
      })
    })

    // Create bookmark nodes
    const bookmarks = [
      'React Documentation', 'TypeScript Handbook', 'Figma Design System',
      'CSS Grid Guide', 'Node.js Best Practices', 'Python Tutorial',
      'AI/ML Resources', 'Business Strategy', 'UX Design Principles',
      'JavaScript Patterns', 'Design Tokens', 'API Design Guide',
      'Database Optimization', 'Frontend Architecture', 'Backend Scaling'
    ]
    bookmarks.forEach((bookmark, i) => {
      nodes.push({
        id: `bookmark-${i}`,
        type: 'bookmark',
        label: bookmark,
        description: `Description for ${bookmark}`,
        url: `https://example.com/${bookmark.toLowerCase().replace(/\s+/g, '-')}`,
        size: 10 + Math.random() * 10,
        color: '#06b6d4',
        connections: 0,
        importance: Math.random(),
        cluster: `cluster-${Math.floor(Math.random() * categories.length)}`,
        metadata: { 
          type: 'bookmark', 
          visits: Math.floor(Math.random() * 100),
          timeSpent: Math.floor(Math.random() * 300)
        }
      })
    })

    // Create edges
    const edgeTypes = ['related', 'tagged', 'categorized', 'visited_together', 'similar_content']
    
    // Connect bookmarks to categories
    nodes.filter(n => n.type === 'bookmark').forEach(bookmark => {
      const category = nodes.filter(n => n.type === 'category')[Math.floor(Math.random() * categories.length)]
      edges.push({
        id: `edge-${bookmark.id}-${category.id}`,
        source: bookmark.id,
        target: category.id,
        type: 'categorized',
        weight: 0.8 + Math.random() * 0.2,
        strength: 0.8,
        bidirectional: false,
        metadata: { type: 'categorization' }
      })
    })

    // Connect bookmarks to tags
    nodes.filter(n => n.type === 'bookmark').forEach(bookmark => {
      const numTags = Math.floor(Math.random() * 3) + 1
      const selectedTags = tags.sort(() => 0.5 - Math.random()).slice(0, numTags)
      selectedTags.forEach(tagName => {
        const tag = nodes.find(n => n.type === 'tag' && n.label === tagName)
        if (tag) {
          edges.push({
            id: `edge-${bookmark.id}-${tag.id}`,
            source: bookmark.id,
            target: tag.id,
            type: 'tagged',
            weight: 0.6 + Math.random() * 0.4,
            strength: 0.6,
            bidirectional: false,
            metadata: { type: 'tagging' }
          })
        }
      })
    })

    // Create related connections between bookmarks
    nodes.filter(n => n.type === 'bookmark').forEach((bookmark, i) => {
      if (Math.random() > 0.7) { // 30% chance of having related bookmarks
        const otherBookmarks = nodes.filter(n => n.type === 'bookmark' && n.id !== bookmark.id)
        const related = otherBookmarks[Math.floor(Math.random() * otherBookmarks.length)]
        edges.push({
          id: `edge-${bookmark.id}-${related.id}`,
          source: bookmark.id,
          target: related.id,
          type: 'related',
          weight: 0.3 + Math.random() * 0.4,
          strength: 0.5,
          bidirectional: true,
          metadata: { type: 'similarity', score: Math.random() }
        })
      }
    })

    // Update connection counts
    nodes.forEach(node => {
      node.connections = edges.filter(e => e.source === node.id || e.target === node.id).length
    })

    // Create clusters
    const clusters = categories.map((cat, i) => ({
      id: `cluster-${i}`,
      label: cat,
      nodes: nodes.filter(n => n.cluster === `cluster-${i}`).map(n => n.id),
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i],
      size: nodes.filter(n => n.cluster === `cluster-${i}`).length,
      density: Math.random(),
      centrality: Math.random()
    }))

    return {
      nodes,
      edges,
      clusters,
      metrics: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        density: edges.length / (nodes.length * (nodes.length - 1) / 2),
        avgDegree: edges.length * 2 / nodes.length,
        clustering: 0.3 + Math.random() * 0.4,
        diameter: Math.floor(Math.random() * 5) + 3,
        components: 1,
        modularity: 0.4 + Math.random() * 0.3
      },
      layout: 'force',
      filters
    }
  }, [userId, filters])

  // Initialize graph
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const mockGraph = generateMockGraph()
      setGraph(mockGraph)
      initializeSimulation(mockGraph)
      setIsLoading(false)
    }, 1000)
  }, [generateMockGraph])

  const initializeSimulation = (graph: KnowledgeGraph) => {
    const width = 800
    const height = 600
    
    // Initialize node positions
    const nodes: SimulationNode[] = graph.nodes.map(node => ({
      ...node,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0
    }))

    // Create edges with node references
    const edges: SimulationEdge[] = graph.edges.map(edge => {
      const source = nodes.find(n => n.id === edge.source)!
      const target = nodes.find(n => n.id === edge.target)!
      return {
        ...edge,
        source,
        target
      }
    })

    setSimulationNodes(nodes)
    setSimulationEdges(edges)
    
    // Start force simulation
    if (isSimulating) {
      startForceSimulation(nodes, edges)
    }
  }

  const startForceSimulation = (nodes: SimulationNode[], edges: SimulationEdge[]) => {
    // Simple force simulation implementation
    const simulation = () => {
      const alpha = 0.1
      const alphaDecay = 0.99
      let currentAlpha = alpha

      const tick = () => {
        if (currentAlpha < 0.01) return

        // Apply forces
        nodes.forEach(node => {
          // Center force
          const centerX = 400
          const centerY = 300
          node.vx = (node.vx || 0) + (centerX - node.x) * 0.001
          node.vy = (node.vy || 0) + (centerY - node.y) * 0.001

          // Collision force
          nodes.forEach(other => {
            if (node.id !== other.id) {
              const dx = other.x - node.x
              const dy = other.y - node.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              const minDistance = (node.size + other.size) / 2 + 5
              
              if (distance < minDistance && distance > 0) {
                const force = (minDistance - distance) / distance * 0.1
                node.vx = (node.vx || 0) - dx * force
                node.vy = (node.vy || 0) - dy * force
              }
            }
          })
        })

        // Link force
        edges.forEach(edge => {
          const dx = edge.target.x - edge.source.x
          const dy = edge.target.y - edge.source.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const targetDistance = 50 + edge.weight * 50
          
          if (distance > 0) {
            const force = (distance - targetDistance) / distance * edge.strength * 0.1
            const fx = dx * force
            const fy = dy * force
            
            edge.source.vx = (edge.source.vx || 0) + fx
            edge.source.vy = (edge.source.vy || 0) + fy
            edge.target.vx = (edge.target.vx || 0) - fx
            edge.target.vy = (edge.target.vy || 0) - fy
          }
        })

        // Update positions
        nodes.forEach(node => {
          if (!node.fx && !node.fy) {
            node.vx = (node.vx || 0) * 0.9 // Damping
            node.vy = (node.vy || 0) * 0.9
            node.x += node.vx || 0
            node.y += node.vy || 0
          }
        })

        setSimulationNodes([...nodes])
        currentAlpha *= alphaDecay

        if (isSimulating && currentAlpha > 0.01) {
          requestAnimationFrame(tick)
        }
      }

      tick()
    }

    simulation()
  }

  const handleNodeClick = (node: KnowledgeGraphNode) => {
    setSelectedNode(node)
    onNodeClick?.(node)
  }

  const handleNodeDrag = (nodeId: string, x: number, y: number) => {
    setSimulationNodes(nodes => 
      nodes.map(node => 
        node.id === nodeId 
          ? { ...node, x, y, fx: x, fy: y }
          : node
      )
    )
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'bookmark': return BookOpen
      case 'category': return Folder
      case 'tag': return Tag
      case 'domain': return Globe
      case 'user': return User
      default: return Cpu
    }
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 animate-pulse text-blue-500" />
          <span className="text-lg">Building knowledge graph...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Graph</h2>
          <p className="text-gray-600">Explore relationships between your bookmarks</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsSimulating(!isSimulating)}
            variant="outline"
            size="sm"
          >
            {isSimulating ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isSimulating ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={resetView} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset View
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Graph Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Node Types</Label>
              <Select 
                value={filters.nodeTypes.join(',')} 
                onValueChange={(value) => setFilters({...filters, nodeTypes: value.split(',')})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bookmark,category,tag">All Types</SelectItem>
                  <SelectItem value="bookmark">Bookmarks Only</SelectItem>
                  <SelectItem value="category">Categories Only</SelectItem>
                  <SelectItem value="tag">Tags Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Connections: {filters.minConnections}</Label>
              <Slider
                value={[filters.minConnections]}
                onValueChange={([value]) => setFilters({...filters, minConnections: value})}
                max={20}
                min={1}
                step={1}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-labels"
                checked={showLabels}
                onCheckedChange={setShowLabels}
              />
              <Label htmlFor="show-labels">Show Labels</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-clusters"
                checked={showClusters}
                onCheckedChange={setShowClusters}
              />
              <Label htmlFor="show-clusters">Show Clusters</Label>
            </div>

            <div className="space-y-2">
              <Label>Zoom: {zoom.toFixed(1)}x</Label>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                max={3}
                min={0.1}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Search Nodes</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10"
                  onChange={(e) => {
                    const query = e.target.value.toLowerCase()
                    // Highlight matching nodes
                    setSimulationNodes(nodes => 
                      nodes.map(node => ({
                        ...node,
                        metadata: {
                          ...node.metadata,
                          highlighted: node.label.toLowerCase().includes(query)
                        }
                      }))
                    )
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graph Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div 
                ref={containerRef}
                className="relative w-full h-[600px] overflow-hidden bg-gray-50 rounded-lg"
              >
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  viewBox={`${-pan.x} ${-pan.y} ${800 / zoom} ${600 / zoom}`}
                  className="cursor-move"
                >
                  {/* Cluster backgrounds */}
                  {showClusters && graph?.clusters.map(cluster => {
                    const clusterNodes = simulationNodes.filter(n => n.cluster === cluster.id)
                    if (clusterNodes.length === 0) return null
                    
                    const minX = Math.min(...clusterNodes.map(n => n.x)) - 20
                    const maxX = Math.max(...clusterNodes.map(n => n.x)) + 20
                    const minY = Math.min(...clusterNodes.map(n => n.y)) - 20
                    const maxY = Math.max(...clusterNodes.map(n => n.y)) + 20
                    
                    return (
                      <rect
                        key={cluster.id}
                        x={minX}
                        y={minY}
                        width={maxX - minX}
                        height={maxY - minY}
                        fill={cluster.color}
                        fillOpacity={0.1}
                        stroke={cluster.color}
                        strokeWidth={1}
                        strokeDasharray="5,5"
                        rx={10}
                      />
                    )
                  })}

                  {/* Edges */}
                  {simulationEdges.map(edge => (
                    <line
                      key={edge.id}
                      x1={edge.source.x}
                      y1={edge.source.y}
                      x2={edge.target.x}
                      y2={edge.target.y}
                      stroke="#94a3b8"
                      strokeWidth={edge.weight * 3}
                      strokeOpacity={0.6}
                      className="cursor-pointer hover:stroke-blue-500"
                      onClick={() => onEdgeClick?.(edge)}
                    />
                  ))}

                  {/* Nodes */}
                  {simulationNodes.map(node => {
                    const Icon = getNodeIcon(node.type)
                    const isHighlighted = node.metadata?.highlighted
                    const isSelected = selectedNode?.id === node.id
                    const isHovered = hoveredNode?.id === node.id
                    
                    return (
                      <g key={node.id}>
                        {/* Node circle */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.size}
                          fill={isHighlighted ? '#fbbf24' : node.color}
                          stroke={isSelected ? '#1d4ed8' : isHovered ? '#3b82f6' : '#ffffff'}
                          strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                          className="cursor-pointer transition-all duration-200"
                          onClick={() => handleNodeClick(node)}
                          onMouseEnter={() => setHoveredNode(node)}
                          onMouseLeave={() => setHoveredNode(null)}
                        />
                        
                        {/* Node label */}
                        {showLabels && (
                          <text
                            x={node.x}
                            y={node.y + node.size + 15}
                            textAnchor="middle"
                            className="text-xs font-medium fill-gray-700 pointer-events-none"
                          >
                            {node.label.length > 12 ? `${node.label.slice(0, 12)}...` : node.label}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Graph Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Graph Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nodes</span>
                <span className="font-medium">{graph?.metrics.totalNodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Edges</span>
                <span className="font-medium">{graph?.metrics.totalEdges}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Density</span>
                <span className="font-medium">{graph?.metrics.density.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Degree</span>
                <span className="font-medium">{graph?.metrics.avgDegree.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Clustering</span>
                <span className="font-medium">{graph?.metrics.clustering.toFixed(3)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Selected Node Info */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {React.createElement(getNodeIcon(selectedNode.type), { className: "h-5 w-5" })}
                  Node Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Label</Label>
                  <p className="text-sm">{selectedNode.label}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge variant="secondary">{selectedNode.type}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Connections</Label>
                  <p className="text-sm">{selectedNode.connections}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Importance</Label>
                  <p className="text-sm">{selectedNode.importance.toFixed(3)}</p>
                </div>
                {selectedNode.url && (
                  <div>
                    <Label className="text-sm font-medium">URL</Label>
                    <a 
                      href={selectedNode.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block truncate"
                    >
                      {selectedNode.url}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Clusters */}
          {graph?.clusters && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clusters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {graph.clusters.map(cluster => (
                  <div key={cluster.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cluster.color }}
                      />
                      <span className="text-sm">{cluster.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{cluster.nodes.length}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 