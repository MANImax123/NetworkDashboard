from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
from datetime import datetime
from typing import List, Dict, Any
import uvicorn
from contextlib import asynccontextmanager

from app.services.network_monitor import NetworkMonitor
from app.services.database import DatabaseService
from app.models.network_data import NetworkMetrics, Device, Alert

# Global instances
network_monitor = NetworkMonitor()
db_service = DatabaseService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db_service.init_database()
    asyncio.create_task(network_monitor.start_monitoring())
    asyncio.create_task(store_metrics_periodically())
    yield
    # Shutdown
    await network_monitor.stop_monitoring()
    await db_service.close()

app = FastAPI(
    title="Network Performance Monitor API",
    description="Real-time network monitoring and analytics",
    version="1.0.0",
    lifespan=lifespan
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
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove broken connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Network Performance Monitor API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/api/network/current")
async def get_current_metrics():
    """Get current network metrics"""
    try:
        metrics = await network_monitor.get_current_metrics()
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
        history = await db_service.get_metrics_history(hours)
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
        devices = await network_monitor.get_connected_devices()
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
        alerts = await db_service.get_active_alerts()
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
                "metrics": await network_monitor.get_current_metrics(),
                "devices": await network_monitor.get_connected_devices(),
                "alerts": await db_service.get_active_alerts(),
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send_text(json.dumps(current_data))
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Background task to store metrics
async def store_metrics_periodically():
    while True:
        try:
            metrics = await network_monitor.get_current_metrics()
            await db_service.store_metrics(metrics)
            
            # Check for alerts
            alerts = network_monitor.check_thresholds(metrics)
            for alert in alerts:
                await db_service.store_alert(alert)
                
        except Exception as e:
            print(f"Error storing metrics: {e}")
        
        await asyncio.sleep(30)  # Store every 30 seconds

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )