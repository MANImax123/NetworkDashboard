'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ProtocolData {
  name: string
  total_bytes: number
  bytes_sent: number
  bytes_recv: number
  total_packets: number
  packets_sent: number
  packets_recv: number
  connections: number
  percentage: number
}

interface ProtocolInsightsProps {
  data: any // More flexible to handle different data structures
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ProtocolInsights({ data }: ProtocolInsightsProps) {
  if (!data?.top_protocols) {
    return (
      <div className="metric-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Protocol Analysis</h3>
        <p className="text-muted-foreground">Loading protocol data...</p>
      </div>
    )
  }

  const pieData = data.top_protocols.map((protocol: any, index: number) => ({
    name: protocol.name,
    value: protocol.total_bytes,
    percentage: protocol.percentage,
    color: COLORS[index % COLORS.length]
  }))

  const trafficData = [
    {
      name: 'Incoming',
      packets: data.traffic_breakdown.incoming_packets,
      bytes: Math.round(data.traffic_breakdown.incoming_bytes / 1024 / 1024)
    },
    {
      name: 'Outgoing', 
      packets: data.traffic_breakdown.outgoing_packets,
      bytes: Math.round(data.traffic_breakdown.outgoing_bytes / 1024 / 1024)
    }
  ]

  return (
    <div className="space-y-6">
      {/* Protocol Distribution */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Protocols by Traffic</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${(value / 1024 / 1024).toFixed(1)} MB`, 'Traffic']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Protocol Details */}
          <div className="space-y-3">
            {data.top_protocols.map((protocol: any, index: number) => (
              <div key={protocol.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium text-foreground">{protocol.name}</p>
                    <p className="text-sm text-muted-foreground">{protocol.connections} connections</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{(protocol.total_bytes / 1024 / 1024).toFixed(1)} MB</p>
                  <p className="text-sm text-muted-foreground">{protocol.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Direction Analysis */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Traffic Direction Analysis</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="packets" fill="#8884d8" name="Packets" />
              <Bar yAxisId="right" dataKey="bytes" fill="#82ca9d" name="Data (MB)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Protocol Breakdown Table */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Protocol Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-sm font-medium text-muted-foreground">Protocol</th>
                <th className="text-left py-2 text-sm font-medium text-muted-foreground">Sent</th>
                <th className="text-left py-2 text-sm font-medium text-muted-foreground">Received</th>
                <th className="text-left py-2 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left py-2 text-sm font-medium text-muted-foreground">Connections</th>
              </tr>
            </thead>
            <tbody>
              {data.top_protocols.map((protocol: any) => (
                <tr key={protocol.name} className="border-b border-border last:border-b-0">
                  <td className="py-3 font-medium text-foreground">{protocol.name}</td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {(protocol.bytes_sent / 1024 / 1024).toFixed(1)} MB
                    <br />
                    <span className="text-xs">{protocol.packets_sent.toLocaleString()} packets</span>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {(protocol.bytes_recv / 1024 / 1024).toFixed(1)} MB
                    <br />
                    <span className="text-xs">{protocol.packets_recv.toLocaleString()} packets</span>
                  </td>
                  <td className="py-3 text-sm font-medium text-foreground">
                    {(protocol.total_bytes / 1024 / 1024).toFixed(1)} MB
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{protocol.connections}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}