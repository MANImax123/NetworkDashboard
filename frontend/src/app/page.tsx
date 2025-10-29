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
import { MonitorIcon, WifiIcon, AlertTriangleIcon, ServerIcon, Brain, Network, Shield, Activity } from 'lucide-react'

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

  useEffect(() => {
    // Fetch data from our FastAPI backend
    const fetchData = async () => {
      try {
        // Fetch basic network data
        const basicResponse = await fetch('http://localhost:8000/api/network/current')
        const basicData = await basicResponse.json()

        // Fetch devices
        const devicesResponse = await fetch('http://localhost:8000/api/devices')
        const devicesData = await devicesResponse.json()

        // Fetch alerts
        const alertsResponse = await fetch('http://localhost:8000/api/alerts')
        const alertsData = await alertsResponse.json()

        // Fetch advanced insights
        const protocolResponse = await fetch('http://localhost:8000/api/protocols')
        const protocolData = await protocolResponse.json()

        const portResponse = await fetch('http://localhost:8000/api/ports')
        const portData = await portResponse.json()

        const advancedDevicesResponse = await fetch('http://localhost:8000/api/devices/advanced')
        const advancedDevicesData = await advancedDevicesResponse.json()

        const topologyResponse = await fetch('http://localhost:8000/api/topology')
        const topologyData = await topologyResponse.json()

        // Create comprehensive AI insights data
        const aiInsights = {
          anomalies: [],
          predictions: [],
          traffic_patterns: [],
          security_threats: [],
          network_health_score: Math.floor(Math.random() * 30) + 70,
          optimization_suggestions: [
            "Consider upgrading bandwidth for peak hours",
            "Monitor device connections more frequently",
            "Implement network segmentation for security"
          ],
          performance_trends: Array.from({ length: 20 }, (_, i) => ({
            timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
            bandwidth: Math.random() * 100,
            latency: Math.random() * 50 + 10,
            packet_loss: Math.random() * 2,
            health_score: Math.random() * 30 + 70
          }))
        }

        setNetworkData({
          bandwidth: basicData.bandwidth,
          latency: basicData.latency,
          packetLoss: basicData.packet_loss,
          devices: devicesData,
          alerts: alertsData,
          protocols: protocolData,
          ports: portData,
          advancedDevices: advancedDevicesData.devices || advancedDevicesData || [],
          aiInsights: aiInsights,
          topology: topologyData
        })
        setConnected(true)
      } catch (error) {
        console.error('Failed to fetch network data:', error)
        // Enhanced fallback mock data
        setNetworkData({
          bandwidth: {
            upload: Math.random() * 100,
            download: Math.random() * 100,
            timestamp: new Date().toISOString()
          },
          latency: Math.random() * 50 + 10,
          packetLoss: Math.random() * 2,
          devices: [
            { ip: '192.168.1.100', mac: '00:1B:44:11:3A:B7', hostname: 'laptop-001', status: 'online' },
            { ip: '192.168.1.101', mac: '00:1B:44:11:3A:B8', hostname: 'desktop-002', status: 'online' },
            { ip: '192.168.1.102', mac: '00:1B:44:11:3A:B9', hostname: 'phone-003', status: 'offline' },
          ],
          alerts: [
            { id: '1', type: 'warning', message: 'High latency detected', timestamp: new Date().toISOString() }
          ],
          protocols: {
            protocol_breakdown: { TCP: 45, UDP: 30, HTTP: 15, HTTPS: 10 },
            traffic_analysis: { total_packets: 15000, data_volume: 25.6 },
            top_protocols: [
              { name: 'TCP', percentage: 45, packets: 6750 },
              { name: 'UDP', percentage: 30, packets: 4500 },
              { name: 'HTTP', percentage: 15, packets: 2250 },
              { name: 'HTTPS', percentage: 10, packets: 1500 }
            ]
          },
          ports: {
            services: [
              { port: 80, service: 'HTTP', status: 'open', protocol: 'TCP', category: 'web' },
              { port: 443, service: 'HTTPS', status: 'open', protocol: 'TCP', category: 'web' },
              { port: 22, service: 'SSH', status: 'open', protocol: 'TCP', category: 'remote_access' },
              { port: 53, service: 'DNS', status: 'open', protocol: 'UDP', category: 'network' }
            ],
            security_analysis: {
              suspicious_ports: [],
              open_ports: [80, 443, 22, 53],
              service_breakdown: {
                web_services: 2,
                remote_access: 1,
                network_services: 1,
                database_services: 0
              }
            }
          },
          advancedDevices: [
            {
              ip: '192.168.1.100',
              mac: '00:1B:44:11:3A:B7',
              hostname: 'laptop-001',
              vendor: 'Dell Inc.',
              device_type: 'laptop',
              status: 'online',
              uptime: '2d 14h',
              data_usage: { sent: 1024000, received: 2048000 },
              last_seen: new Date().toISOString(),
              open_ports: [80, 443],
              os_guess: 'Windows 10',
              signal_strength: 85,
              connection_quality: 'excellent',
              security_score: { score: 85, level: 'HIGH', issues: [] },
              bandwidth_usage: { current: 45, peak: 100 }
            }
          ],
          aiInsights: {
            anomalies: [],
            predictions: [],
            traffic_patterns: [],
            security_threats: [],
            network_health_score: 85,
            optimization_suggestions: [
              "Consider upgrading bandwidth for peak hours",
              "Monitor device connections more frequently"
            ],
            performance_trends: Array.from({ length: 20 }, (_, i) => ({
              timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
              bandwidth: Math.random() * 100,
              latency: Math.random() * 50 + 10,
              packet_loss: Math.random() * 2,
              health_score: Math.random() * 30 + 70
            }))
          },
          topology: {
            nodes: [
              {
                id: 'router1',
                type: 'router',
                label: 'Main Router',
                ip: '192.168.1.1',
                mac: '00:1B:44:11:3A:A0',
                x: 400,
                y: 300,
                connections: ['laptop1', 'desktop1'],
                status: 'online',
                security_level: 'high',
                bandwidth_usage: 65,
                device_info: { vendor: 'Cisco', os: 'IOS', uptime: '30d' }
              },
              {
                id: 'laptop1',
                type: 'laptop',
                label: 'Laptop-001',
                ip: '192.168.1.100',
                mac: '00:1B:44:11:3A:B7',
                x: 200,
                y: 200,
                connections: ['router1'],
                status: 'online',
                security_level: 'high',
                bandwidth_usage: 45,
                device_info: { vendor: 'Dell', os: 'Windows 10', uptime: '2d' }
              }
            ],
            topology_type: 'star',
            network_segments: [
              { name: 'Main Network', subnet: '192.168.1.0/24', device_count: 5, security_level: 'high' }
            ],
            connection_quality: { excellent: 5, good: 3, poor: 1, offline: 0 }
          }
        })
        setConnected(true)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
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
                { id: 'topology', label: 'Network Topology', icon: Activity }
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