# mypy: disable - error - code = "no-untyped-def,misc"
import pathlib
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import fastapi.exceptions
import json

# Define the FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "press-monitor-backend"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Press Monitor LangGraph Backend", "status": "running"}

# Import research graph and press monitoring
from .graph import graph
from .press_monitor_langgraph import (
    detect_press_monitor_intent, 
    extract_monitoring_params,
    press_monitor_node,
    create_press_monitor_response
)
from .state import OverallState as State
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
import asyncio

@app.post("/api/press-monitor")
async def run_press_monitor(request: Request):
    """Run press monitoring for Azerbaijan"""
    try:
        data = await request.json()
        mode = data.get("mode", "neighbors_priority")
        options = data.get("options", {})
        
        print(f"📰 Press monitoring mode: {mode}")
        print(f"🔧 Options: {options}")
        
        # Create query based on mode and options
        query = "monitor press about azerbaijan"
        
        if mode == "custom":
            if options.get("languages"):
                langs = " ".join(options["languages"])
                query += f" in languages: {langs}"
            elif options.get("regions"):
                regions = " ".join(options["regions"])
                query += f" in regions: {regions}"
        else:
            query += f" mode: {mode}"
        
        # Run through press monitoring
        state = State(
            messages=[HumanMessage(content=query)],
            integrated_mode=False  # Standalone mode
        )
        
        result = await press_monitor_node(state)
        
        messages = result.get("messages", [])
        if messages:
            return {"success": True, "result": messages[-1].content}
        else:
            return {"success": False, "error": "No response generated"}
            
    except Exception as e:
        print(f"❌ Error in press monitoring: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/press-monitor-stream")
async def run_press_monitor_stream(request: Request):
    """Run press monitoring with SSE streaming updates"""
    try:
        data = await request.json()
        target_countries = data.get("target_countries", ["azerbaijan"])
        source_countries = data.get("source_countries", [])
        search_mode = data.get("search_mode", "about")
        date_from = data.get("date_from")
        date_to = data.get("date_to")
        
        print(f"📰 Streaming press monitor - Target: {target_countries}, Mode: {search_mode}")
        print(f"📅 Date range: {date_from} to {date_to}")
        
        async def generate_stream():
            try:
                # Initial status
                yield f"data: {json.dumps({'type': 'status', 'message': 'Initializing press monitor...'})}\n\n"
                
                # Create query for press monitoring
                query = f"monitor press about {' '.join(target_countries)}"
                if search_mode == "in" and source_countries:
                    query += f" in {' '.join(source_countries)}"
                
                # Add date range to query if provided
                if date_from and date_to:
                    query += f" from {date_from} to {date_to}"
                
                yield f"data: {json.dumps({'type': 'status', 'message': 'Analysis in progress... This may take several minutes.'})}\n\n"
                
                # Run actual press monitoring for real results
                state = State(
                    messages=[HumanMessage(content=query)],
                    integrated_mode=False,
                    press_monitor_params={
                        "search_mode": search_mode,
                        "target_languages": ["tr", "ru", "fa", "ka", "hy", "en"],
                        "target_regions": [],
                        "date_filter": f"after:{date_from} before:{date_to}" if date_from and date_to else None
                    }
                )
                
                result = await press_monitor_node(state)
                
                # Build digest content
                digest_content = "No results generated"
                if "press_monitoring_results" in result:
                    pr = result["press_monitoring_results"]
                    exec_summary = pr.get("executive_summary", "")
                    pos_digest = pr.get("positive_digest", "")
                    neg_digest = pr.get("negative_digest", "")

                    # If no executive_summary, generate the full report
                    if not exec_summary and not pos_digest and not neg_digest:
                        print("⚠️ No digest fields found, generating full report...")
                        full_report = await create_press_monitor_response(result)
                        digest_content = full_report
                    else:
                        digest_content = "".join([
                            "## 📊 Executive Summary\n" + exec_summary + "\n\n" if exec_summary else "",
                            "## ✅ Positive Digest\n" + pos_digest + "\n\n" if pos_digest else "",
                            "## ❌ Negative Digest\n" + neg_digest + "\n" if neg_digest else "",
                        ]) or "No digest generated"
                else:
                    messages = result.get("messages", [])
                    digest_content = messages[-1].content if messages else "No results generated"
                
                # Complete
                yield f"data: {json.dumps({'type': 'complete', 'digest': digest_content, 'articles': [], 'duration': 'unknown'})}\n\n"
                
            except Exception as e:
                print(f"❌ Streaming error: {e}")
                import traceback
                traceback.print_exc()
                yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except Exception as e:
        print(f"❌ Error in press monitor stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/research/stream")
