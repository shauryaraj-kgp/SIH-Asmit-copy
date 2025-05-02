import { useState } from 'react';
import Map, { Marker, Popup, NavigationControl, ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { Box, Paper, Typography, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import 'maplibre-gl/dist/maplibre-gl.css';

// Define types for our location data
interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  status: 'operational' | 'damaged' | 'destroyed';
}

// Mock data for points of interest
const MOCK_LOCATIONS: Location[] = [
  { id: 1, name: 'Central Hospital', lat: 40.712, lng: -74.006, type: 'hospital', status: 'operational' },
  { id: 2, name: 'North School', lat: 40.718, lng: -74.012, type: 'school', status: 'damaged' },
  { id: 3, name: 'Main Bridge', lat: 40.710, lng: -74.002, type: 'infrastructure', status: 'destroyed' },
  { id: 4, name: 'Emergency Shelter', lat: 40.715, lng: -74.008, type: 'shelter', status: 'operational' },
];

export default function MapContainer() {
  const [viewState, setViewState] = useState({
    latitude: 40.712,
    longitude: -74.006,
    zoom: 12
  });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapMode, setMapMode] = useState<'pre' | 'post'>('pre'); // 'pre' or 'post' disaster view
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['hospital', 'school', 'shelter', 'infrastructure']);

  const handleLayerToggle = (
    event: React.MouseEvent<HTMLElement>, 
    newLayers: string[]
  ) => {
    if (newLayers.length) {
      setVisibleLayers(newLayers);
    }
  };

  const handleMapModeChange = (
    event: React.MouseEvent<HTMLElement>, 
    newMode: 'pre' | 'post' | null
  ) => {
    if (newMode !== null) {
      setMapMode(newMode);
    }
  };

  // Status color mapping
  const getStatusColor = (status: Location['status']): string => {
    switch(status) {
      case 'operational': return '#4caf50';
      case 'damaged': return '#ff9800';
      case 'destroyed': return '#f44336';
      default: return '#2196f3';
    }
  };

  return (
    <Paper elevation={3} sx={{ height: 'calc(100vh - 150px)', position: 'relative' }}>
      {/* Map Mode Toggle */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.8)', p: 1, borderRadius: 1 }}>
        <ToggleButtonGroup
          value={mapMode}
          exclusive
          onChange={handleMapModeChange}
          size="small"
        >
          <ToggleButton value="pre">Pre-Disaster</ToggleButton>
          <ToggleButton value="post">Post-Disaster</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Layers Toggle */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.8)', p: 1, borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom>Layers</Typography>
        <ToggleButtonGroup
          value={visibleLayers}
          onChange={handleLayerToggle}
          size="small"
          orientation="vertical"
        >
          <ToggleButton value="hospital">Hospitals</ToggleButton>
          <ToggleButton value="school">Schools</ToggleButton>
          <ToggleButton value="shelter">Shelters</ToggleButton>
          <ToggleButton value="infrastructure">Infrastructure</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl />
        
        {MOCK_LOCATIONS
          .filter(loc => visibleLayers.includes(loc.type))
          .map(location => (
            <Marker
              key={location.id}
              latitude={location.lat}
              longitude={location.lng}
            >
              <Box 
                onClick={(e) => {
                  // Prevent the click event from propagating to the map
                  e.stopPropagation();
                  setSelectedLocation(location);
                }}
                sx={{ 
                  width: 20, 
                  height: 20, 
                  borderRadius: '50%', 
                  backgroundColor: getStatusColor(location.status),
                  border: '2px solid white',
                  cursor: 'pointer'
                }} 
              />
            </Marker>
          ))
        }

        {selectedLocation && (
          <Popup
            latitude={selectedLocation.lat}
            longitude={selectedLocation.lng}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setSelectedLocation(null)}
            anchor="bottom"
          >
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle1">{selectedLocation.name}</Typography>
              <Typography variant="body2">Type: {selectedLocation.type}</Typography>
              <Chip 
                label={selectedLocation.status} 
                size="small" 
                sx={{ 
                  backgroundColor: getStatusColor(selectedLocation.status),
                  color: 'white',
                  mt: 1
                }} 
              />
            </Box>
          </Popup>
        )}
      </Map>
    </Paper>
  );
}