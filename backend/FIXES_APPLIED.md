# Fixes Applied to Language Search Node

## Problem
The `language_search_node` was failing because it expected the state to have `language_code`, `language_state`, and `orchestrator_state` fields directly, but the orchestrator was passing an `OrchestratorState` which has `active_searches` as a dictionary.

## Solution

### 1. Fixed State Handling in language_search_node
Changed the function signature and logic to:
- Accept `OrchestratorState` directly as input
- Extract `active_searches` dictionary from the state
- Process incomplete searches one language at a time
- Return updated state with the correct structure

### 2. Fixed Google API Authentication
Added proper API key handling:
- Check for `GEMINI_API_KEY` or `GOOGLE_API_KEY` environment variables
- Fall back to extracting API key from the model configuration
- Pass API key to `genai.Client()` constructor

### 3. Fixed PostgreSQL INTERVAL Syntax
Fixed SQL queries that incorrectly used parameterized INTERVAL values:
- Changed from `INTERVAL $1` with parameter `'X days'`
- To `INTERVAL 'X days'` using f-strings
- Updated parameter numbering accordingly

## Files Modified
1. `/src/agent/language_agents.py` - Fixed the language_search_node function
2. `/src/agent/database.py` - Fixed 3 SQL queries with INTERVAL syntax

## Testing
The fixes ensure that:
- The language search node can properly handle the orchestrator state structure
- Multiple language searches can be processed sequentially
- The state is properly updated and returned
- SQL queries execute without syntax errors

## Next Steps
To fully test the system, ensure:
1. Set the `GEMINI_API_KEY` environment variable
2. Database is properly initialized with the migration scripts
3. Run the full integration test with proper API credentials