async def run_research_stream(request: Request):
    """Run research query with streaming updates"""
    try:
        data = await request.json()
        query = data.get("query", "")
        effort = data.get("effort", "medium")
        model = data.get("model", "gemini-2.0-flash")
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        print(f"🔍 Research query: {query}")
        print(f"⚡ Effort: {effort}, Model: {model}")
        
        async def generate():
            try:
                # Send initial status
                yield f"data: {json.dumps({'type': 'status', 'message': 'Initializing search...'})}\n\n"
                
                # Map effort to research parameters
                effort_config = {
                    "low": {"initial_search_query_count": 3, "max_research_loops": 1},
                    "medium": {"initial_search_query_count": 5, "max_research_loops": 2},
                    "high": {"initial_search_query_count": 8, "max_research_loops": 3}
                }
                
                config_params = effort_config.get(effort, effort_config["medium"])
                config_params["reasoning_model"] = model
                config_params["query_generator_model"] = model
                
                # Run the research graph with streaming
                config = {"configurable": config_params}
                
                yield f"data: {json.dumps({'type': 'status', 'message': 'Generating search queries...'})}\n\n"
                
                # Start the research with status updates
                search_count = 0
                
                async for chunk in graph.astream(
                    {
                        "messages": [HumanMessage(content=query)],
                        "initial_search_query_count": config_params["initial_search_query_count"],
                        "max_research_loops": config_params["max_research_loops"],
                        "reasoning_model": model
                    },
                    config=config,
                    stream_mode="updates"
                ):
                    # Send updates about the process
                    if "generate_query" in chunk:
                        queries = chunk.get("generate_query", {}).get("query_list", [])
                        if queries:
                            yield f"data: {json.dumps({'type': 'status', 'message': f'Generated {len(queries)} search queries'})}\n\n"
                    
                    elif "web_research" in chunk:
                        search_queries = chunk.get("web_research", {}).get("search_query", [])
                        if search_queries and len(search_queries) > 0:
                            search_count += 1
                            search_query = str(search_queries[0])[:50]
                            # Safely create message
                            message = {'type': 'status', 'message': f'Searching ({search_count}/{config_params["initial_search_query_count"]}): {search_query}...'}
                            yield f"data: {json.dumps(message, ensure_ascii=False)}\n\n"
                            
                            # Add collecting status
                            yield f"data: {json.dumps({'type': 'status', 'message': 'Collecting articles from search results...'})}\n\n"
                    
                    elif "reflection" in chunk:
                        yield f"data: {json.dumps({'type': 'status', 'message': 'Analyzing collected articles...'})}\n\n"
                        yield f"data: {json.dumps({'type': 'status', 'message': 'Evaluating coverage completeness...'})}\n\n"
                    
                    elif "finalize_answer" in chunk:
                        yield f"data: {json.dumps({'type': 'status', 'message': 'Processing sentiment analysis...'})}\n\n"
                        yield f"data: {json.dumps({'type': 'status', 'message': 'Generating press digest...'})}\n\n"
                        # Send the final result
                        messages = chunk.get("finalize_answer", {}).get("messages", [])
                        if messages:
                            final_message = messages[-1]
                            if hasattr(final_message, 'content'):
                                yield f"data: {json.dumps({'type': 'result', 'content': final_message.content})}\n\n"
                
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                
            except Exception as e:
                print(f"❌ Streaming error: {e}")
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except Exception as e:
        print(f"❌ Error in research stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/research")
