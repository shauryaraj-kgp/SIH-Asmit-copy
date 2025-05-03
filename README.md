# Tri-Aid: Rapid Mapping and AI-Powered Disaster Assessment Platform

## 1) Motivation / Goal

After earthquakes, floods, or other disasters, response efforts are often delayed because data is  
slow to arrive, incomplete, or hard to access. Government reports may take weeks, while NGOs  
and local volunteers don't have the tools to assess needs quickly.

This challenge aims to build a digital platform that helps communities and responders work  
together to create a clear picture of the disaster within 48 hours.

The platform should:

- Map what the community looked like before the disaster (schools, shelters,  
  hospitals, population).  
- Add updates from after the disaster (what's damaged, where help is needed).  
- Collect and organize all this information so it can be used by an AI tool (like  
  ChatGPT) to automatically generate a situation report.  
- Publish a short, clear report that shows what's happening and what's needed — fast.  

This way, aid reaches the right people, in the right places, at the right time.

---

## 2) Key Features

### Before the Disaster (Alpha Team)

Think of this team as the "setup crew" that creates a detailed map of the community:

- Search any location and automatically pull in public data (population, key buildings, etc.).  
- Use tools to gather open data from local government websites.  
- Enter and save that data in an organized format.  

### After the Disaster (Bravo Team)

This team focuses on "what's happening now":

- Gather updates from social media, news articles, and government announcements.  
- Volunteers and field teams send in photos, observations, and GPS locations.  
- A shared portal lets users sort through and verify this info.  
- A map shows which places are working, damaged, or still need help.  

### Shared Tools

- Easy-to-use forms for entering data from anywhere.  
- A "scorecard" to show how complete the data is for each area.  
- A tool that cleans and organizes the data so an AI can use it.  
- Connect to ChatGPT or similar AI to summarize all the info into a readable report.  

---

## 3) Project Setup

### Prerequisites
- Node.js 18+ and npm/pnpm for the frontend
- Python 3.10+ for the backend
- API keys for Gemini AI (for report generation)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/disasterlens-ai.git
   cd disasterlens-ai
   ```

2. Set up the backend
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend
   ```bash
   cd frontend
   pnpm install  # or npm install
   ```

4. Create environment variables
   - Create a `.env` file in the backend directory with:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     ```

### Running the Application

1. Start the backend server
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python main.py
   ```

2. Start the frontend development server
   ```bash
   cd frontend
   pnpm dev  # or npm run dev
   ```

3. Access the application at http://localhost:5173

## 4) Project Structure

```
DisasterLens AI/
├── README.md           # Main project documentation
├── backend/            # FastAPI backend application
│   ├── main.py         # Entry point for backend server
│   ├── requirements.txt# Python dependencies
│   ├── app/            # Backend application modules
│   ├── data/           # Stored disaster and location data
│   └── ...
└── frontend/           # React frontend application
    ├── src/            # Frontend source code
    │   ├── components/ # React components
    │   ├── pages/      # Application pages
    │   └── ...
    ├── package.json    # Frontend dependencies
    └── ...
```

## 5) Hints & Resources

You can use:

- Mapping tools like Leaflet or Mapbox to build interactive maps.  
- Data scraping tools like `snscrape` (for social media) or `Newspaper3k` (for online news).  
- Survey and field tools like KoboToolbox to gather field reports.  
- Python libraries like `pandas` and `LangChain` to organize and format data for GPT.  

To generate the summary report, consider using **Retrieval-Augmented Generation (RAG)** — a  
method that helps AI summarize only what's in the data (reduces hallucinations).

**Organizing team:**  
Shreeansh Agawal, Linn Bieske, Andrea Jimenez, Kai Wiederhold, Lisa Sklyarova

---

## 6) Evaluation Criteria

| What Will Be Evaluated        | What Good Looks Like                                                |
|------------------------------|----------------------------------------------------------------------|
| Pre-Disaster Map Quality      | Accurate, complete baseline maps for each area                      |
| Post-Disaster Data Collection | Timely updates from social/news sources + structured field input     |
| Data Cleanliness & Structure  | Clean, labeled, AI-ready data                                       |
| 48-Hour Summary Output        | A clear, concise disaster report is produced within 48 hours        |
| Map & Interface Usability     | Easy to navigate, intuitive filters, and contribution tools          |
| Scalability                   | Can work for other regions and future disasters                     |

---

## ✨ Why This Matters

A working Tri-Aid platform would make disaster response faster, smarter, and more inclusive —  
giving everyday people the tools to help, no matter where they are. It would also ensure that  
emergency aid goes where it's most needed — not just where information arrives first.

**Organizing team:**  
Shreeansh Agawal, Linn Bieske, Andrea Jimenez, Kai Wiederhold, Lisa Sklyarova
