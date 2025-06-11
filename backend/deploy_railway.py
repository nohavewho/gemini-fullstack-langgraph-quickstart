#!/usr/bin/env python3
"""Quick deploy to Railway"""

import requests
import time

RAILWAY_TOKEN = "9e330276-7482-4ab8-8802-073f51234938"
PROJECT_ID = "7173f5f6-9c58-48b9-91f2-ebe50ab786f9"
SERVICE_ID = "ca6cdbe5-7980-4ae3-89f3-738ff32bc2f2"
GRAPHQL_URL = "https://backboard.railway.app/graphql/v2"

def make_graphql_request(query, variables=None):
    headers = {
        "Authorization": f"Bearer {RAILWAY_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    
    response = requests.post(GRAPHQL_URL, json=payload, headers=headers)
    return response.json()

def trigger_deploy():
    """Trigger a new deployment"""
    query = """
    mutation serviceInstanceRedeploy($serviceId: String!) {
        serviceInstanceRedeploy(serviceId: $serviceId)
    }
    """
    
    variables = {"serviceId": SERVICE_ID}
    result = make_graphql_request(query, variables)
    return result

def main():
    print("🚀 Triggering Railway redeploy...")
    result = trigger_deploy()
    
    if "errors" in result:
        print(f"❌ Deploy failed: {result['errors']}")
    else:
        print("✅ Deploy triggered successfully!")
        print("🔄 Check deployment status at: https://railway.app/project/7173f5f6-9c58-48b9-91f2-ebe50ab786f9")
        
        # Wait a bit and check API
        print("⏳ Waiting 30 seconds for deployment...")
        time.sleep(30)
        
        try:
            import subprocess
            response = subprocess.run([
                "curl", "-s", "-X", "POST", 
                "https://press-monitor-backend-production.up.railway.app/api/press-monitor",
                "-H", "Content-Type: application/json",
                "-d", '{"query":"test Azerbaijan","date_filter":"after:2025-01-08","target_countries":["Azerbaijan"],"max_articles":2}'
            ], capture_output=True, text=True)
            
            if response.returncode == 0:
                print("✅ API is responding after deploy!")
                if '"success":true' in response.stdout:
                    print("🎉 Backend working correctly!")
                else:
                    print("⚠️  API responded but may have issues:")
                    print(response.stdout[:500] + "..." if len(response.stdout) > 500 else response.stdout)
            else:
                print("❌ API test failed")
        except Exception as e:
            print(f"⚠️  Could not test API: {e}")

if __name__ == "__main__":
    main()