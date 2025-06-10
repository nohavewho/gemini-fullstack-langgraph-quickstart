#!/usr/bin/env python3
"""Get Railway service URL"""

import requests
import json

RAILWAY_TOKEN = "9e330276-7482-4ab8-8802-073f51234938"
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

def get_service_domains():
    query = """
    query service($id: String!) {
        service(id: $id) {
            id
            name
            serviceInstances {
                edges {
                    node {
                        domains {
                            serviceDomains {
                                domain
                            }
                        }
                    }
                }
            }
        }
    }
    """
    
    variables = {"id": SERVICE_ID}
    result = make_graphql_request(query, variables)
    return result

def main():
    print("🔍 Getting Railway service domains...")
    
    result = get_service_domains()
    print(f"Raw result: {json.dumps(result, indent=2)}")

if __name__ == "__main__":
    main()