from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import sys
import json
from datetime import datetime

# Import the bravo module
from app.services import bravo

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active jobs (in a real app, use a database)
active_jobs = {}

# Request models
class DiscoveryRequest(BaseModel):
    query: str

class ReportRequest(BaseModel):
    discovery_file: Optional[str] = None
    query: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "DisasterLens AI API"}

@app.post("/api/discover")
async def discover_disaster_data(request: DiscoveryRequest, background_tasks: BackgroundTasks):
    """Discover disaster data based on query"""
    job_id = f"job_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    active_jobs[job_id] = {
        "status": "discovering",
        "query": request.query,
        "progress": 0,
        "result": None,
        "error": None
    }
    
    # Run discovery in background
    background_tasks.add_task(run_discovery, job_id, request.query)
    
    return {"job_id": job_id}

@app.post("/api/generate-report")
async def generate_report(request: ReportRequest, background_tasks: BackgroundTasks):
    """Generate a comprehensive disaster report"""
    if not request.discovery_file and not request.query:
        raise HTTPException(status_code=400, detail="Either discovery_file or query must be provided")
    
    job_id = f"job_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    active_jobs[job_id] = {
        "status": "processing",
        "progress": 0,
        "result": None,
        "error": None
    }
    
    # Run report generation in background
    background_tasks.add_task(run_report_generation, job_id, request.discovery_file, request.query)
    
    return {"job_id": job_id}

@app.get("/api/job/{job_id}")
async def get_job_status(job_id: str):
    """Check the status of a job"""
    if job_id not in active_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return active_jobs[job_id]

@app.get("/api/reports")
async def get_recent_reports():
    """Get list of recently generated reports"""
    reports = []
    
    # Get report files
    os.makedirs("disaster_data", exist_ok=True)
    report_files = []
    for file in os.listdir("."):
        if file.startswith("disaster_report_") and file.endswith(".md"):
            report_files.append(file)
    
    # Sort by creation time (newest first)
    report_files.sort(key=lambda f: os.path.getctime(f) if os.path.exists(f) else 0, reverse=True)
    
    # Add report files
    for file in report_files[:10]:  # Limit to 10
        try:
            with open(file, 'r') as f:
                content = f.read()
                title = content.split('\n')[0].replace('# ', '') if content.startswith('# ') else file
                
                reports.append({
                    "id": file,
                    "title": title,
                    "date": datetime.fromtimestamp(os.path.getctime(file)).strftime('%Y-%m-%d %H:%M:%S'),
                    "type": "file"
                })
        except:
            pass
    
    # Add completed jobs with reports
    for job_id, job in active_jobs.items():
        if job["status"] == "completed" and job.get("result") and isinstance(job.get("result"), str):
            if job["result"].startswith("# "):  # It's a markdown report
                title = job["result"].split('\n')[0].replace('# ', '')
                reports.append({
                    "id": job_id,
                    "title": title,
                    "date": job_id.replace("job_", "").replace("_", " "),
                    "type": "job"
                })
    
    return reports

@app.get("/api/report/{report_id}")
async def get_report(report_id: str):
    """Get a specific report"""
    # Check if it's a job ID
    if report_id in active_jobs and active_jobs[report_id]["status"] == "completed":
        return {
            "content": active_jobs[report_id]["result"],
            "format": "markdown"
        }
    
    # Check if it's a file
    if os.path.exists(report_id) and report_id.startswith("disaster_report_"):
        try:
            with open(report_id, 'r') as f:
                content = f.read()
                return {
                    "content": content,
                    "format": "markdown"
                }
        except:
            pass
    
    raise HTTPException(status_code=404, detail="Report not found")

# Background task functions
async def run_discovery(job_id: str, query: str):
    """Run disaster data discovery in background"""
    try:
        # Update progress
        active_jobs[job_id]["progress"] = 10
        
        # Use bravo's genai_client to create a discovery prompt
        client = bravo.genai_client(api_key=os.environ.get("GEMINI_API_KEY"))
        active_jobs[job_id]["progress"] = 30
        
        prompt = f"""
        Find news articles about the following disaster: {query}
        
        Return JSON in this format:
        {{
          "event_name": "disaster name",
          "start_date": "YYYY-MM-DD",
          "end_date": "YYYY-MM-DD",
          "sources": [
            {{"url": "full_url_1", "title": "article title", "description": "brief description"}},
            {{"url": "full_url_2", "title": "article title", "description": "brief description"}}
          ]
        }}
        """
        
        response = client.models.generate_content(
            contents=prompt,
            model="gemini-2.0-flash"
        )
        result = response.text
        active_jobs[job_id]["progress"] = 70
        
        # Clean up the JSON if needed
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        elif "```" in result:
            result = result.split("```")[1].split("```")[0].strip()
        
        # Save to file
        os.makedirs("disaster_data", exist_ok=True)
        filename = f"discovery_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        file_path = f"disaster_data/{filename}"
        with open(file_path, "w") as f:
            f.write(result)
        
        # Update job status
        active_jobs[job_id]["status"] = "completed"
        active_jobs[job_id]["result"] = filename
        active_jobs[job_id]["progress"] = 100
    except Exception as e:
        active_jobs[job_id]["status"] = "error"
        active_jobs[job_id]["error"] = str(e)

async def run_report_generation(job_id: str, discovery_file: Optional[str], query: Optional[str]):
    """Generate report in background"""
    try:
        # Update progress
        active_jobs[job_id]["progress"] = 10
        
        # If discovery file is provided, use it
        if discovery_file:
            file_path = f"disaster_data/{discovery_file}"
            if not os.path.exists(file_path):
                raise Exception(f"Discovery file not found: {file_path}")
        else:
            # First run discovery with the query
            active_jobs[job_id]["status"] = "discovering"
            discovery_job_id = f"discovery_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            await run_discovery("temp_" + discovery_job_id, query)
            
            if active_jobs["temp_" + discovery_job_id]["status"] != "completed":
                raise Exception(f"Discovery failed: {active_jobs['temp_' + discovery_job_id].get('error', 'Unknown error')}")
            
            file_path = f"disaster_data/{active_jobs['temp_' + discovery_job_id]['result']}"
            active_jobs[job_id]["progress"] = 40
        
        # Generate report using bravo's manual_pipeline
        active_jobs[job_id]["status"] = "processing"
        report = bravo.manual_pipeline(file_path)
        
        # Update job status
        active_jobs[job_id]["status"] = "completed"
        active_jobs[job_id]["result"] = report
        active_jobs[job_id]["progress"] = 100
    except Exception as e:
        active_jobs[job_id]["status"] = "error"
        active_jobs[job_id]["error"] = str(e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)