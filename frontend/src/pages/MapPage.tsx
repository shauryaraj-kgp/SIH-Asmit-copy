import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Paper, Typography, Divider, List, ListItem, ListItemText, 
  ListItemIcon, Chip, Tabs, Tab, IconButton, TextField, InputAdornment,
  Button, Snackbar, Alert, Badge, CircularProgress
} from '@mui/material';
import { 
  LocationOn, Search, ZoomIn, LayersOutlined,
  InfoOutlined, DownloadOutlined, ShareOutlined, 
  Refresh, MyLocation, Clear
} from '@mui/icons-material';
import MapContainer from '../components/map/MapContainer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`map-tabpanel-${index}`}
      aria-labelledby={`map-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

// Extended location interface that matches the one in MapContainer
interface ExtendedLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  status: 'operational' | 'damaged' | 'destroyed';
  preDisasterStatus: 'operational';
  postDisasterStatus: 'operational' | 'damaged' | 'destroyed';
  damageDetails?: string;
  lastUpdated?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export default function MapPage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [notifications, setNotifications] = useState<{
    id: number;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: Date;
  }[]>([
    {
      id: 1,
      title: 'Flash Flood Warning',
      message: 'Potential flooding in northern districts. Evacuations recommended.',
      severity: 'warning',
      timestamp: new Date('2025-05-03T09:15:00')
    },
    {
      id: 2,
      title: 'Building Collapse',
      message: 'Structural damage reported at Western District apartments. Search and rescue deployed.',
      severity: 'error',
      timestamp: new Date('2025-05-02T14:22:00')
    }
  ]);
  const [newNotification, setNewNotification] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Sample data for side panel - will be updated by map selection
  const [criticalLocations, setCriticalLocations] = useState<ExtendedLocation[]>([
    { 
      id: 1, 
      name: 'Central Hospital', 
      lat: 40.712, 
      lng: -74.006, 
      type: 'hospital', 
      status: 'operational',
      preDisasterStatus: 'operational',
      postDisasterStatus: 'damaged',
      priority: 'high',
      damageDetails: 'Structural damage to east wing, operating at 60% capacity.'
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
      priority: 'medium',
      damageDetails: 'Roof collapsed in gymnasium. Main building appears intact.'
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
      priority: 'critical',
      damageDetails: 'Complete structural failure. Bridge has collapsed and is impassable.'
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
      priority: 'high',
      damageDetails: 'Functioning as emergency shelter. Currently housing 87 people.'
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
      priority: 'critical',
      damageDetails: 'Operating at 40% capacity. Repairs underway.'
    }
  ]);

  // Simulate real-time updates for demonstration purposes
  useEffect(() => {
    // Add new notifications periodically
    const notificationInterval = setInterval(() => {
      const shouldAddNotification = Math.random() > 0.7; // 30% chance of new notification
      
      if (shouldAddNotification) {
        const newAlert = {
          id: Date.now(),
          title: Math.random() > 0.5 ? 'New Damage Report' : 'Status Update',
          message: `New information received from field team at ${new Date().toLocaleTimeString()}`,
          severity: Math.random() > 0.7 ? 'error' : Math.random() > 0.5 ? 'warning' : 'info',
          timestamp: new Date()
        } as const;
        
        setNotifications(prev => [newAlert, ...prev]);
        setNewNotification(true);
        setSnackbarMessage(`New alert: ${newAlert.title}`);
        setSnackbarOpen(true);
      }
    }, 120000); // Every 2 minutes
    
    return () => {
      clearInterval(notificationInterval);
    };
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      setNewNotification(false); // Mark notifications as read
    }
  };

  // Enhanced search function with proper state management
  const handleSearch = useCallback(() => {
    if (searchQuery.trim() === '' || searchInProgress) return;
    
    // Set search in progress state
    setSearchInProgress(true);
    
    // Add to search history (avoiding duplicates)
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev].slice(0, 5)); // Keep last 5 searches
    }
    
    setSearchExecuted(true);
    
    // Show feedback to user
    setSnackbarMessage(`Searching for "${searchQuery}"...`);
    setSnackbarOpen(true);
    
    // The MapContainer will handle the actual search execution via the searchQuery prop
    // We'll clear the searchInProgress state when the search completes via the onLocationSelect callback
  }, [searchQuery, searchHistory, searchInProgress]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchExecuted(false);
    setSearchInProgress(false);
  };
  
  const handleLocationSelect = useCallback((location: ExtendedLocation) => {
    // Clear search in progress state
    setSearchInProgress(false);
    
    setSelectedLocation(location.name);
    
    // Add selected location to search history if not already present
    if (!searchHistory.includes(location.name)) {
      setSearchHistory(prev => [location.name, ...prev].slice(0, 5));
    }
    
    // Check if this is a new location without disaster data (from search)
    if (location.type === 'location') {
      // For locations from search that aren't part of our disaster database
      setCriticalLocations([]);
      setNotifications([]);
    } else {
      // Update the side panel to show this location's info
      setCriticalLocations(prev => {
        // If the location is already in our list, just update it
        if (prev.some(loc => loc.id === location.id)) {
          return prev.map(loc => loc.id === location.id ? location : loc);
        }
        // Otherwise add it to the top of our list
        return [location, ...prev.slice(0, 4)]; // Keep list to 5 items
      });
    }
    
    // Confirm search completion to user
    if (searchExecuted) {
      setSnackbarMessage(`Location found: ${location.name}`);
      setSnackbarOpen(true);
    }
  }, [searchHistory, searchExecuted]);

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'operational': return '#4caf50';
      case 'damaged': return '#ff9800';
      case 'destroyed': return '#f44336';
      default: return '#2196f3';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch(priority) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#0288d1';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  const handleRefreshMap = () => {
    // This would trigger a refresh of the map data in a real app
    setSnackbarMessage('Refreshing map data...');
    setSnackbarOpen(true);
    
    // Reset search (optional)
    setSearchExecuted(false);
    setSearchQuery('');
    setSearchInProgress(false);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSnackbarMessage('Location acquired. Centering map...');
          setSnackbarOpen(true);
          // In a real app, we would pass these coordinates to the map component
        },
        () => {
          setSnackbarMessage('Unable to acquire your location. Please check browser permissions.');
          setSnackbarOpen(true);
        }
      );
    } else {
      setSnackbarMessage('Geolocation is not supported by your browser');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Interactive Disaster Map
      </Typography>
      
      {/* Search and Controls Bar */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        gap: 2, 
        mb: 2 
      }}>
        <Box sx={{ flexGrow: 1, maxWidth: '500px', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={searchInProgress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="clear search"
                    onClick={clearSearch}
                    edge="end"
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            size="small"
          />
          <Button 
            variant="contained" 
            onClick={handleSearch}
            disabled={searchQuery.trim() === '' || searchInProgress}
            startIcon={searchInProgress ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {searchInProgress ? 'Searching...' : 'Search'}
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton title="Refresh map data" onClick={handleRefreshMap} disabled={searchInProgress}>
            <Refresh />
          </IconButton>
          <IconButton title="Use current location" onClick={handleGetCurrentLocation} disabled={searchInProgress}>
            <MyLocation />
          </IconButton>
          <IconButton title="Zoom to fit all data points" disabled={searchInProgress}>
            <ZoomIn />
          </IconButton>
          <IconButton title="Change map layers" disabled={searchInProgress}>
            <LayersOutlined />
          </IconButton>
          <IconButton title="Map information">
            <InfoOutlined />
          </IconButton>
          <IconButton title="Download map data">
            <DownloadOutlined />
          </IconButton>
          <IconButton title="Share map view">
            <ShareOutlined />
          </IconButton>
        </Box>
      </Box>
      
      {/* Main Content - Map and Side Panel */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        height: 'calc(100vh - 220px)',
        gap: 2
      }}>
        {/* Map Container - Takes most of the space */}
        <Box sx={{ flexGrow: 1, height: { xs: '400px', md: '100%' } }}>
          <MapContainer 
            searchQuery={searchExecuted ? searchQuery : undefined}
            onLocationSelect={handleLocationSelect} 
          />
        </Box>
        
        {/* Side Panel - Fixed width */}
        <Paper 
          elevation={2} 
          sx={{ 
            width: { xs: '100%', md: '320px' }, 
            height: { xs: 'auto', md: '100%' },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="map side panel tabs"
            >
              <Tab label="Locations" />
              <Tab 
                label={
                  newNotification ? (
                    <Badge color="error" variant="dot">
                      Alerts
                    </Badge>
                  ) : "Alerts"
                } 
              />
              <Tab label="Stats" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ overflow: 'auto', height: '100%', maxHeight: { xs: '300px', md: 'calc(100vh - 300px)' } }}>
              {criticalLocations.length > 0 ? (
                <List disablePadding>
                  {criticalLocations.map((location) => (
                    <ListItem 
                      key={location.id}
                      divider
                      component="button"
                      onClick={() => setSelectedLocation(location.name)}
                      sx={{ 
                        bgcolor: selectedLocation === location.name ? 'action.selected' : 'inherit',
                        '&:hover': {
                          bgcolor: selectedLocation === location.name ? 'action.selected' : 'action.hover'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <LocationOn 
                          sx={{ color: getStatusColor(location.status) }} 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={location.name}
                        secondary={`Type: ${location.type}`}
                        primaryTypographyProps={{
                          fontWeight: location.priority === 'critical' ? 'bold' : 'regular'
                        }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                        <Chip 
                          size="small" 
                          label={location.status} 
                          sx={{ 
                            backgroundColor: getStatusColor(location.status),
                            color: 'white',
                            fontWeight: 'bold',
                            minWidth: '90px',
                            justifyContent: 'center'
                          }} 
                        />
                        {location.priority && (
                          <Chip 
                            size="small" 
                            label={location.priority} 
                            variant="outlined"
                            sx={{ 
                              borderColor: getPriorityColor(location.priority || 'medium'),
                              color: getPriorityColor(location.priority || 'medium'),
                              minWidth: '90px',
                              justifyContent: 'center'
                            }} 
                          />
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1">
                    No building information available for this location.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No disaster data has been recorded for this area.
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {searchQuery && searchExecuted && notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1">
                  No alerts available for this location.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  There are currently no active alerts or warnings for this area.
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Real-time alerts and notifications appear here.
                </Typography>
                
                {notifications.map((notification) => (
                  <Box 
                    key={notification.id}
                    sx={{ 
                      mt: 2, 
                      p: 2, 
                      borderRadius: 1, 
                      border: '1px solid',
                      ...(notification.severity === 'error' 
                        ? { bgcolor: '#ffebee', borderColor: '#ffcdd2' }
                        : notification.severity === 'warning' 
                          ? { bgcolor: '#fff3e0', borderColor: '#ffe0b2' }
                          : { bgcolor: '#e3f2fd', borderColor: '#bbdefb' }
                      )
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: notification.severity === 'error' 
                          ? '#c62828' 
                          : notification.severity === 'warning' 
                            ? '#e65100' 
                            : '#0277bd',
                        fontWeight: 'bold' 
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                      Issued: {notification.timestamp.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {searchQuery && searchExecuted && criticalLocations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1">
                  No statistics available for this location.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No assessment data has been collected for this area.
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Current assessment statistics:
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Buildings Assessed</Typography>
                    <Typography variant="body2" fontWeight="bold">1,248 / 2,370</Typography>
                  </Box>
                  <Box sx={{ height: '8px', bgcolor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', bgcolor: '#1976d2', width: '53%' }} />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Critical Infrastructure</Typography>
                    <Typography variant="body2" fontWeight="bold">42 / 83</Typography>
                  </Box>
                  <Box sx={{ height: '8px', bgcolor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', bgcolor: '#1976d2', width: '51%' }} />
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Status Summary</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ height: '10px', width: '10px', borderRadius: '50%', bgcolor: '#4caf50', mr: 1 }} />
                        <Typography variant="body2">Operational</Typography>
                      </Box>
                      <Typography variant="body2">532</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ height: '10px', width: '10px', borderRadius: '50%', bgcolor: '#ff9800', mr: 1 }} />
                        <Typography variant="body2">Damaged</Typography>
                      </Box>
                      <Typography variant="body2">294</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ height: '10px', width: '10px', borderRadius: '50%', bgcolor: '#f44336', mr: 1 }} />
                        <Typography variant="body2">Destroyed</Typography>
                      </Box>
                      <Typography variant="body2">422</Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </TabPanel>
        </Paper>
      </Box>

      {/* Feedback snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}