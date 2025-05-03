# DisasterLens AI - Backend

The backend component of DisasterLens AI provides the data collection, processing, and AI analysis capabilities that power the platform's disaster assessment functionality.

## What the Backend Does

The DisasterLens AI backend serves as the data processing engine for the platform, enabling:

1. **Pre-disaster baseline data collection** - Gathering and storing information about communities before disasters occur
2. **Post-disaster information aggregation** - Collecting, verifying, and organizing data from various sources during emergencies
3. **AI-powered report generation** - Creating comprehensive situation reports using gathered data
4. **API services** - Providing structured data access to the frontend application

## Key Components

### OpenStreetMap Integration

The backend uses OpenStreetMap to automatically collect baseline data about communities:

- **Location Search**: Converts location queries into geographic coordinates
- **Points of Interest**: Identifies critical infrastructure (hospitals, schools, shelters)
- **Boundary Data**: Determines the geographic area affected by disasters
- **Spatial Analysis**: Calculates areas impacted and population affected

### Disaster Data Discovery

When a disaster occurs, the backend:

- **Crawls News Sources**: Extracts relevant information from news articles
- **Monitors Social Media**: Aggregates posts related to the disaster
- **Processes Field Reports**: Organizes data submitted by on-site responders
- **Verifies Information**: Cross-references data from multiple sources

### AI Report Generation

The backend leverages Google's Gemini AI to:

- **Structure Raw Data**: Organizes scattered information into a coherent format
- **Generate Summaries**: Creates concise overviews of the situation
- **Identify Priorities**: Highlights areas of greatest need
- **Create Recommendations**: Suggests resource allocation strategies

### Background Processing

Resource-intensive tasks are handled asynchronously:

- **Job Queue System**: Manages data processing tasks without blocking API responses
- **Progress Tracking**: Provides updates on long-running operations
- **Error Handling**: Gracefully recovers from processing failures
- **Caching**: Stores intermediate results to speed up repeated operations

## Technical Implementation

### Core Technologies

- **FastAPI**: High-performance API framework with automatic documentation
- **Pydantic**: Data validation and settings management
- **Google Generative AI**: AI-powered text generation and analysis
- **OSMnx**: OpenStreetMap network analysis
- **GeoPandas**: Geospatial data processing
- **Newspaper3k**: News article scraping and extraction

### API Structure

The backend exposes several key endpoints:

- **Pre-Disaster Collection**: `/api/pre-disaster/collect` - Gathers baseline community data
- **Disaster Discovery**: `/api/discover` - Searches for disaster-related information
- **Report Generation**: `/api/generate-report` - Creates comprehensive situation reports
- **Job Management**: `/api/job/{job_id}` - Tracks progress of background tasks
- **Report Retrieval**: `/api/reports` and `/api/report/{report_id}` - Accesses generated reports

### Data Flow

1. **Data Collection**: External data is gathered through API integrations and web scraping
2. **Processing Pipeline**: Raw data is cleaned, structured, and enriched
3. **AI Analysis**: Processed data is sent to AI models for analysis and report generation
4. **Storage**: Results are saved in structured formats (JSON, Markdown, GeoJSON)
5. **API Access**: Processed data is made available to the frontend through REST endpoints

## Development Setup

For detailed setup instructions, see the Getting Started section below.

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