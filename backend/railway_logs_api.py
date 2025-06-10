#!/usr/bin/env python3
"""Railway Logs API - для просмотра логов деплоя"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
import requests
import json
from datetime import datetime

app = FastAPI(title="Railway Logs Viewer")

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

@app.get("/")
async def root():
    return {"message": "Railway Logs API", "endpoints": ["/deployments", "/logs/{deployment_id}", "/status"]}

@app.get("/deployments")
async def get_deployments():
    """Получить список деплоев"""
    query = """
    query deployments($first: Int, $input: DeploymentListInput) {
        deployments(first: $first, input: $input) {
            edges {
                node {
                    id
                    status
                    createdAt
                    updatedAt
                    meta
                    staticUrl
                }
            }
        }
    }
    """
    
    variables = {
        "first": 10,
        "input": {
            "projectId": PROJECT_ID,
            "environmentId": ENV_ID,
            "serviceId": SERVICE_ID
        }
    }
    
    result = make_graphql_request(query, variables)
    
    if "errors" in result:
        raise HTTPException(status_code=500, detail=result["errors"])
    
    return result["data"]["deployments"]["edges"]

@app.get("/logs/{deployment_id}")
async def get_deployment_logs(deployment_id: str):
    """Получить логи конкретного деплоя"""
    query = """
    query deploymentLogs($deploymentId: String!, $filter: DeploymentLogFilter) {
        deploymentLogs(deploymentId: $deploymentId, filter: $filter) {
            edges {
                node {
                    id
                    timestamp
                    message
                    severity
                }
            }
        }
    }
    """
    
    variables = {
        "deploymentId": deployment_id,
        "filter": {}
    }
    
    result = make_graphql_request(query, variables)
    
    if "errors" in result:
        raise HTTPException(status_code=500, detail=result["errors"])
    
    return result["data"]["deploymentLogs"]["edges"]

@app.get("/status")
async def get_service_status():
    """Получить статус сервиса"""
    query = """
    query service($id: String!) {
        service(id: $id) {
            id
            name
            icon
            createdAt
            updatedAt
            serviceInstances {
                edges {
                    node {
                        id
                        buildCommand
                        startCommand
                        isUpdatable
                        latestDeployment {
                            id
                            status
                            createdAt
                            staticUrl
                        }
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
    
    if "errors" in result:
        raise HTTPException(status_code=500, detail=result["errors"])
    
    return result["data"]["service"]

@app.get("/logs-ui", response_class=HTMLResponse)
async def logs_ui():
    """Красивый UI для просмотра логов"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Railway Logs Viewer</title>
        <style>
            body { font-family: monospace; background: #1a1a1a; color: #fff; margin: 0; padding: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { margin-bottom: 20px; }
            .status { background: #2a2a2a; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .deployments { background: #2a2a2a; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .deployment { 
                background: #3a3a3a; 
                margin: 10px 0; 
                padding: 10px; 
                border-radius: 3px; 
                cursor: pointer;
                border-left: 4px solid #666;
            }
            .deployment.SUCCESS { border-left-color: #4CAF50; }
            .deployment.BUILDING { border-left-color: #FF9800; }
            .deployment.FAILED { border-left-color: #F44336; }
            .logs { background: #1e1e1e; padding: 15px; border-radius: 5px; max-height: 600px; overflow-y: auto; }
            .log-entry { margin: 2px 0; }
            .log-timestamp { color: #888; }
            .log-message { color: #fff; }
            .log-error { color: #ff6b6b; }
            .log-warn { color: #ffd93d; }
            .log-info { color: #6bcf7f; }
            button { background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 3px; cursor: pointer; }
            button:hover { background: #005a9e; }
            .refresh { text-align: right; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚂 Railway Logs Viewer</h1>
                <div class="refresh">
                    <button onclick="loadAll()">🔄 Refresh All</button>
                </div>
            </div>
            
            <div class="status">
                <h2>📊 Service Status</h2>
                <div id="status-content">Loading...</div>
            </div>
            
            <div class="deployments">
                <h2>🚀 Recent Deployments</h2>
                <div id="deployments-content">Loading...</div>
            </div>
            
            <div class="logs">
                <h2>📝 Deployment Logs</h2>
                <div id="logs-content">Select a deployment to view logs</div>
            </div>
        </div>
        
        <script>
            async function loadStatus() {
                try {
                    const response = await fetch('/status');
                    const data = await response.json();
                    const statusDiv = document.getElementById('status-content');
                    
                    const instance = data.serviceInstances.edges[0]?.node;
                    if (instance) {
                        const deployment = instance.latestDeployment;
                        const domain = instance.domains.serviceDomains[0]?.domain || 'No domain';
                        
                        statusDiv.innerHTML = `
                            <strong>Service:</strong> ${data.name}<br>
                            <strong>Domain:</strong> <a href="https://${domain}" target="_blank">https://${domain}</a><br>
                            <strong>Latest Deployment:</strong> ${deployment.status} (${new Date(deployment.createdAt).toLocaleString()})<br>
                            <strong>Build Command:</strong> ${instance.buildCommand || 'Auto'}<br>
                            <strong>Start Command:</strong> ${instance.startCommand || 'Auto'}
                        `;
                    }
                } catch (error) {
                    document.getElementById('status-content').innerHTML = 'Error loading status: ' + error.message;
                }
            }
            
            async function loadDeployments() {
                try {
                    const response = await fetch('/deployments');
                    const deployments = await response.json();
                    const deploymentsDiv = document.getElementById('deployments-content');
                    
                    deploymentsDiv.innerHTML = deployments.map(edge => {
                        const dep = edge.node;
                        return `
                            <div class="deployment ${dep.status}" onclick="loadLogs('${dep.id}')">
                                <strong>ID:</strong> ${dep.id.slice(0, 8)}...<br>
                                <strong>Status:</strong> ${dep.status}<br>
                                <strong>Created:</strong> ${new Date(dep.createdAt).toLocaleString()}<br>
                                ${dep.staticUrl ? `<strong>URL:</strong> <a href="${dep.staticUrl}" target="_blank">${dep.staticUrl}</a>` : ''}
                            </div>
                        `;
                    }).join('');
                } catch (error) {
                    document.getElementById('deployments-content').innerHTML = 'Error loading deployments: ' + error.message;
                }
            }
            
            async function loadLogs(deploymentId) {
                const logsDiv = document.getElementById('logs-content');
                logsDiv.innerHTML = 'Loading logs...';
                
                try {
                    const response = await fetch(`/logs/${deploymentId}`);
                    const logs = await response.json();
                    
                    if (logs.length === 0) {
                        logsDiv.innerHTML = 'No logs found for this deployment';
                        return;
                    }
                    
                    logsDiv.innerHTML = logs.map(edge => {
                        const log = edge.node;
                        const timestamp = new Date(log.timestamp).toLocaleTimeString();
                        const severityClass = log.severity ? `log-${log.severity.toLowerCase()}` : '';
                        
                        return `
                            <div class="log-entry">
                                <span class="log-timestamp">[${timestamp}]</span>
                                <span class="log-message ${severityClass}">${log.message}</span>
                            </div>
                        `;
                    }).join('');
                    
                    // Scroll to bottom
                    logsDiv.scrollTop = logsDiv.scrollHeight;
                } catch (error) {
                    logsDiv.innerHTML = 'Error loading logs: ' + error.message;
                }
            }
            
            function loadAll() {
                loadStatus();
                loadDeployments();
            }
            
            // Load on page start
            loadAll();
            
            // Auto-refresh every 30 seconds
            setInterval(loadAll, 30000);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)