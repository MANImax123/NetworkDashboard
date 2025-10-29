'use client'

import { useState, useEffect } from 'react'
import { NetworkStats } from '../components/NetworkStats'
import { NetworkChart } from '../components/NetworkChart'
import { DeviceList } from '../components/DeviceList'
import { AlertPanel } from '../components/AlertPanel'
import { ThemeToggle } from '../components/ThemeToggle'
import { MonitorIcon, WifiIcon, AlertTriangleIcon, ServerIcon } from 'lucide-react'

interface NetworkData {
  bandwidth: { upload: number; download: number; timestamp: string }
  latency: number
  packetLoss: number
  devices: Array<{ ip: string; mac: string; hostname: string; status: string }>
  alerts: Array<{ id: string; type: string; message: string; timestamp: string }>
}

export default function Dashboard() {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Simulate WebSocket connection for now
    const interval = setInterval(() => {
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
        ]
      })
      setConnected(true)
    }, 2000)

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
              <h1 className="text-2xl font-bold text-foreground">Network Monitor</h1>
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {networkData ? (
          <div className="space-y-6">
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
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <WifiIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Connecting to network monitor...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}