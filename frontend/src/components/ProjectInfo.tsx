'use client'

import { useState, useEffect } from 'react'
import { Info, CheckCircle, Shield, Activity, Zap, Users, TrendingUp, Target, Award } from 'lucide-react'

interface ProjectInfoData {
  project_name: string
  version: string
  description: string
  why_useful: any
  metrics: any
  demo_highlights: string[]
  value_proposition: string
}

export function ProjectInfo() {
  const [projectInfo, setProjectInfo] = useState<ProjectInfoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'benefits' | 'scenarios' | 'users'>('benefits')

  useEffect(() => {
    fetch('http://localhost:8000/api/project-info')
      .then(res => res.json())
      .then(data => {
        setProjectInfo(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load project info:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!projectInfo) {
    return (
      <div className="metric-card text-center">
        <p className="text-muted-foreground">Failed to load project information</p>
      </div>
    )
  }

  const getIconForBenefit = (index: number) => {
    const icons = [Activity, Shield, TrendingUp, Target, Zap, Award]
    const Icon = icons[index % icons.length]
    return <Icon className="w-6 h-6" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="metric-card bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{projectInfo.project_name}</h1>
            <p className="text-blue-100 text-lg mb-4">{projectInfo.description}</p>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              Version {projectInfo.version}
            </div>
          </div>
          <Info className="w-12 h-12 text-blue-100" />
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Devices Monitored</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{projectInfo.metrics.devices_monitored.split('+')[0]}+</p>
            </div>
            <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="metric-card bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Update Frequency</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">3s</p>
            </div>
            <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="metric-card bg-purple-50 dark:bg-purple-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Latency</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{projectInfo.metrics.latency}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="metric-card bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Features</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{projectInfo.metrics.features_available}</p>
            </div>
            <Award className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="metric-card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="bg-purple-600 rounded-full p-3">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-2">Why This Project Matters</h3>
            <p className="text-foreground/80 leading-relaxed">{projectInfo.value_proposition}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="metric-card">
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('benefits')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'benefits'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Key Benefits
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'scenarios'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Real-World Use Cases
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Who Benefits
          </button>
        </div>

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectInfo.why_useful.key_benefits.map((benefit: any, index: number) => (
              <div key={index} className="bg-muted rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-lg p-2 text-primary">
                    {getIconForBenefit(index)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-2">{benefit.benefit}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{benefit.description}</p>
                    <div className="bg-background rounded p-2 mb-2">
                      <p className="text-xs font-medium text-foreground">
                        <span className="text-green-600 dark:text-green-400">Impact:</span> {benefit.impact}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                      <p className="text-xs text-foreground">
                        <span className="font-medium">Use Case:</span> {benefit.use_case}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="space-y-4">
            {projectInfo.why_useful.real_world_applications.map((app: any, index: number) => (
              <div key={index} className="bg-muted rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h4 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  {app.scenario}
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="bg-red-100 dark:bg-red-900/20 rounded px-3 py-1 text-sm font-medium text-red-700 dark:text-red-400 self-start">
                      Problem
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">{app.problem}</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/20 rounded px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 self-start">
                      Solution
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">{app.solution}</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-green-100 dark:bg-green-900/20 rounded px-3 py-1 text-sm font-medium text-green-700 dark:text-green-400 self-start">
                      Result
                    </div>
                    <p className="text-sm text-foreground font-medium flex-1">{app.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectInfo.why_useful.who_benefits.map((user: any, index: number) => (
              <div key={index} className="bg-muted rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-bold text-foreground mb-2">{user.role}</h4>
                    <p className="text-sm text-muted-foreground">{user.benefit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo Highlights */}
      <div className="metric-card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
          Demo Highlights - See It In Action!
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projectInfo.demo_highlights.map((highlight: string, index: number) => (
            <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-lg p-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{highlight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="metric-card">
        <h3 className="text-xl font-bold text-foreground mb-4">Competitive Advantages</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {projectInfo.why_useful.competitive_advantages.map((advantage: string, index: number) => (
            <div key={index} className="flex items-center gap-2 bg-muted rounded-lg p-3">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-xs font-medium text-foreground">{advantage}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
