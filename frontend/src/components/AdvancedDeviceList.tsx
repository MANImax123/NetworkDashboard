'use client'

import { useState, useEffect } from 'react'
import { Laptop, Smartphone, Tv, Router, HardDrive, AlertTriangle, Shield, Activity, Clock, Wifi } from 'lucide-react'

interface Device {
  ip: string
  mac: string
  hostname: string
  vendor: string
  device_type: string
  status: string
  uptime: string
  data_usage: { sent: number; received: number }
  last_seen: string
  open_ports: number[]
  os_guess: string
  signal_strength: number
  connection_quality: string
  security_score: {
    score: number
    level: string
    issues: string[]
  }
  bandwidth_usage: {
    current: number
    peak: number
  }
}

interface AdvancedDeviceListProps {
  devices: Device[]
}

export function AdvancedDeviceList({ devices }: AdvancedDeviceListProps) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('hostname')
  const [searchTerm, setSearchTerm] = useState('')

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'laptop': return Laptop
      case 'mobile device': return Smartphone
      case 'smart tv': return Tv
      case 'router': return Router
      case 'single board computer': return HardDrive
      default: return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 dark:text-green-400'
      case 'idle': return 'text-yellow-600 dark:text-yellow-400'
      case 'suspicious': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getSecurityBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'LOW':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const filteredDevices = devices.filter(device => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'online' && device.status === 'online') ||
                         (filter === 'suspicious' && device.status === 'suspicious') ||
                         (filter === 'low-security' && device.security_score.level === 'LOW')
    
    const matchesSearch = searchTerm === '' || 
                         device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.ip.includes(searchTerm) ||
                         device.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const sortedDevices = filteredDevices.sort((a, b) => {
    switch (sortBy) {
      case 'hostname': return a.hostname.localeCompare(b.hostname)
      case 'ip': return a.ip.localeCompare(b.ip, undefined, { numeric: true })
      case 'usage': return (b.data_usage.sent + b.data_usage.received) - (a.data_usage.sent + a.data_usage.received)
      case 'security': return a.security_score.score - b.security_score.score
      default: return 0
    }
  })

  const totalDevices = devices.length
  const onlineDevices = devices.filter(d => d.status === 'online').length
  const suspiciousDevices = devices.filter(d => d.status === 'suspicious').length
  const lowSecurityDevices = devices.filter(d => d.security_score.level === 'LOW').length

  return (
    <div className="space-y-6">
      {/* Device Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
              <p className="text-2xl font-bold text-foreground">{totalDevices}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Online</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{onlineDevices}</p>
            </div>
            <Wifi className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suspicious</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{suspiciousDevices}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low Security</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowSecurityDevices}</p>
            </div>
            <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="metric-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search devices by hostname, IP, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Devices</option>
              <option value="online">Online Only</option>
              <option value="suspicious">Suspicious</option>
              <option value="low-security">Low Security</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="hostname">Sort by Name</option>
              <option value="ip">Sort by IP</option>
              <option value="usage">Sort by Usage</option>
              <option value="security">Sort by Security</option>
            </select>
          </div>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedDevices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.device_type)
            const totalUsage = device.data_usage.sent + device.data_usage.received
            
            return (
              <div key={device.ip} className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <DeviceIcon className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium text-foreground">{device.hostname}</h4>
                      <p className="text-sm text-muted-foreground">{device.ip}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSecurityBadge(device.security_score.level)}`}>
                      {device.security_score.level}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-500' : device.status === 'suspicious' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  </div>
                </div>

                {/* Device Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vendor:</span>
                    <span className="text-foreground">{device.vendor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">OS:</span>
                    <span className="text-foreground">{device.os_guess}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAC:</span>
                    <span className="text-foreground font-mono text-xs">{device.mac}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="text-foreground">{device.uptime}</span>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-muted rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Data Usage</span>
                    <span className="text-sm text-muted-foreground">{(totalUsage / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>↑ {(device.data_usage.sent / 1024 / 1024).toFixed(1)} MB</span>
                    <span>↓ {(device.data_usage.received / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((device.bandwidth_usage.current / device.bandwidth_usage.peak) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Security Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Security Score</span>
                    <span className="text-sm font-bold text-foreground">{device.security_score.score}/100</span>
                  </div>
                  {device.security_score.issues.length > 0 && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {device.security_score.issues.slice(0, 2).map((issue, index) => (
                        <div key={index}>• {issue}</div>
                      ))}
                      {device.security_score.issues.length > 2 && (
                        <div>• +{device.security_score.issues.length - 2} more issues</div>
                      )}
                    </div>
                  )}
                  
                  {device.open_ports.length > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Open ports: </span>
                      <span className="font-mono text-foreground">
                        {device.open_ports.slice(0, 3).join(', ')}
                        {device.open_ports.length > 3 && ` +${device.open_ports.length - 3}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {sortedDevices.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No devices found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}