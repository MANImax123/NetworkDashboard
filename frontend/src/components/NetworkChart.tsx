'use client'

import { useState, useEffect, useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface NetworkChartProps {
  data: {
    bandwidth: { upload: number; download: number; timestamp: string }
    latency: number
    packetLoss: number
  }
}

export function NetworkChart({ data }: NetworkChartProps) {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Download (Mbps)',
        data: [] as number[],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Upload (Mbps)',
        data: [] as number[],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Latency (ms)',
        data: [] as number[],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Network Performance Metrics',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Bandwidth (Mbps)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Latency (ms)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  useEffect(() => {
    const now = new Date().toLocaleTimeString()
    
    setChartData(prev => {
      const newLabels = [...prev.labels, now].slice(-20) // Keep last 20 points
      const newDownloadData = [...prev.datasets[0].data, data.bandwidth.download].slice(-20)
      const newUploadData = [...prev.datasets[1].data, data.bandwidth.upload].slice(-20)
      const newLatencyData = [...prev.datasets[2].data, data.latency].slice(-20)

      return {
        labels: newLabels,
        datasets: [
          { ...prev.datasets[0], data: newDownloadData },
          { ...prev.datasets[1], data: newUploadData },
          { ...prev.datasets[2], data: newLatencyData },
        ]
      }
    })
  }, [data])

  return (
    <div className="chart-container">
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}