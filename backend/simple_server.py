from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import random
from datetime import datetime
from typing import List, Dict, Any
import uvicorn

app = FastAPI(
    title="Network Performance Monitor API",
    description="Real-time network monitoring and analytics",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections[:]:  # Copy list to avoid modification during iteration
            try:
                await connection.send_text(message)
            except:
                # Remove broken connections
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

manager = ConnectionManager()

def generate_mock_data():
    """Generate realistic mock network data"""
    return {
        "bandwidth": {
            "upload": round(random.uniform(5, 50), 1),
            "download": round(random.uniform(10, 100), 1),
            "timestamp": datetime.now().isoformat()
        },
        "latency": round(random.uniform(15, 45), 1),
        "packet_loss": round(random.uniform(0, 2), 2),
        "timestamp": datetime.now().isoformat()
    }

def generate_mock_devices():
    """Generate mock device list"""
    return [
        {
            "ip": "192.168.1.100",
            "mac": "00:1B:44:11:3A:B7",
            "hostname": "laptop-001",
            "status": "online",
            "last_seen": datetime.now().isoformat()
        },
        {
            "ip": "192.168.1.101",
            "mac": "00:1B:44:11:3A:B8",
            "hostname": "desktop-002",
            "status": "online",
            "last_seen": datetime.now().isoformat()
        },
        {
            "ip": "192.168.1.102",
            "mac": "00:1B:44:11:3A:B9",
            "hostname": "phone-003",
            "status": random.choice(["online", "offline"]),
            "last_seen": datetime.now().isoformat()
        },
        {
            "ip": "192.168.1.103",
            "mac": "00:1B:44:11:3A:C0",
            "hostname": "tablet-004",
            "status": random.choice(["online", "offline"]),
            "last_seen": datetime.now().isoformat()
        }
    ]

def generate_mock_alerts():
    """Generate mock alerts based on current metrics"""
    alerts = []
    current_time = datetime.now().isoformat()
    
    # Randomly generate alerts
    if random.random() < 0.3:  # 30% chance of high latency alert
        alerts.append({
            "id": f"alert-{int(datetime.now().timestamp())}",
            "type": "warning",
            "message": "High network latency detected",
            "timestamp": current_time
        })
    
    if random.random() < 0.2:  # 20% chance of high bandwidth alert
        alerts.append({
            "id": f"alert-{int(datetime.now().timestamp()) + 1}",
            "type": "warning",
            "message": "High bandwidth usage detected",
            "timestamp": current_time
        })
    
    if random.random() < 0.1:  # 10% chance of packet loss alert
        alerts.append({
            "id": f"alert-{int(datetime.now().timestamp()) + 2}",
            "type": "error",
            "message": "Packet loss detected on network",
            "timestamp": current_time
        })
    
    return alerts

@app.get("/")
async def root():
    return {"message": "Network Performance Monitor API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/network/current")
async def get_current_metrics():
    """Get current network metrics"""
    try:
        metrics = generate_mock_data()
        return metrics
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get current metrics: {str(e)}"}
        )

@app.get("/api/network/history")
async def get_historical_metrics(hours: int = 24):
    """Get historical network metrics"""
    try:
        # Generate mock historical data
        history = []
        for i in range(20):  # Last 20 data points
            timestamp = datetime.now().isoformat()
            history.append({
                "timestamp": timestamp,
                "bandwidth": {
                    "upload": round(random.uniform(5, 50), 1),
                    "download": round(random.uniform(10, 100), 1),
                    "timestamp": timestamp
                },
                "latency": round(random.uniform(15, 45), 1),
                "packet_loss": round(random.uniform(0, 2), 2)
            })
        return history
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get historical data: {str(e)}"}
        )

@app.get("/api/devices")
async def get_devices():
    """Get list of connected devices"""
    try:
        devices = generate_mock_devices()
        return devices
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get devices: {str(e)}"}
        )

@app.get("/api/alerts")
async def get_alerts():
    """Get current alerts"""
    try:
        alerts = generate_mock_alerts()
        return alerts
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get alerts: {str(e)}"}
        )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send current data every 2 seconds
            current_data = {
                "metrics": generate_mock_data(),
                "devices": generate_mock_devices(),
                "alerts": generate_mock_alerts(),
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send_text(json.dumps(current_data))
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(
        "simple_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )