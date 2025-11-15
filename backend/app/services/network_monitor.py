import psutil
import asyncio
import socket
import subprocess
import platform
import time
import re
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
    
    def _get_netbios_name(self, ip: str) -> str:
        """Get NetBIOS name for an IP address (Windows - super fast!)"""
        try:
            # Use nbtstat command for fast NetBIOS name resolution
            result = subprocess.run(
                ["nbtstat", "-A", ip],
                capture_output=True,
                text=True,
                timeout=0.3  # Very short timeout - 300ms
            )
            
            if result.returncode == 0:
                # Parse nbtstat output to find the computer name
                lines = result.stdout.split('\n')
                for line in lines:
                    # Look for lines with <00> which indicates computer name
                    if '<00>' in line and 'UNIQUE' in line:
                        # Extract the name (first column, strip whitespace)
                        parts = line.split()
                        if parts:
                            name = parts[0].strip()
                            if name and not name.startswith('_'):
                                return name.lower()
        except:
            pass
        
        # Fallback to simple device naming
        return f"device-{ip.split('.')[-1]}"
    
    async def get_connected_devices(self) -> List[Dict[str, Any]]:
        """Get list of devices connected to the network using ARP scanning"""
        try:
            devices = []
            
            # Get local IP and network
            local_ip = self._get_local_ip()
            
            # Add local machine as first device
            devices.append({
                "ip": local_ip,
                "mac": self._get_local_mac(),
                "hostname": socket.gethostname(),
                "status": "online",
                "last_seen": datetime.now().isoformat()
            })
            
            # Scan ARP table for connected devices (Windows)
            if platform.system().lower() == "windows":
                try:
                    # Run arp -a to get connected devices with 2 second timeout
                    result = subprocess.run(
                        ["arp", "-a"],
                        capture_output=True,
                        text=True,
                        timeout=2  # Reduced timeout to 2 seconds
                    )
                    
                    if result.returncode == 0:
                        lines = result.stdout.strip().split('\n')
                        device_count = 0  # Counter for DNS lookups
                        for line in lines:
                            # Parse ARP table entries
                            # Format: IP Address        Physical Address      Type
                            if 'dynamic' in line.lower() or 'static' in line.lower():
                                parts = line.split()
                                if len(parts) >= 2:
                                    ip = parts[0]
                                    mac = parts[1]
                                    
                                    # Skip invalid entries
                                    if ip.startswith('224.') or ip.startswith('239.') or ip.startswith('255.'):
                                        continue
                                    
                                    # Skip multicast/broadcast MACs
                                    if mac.lower().startswith('ff-ff') or mac.lower() == '(incomplete)':
                                        continue
                                    
                                    # Use simple fast naming (NetBIOS disabled for speed)
                                    hostname = f"device-{ip.split('.')[-1]}"
                                    
                                    device_count += 1
                                    devices.append({
                                        "ip": ip,
                                        "mac": mac,
                                        "hostname": hostname,
                                        "status": "online",
                                        "last_seen": datetime.now().isoformat()
                                    })
                except subprocess.TimeoutExpired:
                    print(f"ARP scan timeout - using cached devices")
                except Exception as e:
                    print(f"Error scanning ARP table: {e}")
            else:
                # Linux/Mac ARP scanning
                try:
                    result = subprocess.run(
                        ["arp", "-n"],
                        capture_output=True,
                        text=True,
                        timeout=2  # 2 second timeout
                    )
                    
                    if result.returncode == 0:
                        lines = result.stdout.strip().split('\n')[1:]  # Skip header
                        for line in lines:
                            parts = line.split()
                            if len(parts) >= 3:
                                ip = parts[0]
                                mac = parts[2]
                                
                                # Skip incomplete entries
                                if mac == "(incomplete)":
                                    continue
                                
                                # Use simple hostname without DNS lookup (faster)
                                hostname = f"device-{ip.split('.')[-1]}"
                                
                                devices.append({
                                    "ip": ip,
                                    "mac": mac,
                                    "hostname": hostname,
                                    "status": "online",
                                    "last_seen": datetime.now().isoformat()
                                })
                except subprocess.TimeoutExpired:
                    print(f"ARP scan timeout - using cached devices")
                except Exception as e:
                    print(f"Error scanning ARP table: {e}")
            
            # Remove duplicates based on IP
            seen_ips = set()
            unique_devices = []
            for device in devices:
                if device["ip"] not in seen_ips:
                    seen_ips.add(device["ip"])
                    unique_devices.append(device)
            
            return unique_devices
            
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
    
    def _get_local_mac(self) -> str:
        """Get the MAC address of the primary network interface"""
        try:
            interfaces = psutil.net_if_addrs()
            # Try to find the interface with the local IP
            local_ip = self._get_local_ip()
            
            for interface_name, addrs in interfaces.items():
                for addr in addrs:
                    if addr.family == socket.AF_INET and addr.address == local_ip:
                        # Found the interface, now get its MAC
                        for addr2 in addrs:
                            if addr2.family == psutil.AF_LINK:
                                return addr2.address
            
            # Fallback: return first non-loopback MAC
            for interface_name, addrs in interfaces.items():
                if 'loopback' not in interface_name.lower():
                    for addr in addrs:
                        if addr.family == psutil.AF_LINK:
                            return addr.address
            
            return "00:00:00:00:00:00"
        except Exception as e:
            print(f"Error getting local MAC: {e}")
            return "00:00:00:00:00:00"
    
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