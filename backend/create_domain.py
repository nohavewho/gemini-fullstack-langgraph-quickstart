#!/usr/bin/env python3
"""Create Railway service domain"""

import requests
import json

RAILWAY_TOKEN = "9e330276-7482-4ab8-8802-073f51234938"
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

def create_service_domain():
    query = """
    mutation serviceDomainCreate($input: ServiceDomainCreateInput!) {
        serviceDomainCreate(input: $input) {
            id
            domain
        }
    }
    """
    
    variables = {
        "input": {
            "environmentId": ENV_ID,
            "serviceId": SERVICE_ID
        }
    }
    
    result = make_graphql_request(query, variables)
    return result

def main():
    print("🌐 Creating Railway service domain...")
    
    result = create_service_domain()
    
    if "errors" in result:
        print(f"❌ Error: {result['errors']}")
        return
    
    domain_data = result["data"]["serviceDomainCreate"]
    domain = domain_data["domain"]
    
    print(f"✅ Domain created: {domain}")
    print(f"🔗 Backend URL: https://{domain}")
    print(f"🎯 Add to Vercel env: RAILWAY_BACKEND_URL=https://{domain}")

if __name__ == "__main__":
    main()