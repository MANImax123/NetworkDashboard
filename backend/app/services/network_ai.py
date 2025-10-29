import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
from collections import deque
import asyncio
import math

class NetworkAI:
    def __init__(self):
        self.bandwidth_history = deque(maxlen=1000)
        self.latency_history = deque(maxlen=1000)
        self.device_activity_history = {}
        self.anomaly_threshold = 2.5  # Standard deviations
        self.learning_window = 100  # Number of samples for learning
        self.predictions = {}
        
    async def detect_anomalies(self, current_metrics: Dict) -> Dict[str, Any]:
        """Detect network anomalies using statistical analysis"""
        anomalies = []
        
        # Store current metrics
        self.bandwidth_history.append({
            "timestamp": datetime.now(),
            "download": current_metrics.get("bandwidth", {}).get("download", 0),
            "upload": current_metrics.get("bandwidth", {}).get("upload", 0)
        })
        
        self.latency_history.append({
            "timestamp": datetime.now(),
            "latency": current_metrics.get("latency", 0)
        })
        
        if len(self.bandwidth_history) >= self.learning_window:
            # Bandwidth anomalies
            download_values = [item["download"] for item in self.bandwidth_history]
            upload_values = [item["upload"] for item in self.bandwidth_history]
            
            download_anomaly = self._detect_statistical_anomaly(
                download_values, 
                current_metrics.get("bandwidth", {}).get("download", 0)
            )
            
            upload_anomaly = self._detect_statistical_anomaly(
                upload_values,
                current_metrics.get("bandwidth", {}).get("upload", 0)
            )
            
            if download_anomaly:
                anomalies.append({
                    "type": "bandwidth_spike",
                    "metric": "download",
                    "severity": "HIGH" if download_anomaly["z_score"] > 3 else "MEDIUM",
                    "message": f"Download bandwidth spike detected: {current_metrics['bandwidth']['download']:.1f} Mbps (normal: {download_anomaly['expected']:.1f} Mbps)",
                    "z_score": download_anomaly["z_score"],
                    "timestamp": datetime.now().isoformat()
                })
            
            if upload_anomaly:
                anomalies.append({
                    "type": "bandwidth_spike",
                    "metric": "upload", 
                    "severity": "HIGH" if upload_anomaly["z_score"] > 3 else "MEDIUM",
                    "message": f"Upload bandwidth spike detected: {current_metrics['bandwidth']['upload']:.1f} Mbps (normal: {upload_anomaly['expected']:.1f} Mbps)",
                    "z_score": upload_anomaly["z_score"],
                    "timestamp": datetime.now().isoformat()
                })
            
            # Latency anomalies
            latency_values = [item["latency"] for item in self.latency_history]
            latency_anomaly = self._detect_statistical_anomaly(
                latency_values,
                current_metrics.get("latency", 0)
            )
            
            if latency_anomaly:
                anomalies.append({
                    "type": "latency_spike",
                    "metric": "latency",
                    "severity": "HIGH" if latency_anomaly["z_score"] > 3 else "MEDIUM",
                    "message": f"High latency detected: {current_metrics['latency']:.1f} ms (normal: {latency_anomaly['expected']:.1f} ms)",
                    "z_score": latency_anomaly["z_score"],
                    "timestamp": datetime.now().isoformat()
                })
        
        # Pattern-based anomalies
        pattern_anomalies = await self._detect_pattern_anomalies(current_metrics)
        anomalies.extend(pattern_anomalies)
        
        return {
            "anomalies": anomalies,
            "total_anomalies": len(anomalies),
            "risk_level": self._calculate_risk_level(anomalies),
            "recommendations": self._generate_recommendations(anomalies)
        }
    
    def _detect_statistical_anomaly(self, values: List[float], current_value: float) -> Dict[str, Any]:
        """Detect statistical anomalies using z-score"""
        if len(values) < 10:
            return None
        
        mean_val = np.mean(values)
        std_val = np.std(values)
        
        if std_val == 0:
            return None
        
        z_score = abs((current_value - mean_val) / std_val)
        
        if z_score > self.anomaly_threshold:
            return {
                "z_score": z_score,
                "expected": mean_val,
                "deviation": abs(current_value - mean_val)
            }
        
        return None
    
    async def _detect_pattern_anomalies(self, current_metrics: Dict) -> List[Dict]:
        """Detect pattern-based anomalies"""
        anomalies = []
        current_time = datetime.now()
        
        # Time-based patterns
        if current_time.hour >= 2 and current_time.hour <= 5:  # Late night activity
            if current_metrics.get("bandwidth", {}).get("download", 0) > 50:
                anomalies.append({
                    "type": "unusual_time_activity",
                    "severity": "MEDIUM",
                    "message": f"High bandwidth usage during off-hours: {current_metrics['bandwidth']['download']:.1f} Mbps at {current_time.strftime('%H:%M')}",
                    "timestamp": current_time.isoformat()
                })
        
        # Bandwidth ratio anomalies
        download = current_metrics.get("bandwidth", {}).get("download", 0)
        upload = current_metrics.get("bandwidth", {}).get("upload", 0)
        
        if upload > 0 and download > 0:
            ratio = upload / download
            if ratio > 0.8:  # Unusual upload/download ratio
                anomalies.append({
                    "type": "unusual_traffic_ratio",
                    "severity": "MEDIUM",
                    "message": f"Unusual upload/download ratio: {ratio:.2f} (upload: {upload:.1f} Mbps, download: {download:.1f} Mbps)",
                    "timestamp": current_time.isoformat()
                })
        
        return anomalies
    
    def _calculate_risk_level(self, anomalies: List[Dict]) -> str:
        """Calculate overall risk level based on anomalies"""
        if not anomalies:
            return "LOW"
        
        high_severity = len([a for a in anomalies if a.get("severity") == "HIGH"])
        medium_severity = len([a for a in anomalies if a.get("severity") == "MEDIUM"])
        
        if high_severity >= 2:
            return "CRITICAL"
        elif high_severity >= 1 or medium_severity >= 3:
            return "HIGH"
        elif medium_severity >= 1:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _generate_recommendations(self, anomalies: List[Dict]) -> List[str]:
        """Generate recommendations based on detected anomalies"""
        recommendations = []
        
        anomaly_types = [a.get("type") for a in anomalies]
        
        if "bandwidth_spike" in anomaly_types:
            recommendations.append("Monitor bandwidth usage and identify high-consumption applications")
            recommendations.append("Consider upgrading network capacity if spikes are frequent")
        
        if "latency_spike" in anomaly_types:
            recommendations.append("Check network equipment for performance issues")
            recommendations.append("Analyze routing and switching infrastructure")
        
        if "unusual_time_activity" in anomaly_types:
            recommendations.append("Investigate after-hours network activity for security concerns")
            recommendations.append("Review access logs and user activity")
        
        if "unusual_traffic_ratio" in anomaly_types:
            recommendations.append("Monitor for potential data exfiltration or security breaches")
            recommendations.append("Analyze traffic patterns and destination addresses")
        
        if not recommendations:
            recommendations.append("Network performance is within normal parameters")
            recommendations.append("Continue monitoring for any changes in patterns")
        
        return recommendations
    
    async def predict_network_trends(self, historical_data: List[Dict]) -> Dict[str, Any]:
        """Predict network performance trends using simple forecasting"""
        if len(historical_data) < 20:
            return {"predictions": [], "confidence": 0}
        
        # Extract time series data
        timestamps = []
        bandwidth_values = []
        latency_values = []
        
        for item in historical_data[-50:]:  # Use last 50 data points
            timestamps.append(datetime.fromisoformat(item["timestamp"]))
            bandwidth_values.append(item["bandwidth"]["download"] + item["bandwidth"]["upload"])
            latency_values.append(item["latency"])
        
        # Simple linear trend prediction
        bandwidth_trend = self._calculate_trend(bandwidth_values)
        latency_trend = self._calculate_trend(latency_values)
        
        # Generate predictions for next 24 hours
        predictions = []
        base_time = timestamps[-1]
        
        for i in range(1, 25):  # Next 24 hours
            pred_time = base_time + timedelta(hours=i)
            
            # Apply trend with some noise
            bandwidth_pred = bandwidth_values[-1] + (bandwidth_trend * i)
            latency_pred = latency_values[-1] + (latency_trend * i)
            
            # Add seasonal patterns (daily cycle)
            hour = pred_time.hour
            bandwidth_seasonal = 1.0 + 0.3 * math.sin((hour - 6) * math.pi / 12)  # Peak during day
            latency_seasonal = 1.0 + 0.2 * math.sin((hour - 14) * math.pi / 12)    # Peak in afternoon
            
            predictions.append({
                "timestamp": pred_time.isoformat(),
                "predicted_bandwidth": max(0, bandwidth_pred * bandwidth_seasonal),
                "predicted_latency": max(0, latency_pred * latency_seasonal),
                "confidence": max(0.1, 0.9 - (i * 0.02))  # Decreasing confidence over time
            })
        
        return {
            "predictions": predictions,
            "trends": {
                "bandwidth_trend": "increasing" if bandwidth_trend > 0.1 else "decreasing" if bandwidth_trend < -0.1 else "stable",
                "latency_trend": "increasing" if latency_trend > 0.1 else "decreasing" if latency_trend < -0.1 else "stable"
            },
            "insights": self._generate_trend_insights(bandwidth_trend, latency_trend)
        }
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate simple linear trend"""
        if len(values) < 2:
            return 0
        
        n = len(values)
        x = list(range(n))
        y = values
        
        # Simple linear regression
        x_mean = sum(x) / n
        y_mean = sum(y) / n
        
        numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return 0
        
        return numerator / denominator
    
    def _generate_trend_insights(self, bandwidth_trend: float, latency_trend: float) -> List[str]:
        """Generate insights based on trends"""
        insights = []
        
        if bandwidth_trend > 0.5:
            insights.append("Bandwidth usage is trending upward - consider capacity planning")
        elif bandwidth_trend < -0.5:
            insights.append("Bandwidth usage is declining - may indicate reduced activity or optimization")
        
        if latency_trend > 0.1:
            insights.append("Latency is increasing - investigate network performance issues")
        elif latency_trend < -0.1:
            insights.append("Latency is improving - network optimizations may be effective")
        
        if abs(bandwidth_trend) < 0.1 and abs(latency_trend) < 0.1:
            insights.append("Network performance is stable with consistent patterns")
        
        return insights
    
    async def analyze_device_behavior(self, devices: List[Dict]) -> Dict[str, Any]:
        """Analyze device behavior patterns for security and optimization"""
        analysis = {
            "device_insights": [],
            "security_alerts": [],
            "optimization_opportunities": []
        }
        
        for device in devices:
            device_ip = device["ip"]
            current_usage = device["data_usage"]["sent"] + device["data_usage"]["received"]
            
            # Store device activity history
            if device_ip not in self.device_activity_history:
                self.device_activity_history[device_ip] = deque(maxlen=100)
            
            self.device_activity_history[device_ip].append({
                "timestamp": datetime.now(),
                "usage": current_usage,
                "status": device["status"]
            })
            
            # Analyze patterns
            device_analysis = self._analyze_single_device(device)
            analysis["device_insights"].append(device_analysis)
            
            # Security analysis
            if device_analysis["risk_level"] == "HIGH":
                analysis["security_alerts"].append({
                    "device": device["hostname"],
                    "ip": device["ip"],
                    "issues": device_analysis["security_issues"],
                    "recommendation": device_analysis["recommendation"]
                })
            
            # Optimization opportunities
            if device_analysis["optimization_potential"]:
                analysis["optimization_opportunities"].extend(device_analysis["optimization_potential"])
        
        return analysis
    
    def _analyze_single_device(self, device: Dict) -> Dict[str, Any]:
        """Analyze individual device patterns"""
        analysis = {
            "device_id": device["ip"],
            "hostname": device["hostname"],
            "risk_level": "LOW",
            "security_issues": [],
            "optimization_potential": [],
            "behavior_score": 100,
            "recommendation": ""
        }
        
        # Security analysis
        if device["status"] == "suspicious":
            analysis["risk_level"] = "HIGH"
            analysis["security_issues"].append("Device flagged as suspicious")
            analysis["behavior_score"] -= 40
        
        if device.get("open_ports") and any(port in [4444, 1337, 31337] for port in device["open_ports"]):
            analysis["risk_level"] = "HIGH"
            analysis["security_issues"].append("Suspicious ports detected")
            analysis["behavior_score"] -= 30
        
        if device["vendor"] == "Unknown":
            analysis["risk_level"] = "MEDIUM" if analysis["risk_level"] == "LOW" else analysis["risk_level"]
            analysis["security_issues"].append("Unknown device vendor")
            analysis["behavior_score"] -= 15
        
        # Usage analysis
        total_usage = device["data_usage"]["sent"] + device["data_usage"]["received"]
        if total_usage > 500_000_000:  # > 500MB
            analysis["optimization_potential"].append({
                "type": "high_bandwidth_usage",
                "device": device["hostname"],
                "usage_mb": round(total_usage / 1024 / 1024, 2),
                "suggestion": "Monitor for unnecessary background processes or consider QoS policies"
            })
        
        # Generate recommendations
        if analysis["risk_level"] == "HIGH":
            analysis["recommendation"] = "Immediate security review required - isolate device and investigate"
        elif analysis["risk_level"] == "MEDIUM":
            analysis["recommendation"] = "Enhanced monitoring recommended - verify device legitimacy"
        else:
            analysis["recommendation"] = "Device operating normally - continue standard monitoring"
        
        return analysis