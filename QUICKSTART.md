# Quick Start Guide

## 🚀 Getting Started (5 minutes)

### Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- Terminal/Command Prompt access

### Step 1: Setup Backend
```bash
cd backend
pip install fastapi uvicorn websockets
python simple_server.py
```
Backend will be available at: http://localhost:8000

### Step 2: Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: http://localhost:3000

### Step 3: Open Dashboard
Navigate to: http://localhost:3000

## 🎯 What You'll See

- **Real-time metrics**: Bandwidth, latency, packet loss
- **Interactive charts**: Live updating network performance graphs
- **Device monitoring**: Connected devices with status
- **Smart alerts**: Notifications for network issues
- **Dark/Light theme**: Toggle between themes

## 🔧 For Development

### Backend Endpoints:
- `GET /api/health` - API health check
- `GET /api/network/current` - Current network metrics
- `GET /api/devices` - Connected devices
- `GET /api/alerts` - Network alerts
- `WS /ws` - WebSocket for real-time updates

### Frontend Features:
- Next.js 14 with App Router
- TailwindCSS for styling
- Chart.js for visualizations
- WebSocket integration
- Responsive design

## 🐛 Troubleshooting

### Backend Issues:
- Ensure Python 3.8+ is installed
- Check if port 8000 is available
- Install dependencies: `pip install fastapi uvicorn websockets`

### Frontend Issues:
- Ensure Node.js 18+ is installed  
- Check if port 3000 is available
- Install dependencies: `npm install`
- Clear cache: `npm run build`

### Connection Issues:
- Verify both servers are running
- Check firewall settings
- Ensure CORS is configured properly

## 📊 Demo Data

The application uses realistic mock data for demonstration:
- Bandwidth: 5-100 Mbps range
- Latency: 15-45ms range  
- Packet Loss: 0-2% range
- Multiple device types with rotating status

## 🔄 Next Steps

1. **Real Data Integration**: Replace mock data with actual network monitoring
2. **Database Storage**: Add SQLite/PostgreSQL for historical data
3. **Authentication**: Implement user login and permissions
4. **Deployment**: Deploy to cloud platforms (AWS, Azure, GCP)
5. **Monitoring**: Add more network metrics and devices

Enjoy monitoring your network! 🚀