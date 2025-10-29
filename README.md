# Network Performance Monitor

A real-time network monitoring dashboard that visualizes network performance data including bandwidth usage, latency, packet loss, connected devices, and network health alerts.

## 🌟 Features

- **Real-time Network Monitoring**: Live tracking of bandwidth, latency, and packet loss
- **Interactive Dashboard**: Beautiful charts and visualizations using Chart.js
- **Device Discovery**: Automatic detection and listing of connected network devices
- **Smart Alerts**: Threshold-based alerts for unusual network behavior
- **Historical Data**: Track performance trends over time
- **Dark/Light Theme**: Modern UI with theme switching
- **WebSocket Communication**: Real-time data updates without page refresh
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js + react-chartjs-2** - Interactive charts
- **Lucide React** - Beautiful icons
- **Socket.io Client** - Real-time communication

### Backend
- **FastAPI** - Modern Python web framework
- **WebSockets** - Real-time bidirectional communication
- **SQLite** - Lightweight database for metrics storage
- **psutil** - System and network monitoring
- **ping3** - Network latency measurement
- **uvicorn** - ASGI server

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd network-monitor
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend will start on `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Access the Dashboard

Open your browser and navigate to `http://localhost:3000` to view the network monitoring dashboard.

## 📊 Dashboard Overview

### Main Metrics Cards
- **Download Speed**: Current download bandwidth in Mbps
- **Upload Speed**: Current upload bandwidth in Mbps  
- **Latency**: Network response time in milliseconds
- **Packet Loss**: Percentage of lost network packets

### Real-time Charts
- Interactive line charts showing bandwidth and latency trends over time
- Dual Y-axis for different metric scales
- Live updates every 2 seconds

### Device List
- Displays all detected network devices
- Shows IP address, MAC address, hostname, and online status
- Real-time status updates

### Alert Panel
- Shows network performance alerts when thresholds are exceeded
- Color-coded by severity (warning, error, success)
- Timestamps for when issues occurred

## ⚙️ Configuration

### Backend Configuration

Edit the threshold values in `backend/app/models/network_data.py`:

```python
class NetworkConfig(BaseModel):
    bandwidth_threshold_mbps: float = 80.0      # Alert when bandwidth > 80 Mbps
    latency_threshold_ms: float = 100.0         # Alert when latency > 100ms
    packet_loss_threshold_percent: float = 5.0  # Alert when packet loss > 5%
    monitoring_interval_seconds: int = 2        # Data collection interval
```

### Frontend Configuration

API endpoint configuration is in `frontend/next.config.js`:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/api/:path*',
    },
  ]
}
```

## 🔧 API Endpoints

### REST API
- `GET /` - API health check
- `GET /api/health` - Service health status
- `GET /api/network/current` - Current network metrics
- `GET /api/network/history?hours=24` - Historical metrics
- `GET /api/devices` - Connected devices list
- `GET /api/alerts` - Active network alerts

### WebSocket
- `WS /ws` - Real-time data stream

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Test API endpoints
curl http://localhost:8000/api/health
curl http://localhost:8000/api/network/current
curl http://localhost:8000/api/devices
curl http://localhost:8000/api/alerts
```

### Frontend Testing

```bash
cd frontend

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📦 Production Deployment

### Backend Deployment

```bash
cd backend

# Install production dependencies
pip install -r requirements.txt

# Run with production settings
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Deployment

```bash
cd frontend

# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Using Docker (Optional)

Create `Dockerfile` for backend:

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `Dockerfile` for frontend:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Monitoring Features

### Real-time Metrics
- **Bandwidth Monitoring**: Tracks upload/download speeds using psutil
- **Latency Measurement**: Pings external servers (8.8.8.8) for latency data
- **Packet Loss Detection**: Calculates packet loss percentage
- **Device Discovery**: Scans network interfaces for connected devices

### Alert System
- **Configurable Thresholds**: Set custom limits for different metrics
- **Multiple Alert Types**: Warning, error, and info level alerts
- **Historical Tracking**: Store and retrieve alert history
- **Auto-Resolution**: Alerts can be marked as resolved

### Data Storage
- **SQLite Database**: Lightweight storage for historical data
- **Automatic Cleanup**: Removes old data to manage storage
- **Indexed Queries**: Optimized database queries for performance

## 🎨 Customization

### Themes
The dashboard supports both light and dark themes. Users can toggle between themes using the button in the header.

### Charts
Charts are built with Chart.js and can be customized by modifying the chart options in the frontend components.

### Styling
The UI uses TailwindCSS utility classes for styling. Custom styles can be added to the `globals.css` file.

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting**:
   - Check if Python 3.8+ is installed
   - Verify all dependencies are installed: `pip install -r requirements.txt`
   - Check if port 8000 is available

2. **Frontend not connecting to backend**:
   - Ensure backend is running on port 8000
   - Check CORS settings in `main.py`
   - Verify API proxy configuration in `next.config.js`

3. **No network data showing**:
   - Check if the application has network monitoring permissions
   - Verify that psutil can access network interfaces
   - Check console logs for error messages

4. **WebSocket connection issues**:
   - Ensure WebSocket port is not blocked by firewall
   - Check browser console for WebSocket errors
   - Verify the WebSocket endpoint URL

### Performance Optimization

- Reduce monitoring interval for better performance on slower systems
- Limit historical data retention to manage database size
- Use production builds for better frontend performance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you encounter any issues or have questions, please create an issue in the project repository.

---

**Happy Monitoring!** 🚀📊