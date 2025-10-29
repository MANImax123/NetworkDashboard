from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class BandwidthData(BaseModel):
    upload: float
    download: float
    timestamp: datetime

class NetworkMetrics(BaseModel):
    bandwidth: BandwidthData
    latency: float
    packet_loss: float
    timestamp: datetime

class Device(BaseModel):
    ip: str
    mac: str
    hostname: str
    status: str
    last_seen: datetime

class Alert(BaseModel):
    id: Optional[str] = None
    type: str  # 'warning', 'error', 'info'
    message: str
    metric_type: str  # 'bandwidth', 'latency', 'packet_loss'
    metric_value: float
    threshold: float
    timestamp: datetime
    resolved: bool = False

class NetworkConfig(BaseModel):
    bandwidth_threshold_mbps: float = 80.0
    latency_threshold_ms: float = 100.0
    packet_loss_threshold_percent: float = 5.0
    monitoring_interval_seconds: int = 2