#!/usr/bin/env python3
"""Test if server starts correctly"""

import subprocess
import time
import requests

def test_server():
    print("🚀 Starting backend server...")
    
    # Start server
    server = subprocess.Popen(
        ["python3", "-m", "langgraph", "up", "--port", "2024"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Give it time to start
    time.sleep(5)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:2024/health")
        print(f"✅ Server health check: {response.status_code}")
    except Exception as e:
        print(f"❌ Server not responding: {e}")
        
        # Get stderr
        stdout, stderr = server.communicate(timeout=1)
        print(f"STDOUT: {stdout}")
        print(f"STDERR: {stderr}")
    
    # Stop server
    server.terminate()

if __name__ == "__main__":
    test_server()