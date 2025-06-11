#!/usr/bin/env python3
"""Add database connection checks to all functions"""

import re

# Read the file
with open('src/agent/database.py', 'r') as f:
    content = f.read()

# Find all async functions that use conn
pattern = r'(async def [^:]+:\n[^}]+?async with db_manager\.acquire\(\) as conn:\n)'

def add_check(match):
    func_def = match.group(1)
    # Check if already has the check
    if "if not conn:" in func_def:
        return func_def
    
    # Add the check
    lines = func_def.split('\n')
    indent = '        '  # Standard indent for function body
    new_lines = lines[:-1] + [
        indent + "if not conn:",
        indent + "    return []  # No database connection",
        lines[-1]
    ]
    return '\n'.join(new_lines)

# Replace all occurrences
new_content = re.sub(pattern, add_check, content, flags=re.MULTILINE | re.DOTALL)

# Write back
with open('src/agent/database.py', 'w') as f:
    f.write(new_content)

print("✅ Added database checks to all functions")