'use client'

import { useState, useEffect, useRef } from 'react'
import { Network, Router, Laptop, Smartphone, Server, Wifi, Shield, AlertTriangle, Activity } from 'lucide-react'

interface NetworkNode {
  id: string
  type: string
  label: string
  ip: string
  mac: string
  x?: number
  y?: number
  connections: string[]
  status: string
  security_level: string
  bandwidth_usage: number
  device_info: {
    vendor: string
    os: string
    uptime: string
  }
}

interface NetworkTopologyData {
  nodes: NetworkNode[]
  topology_type: string
  network_segments: Array<{
    name: string
    subnet: string
    device_count: number
    security_level: string
  }>
  connection_quality: {
    excellent: number
    good: number
    poor: number
    offline: number
  }
}

interface NetworkTopologyProps {
  data: NetworkTopologyData
}

export function NetworkTopology({ data }: NetworkTopologyProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [viewMode, setViewMode] = useState<'topology' | 'security' | 'traffic'>('topology')

  // Provide default values to prevent undefined errors
  const safeData = {
    nodes: data?.nodes || [],
    topology_type: data?.topology_type || 'star',
    network_segments: data?.network_segments || [],
    connection_quality: data?.connection_quality || {
      excellent: 0,
      good: 0,
      poor: 0,
      offline: 0
    }
  }

  // Show loading state if no data
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="metric-card">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading network topology...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate node positions based on topology type
  const calculateNodePositions = (nodes: NetworkNode[]) => {
    const width = 800
    const height = 600
    const centerX = width / 2
    const centerY = height / 2

    return nodes.map((node, index) => {
      let x, y

      if (safeData.topology_type === 'star') {
        if (node.type === 'router' || node.type === 'gateway') {
          x = centerX
          y = centerY
        } else {
          const angle = (2 * Math.PI * index) / (nodes.length - 1)
          const radius = 200
          x = centerX + radius * Math.cos(angle)
          y = centerY + radius * Math.sin(angle)
        }
      } else if (safeData.topology_type === 'ring') {
        const angle = (2 * Math.PI * index) / nodes.length
        const radius = 180
        x = centerX + radius * Math.cos(angle)
        y = centerY + radius * Math.sin(angle)
      } else {
        // Default layout
        const cols = Math.ceil(Math.sqrt(nodes.length))
        const row = Math.floor(index / cols)
        const col = index % cols
        x = (width / (cols + 1)) * (col + 1)
        y = (height / (Math.ceil(nodes.length / cols) + 1)) * (row + 1)
      }

      return { 
        ...node, 
        x, 
        y,
        connections: node.connections || [] // Ensure connections is always an array
      }
    })
  }

  const nodesWithPositions = calculateNodePositions(safeData.nodes)

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'router': return Router
      case 'laptop': return Laptop
      case 'mobile': return Smartphone
      case 'server': return Server
      case 'access_point': return Wifi
      default: return Activity
    }
  }

  const getNodeColor = (node: NetworkNode) => {
    if (viewMode === 'security') {
      switch (node.security_level) {
        case 'high': return '#10b981'
        case 'medium': return '#f59e0b'
        case 'low': return '#ef4444'
        default: return '#6b7280'
      }
    } else if (viewMode === 'traffic') {
      const usage = node.bandwidth_usage
      if (usage > 80) return '#ef4444'
      if (usage > 50) return '#f59e0b'
      return '#10b981'
    } else {
      switch (node.status) {
        case 'online': return '#10b981'
        case 'warning': return '#f59e0b'
        case 'offline': return '#ef4444'
        default: return '#6b7280'
      }
    }
  }

  const drawConnections = (): JSX.Element[] => {
    const connections: JSX.Element[] = []
    nodesWithPositions.forEach(node => {
      // Check if node.connections exists and is an array
      if (node.connections && Array.isArray(node.connections)) {
        node.connections.forEach(connectionId => {
          const targetNode = nodesWithPositions.find(n => n.id === connectionId)
          if (targetNode && node.x && node.y && targetNode.x && targetNode.y) {
            connections.push(
              <line
                key={`${node.id}-${connectionId}`}
                x1={node.x}
                y1={node.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                strokeOpacity="0.6"
              />
            )
          }
        })
      }
    })
    return connections
  }

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
              <p className="text-2xl font-bold text-foreground">{safeData.nodes.length}</p>
            </div>
            <Network className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Online</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {safeData.connection_quality.excellent + safeData.connection_quality.good}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Warning</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {safeData.connection_quality.poor}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Offline</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {safeData.connection_quality.offline}
              </p>
            </div>
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Network Segments */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Network Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeData.network_segments.map((segment, index) => (
            <div key={index} className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">{segment.name}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  segment.security_level === 'high' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : segment.security_level === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {segment.security_level}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subnet:</span>
                  <span className="font-mono text-foreground">{segment.subnet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Devices:</span>
                  <span className="text-foreground">{segment.device_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topology Visualization */}
      <div className="metric-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Network Topology</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('topology')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'topology'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Topology
            </button>
            <button
              onClick={() => setViewMode('security')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'security'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setViewMode('traffic')}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'traffic'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Traffic
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Topology SVG */}
          <div className="flex-1">
            <svg
              ref={svgRef}
              width="800"
              height="600"
              className="border border-border rounded-lg bg-muted/30"
              viewBox="0 0 800 600"
            >
              {/* Draw connections */}
              {drawConnections()}

              {/* Draw nodes */}
              {nodesWithPositions.map((node) => {
                const NodeIcon = getNodeIcon(node.type)
                const nodeColor = getNodeColor(node)

                return (
                  <g key={node.id}>
                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="20"
                      fill={nodeColor}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedNode(node)}
                    />
                    
                    {/* Node icon (using a simple circle for now since SVG doesn't support React components directly) */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="8"
                      fill="white"
                      className="cursor-pointer"
                      onClick={() => setSelectedNode(node)}
                    />
                    
                    {/* Node label */}
                    <text
                      x={node.x}
                      y={(node.y || 0) + 35}
                      textAnchor="middle"
                      className="text-xs fill-current text-foreground"
                      onClick={() => setSelectedNode(node)}
                    >
                      {node.label}
                    </text>

                    {/* Bandwidth usage indicator for traffic view */}
                    {viewMode === 'traffic' && (
                      <circle
                        cx={(node.x || 0) + 15}
                        cy={(node.y || 0) - 15}
                        r="6"
                        fill={node.bandwidth_usage > 80 ? '#ef4444' : node.bandwidth_usage > 50 ? '#f59e0b' : '#10b981'}
                        stroke="white"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Node Details Panel */}
          {selectedNode && (
            <div className="w-80 ml-6 border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">{selectedNode.label}</h4>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {(() => {
                    const Icon = getNodeIcon(selectedNode.type)
                    return <Icon className="w-5 h-5 text-muted-foreground" />
                  })()}
                  <span className="text-sm font-medium text-foreground">{selectedNode.type}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedNode.status === 'online' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : selectedNode.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IP Address:</span>
                    <span className="font-mono text-foreground">{selectedNode.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MAC Address:</span>
                    <span className="font-mono text-foreground text-xs">{selectedNode.mac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendor:</span>
                    <span className="text-foreground">{selectedNode.device_info.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OS:</span>
                    <span className="text-foreground">{selectedNode.device_info.os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="text-foreground">{selectedNode.device_info.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Level:</span>
                    <span className={`font-medium ${
                      selectedNode.security_level === 'high' ? 'text-green-600 dark:text-green-400' :
                      selectedNode.security_level === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {selectedNode.security_level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bandwidth Usage:</span>
                    <span className="text-foreground">{selectedNode.bandwidth_usage}%</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-medium text-foreground mb-2">Connections</h5>
                  <div className="space-y-1">
                    {selectedNode.connections && Array.isArray(selectedNode.connections) ? 
                      selectedNode.connections.map(connectionId => {
                        const connectedNode = safeData.nodes.find(n => n.id === connectionId)
                        return connectedNode ? (
                          <div key={connectionId} className="text-xs text-muted-foreground">
                            → {connectedNode.label} ({connectedNode.ip})
                          </div>
                        ) : null
                      }) : (
                        <div className="text-xs text-muted-foreground">No connections</div>
                      )
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          {viewMode === 'topology' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-muted-foreground">Warning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-muted-foreground">Offline</span>
              </div>
            </>
          )}
          {viewMode === 'security' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">High Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-muted-foreground">Medium Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-muted-foreground">Low Security</span>
              </div>
            </>
          )}
          {viewMode === 'traffic' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-muted-foreground">Low Traffic (&lt;50%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-muted-foreground">Medium Traffic (50-80%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-muted-foreground">High Traffic (&gt;80%)</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}