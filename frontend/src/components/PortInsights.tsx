'use client'

import { useState } from 'react'
import { Shield, AlertTriangle, Network, Server } from 'lucide-react'

interface PortData {
  port: number
  service: string
  count: number
  is_suspicious: boolean
  bytes: number
}

interface SuspiciousActivity {
  port: number
  service: string
  count: number
  severity: string
}

interface ServiceBreakdown {
  web_traffic: number
  secure_services: number
  database_services: number
  remote_access: number
}

interface PortInsightsProps {
  data: {
    top_source_ports: PortData[]
    suspicious_activity: SuspiciousActivity[]
    service_breakdown: ServiceBreakdown
  }
}

export function PortInsights({ data }: PortInsightsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!data?.top_source_ports) {
    return (
      <div className="metric-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Port & Service Analysis</h3>
        <p className="text-muted-foreground">Loading port data...</p>
      </div>
    )
  }

  const totalTraffic = data.service_breakdown.web_traffic + 
                      data.service_breakdown.secure_services + 
                      data.service_breakdown.database_services + 
                      data.service_breakdown.remote_access

  const serviceData = [
    { name: 'Web Traffic', count: data.service_breakdown.web_traffic, color: 'bg-blue-500', icon: Network },
    { name: 'Secure Services', count: data.service_breakdown.secure_services, color: 'bg-green-500', icon: Shield },
    { name: 'Database Services', count: data.service_breakdown.database_services, color: 'bg-purple-500', icon: Server },
    { name: 'Remote Access', count: data.service_breakdown.remote_access, color: 'bg-orange-500', icon: AlertTriangle }
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="metric-card">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'ports', label: 'Top Ports' },
            { id: 'security', label: 'Security' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Service Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {serviceData.map((service) => {
                const Icon = service.icon
                const percentage = totalTraffic > 0 ? (service.count / totalTraffic * 100) : 0
                return (
                  <div key={service.name} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                    <h4 className="font-medium text-foreground">{service.name}</h4>
                    <p className="text-2xl font-bold text-foreground">{service.count}</p>
                  </div>
                )
              })}
            </div>

            {/* Service Distribution Bar */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Traffic Distribution</h4>
              <div className="flex h-4 bg-muted rounded-lg overflow-hidden">
                {serviceData.map((service, index) => {
                  const percentage = totalTraffic > 0 ? (service.count / totalTraffic * 100) : 0
                  return (
                    <div
                      key={index}
                      className={`${service.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                      title={`${service.name}: ${service.count} connections (${percentage.toFixed(1)}%)`}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                {serviceData.map((service, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${service.color} rounded`} />
                    <span className="text-muted-foreground">{service.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Ports Tab */}
        {activeTab === 'ports' && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Active Ports</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Port</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Service</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Connections</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Data Usage</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_source_ports.map((port) => (
                    <tr key={port.port} className="border-b border-border last:border-b-0">
                      <td className="py-3 font-mono font-medium text-foreground">{port.port}</td>
                      <td className="py-3 text-sm text-foreground">{port.service}</td>
                      <td className="py-3 text-sm text-muted-foreground">{port.count}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {(port.bytes / 1024 / 1024).toFixed(1)} MB
                      </td>
                      <td className="py-3">
                        {port.is_suspicious ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Suspicious
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <Shield className="w-3 h-3 mr-1" />
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Security Analysis</h3>
            
            {data.suspicious_activity.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <h4 className="font-medium text-red-800 dark:text-red-200">
                      Suspicious Port Activity Detected
                    </h4>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    {data.suspicious_activity.length} suspicious port(s) detected. Immediate attention required.
                  </p>
                </div>

                <div className="space-y-3">
                  {data.suspicious_activity.map((activity, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="font-mono font-medium text-foreground">
                            Port {activity.port}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {activity.service}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.severity === 'HIGH' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {activity.severity}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.count} connections detected
                      </div>
                      <div className="mt-2 text-sm text-foreground">
                        Recommendations:
                        <ul className="list-disc list-inside mt-1 text-muted-foreground">
                          <li>Monitor traffic on this port closely</li>
                          <li>Verify if this service should be running</li>
                          <li>Consider blocking if unauthorized</li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">No Security Threats Detected</h4>
                <p className="text-sm text-muted-foreground">
                  All active ports are running expected services. Continue monitoring.
                </p>
              </div>
            )}

            {/* Security Recommendations */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Security Best Practices</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Regularly scan for open ports and unnecessary services</li>
                <li>• Implement firewall rules to block suspicious ports</li>
                <li>• Monitor port activity for unusual patterns</li>
                <li>• Keep services updated and properly configured</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}