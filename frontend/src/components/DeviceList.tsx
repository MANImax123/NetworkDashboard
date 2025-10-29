'use client'

import { ServerIcon, WifiIcon, SmartphoneIcon } from 'lucide-react'

interface Device {
  ip: string
  mac: string
  hostname: string
  status: string
}

interface DeviceListProps {
  devices: Device[]
}

export function DeviceList({ devices }: DeviceListProps) {
  const getDeviceIcon = (hostname: string) => {
    if (hostname.includes('laptop') || hostname.includes('desktop')) {
      return ServerIcon
    } else if (hostname.includes('phone') || hostname.includes('mobile')) {
      return SmartphoneIcon
    }
    return WifiIcon
  }

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Connected Devices</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">Device</th>
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">IP Address</th>
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">MAC Address</th>
              <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => {
              const Icon = getDeviceIcon(device.hostname)
              return (
                <tr key={index} className="border-b border-border last:border-b-0">
                  <td className="py-3">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{device.hostname}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{device.ip}</td>
                  <td className="py-3 text-sm text-muted-foreground font-mono">{device.mac}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      device.status === 'online' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {device.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}