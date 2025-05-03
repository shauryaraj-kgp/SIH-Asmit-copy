import { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { Box, Paper, Typography, Chip, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
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

// Expanded interface to include before/after data
interface ExtendedLocation extends Location {
  preDisasterStatus: 'operational';
  postDisasterStatus: 'operational' | 'damaged' | 'destroyed';
  damageDetails?: string;
  lastUpdated?: string;
}

// Correct interface for Nominatim API response
interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

// Mock data for points of interest with pre/post disaster status
const MOCK_LOCATIONS: ExtendedLocation[] = [
  { 
    id: 1, 
    name: 'Central Hospital', 
    lat: 40.712, 
    lng: -74.006, 
    type: 'hospital', 
    status: 'operational',
    preDisasterStatus: 'operational',
    postDisasterStatus: 'damaged',
    damageDetails: 'Structural damage to east wing, operating at 60% capacity. Emergency room still functional.',
    lastUpdated: '2025-05-02T08:45:00Z'
  },
  { 
    id: 2, 
    name: 'North School', 
    lat: 40.718, 
    lng: -74.012, 
    type: 'school', 
    status: 'damaged',
    preDisasterStatus: 'operational',
    postDisasterStatus: 'damaged',
    damageDetails: 'Roof collapsed in gymnasium. Main building appears intact but needs assessment.',
    lastUpdated: '2025-05-01T15:20:00Z'
  },
  { 
    id: 3, 
    name: 'Main Bridge', 
    lat: 40.710, 
    lng: -74.002, 
    type: 'infrastructure', 
    status: 'destroyed',
    preDisasterStatus: 'operational',
    postDisasterStatus: 'destroyed',
    damageDetails: 'Complete structural failure. Bridge has collapsed and is impassable.',
    lastUpdated: '2025-05-01T12:35:00Z'
  },
  { 
    id: 4, 
    name: 'Emergency Shelter', 
    lat: 40.715, 
    lng: -74.008, 
    type: 'shelter', 
    status: 'operational',
    preDisasterStatus: 'operational',
    postDisasterStatus: 'operational',
    damageDetails: 'Functioning as emergency shelter. Currently housing 87 people. Supplies adequate for 48 hours.',
    lastUpdated: '2025-05-02T10:15:00Z'
  },
  {
    id: 5, 
    name: 'City Power Substation Alpha', 
    lat: 40.709, 
    lng: -74.015, 
    type: 'infrastructure', 
    status: 'damaged',
    preDisasterStatus: 'operational',
    postDisasterStatus: 'damaged',
    damageDetails: 'Operating at 40% capacity. Repairs underway, estimated 72 hours to full restoration.',
    lastUpdated: '2025-05-02T14:30:00Z'
  }
];

interface MapContainerProps {
  searchQuery?: string;
  onLocationSelect?: (location: ExtendedLocation) => void;
}

export default function MapContainer({ searchQuery, onLocationSelect }: MapContainerProps) {
  const [viewState, setViewState] = useState({
    latitude: 40.712,
    longitude: -74.006,
    zoom: 12
  });
  const [selectedLocation, setSelectedLocation] = useState<ExtendedLocation | null>(null);
  const [mapMode, setMapMode] = useState<'pre' | 'post'>('pre'); // 'pre' or 'post' disaster view
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['hospital', 'school', 'shelter', 'infrastructure']);
  const [locations, setLocations] = useState<ExtendedLocation[]>(MOCK_LOCATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Add ref to track previous search query to prevent oscillation
  const prevSearchQueryRef = useRef<string | undefined>(undefined);
  const searchInProgressRef = useRef<boolean>(false);

  // Simulate real-time updates every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealTimeUpdates();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to simulate fetching real-time updates
  const fetchRealTimeUpdates = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would be an API call to get fresh data
      // For now, we'll simulate an update by randomly changing some location statuses
      const updatedLocations = [...locations];
      
      // Randomly update 1-2 locations
      const numToUpdate = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numToUpdate; i++) {
        const randomIndex = Math.floor(Math.random() * updatedLocations.length);
        const statuses: ('operational' | 'damaged' | 'destroyed')[] = ['operational', 'damaged', 'destroyed'];
        
        // Only update post-disaster status
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        updatedLocations[randomIndex] = {
          ...updatedLocations[randomIndex],
          postDisasterStatus: newStatus,
          lastUpdated: new Date().toISOString()
        };
        
        // Update the current status based on map mode
        if (mapMode === 'post') {
          updatedLocations[randomIndex].status = newStatus;
        }
      }
      
      setLocations(updatedLocations);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  // Improved search function that prevents oscillation
  const handleSearch = useCallback((searchText: string) => {
    // Prevent duplicate search operations
    if (prevSearchQueryRef.current === searchText || searchInProgressRef.current) {
      return;
    }
    
    prevSearchQueryRef.current = searchText;
    searchInProgressRef.current = true;
    setIsLoading(true);
    
    // First, check if the search text matches any of our known locations
    const directMatch = locations.filter(location => 
      location.name.toLowerCase().includes(searchText.toLowerCase())
    );
    
    if (directMatch.length > 0) {
      // We found a match in our existing data
      setViewState({
        latitude: directMatch[0].lat,
        longitude: directMatch[0].lng,
        zoom: 14
      });
      
      // Highlight the location
      setSelectedLocation(directMatch[0]);
      
      // Notify parent component
      if (onLocationSelect) {
        onLocationSelect(directMatch[0]);
      }
      
      setIsLoading(false);
      searchInProgressRef.current = false;
      return;
    }
    
    // If no direct match, use the Nominatim geocoding API
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=1`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: NominatimResponse[]) => {
        if (data && data.length > 0) {
          const result = data[0];
          
          // Create a location from the search result
          const newLocation: ExtendedLocation = {
            id: Math.floor(Math.random() * 10000),
            name: result.display_name || searchText,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            type: 'location',
            status: 'operational',
            preDisasterStatus: 'operational',
            postDisasterStatus: 'operational',
            damageDetails: 'No damage information available for this location.',
            lastUpdated: new Date().toISOString()
          };
          
          console.log('Found location:', newLocation);
          
          // Update the view to center on this new location
          setViewState({
            latitude: newLocation.lat,
            longitude: newLocation.lng,
            zoom: 10
          });
          
          // Add this location to our locations state
          setLocations(prev => [...prev, newLocation]);
          
          // Select this location
          setSelectedLocation(newLocation);
          
          // Notify the parent component
          if (onLocationSelect) {
            onLocationSelect(newLocation);
          }
        } else {
          console.log('No results found for:', searchText);
          // No results found - you might want to show a message to the user
        }
        
        setIsLoading(false);
        searchInProgressRef.current = false;
      })
      .catch((error) => {
        console.error('Error searching for location:', error);
        setIsLoading(false);
        searchInProgressRef.current = false;
      });
  }, [onLocationSelect, locations]);
  
  // Effect for handling search queries - Fixed to prevent oscillation
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== '' && searchQuery !== prevSearchQueryRef.current) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);

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
      
      // Update all location statuses based on the selected mode
      const updatedLocations = locations.map(location => ({
        ...location,
        status: newMode === 'pre' ? location.preDisasterStatus : location.postDisasterStatus
      }));
      
      setLocations(updatedLocations);
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

  const handleMarkerClick = (location: ExtendedLocation) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
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

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 40, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 2, 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          p: 1, 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CircularProgress size={20} />
          <Typography variant="caption">Updating map data...</Typography>
        </Box>
      )}

      {/* Last updated indicator */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 10, 
        right: 10, 
        zIndex: 1, 
        backgroundColor: 'rgba(255,255,255,0.8)', 
        p: 1, 
        borderRadius: 1 
      }}>
        <Typography variant="caption">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
      </Box>
      
      {/* Add visual indicator for search results */}
      {selectedLocation && searchQuery && selectedLocation.name.toLowerCase().includes(searchQuery.toLowerCase()) && (
        <Box sx={{ 
          position: 'absolute', 
          top: 60, 
          left: 10, 
          zIndex: 1, 
          backgroundColor: 'rgba(25, 118, 210, 0.8)', 
          color: 'white',
          px: 2,
          py: 1, 
          borderRadius: 1,
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <Typography variant="body2">
            Showing results for: {selectedLocation.name}
          </Typography>
        </Box>
      )}

      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => {
          // Only update view state if not currently searching
          if (!searchInProgressRef.current) {
            setViewState(evt.viewState);
          }
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl />
        
        {locations
          .filter(loc => visibleLayers.includes(loc.type) || loc.type === 'location')
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
                  handleMarkerClick(location);
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
              {mapMode === 'post' && selectedLocation.damageDetails && (
                <Typography variant="body2" sx={{ mt: 1, fontSize: '0.85rem' }}>
                  {selectedLocation.damageDetails}
                </Typography>
              )}
              {selectedLocation.lastUpdated && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                  Last update: {new Date(selectedLocation.lastUpdated).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Popup>
        )}
      </Map>
    </Paper>
  );
}