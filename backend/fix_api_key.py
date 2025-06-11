#!/usr/bin/env python3
"""Fix API key in Railway"""

import requests

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

def set_variable(name, value):
    query = """
    mutation variableUpsert($input: VariableUpsertInput!) {
        variableUpsert(input: $input)
    }
    """
    
    variables = {
        "input": {
            "projectId": PROJECT_ID,
            "environmentId": ENV_ID,
            "serviceId": SERVICE_ID,
            "name": name,
            "value": value
        }
    }
    
    result = make_graphql_request(query, variables)
    return result

def main():
    print("🔧 Fixing API key in Railway...")
    
    # ПРАВИЛЬНЫЙ API key из frontend!
    correct_api_key = "AIzaSyCzc7LPoJNS4QkI5kZDLS4M9RyElZjy9BQ"
    
    variables_to_fix = {
        "GOOGLE_GENERATIVE_AI_API_KEY": correct_api_key,
        "GOOGLE_API_KEY": correct_api_key,
        "GEMINI_API_KEY": correct_api_key
    }
    
    for name, value in variables_to_fix.items():
        print(f"⚙️  Setting {name}...")
        result = set_variable(name, value)
        
        if "errors" in result:
            print(f"❌ Error setting {name}: {result['errors']}")
        else:
            print(f"✅ Successfully set {name}")
    
    print("🎉 API key fix complete!")

if __name__ == "__main__":
    main()