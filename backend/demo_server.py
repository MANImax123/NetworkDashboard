from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
import json
from datetime import datetime

app = FastAPI(title="Network Monitor Demo Backend")

# Mock devices and attack examples
MOCK_DEVICES = [
    {"ip": "192.168.0.10", "mac": "AA:BB:CC:11:22:33", "hostname": "office-printer", "status": "online"},
    {"ip": "192.168.0.11", "mac": "AA:BB:CC:44:55:66", "hostname": "john-laptop", "status": "online"},
    {"ip": "192.168.0.12", "mac": "AA:BB:CC:77:88:99", "hostname": "guest-phone", "status": "online"},
    {"ip": "192.168.0.200", "mac": "DE:AD:BE:EF:00:01", "hostname": "unknown-device-1", "status": "suspicious"},
    {"ip": "192.168.0.201", "mac": "DE:AD:BE:EF:00:02", "hostname": "unknown-device-2", "status": "suspicious"}
]

MOCK_ALERTS = [
    {"id": "A-1", "type": "port_scan", "message": "Port scanning detected from 192.168.0.200", "timestamp": datetime.now().isoformat()},
    {"id": "A-2", "type": "malware_beacon", "message": "Suspicious outbound traffic from 192.168.0.201", "timestamp": datetime.now().isoformat()}
]

# Simple REST endpoints for demo
@app.get("/api/devices")
async def get_devices():
    return JSONResponse({"devices": MOCK_DEVICES})

@app.get("/api/alerts")
async def get_alerts():
    return JSONResponse({"alerts": MOCK_ALERTS})

@app.get("/api/demo-info")
async def demo_info():
    return {
        "title": "Demo Backend for Network Monitor",
        "purpose": "Serve fake devices and alerts for presentation/demos",
        "how_to_use": "Run this server instead of main.py during demos. Connect frontend to ws://localhost:8001/ws or visit /api/devices to see mock data." 
    }

# WebSocket endpoint that streams mock data (including simulated attack changes)
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print("Demo WebSocket: client connected")
    try:
        counter = 0
        while True:
            # Alternate and update timestamps to simulate live changes
            for a in MOCK_ALERTS:
                a["timestamp"] = datetime.now().isoformat()
            payload = {
                "timestamp": datetime.now().isoformat(),
                "devices": MOCK_DEVICES,
                "alerts": MOCK_ALERTS,
                "demo_note": "This is mock data for demo. Devices with status 'suspicious' highlight threats."
            }
            await ws.send_text(json.dumps(payload))
            counter += 1

            # Simulate a threat escalation every 5 sends
            if counter % 5 == 0:
                MOCK_ALERTS.append({
                    "id": f"A-{len(MOCK_ALERTS)+1}",
                    "type": "unauthorized_access",
                    "message": f"Unauthorized login attempt on {MOCK_DEVICES[0]['ip']}",
                    "timestamp": datetime.now().isoformat()
                })
                # flip a device to suspicious to demo dynamic change
                MOCK_DEVICES[0]["status"] = "suspicious"

            await asyncio.sleep(2)  # faster updates for demo
    except WebSocketDisconnect:
        print("Demo WebSocket: client disconnected")
    except Exception as e:
        print("Demo WebSocket error:", e)

if __name__ == '__main__':
    # Run on a separate port so you can switch to it during demo
    uvicorn.run(app, host="0.0.0.0", port=8001)
