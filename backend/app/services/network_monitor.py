import psutil
import asyncio
import socket
import subprocess
import platform
import time
from datetime import datetime
from typing import Dict, List, Any

from ..models.network_data import NetworkMetrics, BandwidthData, Device, Alert, NetworkConfig

class NetworkMonitor:
    def __init__(self):
        self.config = NetworkConfig()
        self.previous_stats = None
        self.monitoring = False
        self.current_metrics = None
        
    async def start_monitoring(self):
        """Start the network monitoring process"""
        self.monitoring = True
        self.previous_stats = psutil.net_io_counters()
        
    async def stop_monitoring(self):
        """Stop the network monitoring process"""
        self.monitoring = False
        
    async def get_current_metrics(self) -> Dict[str, Any]:
        """Get current network performance metrics"""
        try:
            # Get bandwidth data
            bandwidth = await self._get_bandwidth_usage()
            
            # Get latency (ping to Google DNS)
            latency = await self._get_latency()
            
            # Get packet loss (simplified calculation)
            packet_loss = await self._get_packet_loss()
            
            metrics = {
                "bandwidth": bandwidth,
                "latency": latency,
                "packet_loss": packet_loss,
                "timestamp": datetime.now().isoformat()
            }
            
            self.current_metrics = metrics
            return metrics
            
        except Exception as e:
            print(f"Error getting current metrics: {e}")
            return {
                "bandwidth": {"upload": 0, "download": 0, "timestamp": datetime.now().isoformat()},
                "latency": 0,
                "packet_loss": 0,
                "timestamp": datetime.now().isoformat()
            }
    
    async def _get_bandwidth_usage(self) -> Dict[str, Any]:
        """Calculate current bandwidth usage"""
        try:
            current_stats = psutil.net_io_counters()
            
            if self.previous_stats:
                # Calculate bytes transferred in the last interval
                time_delta = 2.0  # Assume 2 second interval
                
                bytes_sent = current_stats.bytes_sent - self.previous_stats.bytes_sent
                bytes_recv = current_stats.bytes_recv - self.previous_stats.bytes_recv
                
                # Convert to Mbps
                upload_mbps = (bytes_sent * 8) / (time_delta * 1024 * 1024)
                download_mbps = (bytes_recv * 8) / (time_delta * 1024 * 1024)
                
                self.previous_stats = current_stats
                
                return {
                    "upload": max(0, upload_mbps),
                    "download": max(0, download_mbps),
                    "timestamp": datetime.now().isoformat()
                }
            else:
                self.previous_stats = current_stats
                return {
                    "upload": 0,
                    "download": 0,
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            print(f"Error calculating bandwidth: {e}")
            return {
                "upload": 0,
                "download": 0,
                "timestamp": datetime.now().isoformat()
            }
    
    async def _get_latency(self) -> float:
        """Get network latency by pinging a reliable server"""
        try:
            # Use system ping command for Windows
            if platform.system().lower() == "windows":
                result = subprocess.run(
                    ["ping", "-n", "1", "8.8.8.8"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    # Parse ping output to extract time
                    lines = result.stdout.strip().split('\n')
                    for line in lines:
                        if 'time=' in line.lower():
                            time_str = line.split('time=')[1].split('ms')[0]
                            return float(time_str)
            else:
                # Unix/Linux/Mac ping
                result = subprocess.run(
                    ["ping", "-c", "1", "8.8.8.8"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    lines = result.stdout.strip().split('\n')
                    for line in lines:
                        if 'time=' in line.lower():
                            time_str = line.split('time=')[1].split(' ')[0]
                            return float(time_str)
            
            return 0.0
        except Exception as e:
            print(f"Error measuring latency: {e}")
            return 0.0
    
    async def _get_packet_loss(self) -> float:
        """Calculate packet loss percentage (simplified)"""
        try:
            # Simple packet loss calculation - ping multiple times
            successful_pings = 0
            total_pings = 5
            
            for _ in range(total_pings):
                if platform.system().lower() == "windows":
                    result = subprocess.run(
                        ["ping", "-n", "1", "8.8.8.8"],
                        capture_output=True,
                        text=True,
                        timeout=2
                    )
                else:
                    result = subprocess.run(
                        ["ping", "-c", "1", "8.8.8.8"],
                        capture_output=True,
                        text=True,
                        timeout=2
                    )
                
                if result.returncode == 0:
                    successful_pings += 1
            
            loss_percentage = ((total_pings - successful_pings) / total_pings) * 100
            return loss_percentage
            
        except Exception as e:
            print(f"Error calculating packet loss: {e}")
            return 0.0
    
    async def get_connected_devices(self) -> List[Dict[str, Any]]:
        """Get list of devices connected to the network"""
        try:
            devices = []
            
            # Get local network interfaces
            interfaces = psutil.net_if_addrs()
            
            for interface_name, interface_addresses in interfaces.items():
                for address in interface_addresses:
                    if address.family == socket.AF_INET and not address.address.startswith('127.'):
                        # This is a simplified device detection
                        device = {
                            "ip": address.address,
                            "mac": self._get_mac_address(interface_name),
                            "hostname": socket.gethostname() if address.address == self._get_local_ip() else f"device-{address.address.split('.')[-1]}",
                            "status": "online",
                            "last_seen": datetime.now().isoformat()
                        }
                        devices.append(device)
            
            # Add some mock devices for demonstration
            mock_devices = [
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
                    "status": "offline",
                    "last_seen": datetime.now().isoformat()
                }
            ]
            
            return devices + mock_devices
            
        except Exception as e:
            print(f"Error getting connected devices: {e}")
            return []
    
    def _get_mac_address(self, interface_name: str) -> str:
        """Get MAC address for a network interface"""
        try:
            interfaces = psutil.net_if_addrs()
            if interface_name in interfaces:
                for addr in interfaces[interface_name]:
                    if addr.family == psutil.AF_LINK:
                        return addr.address
            return "00:00:00:00:00:00"
        except:
            return "00:00:00:00:00:00"
    
    def _get_local_ip(self) -> str:
        """Get the local IP address"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.connect(("8.8.8.8", 80))
            local_ip = sock.getsockname()[0]
            sock.close()
            return local_ip
        except:
            return "127.0.0.1"
    
    def check_thresholds(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check if any metrics exceed thresholds and generate alerts"""
        alerts = []
        
        try:
            # Check bandwidth thresholds
            if metrics["bandwidth"]["download"] > self.config.bandwidth_threshold_mbps:
                alerts.append({
                    "type": "warning",
                    "message": f"High download bandwidth usage: {metrics['bandwidth']['download']:.1f} Mbps",
                    "metric_type": "bandwidth",
                    "metric_value": metrics["bandwidth"]["download"],
                    "threshold": self.config.bandwidth_threshold_mbps,
                    "timestamp": datetime.now().isoformat()
                })
            
            # Check latency thresholds
            if metrics["latency"] > self.config.latency_threshold_ms:
                alerts.append({
                    "type": "warning",
                    "message": f"High network latency: {metrics['latency']:.0f} ms",
                    "metric_type": "latency",
                    "metric_value": metrics["latency"],
                    "threshold": self.config.latency_threshold_ms,
                    "timestamp": datetime.now().isoformat()
                })
            
            # Check packet loss thresholds
            if metrics["packet_loss"] > self.config.packet_loss_threshold_percent:
                alerts.append({
                    "type": "error",
                    "message": f"High packet loss detected: {metrics['packet_loss']:.1f}%",
                    "metric_type": "packet_loss",
                    "metric_value": metrics["packet_loss"],
                    "threshold": self.config.packet_loss_threshold_percent,
                    "timestamp": datetime.now().isoformat()
                })
                
        except Exception as e:
            print(f"Error checking thresholds: {e}")
        
        return alerts