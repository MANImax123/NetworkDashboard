'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import { Brain, TrendingUp, AlertTriangle, Shield, Activity, Zap, Target, Clock } from 'lucide-react'

interface AnomalyDetection {
  timestamp: string
  metric: string
  value: number
  expected_range: [number, number]
  severity: string
  description: string
  confidence: number
}

interface PredictiveInsight {
  metric: string
  prediction: number
  timeframe: string
  confidence: number
  trend: string
  recommendation: string
}

interface TrafficPattern {
  pattern_type: string
  description: string
  frequency: string
  impact: string
  typical_times: string[]
  bandwidth_usage: number
}

interface SecurityThreat {
  threat_type: string
  severity: string
  source_ip: string
  target_ip: string
  description: string
  confidence: number
  timestamp: string
  mitigation: string
}

interface AIInsightsData {
  anomalies: AnomalyDetection[]
  predictions: PredictiveInsight[]
  traffic_patterns: TrafficPattern[]
  security_threats: SecurityThreat[]
  network_health_score: number
  optimization_suggestions: string[]
  performance_trends: Array<{
    timestamp: string
    bandwidth: number
    latency: number
    packet_loss: number
    health_score: number
  }>
}

interface AIInsightsDashboardProps {
  data: AIInsightsData
}

export function AIInsightsDashboard({ data }: AIInsightsDashboardProps) {
  const [activeTab, setActiveTab] = useState('anomalies')

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const criticalAnomalies = data.anomalies.filter(a => a.severity === 'critical').length
  const highSeverityThreats = data.security_threats.filter(t => t.severity === 'high' || t.severity === 'critical').length

  return (
    <div className="space-y-6">
      {/* AI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Network Health</p>
              <p className={`text-2xl font-bold ${getHealthScoreColor(data.network_health_score)}`}>
                {data.network_health_score}%
              </p>
            </div>
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Anomalies</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalAnomalies}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Security Threats</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{highSeverityThreats}</p>
            </div>
            <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patterns Detected</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.traffic_patterns.length}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Performance Trends Chart */}
      <div className="metric-card">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Network Performance Trends
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.performance_trends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="timestamp" 
                className="text-muted-foreground text-xs"
                tickFormatter={(value: any) => new Date(value).toLocaleTimeString()}
              />
              <YAxis className="text-muted-foreground text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                labelFormatter={(value: any) => new Date(value).toLocaleString()}
              />
              <Area 
                type="monotone" 
                dataKey="health_score" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.2}
                name="Health Score (%)"
              />
              <Area 
                type="monotone" 
                dataKey="bandwidth" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.2}
                name="Bandwidth (Mbps)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="metric-card">
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
          {[
            { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle },
            { id: 'predictions', label: 'Predictive Insights', icon: TrendingUp },
            { id: 'patterns', label: 'Traffic Patterns', icon: Activity },
            { id: 'security', label: 'Security Threats', icon: Shield }
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
        </div>

        {/* Anomaly Detection Tab */}
        {activeTab === 'anomalies' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Detected Anomalies</h4>
            {data.anomalies.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No anomalies detected. Your network is performing normally.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.anomalies.map((anomaly, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                        <span className="font-medium text-foreground">{anomaly.metric}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(anomaly.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Value: <span className="font-mono text-foreground">{anomaly.value}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Expected: <span className="font-mono text-foreground">
                          {anomaly.expected_range[0]} - {anomaly.expected_range[1]}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Confidence: <span className="font-medium text-foreground">{anomaly.confidence}%</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Predictive Insights Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Predictive Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.predictions.map((prediction, index) => (
                <div key={index} className="border border-border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-foreground">{prediction.metric}</h5>
                    {getTrendIcon(prediction.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Predicted Value:</span>
                      <span className="text-sm font-medium text-foreground">{prediction.prediction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Timeframe:</span>
                      <span className="text-sm font-medium text-foreground">{prediction.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <span className="text-sm font-medium text-foreground">{prediction.confidence}%</span>
                    </div>
                    <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
                      <strong>Recommendation:</strong> {prediction.recommendation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traffic Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Traffic Patterns</h4>
            <div className="space-y-3">
              {data.traffic_patterns.map((pattern, index) => (
                <div key={index} className="border border-border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-foreground">{pattern.pattern_type}</h5>
                    <span className="text-sm text-muted-foreground">{pattern.frequency}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Impact: </span>
                      <span className="font-medium text-foreground">{pattern.impact}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bandwidth: </span>
                      <span className="font-medium text-foreground">{pattern.bandwidth_usage} Mbps</span>
                    </div>
                  </div>
                  {pattern.typical_times.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Typical times: </span>
                      <span className="font-mono text-foreground">{pattern.typical_times.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Threats Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Security Threats</h4>
            {data.security_threats.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No security threats detected. Your network is secure.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.security_threats.map((threat, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                          {threat.severity.toUpperCase()}
                        </span>
                        <span className="font-medium text-foreground">{threat.threat_type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(threat.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{threat.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                      <div>
                        <span className="text-muted-foreground">Source IP: </span>
                        <span className="font-mono text-foreground">{threat.source_ip}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target IP: </span>
                        <span className="font-mono text-foreground">{threat.target_ip}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Confidence: </span>
                      <span className="font-medium text-foreground">{threat.confidence}%</span>
                    </div>
                    <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                      <strong>Mitigation:</strong> {threat.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optimization Suggestions */}
      {data.optimization_suggestions.length > 0 && (
        <div className="metric-card">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            AI Optimization Suggestions
          </h3>
          <div className="space-y-2">
            {data.optimization_suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-foreground">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}