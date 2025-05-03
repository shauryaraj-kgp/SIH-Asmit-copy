import { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Tabs, Tab, TextField, 
  Button, IconButton, Chip, Divider, Menu, MenuItem,
  InputAdornment, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  TableSortLabel, LinearProgress, Alert, CircularProgress,
  Card, CardContent, Stack, Stepper, Step, StepLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar
} from '@mui/material';
import { 
  Search, Add, FilterList, CloudDownload, 
  DeleteOutline, EditOutlined, VisibilityOutlined,
  LocationOn, CheckCircle, HighlightOff, LocalHospital,
  School, HomeWork, Engineering, WaterDrop
} from '@mui/icons-material';
import { preDisasterService } from '../services/preDisasterService';

// Define the interface for pre-disaster location data
interface PreDisasterLocation {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  occupancy?: number;
  details: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
}

// TabPanel component for tab content
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
      id={`pre-disaster-tabpanel-${index}`}
      aria-labelledby={`pre-disaster-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Sample data for demonstration
const SAMPLE_LOCATIONS: PreDisasterLocation[] = [
  {
    id: '1',
    name: 'Central Hospital',
    type: 'hospital',
    latitude: 34.052235,
    longitude: -118.243683,
    occupancy: 450,
    details: 'Level 1 trauma center with emergency power generators',
    status: 'active',
    lastUpdated: '2025-04-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Lincoln High School',
    type: 'school',
    latitude: 34.056235,
    longitude: -118.248683,
    occupancy: 1200,
    details: 'Large gymnasium suitable for emergency shelter',
    status: 'active',
    lastUpdated: '2025-04-10T14:45:00Z'
  },
  {
    id: '3',
    name: 'Main Water Treatment Plant',
    type: 'waterSource',
    latitude: 34.062235,
    longitude: -118.253683,
    details: 'Supplies 60% of municipal water, has 72-hour backup power',
    status: 'active',
    lastUpdated: '2025-04-12T09:15:00Z'
  },
  {
    id: '4',
    name: 'Community Recreation Center',
    type: 'shelter',
    latitude: 34.048235,
    longitude: -118.238683,
    occupancy: 800,
    details: 'Designated emergency shelter with kitchen facilities',
    status: 'active',
    lastUpdated: '2025-04-08T16:20:00Z'
  },
  {
    id: '5',
    name: 'City Power Substation Alpha',
    type: 'infrastructure',
    latitude: 34.059235,
    longitude: -118.246683,
    details: 'Critical power distribution node for downtown area',
    status: 'active',
    lastUpdated: '2025-04-11T11:10:00Z'
  },
  {
    id: '6',
    name: 'Riverside Medical Clinic',
    type: 'hospital',
    latitude: 34.051235,
    longitude: -118.241683,
    occupancy: 120,
    details: 'Outpatient services and urgent care',
    status: 'active',
    lastUpdated: '2025-04-14T13:25:00Z'
  },
  {
    id: '7',
    name: 'Elementary School #42',
    type: 'school',
    latitude: 34.053235,
    longitude: -118.245683,
    occupancy: 550,
    details: 'Single-story building with large playground',
    status: 'active',
    lastUpdated: '2025-04-09T10:05:00Z'
  }
];

// Sample external data sources
const EXTERNAL_SOURCES = [
  {
    id: '1',
    name: 'National Health Facility Registry',
    category: 'Healthcare',
    url: 'https://health.gov/facilities',
    lastSync: '2025-04-01',
    status: 'connected'
  },
  {
    id: '2',
    name: 'State Education Department Database',
    category: 'Education',
    url: 'https://education.state.gov/schools',
    lastSync: '2025-03-28',
    status: 'connected'
  },
  {
    id: '3',
    name: 'Municipal Infrastructure Mapping System',
    category: 'Infrastructure',
    url: 'https://city.gov/gis/infrastructure',
    lastSync: '2025-04-05',
    status: 'connected'
  },
  {
    id: '4',
    name: 'Emergency Management Shelter Database',
    category: 'Shelters',
    url: 'https://emergency.gov/shelters',
    lastSync: null,
    status: 'disconnected'
  }
];

export default function PreDisasterPage() {
  // Original state variables
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<keyof PreDisasterLocation>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // New state variables for agent functionality
  const [locationQuery, setLocationQuery] = useState('');
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentProgress, setAgentProgress] = useState(0);
  const [collectionStatus, setCollectionStatus] = useState<{
    hospitals: number;
    schools: number;
    infrastructure: number;
    shelters: number;
    waterSources: number;
  }>({
    hospitals: 0,
    schools: 0,
    infrastructure: 0,
    shelters: 0,
    waterSources: 0
  });
  const [collectedLocations, setCollectedLocations] = useState<PreDisasterLocation[]>([]);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  
  // New state variables to handle the updated requirements
  const [hasSearchedBefore, setHasSearchedBefore] = useState(false);
  const [databaseLocations, setDatabaseLocations] = useState<PreDisasterLocation[]>([]);
  const [searchedLocations, setSearchedLocations] = useState<{
    query: string;
    count: number;
  }[]>([]);
  
  // New state for OSM data collection
  const [jobId, setJobId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [lastJobStatus, setLastJobStatus] = useState<string>('');
  
  // Table related handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: keyof PreDisasterLocation) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterSelect = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // New handler for location search using OSM
  const handleSearchLocation = async () => {
    if (!locationQuery) return;
    
    try {
      // Reset states
      setIsAgentRunning(true);
      setAgentProgress(0);
      setCollectionStatus({
        hospitals: 0,
        schools: 0,
        infrastructure: 0,
        shelters: 0,
        waterSources: 0
      });
      setCollectedLocations([]);
      setJobId(null);
      
      // Define structures to search for
      const structures = [
        "hospital", 
        "school", 
        "shelter", 
        "fire_station", 
        "police", 
        "water", 
        "power"
      ];
      
      // Start OSM data collection
      const response = await preDisasterService.collectLocationData({
        location: locationQuery,
        structures
      });
      
      // Save job ID
      setJobId(response.job_id);
      
      // Start polling job status
      pollJobStatus(response.job_id);
      
    } catch (error) {
      console.error("Failed to start data collection:", error);
      setIsAgentRunning(false);
      setSnackbarMessage("Failed to start data collection. Please try again.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Function to poll job status
  const pollJobStatus = async (jobId: string) => {
    try {
      const result = await preDisasterService.getJobStatus(jobId);
      
      // Update progress
      setAgentProgress(result.progress);
      
      // Use our service's progress calculation for structured progress updates
      const progressByCategory = preDisasterService.calculateStructureProgress(result.status, result.progress);
      setCollectionStatus(progressByCategory);
      
      // Check if job is completed or errored
      if (result.status === "completed") {
        // Convert OSM data to PreDisasterLocation format
        const locations = preDisasterService.convertOSMToLocationData(result.result);
        
        console.log("Collected locations:", locations);
        
        // Ensure locations is always an array
        setCollectedLocations(Array.isArray(locations) ? locations : []);
        setIsAgentRunning(false);
        
        // Only show dialog if we have data
        if (locations && locations.length > 0) {
          setShowResultsDialog(true);
        } else {
          // Show a message that no data was found
          setSnackbarMessage(`No locations found for "${locationQuery}". Try a different search term.`);
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
        }
      } else if (result.status === "error") {
        setIsAgentRunning(false);
        setSnackbarMessage(`Error collecting data: ${result.error || "Unknown error"}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        // Continue polling with exponential backoff
        const waitTime = result.status === "collecting_boundary" ? 2000 : 1000;
        setTimeout(() => pollJobStatus(jobId), waitTime);
      }
    } catch (error) {
      console.error("Error polling job status:", error);
      setIsAgentRunning(false);
      setSnackbarMessage("Failed to check data collection status. Please try again.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Import all existing locations to the main database
  const handleImportAllLocations = () => {
    setShowResultsDialog(false);
    // Add new locations to the database
    setDatabaseLocations(prev => [...prev, ...collectedLocations]);
    
    // Add to searched locations history
    setSearchedLocations(prev => [
      ...prev, 
      { query: locationQuery, count: collectedLocations.length }
    ]);
    
    // Set flag that we've searched before
    setHasSearchedBefore(true);
    
    // Show success message
    setSnackbarMessage(`Successfully imported ${collectedLocations.length} locations for "${locationQuery}"`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  // Get the filtered and sorted database locations
  const filteredLocations = databaseLocations
    .filter(location => 
      (searchTerm === '' || location.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedTypes.length === 0 || selectedTypes.includes(location.type))
    )
    .sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return order === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Pre-Disaster Data Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        AI-powered baseline data collection for community facilities and infrastructure
      </Typography>
      
      {/* Search section - Always visible */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Search Location</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Enter a location to automatically collect baseline community data from OpenStreetMap
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Enter city, district, or region name..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            disabled={isAgentRunning}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSearchLocation}
            disabled={isAgentRunning || !locationQuery}
            sx={{ px: 4 }}
          >
            {isAgentRunning ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>
        
        {/* Progress indicators - Only shown when search is running */}
        {isAgentRunning && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Overall Progress</Typography>
              <Typography variant="body2">{Math.round(agentProgress)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={agentProgress} sx={{ mb: 3, height: 6, borderRadius: 3 }} />
            
            {/* Using Stack instead of Grid component */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              useFlexGap 
              flexWrap="wrap"
              sx={{ mb: 2 }}
            >
              <Card variant="outlined" sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: '250px', md: '30%' } }}>
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalHospital color="error" sx={{ mr: 1 }} />
                    <Typography variant="body2">Hospitals & Medical Facilities</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={collectionStatus.hospitals} />
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: '250px', md: '30%' } }}>
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <School color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">Schools & Education Facilities</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={collectionStatus.schools} />
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: '250px', md: '30%' } }}>
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HomeWork color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">Shelters & Community Centers</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={collectionStatus.shelters} />
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: '250px', md: '30%' } }}>
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Engineering color="warning" sx={{ mr: 1 }} />
                    <Typography variant="body2">Infrastructure & Critical Facilities</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={collectionStatus.infrastructure} />
                </CardContent>
              </Card>
              
              <Card variant="outlined" sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: '250px', md: '30%' } }}>
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WaterDrop color="info" sx={{ mr: 1 }} />
                    <Typography variant="body2">Water Sources & Utilities</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={collectionStatus.waterSources} />
                </CardContent>
              </Card>
            </Stack>
          </Box>
        )}
        
        {/* Success message - Shown after successful search */}
        {!isAgentRunning && locationQuery && agentProgress > 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Data collection for "{locationQuery}" completed successfully!
          </Alert>
        )}
        
        {/* Search history - Only shown when there's history */}
        {searchedLocations.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Search History</Typography>
            <Stack spacing={1}>
              {searchedLocations.map((item, index) => (
                <Alert 
                  key={index} 
                  severity="info" 
                  icon={<CheckCircle fontSize="inherit" />}
                  sx={{ py: 0 }}
                >
                  {item.count} locations added from "{item.query}"
                </Alert>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
      
      {/* Only show tabs section if we have searched and added data */}
      {hasSearchedBefore && (
        <>
          {/* Tabs for data management */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="pre-disaster data tabs"
            >
              <Tab label="Database" />
              <Tab label="External Sources" />
            </Tabs>
          </Box>
          
          {/* Database tab content */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Pre-Disaster Locations Database</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  size="small"
                  startIcon={<FilterList />}
                  onClick={handleFilterClick}
                  variant="outlined"
                >
                  Filter
                </Button>
                <Menu
                  open={Boolean(filterMenuAnchor)}
                  anchorEl={filterMenuAnchor}
                  onClose={handleFilterClose}
                >
                  {['hospital', 'school', 'infrastructure', 'shelter', 'water', 'power', 'fire_station', 'police'].map((type) => (
                    <MenuItem 
                      key={type} 
                      onClick={() => handleFilterSelect(type)}
                      sx={{ 
                        backgroundColor: selectedTypes.includes(type) ? 'action.selected' : 'inherit',
                        textTransform: 'capitalize'
                      }}
                    >
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'name'}
                        direction={orderBy === 'name' ? order : 'asc'}
                        onClick={() => handleRequestSort('name')}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Coordinates</TableCell>
                    <TableCell>Occupancy</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLocations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={location.type.replace('_', ' ')} 
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </TableCell>
                        <TableCell>{location.occupancy || 'N/A'}</TableCell>
                        <TableCell>{location.details}</TableCell>
                        <TableCell>
                          <Chip 
                            label={location.status} 
                            color={location.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(location.lastUpdated).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small">
                            <VisibilityOutlined fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                  ))}
                  {filteredLocations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No locations found matching your search criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredLocations.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </TabPanel>
          
          {/* External Sources tab content */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Connected Data Sources</Typography>
              <Typography variant="body2" color="text.secondary">
                External data sources that can be used for automated data collection
              </Typography>
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Last Synced</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {EXTERNAL_SOURCES.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>{source.name}</TableCell>
                      <TableCell>{source.category}</TableCell>
                      <TableCell>{source.url}</TableCell>
                      <TableCell>{source.lastSync || 'Never'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={source.status} 
                          color={source.status === 'connected' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          startIcon={<CloudDownload />}
                          disabled={source.status !== 'connected'}
                        >
                          Sync Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button startIcon={<Add />} variant="outlined">
                Add New Data Source
              </Button>
            </Box>
          </TabPanel>
        </>
      )}
      
      {/* Agent Results Dialog - Shows when search finds results */}
      <Dialog 
        open={showResultsDialog} 
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          AI Agent Results for "{locationQuery}"
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            The data collection agent has identified {collectedLocations.length} locations for "{locationQuery}". 
            Review the findings below before adding to your database.
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Coordinates</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectedLocations.map(location => (
                  <TableRow key={location.id}>
                    <TableCell padding="checkbox">
                      <IconButton color="success" size="small">
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={location.type.replace('_', ' ')} 
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </TableCell>
                    <TableCell>{location.details}</TableCell>
                  </TableRow>
                ))}
                {collectedLocations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No locations were found for this search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResultsDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleImportAllLocations}
            disabled={collectedLocations.length === 0}
          >
            Import All Locations
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for feedback */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}