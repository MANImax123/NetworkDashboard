import sqlite3
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
import uuid

class DatabaseService:
    def __init__(self, db_path: str = "network_monitor.db"):
        self.db_path = db_path
        
    async def init_database(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS network_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME NOT NULL,
                upload_mbps REAL NOT NULL,
                download_mbps REAL NOT NULL,
                latency_ms REAL NOT NULL,
                packet_loss_percent REAL NOT NULL
            )
        ''')
        
        # Create devices table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT NOT NULL,
                mac_address TEXT NOT NULL,
                hostname TEXT NOT NULL,
                status TEXT NOT NULL,
                last_seen DATETIME NOT NULL,
                UNIQUE(ip_address, mac_address)
            )
        ''')
        
        # Create alerts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                metric_type TEXT NOT NULL,
                metric_value REAL NOT NULL,
                threshold_value REAL NOT NULL,
                timestamp DATETIME NOT NULL,
                resolved BOOLEAN DEFAULT FALSE
            )
        ''')
        
        # Create indexes for better performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON network_metrics(timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_devices_ip ON devices(ip_address)')
        
        conn.commit()
        conn.close()
        
    async def store_metrics(self, metrics: Dict[str, Any]):
        """Store network metrics in the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO network_metrics 
                (timestamp, upload_mbps, download_mbps, latency_ms, packet_loss_percent)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                datetime.now(),
                metrics["bandwidth"]["upload"],
                metrics["bandwidth"]["download"],
                metrics["latency"],
                metrics["packet_loss"]
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error storing metrics: {e}")
    
    async def get_metrics_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get historical metrics from the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            since_time = datetime.now() - timedelta(hours=hours)
            
            cursor.execute('''
                SELECT timestamp, upload_mbps, download_mbps, latency_ms, packet_loss_percent
                FROM network_metrics
                WHERE timestamp >= ?
                ORDER BY timestamp DESC
                LIMIT 1000
            ''', (since_time,))
            
            rows = cursor.fetchall()
            conn.close()
            
            history = []
            for row in rows:
                history.append({
                    "timestamp": row[0],
                    "bandwidth": {
                        "upload": row[1],
                        "download": row[2],
                        "timestamp": row[0]
                    },
                    "latency": row[3],
                    "packet_loss": row[4]
                })
            
            return history
            
        except Exception as e:
            print(f"Error getting metrics history: {e}")
            return []
    
    async def store_alert(self, alert: Dict[str, Any]):
        """Store an alert in the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            alert_id = str(uuid.uuid4())
            
            cursor.execute('''
                INSERT OR REPLACE INTO alerts 
                (id, type, message, metric_type, metric_value, threshold_value, timestamp, resolved)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                alert_id,
                alert["type"],
                alert["message"],
                alert["metric_type"],
                alert["metric_value"],
                alert["threshold"],
                datetime.now(),
                False
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error storing alert: {e}")
    
    async def get_active_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get active alerts from the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get alerts from the last 24 hours
            since_time = datetime.now() - timedelta(hours=24)
            
            cursor.execute('''
                SELECT id, type, message, metric_type, metric_value, threshold_value, timestamp, resolved
                FROM alerts
                WHERE timestamp >= ? AND resolved = FALSE
                ORDER BY timestamp DESC
                LIMIT ?
            ''', (since_time, limit))
            
            rows = cursor.fetchall()
            conn.close()
            
            alerts = []
            for row in rows:
                alerts.append({
                    "id": row[0],
                    "type": row[1],
                    "message": row[2],
                    "metric_type": row[3],
                    "metric_value": row[4],
                    "threshold": row[5],
                    "timestamp": row[6],
                    "resolved": bool(row[7])
                })
            
            return alerts
            
        except Exception as e:
            print(f"Error getting active alerts: {e}")
            return []
    
    async def resolve_alert(self, alert_id: str):
        """Mark an alert as resolved"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE alerts 
                SET resolved = TRUE 
                WHERE id = ?
            ''', (alert_id,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error resolving alert: {e}")
    
    async def store_device(self, device: Dict[str, Any]):
        """Store or update device information"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO devices 
                (ip_address, mac_address, hostname, status, last_seen)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                device["ip"],
                device["mac"],
                device["hostname"],
                device["status"],
                datetime.now()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error storing device: {e}")
    
    async def get_devices(self) -> List[Dict[str, Any]]:
        """Get all devices from the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT ip_address, mac_address, hostname, status, last_seen
                FROM devices
                ORDER BY last_seen DESC
            ''')
            
            rows = cursor.fetchall()
            conn.close()
            
            devices = []
            for row in rows:
                devices.append({
                    "ip": row[0],
                    "mac": row[1],
                    "hostname": row[2],
                    "status": row[3],
                    "last_seen": row[4]
                })
            
            return devices
            
        except Exception as e:
            print(f"Error getting devices: {e}")
            return []
    
    async def cleanup_old_data(self, days: int = 30):
        """Clean up old data from the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cutoff_time = datetime.now() - timedelta(days=days)
            
            # Clean old metrics
            cursor.execute('DELETE FROM network_metrics WHERE timestamp < ?', (cutoff_time,))
            
            # Clean old resolved alerts
            cursor.execute('DELETE FROM alerts WHERE timestamp < ? AND resolved = TRUE', (cutoff_time,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error cleaning up old data: {e}")
    
    async def close(self):
        """Close database connections and cleanup"""
        # Perform any cleanup operations
        await self.cleanup_old_data()