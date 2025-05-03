# DisasterLens AI - Frontend

The frontend component of DisasterLens AI is an interactive React application that provides an intuitive interface for users to visualize, analyze, and contribute to disaster assessment information.

## What the Frontend Does

The DisasterLens AI frontend serves as the user interface of the platform, enabling:

1. **Interactive Disaster Mapping** - Visualizing pre and post-disaster conditions on dynamic maps
2. **Data Collection & Contribution** - Providing forms for field responders to submit observations
3. **Report Visualization** - Displaying AI-generated disaster assessment reports in readable formats
4. **Workflow Management** - Guiding users through the disaster assessment process

## Key Features

### Interactive Maps

The map interface is the central feature of the frontend:

- **Pre-Disaster Baseline**: Displays critical infrastructure (hospitals, schools, shelters) before disasters
- **Post-Disaster Overlays**: Shows damage assessment data collected after disasters
- **Location-Based Filtering**: Allows users to focus on specific geographic areas
- **Layer Controls**: Toggles different data sets for customized views

![Map Interface](https://via.placeholder.com/600x300?text=DisasterLens+Map+Interface)

### Data Collection Forms

Structured data entry forms enable:

- **Field Observations**: Mobile-optimized forms for on-site responders
- **Damage Assessment**: Standardized scales for evaluating infrastructure damage
- **Media Uploads**: Support for photos and videos from disaster zones
- **Verification Workflows**: Processes to confirm and validate submitted information

### Social Media Feed

The social media monitoring component:

- **Disaster-Related Posts**: Filters and displays relevant social media content
- **Sentiment Analysis**: Categorizes posts by urgency and information type
- **Timeline Views**: Organizes posts chronologically to track evolving situations
- **Source Verification**: Highlights posts from official or trusted accounts

### Report Dashboard

The reporting dashboard:

- **AI-Generated Reports**: Displays comprehensive situation summaries
- **Visual Analytics**: Charts and graphs showing disaster impact metrics
- **Resource Needs**: Highlights areas requiring immediate assistance
- **Time-Series Data**: Shows how conditions change over the course of the disaster response

## Technical Implementation

### Core Technologies

- **React 19**: Modern React with hooks and concurrent rendering
- **TypeScript**: Type-safe JavaScript for robust code quality
- **Material UI 7**: Component library for consistent design
- **MapLibre GL**: Open-source mapping library for interactive maps
- **Vite**: Next-generation frontend build tool
- **React Router**: Client-side routing for single-page application

### Application Structure

The frontend follows a modular architecture:

- **Components**: Reusable UI building blocks
- **Pages**: Complete screen views assembled from components
- **Services**: API integration with the backend
- **Contexts**: State management for application-wide data
- **Hooks**: Custom React hooks for shared functionality

### Responsive Design

The interface is fully responsive:

- **Desktop**: Full-featured interface for emergency operations centers
- **Tablet**: Touch-optimized layouts for field command posts
- **Mobile**: Streamlined interface for on-site responders
- **Offline Support**: Limited functionality when network connectivity is poor

### User Experience

The frontend prioritizes usability in high-stress situations:

- **Clear Information Hierarchy**: Critical information is easily accessible
- **Intuitive Navigation**: Minimal learning curve for emergency responders
- **Accessibility**: WCAG compliance for users of all abilities
- **Error Handling**: Graceful recovery from connectivity or server issues

## Integration with Backend

The frontend communicates with the backend through:

1. **REST API**: Standard HTTP requests for data operations
2. **Background Jobs**: Long-running tasks with progress monitoring
3. **Real-time Updates**: Data refreshing for timely information

## Getting Started

### Prerequisites

- Node.js 18+ (Latest LTS version recommended)
- pnpm (or npm/yarn)

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create an `.env` file in the `frontend` directory with your configuration:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_MAPBOX_TOKEN=your_mapbox_token_here  # If using Mapbox
   ```

### Development

Run the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist` directory.
