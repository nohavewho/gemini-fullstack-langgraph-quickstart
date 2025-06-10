#!/usr/bin/env python3
"""Get Railway deployment URL"""

import requests
import json

RAILWAY_TOKEN = "9e330276-7482-4ab8-8802-073f51234938"
PROJECT_ID = "7173f5f6-9c58-48b9-91f2-ebe50ab786f9"
SERVICE_ID = "ca6cdbe5-7980-4ae3-89f3-738ff32bc2f2"
ENV_ID = "545f9740-ccc6-4219-8370-882fa16afa0b"
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

def get_deployment_url():
    query = """
    query deployments($first: Int, $input: DeploymentListInput) {
        deployments(first: $first, input: $input) {
            edges {
                node {
                    id
                    url
                    status
                    createdAt
                }
            }
        }
    }
    """
    
    variables = {
        "first": 1,
        "input": {
            "projectId": PROJECT_ID,
            "environmentId": ENV_ID,
            "serviceId": SERVICE_ID
        }
    }
    
    result = make_graphql_request(query, variables)
    return result

def main():
    print("🔍 Getting Railway deployment URL...")
    
    result = get_deployment_url()
    
    if "errors" in result:
        print(f"❌ Error: {result['errors']}")
        return
    
    deployments = result["data"]["deployments"]["edges"]
    
    if not deployments:
        print("❌ No deployments found")
        return
    
    latest_deployment = deployments[0]["node"]
    
    print(f"🚀 Latest deployment:")
    print(f"   ID: {latest_deployment['id']}")
    print(f"   URL: {latest_deployment['url']}")
    print(f"   Status: {latest_deployment['status']}")
    print(f"   Created: {latest_deployment['createdAt']}")
    
    if latest_deployment['url']:
        print(f"\n✅ Backend URL: {latest_deployment['url']}")
        print(f"🔗 Add this to Vercel env: RAILWAY_BACKEND_URL={latest_deployment['url']}")
    else:
        print("⏳ Deployment URL not ready yet")

if __name__ == "__main__":
    main()