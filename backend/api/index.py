"""
Vercel Function handler for the FastAPI backend
"""
import os
import sys
from pathlib import Path

# Add the parent directory to the Python path so we can import our modules
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the FastAPI app
from src.agent.app import app

# Vercel expects a handler function
handler = app