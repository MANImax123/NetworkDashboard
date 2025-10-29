'use client'

import { AlertTriangleIcon, XIcon } from 'lucide-react'
import { format } from 'date-fns'

interface Alert {
  id: string
  type: string
  message: string
  timestamp: string
}

interface AlertPanelProps {
  alerts: Alert[]
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const getAlertClass = (type: string) => {
    switch (type) {
      case 'error':
        return 'alert-card alert-error'
      case 'warning':
        return 'alert-card alert-warning'
      case 'success':
        return 'alert-card alert-success'
      default:
        return 'alert-card alert-warning'
    }
  }

  return (
    <div className="metric-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Network Alerts</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className={getAlertClass(alert.type)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}
                    </p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AlertTriangleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No alerts at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}