import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    
    print("Testing Network Monitor API...")
    print("=" * 40)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return
    
    # Test current metrics
    try:
        response = requests.get(f"{base_url}/api/network/current")
        print(f"Current Metrics: {response.status_code}")
        data = response.json()
        print(f"Bandwidth: {data['bandwidth']['download']:.1f} Mbps down, {data['bandwidth']['upload']:.1f} Mbps up")
        print(f"Latency: {data['latency']:.1f} ms")
        print(f"Packet Loss: {data['packet_loss']:.2f}%")
        print()
    except Exception as e:
        print(f"Current Metrics Failed: {e}")
    
    # Test devices
    try:
        response = requests.get(f"{base_url}/api/devices")
        print(f"Devices: {response.status_code}")
        devices = response.json()
        print(f"Found {len(devices)} devices:")
        for device in devices:
            print(f"  - {device['hostname']} ({device['ip']}) - {device['status']}")
        print()
    except Exception as e:
        print(f"Devices Failed: {e}")
    
    # Test alerts
    try:
        response = requests.get(f"{base_url}/api/alerts")
        print(f"Alerts: {response.status_code}")
        alerts = response.json()
        print(f"Active alerts: {len(alerts)}")
        for alert in alerts:
            print(f"  - {alert['type'].upper()}: {alert['message']}")
        print()
    except Exception as e:
        print(f"Alerts Failed: {e}")
    
    print("API testing complete!")

if __name__ == "__main__":
    test_api()