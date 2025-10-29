from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import random
from datetime import datetime
from typing import List, Dict, Any
import uvicorn
from app.services.advanced_monitor import AdvancedNetworkMonitor
from app.services.network_ai import NetworkAI

app = FastAPI(
    title="Advanced Network Performance Monitor API",
    description="Enterprise-grade real-time network monitoring with AI-powered analytics",
    version="2.0.0"
)

# Initialize advanced monitoring services
advanced_monitor = AdvancedNetworkMonitor()
network_ai = NetworkAI()
historical_data = []  # Store for AI analysis

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
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

# Advanced Network Analysis Endpoints

@app.get("/api/protocols")
async def get_protocol_insights():
    """Get protocol-level network insights"""
    try:
        insights = await advanced_monitor.get_protocol_insights()
        return insights
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get protocol insights: {str(e)}"}
        )

@app.get("/api/ports")
async def get_port_insights():
    """Get port and service tracking information"""
    try:
        insights = await advanced_monitor.get_port_service_insights()
        return insights
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get port insights: {str(e)}"}
        )

@app.get("/api/devices/advanced")
async def get_advanced_devices():
    """Get advanced device information with ARP scanning"""
    try:
        devices = await advanced_monitor.scan_network_devices()
        return devices
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get advanced devices: {str(e)}"}
        )

@app.get("/api/topology")
async def get_network_topology():
    """Get network topology information"""
    try:
        topology = await advanced_monitor.get_network_topology()
        return topology
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get network topology: {str(e)}"}
        )

# AI-Powered Analytics Endpoints

@app.get("/api/ai/anomalies")
async def get_anomaly_detection():
    """Get AI-powered anomaly detection results"""
    try:
        current_metrics = generate_mock_data()
        anomalies = await network_ai.detect_anomalies(current_metrics)
        return anomalies
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to detect anomalies: {str(e)}"}
        )

@app.get("/api/ai/predictions")
async def get_network_predictions():
    """Get AI-powered network performance predictions"""
    try:
        predictions = await network_ai.predict_network_trends(historical_data)
        return predictions
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to generate predictions: {str(e)}"}
        )

@app.get("/api/ai/device-analysis")
async def get_device_behavior_analysis():
    """Get AI-powered device behavior analysis"""
    try:
        devices = await advanced_monitor.scan_network_devices()
        analysis = await network_ai.analyze_device_behavior(devices)
        return analysis
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to analyze device behavior: {str(e)}"}
        )

@app.get("/api/security/overview")
async def get_security_overview():
    """Get comprehensive security overview"""
    try:
        devices = await advanced_monitor.scan_network_devices()
        port_insights = await advanced_monitor.get_port_service_insights()
        anomalies = await network_ai.detect_anomalies(generate_mock_data())
        
        security_overview = {
            "threat_level": "MEDIUM",
            "total_devices": len(devices),
            "suspicious_devices": len([d for d in devices if d["status"] == "suspicious"]),
            "open_suspicious_ports": len(port_insights["suspicious_activity"]),
            "recent_anomalies": len(anomalies["anomalies"]),
            "security_score": 75,
            "recommendations": [
                "Monitor suspicious device activity closely",
                "Review and close unnecessary open ports",
                "Implement network segmentation for critical assets",
                "Enable intrusion detection system alerts"
            ],
            "recent_threats": [
                {
                    "type": "Suspicious Device",
                    "description": "Unknown device detected on network",
                    "severity": "MEDIUM",
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "type": "Port Scan",
                    "description": "Multiple port scan attempts detected",
                    "severity": "LOW",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        }
        
        return security_overview
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get security overview: {str(e)}"}
        )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Generate current data
            current_metrics = generate_mock_data()
            devices = await advanced_monitor.scan_network_devices()
            alerts = generate_mock_alerts()
            
            # Store for AI analysis
            historical_data.append(current_metrics)
            if len(historical_data) > 1000:  # Keep last 1000 records
                historical_data.pop(0)
            
            # Get AI insights
            try:
                anomalies = await network_ai.detect_anomalies(current_metrics) if len(historical_data) > 10 else {"anomalies": []}
                protocol_insights = await advanced_monitor.get_protocol_insights()
                port_insights = await advanced_monitor.get_port_service_insights()
            except Exception as e:
                print(f"AI analysis error: {e}")
                anomalies = {"anomalies": []}
                protocol_insights = {}
                port_insights = {}
            
            # Send comprehensive data
            websocket_data = {
                "timestamp": datetime.now().isoformat(),
                "metrics": current_metrics,
                "devices": devices,
                "alerts": alerts,
                "anomalies": anomalies,
                "protocols": protocol_insights,
                "ports": port_insights,
                "ai_insights": {
                    "risk_level": anomalies.get("risk_level", "LOW"),
                    "recommendations": anomalies.get("recommendations", []),
                    "total_anomalies": len(anomalies.get("anomalies", []))
                }
            }
            
            await websocket.send_text(json.dumps(websocket_data))
            await asyncio.sleep(3)  # Update every 3 seconds for more data
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