'use client'

import { TrendingUpIcon, TrendingDownIcon, WifiIcon, AlertTriangleIcon } from 'lucide-react'

interface NetworkStatsProps {
  data: {
    bandwidth: { upload: number; download: number; timestamp: string }
    latency: number
    packetLoss: number
  }
}

export function NetworkStats({ data }: NetworkStatsProps) {
  const stats = [
    {
      title: 'Download Speed',
      value: `${data.bandwidth.download.toFixed(1)} Mbps`,
      icon: TrendingDownIcon,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Upload Speed', 
      value: `${data.bandwidth.upload.toFixed(1)} Mbps`,
      icon: TrendingUpIcon,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Latency',
      value: `${data.latency.toFixed(0)} ms`,
      icon: WifiIcon,
      color: data.latency > 30 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Packet Loss',
      value: `${data.packetLoss.toFixed(2)}%`,
      icon: AlertTriangleIcon,
      color: data.packetLoss > 1 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}