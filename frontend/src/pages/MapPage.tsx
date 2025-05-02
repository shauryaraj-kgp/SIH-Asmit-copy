import { useState } from 'react';
import { 
  Box, Paper, Typography, Divider, List, ListItem, ListItemText, 
  ListItemIcon, Chip, Tabs, Tab, IconButton, TextField, InputAdornment
} from '@mui/material';
import { 
  LocationOn, Search, ZoomIn, LayersOutlined,
  InfoOutlined, DownloadOutlined, ShareOutlined 
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

export default function MapPage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Sample data for side panel
  const criticalLocations = [
    { id: 1, name: 'Central Hospital', type: 'hospital', status: 'operational', priority: 'high' },
    { id: 2, name: 'North School', type: 'school', status: 'damaged', priority: 'medium' },
    { id: 3, name: 'Main Bridge', type: 'infrastructure', status: 'destroyed', priority: 'critical' },
    { id: 4, name: 'Emergency Shelter', type: 'shelter', status: 'operational', priority: 'high' },
    { id: 5, name: 'Power Plant', type: 'infrastructure', status: 'damaged', priority: 'critical' },
  ];

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
        <Box sx={{ flexGrow: 1, maxWidth: '500px' }}>
          <TextField
            fullWidth
            placeholder="Search locations..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton title="Zoom to fit all data points">
            <ZoomIn />
          </IconButton>
          <IconButton title="Change map layers">
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
          <MapContainer />
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
              <Tab label="Alerts" />
              <Tab label="Stats" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ overflow: 'auto', height: '100%', maxHeight: { xs: '300px', md: 'calc(100vh - 300px)' } }}>
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
                      <Chip 
                        size="small" 
                        label={location.priority} 
                        variant="outlined"
                        sx={{ 
                          borderColor: getPriorityColor(location.priority),
                          color: getPriorityColor(location.priority),
                          minWidth: '90px',
                          justifyContent: 'center'
                        }} 
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="body2" color="text.secondary">
              Recent alerts and notifications will appear here.
            </Typography>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffe0b2' }}>
              <Typography variant="subtitle2" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                Flash Flood Warning
              </Typography>
              <Typography variant="body2">
                Potential flooding in northern districts. Evacuations recommended.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                Issued: May 3, 2025 - 09:15 AM
              </Typography>
            </Box>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #ffcdd2' }}>
              <Typography variant="subtitle2" sx={{ color: '#c62828', fontWeight: 'bold' }}>
                Building Collapse
              </Typography>
              <Typography variant="body2">
                Structural damage reported at Western District apartments. Search and rescue deployed.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                Issued: May 2, 2025 - 14:22 PM
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
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
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  );
}