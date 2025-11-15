'use client'

import { useState, useEffect } from 'react'
import { NetworkStats } from '../components/NetworkStats'
import { NetworkChart } from '../components/NetworkChart'
import { DeviceList } from '../components/DeviceList'
import { AlertPanel } from '../components/AlertPanel'
import { ThemeToggle } from '../components/ThemeToggle'
import { ProtocolInsights } from '../components/ProtocolInsights'
import { PortInsights } from '../components/PortInsights'
import { AdvancedDeviceList } from '../components/AdvancedDeviceList'
import { AIInsightsDashboard } from '../components/AIInsightsDashboard'
import { NetworkTopology } from '../components/NetworkTopology'
import { ProjectInfo } from '../components/ProjectInfo'
import { MonitorIcon, WifiIcon, AlertTriangleIcon, ServerIcon, Brain, Network, Shield, Activity, Info } from 'lucide-react'

interface NetworkData {
  bandwidth: { upload: number; download: number; timestamp: string }
  latency: number
  packetLoss: number
  devices: Array<{ ip: string; mac: string; hostname: string; status: string }>
  alerts: Array<{ id: string; type: string; message: string; timestamp: string }>
}

export default function Dashboard() {
  const [networkData, setNetworkData] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    let websocket: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connectWebSocket = () => {
      try {
        websocket = new WebSocket('ws://localhost:8000/ws')

        websocket.onopen = () => {
          console.log('WebSocket connected')
          setConnected(true)
        }

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('Received data:', data) // Debug log
            
            // Safely access data with fallbacks
            const metrics = data.metrics || {}
            const bandwidth = metrics.bandwidth || { upload: 0, download: 0, timestamp: new Date().toISOString() }
            
            // Transform backend data to frontend format
            setNetworkData({
              bandwidth: bandwidth,
              latency: metrics.latency || 0,
              packetLoss: metrics.packet_loss || 0,
              devices: data.devices || [],
              alerts: data.alerts || [],
              protocols: data.protocols || { top_protocols: [] },
              ports: data.ports || { top_source_ports: [], suspicious_activity: [] },
              advancedDevices: data.advanced_devices || [],
              topology: data.topology || {
                nodes: [],
                topology_type: 'star',
                network_segments: [],
                connection_quality: { excellent: 0, good: 0, poor: 0, offline: 0 }
              },
              aiInsights: {
                anomalies: data.anomalies?.anomalies || [],
                predictions: [],
                traffic_patterns: [],
                security_threats: [],
                network_health_score: 100 - (data.anomalies?.total_anomalies || 0) * 10,
                optimization_suggestions: data.anomalies?.recommendations || [],
                performance_trends: Array.from({ length: 20 }, (_, i) => ({
                  timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
                  bandwidth: (bandwidth.download || 0) + (bandwidth.upload || 0),
                  latency: metrics.latency || 0,
                  packet_loss: metrics.packet_loss || 0,
                  health_score: Math.max(70, 100 - (metrics.latency || 0))
                }))
              }
            })
            setConnected(true)
          } catch (error) {
            console.error('Error parsing WebSocket data:', error, event.data)
          }
        }

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error)
          setConnected(false)
        }

        websocket.onclose = () => {
          console.log('WebSocket disconnected, reconnecting in 5 seconds...')
          setConnected(false)
          reconnectTimeout = setTimeout(connectWebSocket, 5000)
        }

        setWs(websocket)
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        reconnectTimeout = setTimeout(connectWebSocket, 5000)
      }
    }

    // Initial connection
    connectWebSocket()

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (websocket) {
        websocket.close()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MonitorIcon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Enterprise Network Monitor</h1>
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <ThemeToggle />
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-4">
            <nav className="flex space-x-1 bg-muted p-1 rounded-lg">
              {[
                { id: 'overview', label: 'Overview', icon: MonitorIcon },
                { id: 'protocols', label: 'Protocol Analysis', icon: Network },
                { id: 'ports', label: 'Port Security', icon: Shield },
                { id: 'devices', label: 'Device Discovery', icon: ServerIcon },
                { id: 'ai', label: 'AI Insights', icon: Brain },
                { id: 'topology', label: 'Network Topology', icon: Activity },
                { id: 'about', label: 'Why This Project', icon: Info }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {networkData ? (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Stats Cards */}
                <NetworkStats data={networkData} />

                {/* Charts and Alerts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <NetworkChart data={networkData} />
                  </div>
                  <div>
                    <AlertPanel alerts={networkData.alerts} />
                  </div>
                </div>

                {/* Device List */}
                <DeviceList devices={networkData.devices} />
              </>
            )}

            {/* Protocol Analysis Tab */}
            {activeTab === 'protocols' && (
              <ProtocolInsights data={networkData.protocols} />
            )}

            {/* Port Security Tab */}
            {activeTab === 'ports' && (
              <PortInsights data={networkData.ports} />
            )}

            {/* Advanced Device Discovery Tab */}
            {activeTab === 'devices' && (
              <AdvancedDeviceList devices={networkData.advancedDevices} />
            )}

            {/* AI Insights Tab */}
            {activeTab === 'ai' && (
              <AIInsightsDashboard data={networkData.aiInsights} />
            )}

            {/* Network Topology Tab */}
            {activeTab === 'topology' && (
              <NetworkTopology data={networkData.topology} />
            )}

            {/* About Project Tab */}
            {activeTab === 'about' && (
              <ProjectInfo />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <WifiIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Connecting to enterprise network monitor...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}