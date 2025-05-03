# DisasterLens AI - Backend

The backend component of the DisasterLens AI (Tri-Aid) platform is built with FastAPI and provides APIs for pre-disaster data collection, post-disaster information gathering, and report generation.

## Features

- **Pre-Disaster Data Collection**: Gathers baseline data about a location (hospitals, schools, shelters, etc.) using OpenStreetMap
- **Disaster Data Discovery**: Searches for and aggregates information about ongoing disasters
- **Report Generation**: Creates comprehensive disaster assessment reports using AI
- **Background Processing**: Handles resource-intensive tasks asynchronously
- **REST API**: Provides a clean interface for the frontend to interact with

## Getting Started

### Prerequisites

- Python 3.10+
- API key for Google's Gemini AI

### Installation

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables by creating a `.env` file in the `backend` directory with:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### Running the Server

Start the FastAPI server:

```bash
python main.py
```

The server will run at `http://localhost:8000`. You can access the API documentation at `http://localhost:8000/docs`.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/pre-disaster/collect` | POST | Collect pre-disaster data for a location |
| `/api/discover` | POST | Discover disaster data based on query |
| `/api/generate-report` | POST | Generate comprehensive disaster report |
| `/api/job/{job_id}` | GET | Check status of a background job |
| `/api/reports` | GET | Get list of recently generated reports |
| `/api/report/{report_id}` | GET | Get a specific report |

## Architecture

- `main.py` - Entry point and API routing
- `app/` - Core application modules
  - `api/` - API endpoints and request handling
  - `db/` - Database models and interactions
  - `models/` - Data models
  - `schemas/` - Pydantic schemas for validation
  - `services/` - Core business logic
    - `bravo.py` - Disaster data processing
    - `osm_service.py` - OpenStreetMap data collection
    - `RAG.py` - Retrieval-Augmented Generation for AI reports
    - `social_media_agent.py` - Social media data collection
  - `utils/` - Helper functions and utilities

## Data Storage

- `data/` - Directory for storing collected data
  - `boundaries/` - GeoJSON files for location boundaries
  - `pre_disaster/` - Pre-disaster data collected from OpenStreetMap
- `disaster_data/` - Storage for disaster discovery data
- `uploads/` - User-uploaded files

## Development

### Adding New Features

1. Create appropriate service modules in `app/services/`
2. Add new API endpoints in `main.py`
3. Update data models as needed

### Testing

To run tests (to be implemented):

```bash
pytest tests/
```

## Dependencies

Key dependencies include:
- FastAPI - Web framework
- uvicorn - ASGI server
- newspaper3k - News article scraping
- google-generativeai - Google Gemini AI integration
- overpy - OpenStreetMap API wrapper
- osmnx - OpenStreetMap network analysis
- geopandas - Geospatial data handling