# DisasterLens AI - Frontend

The frontend component of the DisasterLens AI (Tri-Aid) platform is a modern React application that provides an intuitive interface for disaster assessment and reporting. It's built with React 19, TypeScript, and Material UI.

## Features

- **Interactive Maps**: Visualize pre and post-disaster data using MapLibre GL
- **Disaster Reports**: View AI-generated disaster assessment reports
- **Pre-Disaster Data Collection**: Interface for collecting and viewing pre-disaster information
- **Post-Disaster Assessment**: Tools for collecting and analyzing post-disaster data
- **Social Media Feed**: Monitor social media for disaster-related information
- **Responsive Design**: Works on desktop and mobile devices

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

## Project Structure

- `src/` - Source code
  - `components/` - Reusable UI components
    - `feeds/` - Social media feed components
    - `forms/` - Data entry forms
    - `map/` - Map visualization components
    - `reports/` - Report viewing components
    - `settings/` - Settings-related components
  - `contexts/` - React context providers
  - `hooks/` - Custom React hooks
  - `layouts/` - Page layout components
  - `pages/` - Application pages
    - `Dashboard.tsx` - Main dashboard
    - `MapPage.tsx` - Interactive map view
    - `PostDisasterPage.tsx` - Post-disaster data collection
    - `PreDisasterPage.tsx` - Pre-disaster data collection
    - `ReportsPage.tsx` - Disaster reports
    - `SettingsPage.tsx` - Application settings
  - `services/` - API services and data fetching
  - `theme/` - UI theme configuration
  - `utils/` - Helper functions and utilities

## Key Technologies

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Material UI** - Component library
- **MapLibre GL** - Open-source map rendering
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Adding New Features

1. Create new components in the appropriate directories
2. Add API services in the `services` directory
3. Update routes in the main application if needed

## Best Practices

- Use TypeScript for all new components and functions
- Follow the established component structure
- Use Material UI components for consistent design
- Implement responsive layouts for all new views
- Write descriptive commit messages

## Deployment

The frontend can be deployed to any static site hosting service after building:

1. Run `pnpm build`
2. Deploy the contents of the `dist` directory to your hosting provider
3. Ensure proper configuration for the API base URL in production environment
