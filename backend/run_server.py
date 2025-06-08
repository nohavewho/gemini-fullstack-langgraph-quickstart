#!/usr/bin/env python3
"""Run server directly with uvicorn"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.agent.app import app
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting Azerbaijan Press Monitor Server...")
    uvicorn.run(app, host="0.0.0.0", port=2024)