async def run_research(request: Request):
    """Run research query or press monitoring"""
    try:
        data = await request.json()
        query = data.get("query", "")
        effort = data.get("effort", "medium")
        model = data.get("model", "gemini-2.0-flash")
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        print(f"🔍 Research query: {query}")
        print(f"⚡ Effort: {effort}, Model: {model}")
        
        # Check if this is a press monitoring request
        if detect_press_monitor_intent(query):
            print("📰 Detected press monitoring intent!")
            
            # Extract monitoring parameters
            params = extract_monitoring_params(query)
            print(f"📊 Monitoring params: {params}")
            
            # Create a simple state for press monitoring
            state = State(
                messages=[HumanMessage(content=query)],
                integrated_mode=True  # Enable integrated mode for dual analysis
            )
            
            # Run press monitoring
            result = await press_monitor_node(state)
            
            # Check if we should continue to deep research
            if result.get("continue_to_research", False):
                # Get press monitoring results
                press_results = result.get("press_monitoring_results", {})
                
                # Create enhanced query for deep research
                enhanced_query = f"""
{query}

По результатам мониторинга прессы найдено {press_results['statistics']['total']} статей.
Теперь проведите глубокий анализ интернета по этой теме, включая:
- Анализ социальных сетей и общественного мнения
- Официальные заявления и дипломатические источники  
- Экспертные мнения и аналитические материалы
- Исторический контекст взаимоотношений
"""
                
                # Run deep research with enhanced query
                config_params = {
                    "initial_search_query_count": 8,
                    "max_research_loops": 3,
                    "reasoning_model": model,
                    "query_generator_model": model
                }
                
                research_result = await graph.ainvoke(
                    {
                        "messages": [HumanMessage(content=enhanced_query)],
                        "initial_search_query_count": config_params["initial_search_query_count"],
                        "max_research_loops": config_params["max_research_loops"],
                        "reasoning_model": model
                    },
                    config={"configurable": config_params}
                )
                
                # Combine results
                combined_response = f"""
# 📰 Комплексный Анализ: Азербайджан в Мировой Прессе

## Этап 1: Мониторинг Прессы

{result['messages'][-1].content}

### 📊 Краткая Сводка:
{press_results.get('executive_summary', 'Нет данных')}

## Этап 2: Глубокий Веб-Анализ

{research_result['messages'][-1].content}
"""
                
                return {"success": True, "result": combined_response}
            else:
                # Return standalone press monitoring results
                messages = result.get("messages", [])
                if messages:
                    return {"success": True, "result": messages[-1].content}
                else:
                    return {"success": False, "error": "No response generated"}
        
        
        # Map effort to research parameters
        effort_config = {
            "low": {"initial_search_query_count": 3, "max_research_loops": 1},
            "medium": {"initial_search_query_count": 5, "max_research_loops": 2}, 
            "high": {"initial_search_query_count": 8, "max_research_loops": 3}
        }
        
        config_params = effort_config.get(effort, effort_config["medium"])
        config_params["reasoning_model"] = model
        config_params["query_generator_model"] = model
        
        # Run the research graph
        config = {"configurable": config_params}
        
        result = await graph.ainvoke(
            {
                "messages": [HumanMessage(content=query)],
                "initial_search_query_count": config_params["initial_search_query_count"],
                "max_research_loops": config_params["max_research_loops"],
                "reasoning_model": model
            },
            config=config
        )
        
        # Extract the final message
        messages = result.get("messages", [])
        if messages:
            final_message = messages[-1]
            if hasattr(final_message, 'content'):
                return {"success": True, "result": final_message.content}
            else:
                return {"success": True, "result": str(final_message)}
        else:
            return {"success": False, "error": "No response generated"}
            
    except Exception as e:
        print(f"❌ Error in research: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def create_frontend_router(build_dir="../frontend/dist"):
    """Creates a router to serve the React frontend.

    Args:
        build_dir: Path to the React build directory relative to this file.

    Returns:
        A Starlette application serving the frontend.
    """
    build_path = pathlib.Path(__file__).parent.parent.parent / build_dir
    static_files_path = build_path / "assets"  # Vite uses 'assets' subdir

    if not build_path.is_dir() or not (build_path / "index.html").is_file():
        print(
            f"WARN: Frontend build directory not found or incomplete at {build_path}. Serving frontend will likely fail."
        )
        # Return a dummy router if build isn't ready
        from starlette.routing import Route

        async def dummy_frontend(request):
            return Response(
                "Frontend not built. Run 'npm run build' in the frontend directory.",
                media_type="text/plain",
                status_code=503,
            )

        return Route("/{path:path}", endpoint=dummy_frontend)

    build_dir = pathlib.Path(build_dir)

    react = FastAPI(openapi_url="")
    react.mount(
        "/assets", StaticFiles(directory=static_files_path), name="static_assets"
    )

    @react.get("/{path:path}")
    async def handle_catch_all(request: Request, path: str):
        fp = build_path / path
        if not fp.exists() or not fp.is_file():
            fp = build_path / "index.html"
        return fastapi.responses.FileResponse(fp)

    return react


# Mount the frontend under /app to not conflict with the LangGraph API routes
app.mount(
    "/app",
    create_frontend_router(),
    name="frontend",
)
