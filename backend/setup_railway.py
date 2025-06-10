#!/usr/bin/env python3
"""Setup Railway project with environment variables"""

import requests
import json
import os

RAILWAY_TOKEN = "9e330276-7482-4ab8-8802-073f51234938"
PROJECT_ID = "7173f5f6-9c58-48b9-91f2-ebe50ab786f9"
GRAPHQL_URL = "https://backboard.railway.app/graphql/v2"

def make_graphql_request(query, variables=None):
    """Make GraphQL request to Railway API"""
    headers = {
        "Authorization": f"Bearer {RAILWAY_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    
    response = requests.post(GRAPHQL_URL, json=payload, headers=headers)
    return response.json()

def get_project_info():
    """Get project services and environments"""
    query = """
    query project($id: String!) {
        project(id: $id) {
            id
            name
            services {
                edges {
                    node {
                        id
                        name
                    }
                }
            }
            environments {
                edges {
                    node {
                        id
                        name
                    }
                }
            }
        }
    }
    """
    
    variables = {"id": PROJECT_ID}
    result = make_graphql_request(query, variables)
    return result

def set_variable(service_id, environment_id, name, value):
    """Set environment variable"""
    query = """
    mutation variableUpsert($input: VariableUpsertInput!) {
        variableUpsert(input: $input)
    }
    """
    
    variables = {
        "input": {
            "projectId": PROJECT_ID,
            "environmentId": environment_id,
            "serviceId": service_id,
            "name": name,
            "value": value
        }
    }
    
    result = make_graphql_request(query, variables)
    return result

def main():
    print("🚀 Setting up Railway environment variables...")
    
    # Get project info
    project_info = get_project_info()
    print(f"Project info: {json.dumps(project_info, indent=2)}")
    
    if "errors" in project_info:
        print(f"❌ Error getting project info: {project_info['errors']}")
        return
    
    project = project_info["data"]["project"]
    services = project["services"]["edges"]
    environments = project["environments"]["edges"]
    
    print(f"📦 Project: {project['name']}")
    print(f"🔧 Services: {[s['node']['name'] for s in services]}")
    print(f"🌍 Environments: {[e['node']['name'] for e in environments]}")
    
    # Find production environment
    prod_env = None
    for env in environments:
        if env["node"]["name"] == "production":
            prod_env = env["node"]["id"]
            break
    
    if not prod_env:
        print("❌ Production environment not found")
        return
    
    # Get first service (should be our backend)
    if not services:
        print("❌ No services found")
        return
    
    service_id = services[0]["node"]["id"]
    service_name = services[0]["node"]["name"]
    
    print(f"🎯 Using service: {service_name} ({service_id})")
    print(f"🎯 Using environment: production ({prod_env})")
    
    # Set environment variables
    variables_to_set = {
        "GOOGLE_GENERATIVE_AI_API_KEY": "7a6d6fdc120f9c927fed34e80372dc9b3081f",
        "DATABASE_URL": "postgresql://postgres.peojtkesvynmmzftljxo:H^Ops#&PNPXnn9i@cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
        "PORT": "8000"
    }
    
    for name, value in variables_to_set.items():
        print(f"⚙️  Setting {name}...")
        result = set_variable(service_id, prod_env, name, value)
        
        if "errors" in result:
            print(f"❌ Error setting {name}: {result['errors']}")
        else:
            print(f"✅ Successfully set {name}")
    
    print("🎉 Railway setup complete!")

if __name__ == "__main__":
    main()