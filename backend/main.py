from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import sys
import json
from datetime import datetime

# Import the bravo module and osm_service
from app.services import bravo
from app.services.osm_service import OSMService

# Initialize OSM service
osm_service = OSMService()

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
    
class LocationRequest(BaseModel):
    location: str
    structures: Optional[List[str]] = None

@app.get("/")
async def root():
    return {"message": "DisasterLens AI API"}

@app.post("/api/pre-disaster/collect")
async def collect_location_data(request: LocationRequest, background_tasks: BackgroundTasks):
    """Collect pre-disaster data for a location using OpenStreetMap"""
    job_id = f"predisaster_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Default structures if not provided
    if not request.structures:
        request.structures = ["hospital", "school", "shelter", "fire_station", "police", "water", "power"]
    
    active_jobs[job_id] = {
        "status": "collecting",
        "location": request.location,
        "structures": request.structures,
        "progress": 0,
        "result": None,
        "error": None
    }
    
    # Run collection in background
    background_tasks.add_task(run_location_data_collection, job_id, request.location, request.structures)
    
    return {"job_id": job_id}

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
            temp_discovery_id = f"temp_{discovery_job_id}"
            
            # Initialize the temp discovery job in active_jobs
            active_jobs[temp_discovery_id] = {
                "status": "discovering",
                "query": query,
                "progress": 0,
                "result": None,
                "error": None
            }
            
            # Run the discovery
            await run_discovery(temp_discovery_id, query)
            
            if temp_discovery_id not in active_jobs:
                raise Exception(f"Internal error: discovery job {temp_discovery_id} not found")
                
            if active_jobs[temp_discovery_id]["status"] != "completed":
                raise Exception(f"Discovery failed: {active_jobs[temp_discovery_id].get('error', 'Unknown error')}")
            
            file_path = f"disaster_data/{active_jobs[temp_discovery_id]['result']}"
            if not os.path.exists(file_path):
                raise Exception(f"Discovery file not found: {file_path}")
                
            active_jobs[job_id]["progress"] = 40
        
        # Generate report using bravo's manual_pipeline
        active_jobs[job_id]["status"] = "processing"
        print(f"Generating report from file: {file_path}")
        report = bravo.manual_pipeline(file_path)
        
        print(f"Report generation complete. Content length: {len(report) if report else 0}")
        print(f"Report starts with: {report[:100] if report else 'No content'}")
        
        # Ensure the report is a string with actual content
        if not report or not isinstance(report, str) or len(report) < 10:
            # If the report is empty or not a string, create a simple report
            report = f"""# Error in Report Generation
            
We encountered an issue generating the full report. 

Please try again with a different query or check the system logs.

Query: {query}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            print("Generated fallback report due to empty or invalid report content")
        
        # Update job status with the report content
        active_jobs[job_id]["status"] = "completed"
        active_jobs[job_id]["result"] = report
        active_jobs[job_id]["progress"] = 100
        print(f"Job {job_id} completed successfully with report content")
    except Exception as e:
        print(f"Error generating report: {str(e)}")
        active_jobs[job_id]["status"] = "error"
        active_jobs[job_id]["error"] = str(e)

# New background task for pre-disaster data collection
async def run_location_data_collection(job_id: str, location: str, structures: List[str]):
    """Run pre-disaster data collection in background"""
    try:
        # Update progress
        active_jobs[job_id]["progress"] = 10
        
        # Collect POI data
        active_jobs[job_id]["status"] = "collecting_poi"
        poi_data = osm_service.collect_poi_data(location, structures)
        active_jobs[job_id]["progress"] = 60
        
        # Collect boundary data
        active_jobs[job_id]["status"] = "collecting_boundary"
        boundary_info = osm_service.collect_boundary_data(location)
        active_jobs[job_id]["progress"] = 90
        
        # Compile results
        results = {
            "location": location,
            "timestamp": datetime.now().isoformat(),
            "poi_data": poi_data,
            "boundary_info": boundary_info
        }
        
        # Save results to file
        os.makedirs("data/pre_disaster", exist_ok=True)
        filename = f"predisaster_{location.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        file_path = f"data/pre_disaster/{filename}"
        
        with open(file_path, "w") as f:
            json.dump(results, f, indent=2)
        
        # Update job status
        active_jobs[job_id]["status"] = "completed"
        active_jobs[job_id]["result"] = results
        active_jobs[job_id]["file_path"] = file_path
        active_jobs[job_id]["progress"] = 100
        
    except Exception as e:
        active_jobs[job_id]["status"] = "error"
        active_jobs[job_id]["error"] = str(e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)