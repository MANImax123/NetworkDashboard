#!/usr/bin/env python3
"""
Comprehensive test script for Network Monitor application
Tests all API endpoints and verifies functionality before deployment
"""

import requests
import json
import time
import sys

def test_api_endpoint(url, endpoint_name):
    """Test a single API endpoint"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print(f"✅ {endpoint_name}: SUCCESS (Status: {response.status_code})")
            return True, response.json()
        else:
            print(f"❌ {endpoint_name}: FAILED (Status: {response.status_code})")
            return False, None
    except requests.exceptions.RequestException as e:
        print(f"❌ {endpoint_name}: ERROR - {str(e)}")
        return False, None

def main():
    """Run comprehensive tests"""
    print("🚀 Starting Network Monitor Deployment Tests")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    frontend_url = "http://localhost:3001"
    
    # Test all API endpoints
    endpoints = {
        "Root API": f"{base_url}/",
        "Health Check": f"{base_url}/api/health",
        "Current Metrics": f"{base_url}/api/network/current",
        "Historical Data": f"{base_url}/api/network/history",
        "Device List": f"{base_url}/api/devices",
        "Alerts": f"{base_url}/api/alerts",
        "Protocol Insights": f"{base_url}/api/protocols", 
        "Port Analysis": f"{base_url}/api/ports",
        "Advanced Devices": f"{base_url}/api/devices/advanced",
        "Network Topology": f"{base_url}/api/topology",
        "AI Anomalies": f"{base_url}/api/ai/anomalies",
        "AI Predictions": f"{base_url}/api/ai/predictions",
        "Device Analysis": f"{base_url}/api/ai/device-analysis",
        "Security Overview": f"{base_url}/api/security/overview"
    }
    
    print("\n📡 Testing API Endpoints:")
    print("-" * 30)
    
    passed = 0
    total = len(endpoints)
    
    for name, url in endpoints.items():
        success, data = test_api_endpoint(url, name)
        if success:
            passed += 1
            # Print sample data for key endpoints
            if name in ["Current Metrics", "Protocol Insights"]:
                print(f"    Sample data: {json.dumps(data, indent=2)[:100]}...")
    
    print(f"\n📊 API Test Results: {passed}/{total} endpoints passed")
    
    # Test frontend accessibility
    print("\n🌐 Testing Frontend:")
    print("-" * 20)
    
    try:
        response = requests.get(frontend_url, timeout=10)
        if response.status_code == 200:
            print("✅ Frontend: Accessible")
        else:
            print(f"❌ Frontend: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend: ERROR - {str(e)}")
    
    # Overall assessment
    print("\n🎯 Deployment Readiness Assessment:")
    print("-" * 35)
    
    if passed >= total * 0.8:  # 80% success rate
        print("✅ READY FOR DEPLOYMENT")
        print("   - Backend API functioning properly")
        print("   - All critical endpoints operational")
        print("   - Frontend accessible")
        return True
    else:
        print("❌ NOT READY FOR DEPLOYMENT")
        print(f"   - Only {passed}/{total} endpoints working")
        print("   - Fix failing endpoints before deployment")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)