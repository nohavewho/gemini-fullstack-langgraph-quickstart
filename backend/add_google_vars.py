#!/usr/bin/env python3
"""Add additional Google variables to Railway"""

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
    print("🔧 Adding Google credentials to Railway...")
    
    # Добавляем нужные переменные для Google Auth
    variables_to_add = {
        "GOOGLE_API_KEY": "7a6d6fdc120f9c927fed34e80372dc9b3081f",
        "GEMINI_API_KEY": "7a6d6fdc120f9c927fed34e80372dc9b3081f"
    }
    
    for name, value in variables_to_add.items():
        print(f"⚙️  Setting {name}...")
        result = set_variable(name, value)
        
        if "errors" in result:
            print(f"❌ Error setting {name}: {result['errors']}")
        else:
            print(f"✅ Successfully set {name}")
    
    print("🎉 Google credentials setup complete!")

if __name__ == "__main__":
    main()