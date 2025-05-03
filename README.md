# DisasterLens AI: AI-Powered Disaster Assessment Platform

DisasterLens AI (also known as Tri-Aid) is a comprehensive disaster response platform that bridges the critical information gap during the first 48 hours after a disaster occurs. The platform combines pre-disaster mapping, real-time post-disaster data collection, and advanced AI analysis to generate rapid, actionable disaster assessment reports.

![DisasterLens AI Platform](https://via.placeholder.com/800x400?text=DisasterLens+AI+Platform)

## What DisasterLens AI Solves

When disasters strike, emergency responders and aid organizations often struggle with:
- Incomplete, delayed, or hard-to-access information
- Disconnected data sources and formats
- Lack of coordinated situation awareness
- Inability to quickly determine where resources are most needed

DisasterLens AI addresses these challenges by creating a unified platform where community members and professional responders can collaborate to build a comprehensive disaster assessment within 48 hours.

## How It Works

### 1. Pre-Disaster Baseline (Alpha Team)

The platform establishes baseline data about communities before disasters strike:

- **Automated Location Mapping**: Uses OpenStreetMap to gather data about critical infrastructure (hospitals, schools, shelters, etc.)
- **Population Data Integration**: Incorporates demographic information for affected areas
- **Risk Assessment**: Identifies vulnerable locations and populations based on historical and geographical data

### 2. Post-Disaster Data Collection (Bravo Team)

When a disaster occurs, the platform rapidly collects information through multiple channels:

- **Social Media Monitoring**: Aggregates and filters social media posts related to the disaster
- **News Source Integration**: Extracts relevant information from news articles and reports
- **Field Report Submission**: Mobile-optimized forms for on-site responders to submit observations
- **Damage Assessment**: Structured data collection for categorizing damage levels to infrastructure

### 3. AI-Powered Analysis

The platform leverages advanced AI to process and analyze collected data:

- **Data Verification**: Cross-references information from multiple sources to ensure accuracy
- **Information Categorization**: Automatically tags and organizes incoming data
- **Retrieval-Augmented Generation (RAG)**: Uses Google's Gemini AI to generate comprehensive situational reports
- **Time-Series Analysis**: Tracks changes in conditions over time to identify trends

### 4. Actionable Outputs

DisasterLens AI delivers several key outputs:

- **Interactive Disaster Maps**: Visual representation of affected areas with damage assessment overlays
- **Resource Allocation Recommendations**: AI-generated suggestions for prioritizing aid distribution
- **Comprehensive Situation Reports**: Clear, concise summaries of current conditions, needs, and response activities
- **API Integration**: Allows other disaster response tools to utilize the gathered data

## Technical Architecture

DisasterLens AI consists of two main components:

### Frontend (React Application)
- Interactive maps using MapLibre GL
- Intuitive data entry forms
- Real-time social media monitoring
- Report generation and viewing interfaces
- Responsive design for field use on mobile devices

### Backend (FastAPI Application)
- RESTful API endpoints for data collection and retrieval
- OpenStreetMap integration for location data
- Social media and news article scraping
- Background task processing for resource-intensive operations
- Google Gemini AI integration for report generation

## Real-World Impact

DisasterLens AI makes disaster response:

- **Faster**: Critical information available in hours instead of days or weeks
- **Smarter**: AI-powered analysis ensures resources go where they're most needed
- **More Inclusive**: Enables community participation in disaster assessment
- **More Coordinated**: Creates a single source of truth for all responders
- **More Adaptable**: Works across different disaster types and geographical regions

## Getting Started

For developers interested in contributing to or using DisasterLens AI, detailed setup instructions are available in the [frontend](/frontend/README.md) and [backend](/backend/README.md) directories.

## 💡 Creators
This project was developed by:

- **Pratyay Ganguly**  
  [![GitHub](https://img.shields.io/badge/GitHub-%2312100E.svg?logo=github&logoColor=white)](https://github.com/drcocktail) [![LinkedIn](https://img.shields.io/badge/LinkedIn-%230A66C2.svg?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pratyayganguly/)  
  Undergraduate Student, Department of Electrical Engineering, IIT Kharagpur
  
- **Asmit Chauhan**  
  [![GitHub](https://img.shields.io/badge/GitHub-%2312100E.svg?logo=github&logoColor=white)](https://github.com/RocketFuel810) [![LinkedIn](https://img.shields.io/badge/LinkedIn-%230A66C2.svg?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/asmit-chauhan-2606612a8/)  
  Undergraduate Student, Department of Electronics and Electrical Communication Engineering, IIT Kharagpur 

- **Malyadip Pal**  
  [![GitHub](https://img.shields.io/badge/GitHub-%2312100E.svg?logo=github&logoColor=white)](https://github.com/Neural-Knight) [![LinkedIn](https://img.shields.io/badge/LinkedIn-%230A66C2.svg?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/malyadip-pal-bb034726a/)  
  Undergraduate Student, Department of Electrical Engineering, IIT Kharagpur

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.

## Acknowledgments

This challenge was developed as part of the GLOBAL MIT AI HACKATHON 2025. Shreeansh Agawal, Linn Bieske, Andrea Jimenez, Kai Wiederhold, and Lisa Sklyarova organized this event and created this challenge in response to the growing need for better information management during disaster events.
