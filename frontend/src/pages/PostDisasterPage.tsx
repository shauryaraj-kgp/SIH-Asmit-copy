import { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Tabs, Tab, TextField, 
  Button, IconButton, Chip, Divider, Menu, MenuItem,
  InputAdornment, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  TableSortLabel, Avatar, Badge, Alert, Snackbar, CircularProgress
} from '@mui/material';
import { 
  Search, Add, FilterList, CloudUpload, Refresh,
  DeleteOutline, EditOutlined, VisibilityOutlined,
  NewReleases, Twitter, Public, CameraAlt
} from '@mui/icons-material';
import DataEntryForm from '../components/forms/DataEntryForm';
import SocialFeed from '../components/feeds/SocialFeed';
import { postDisasterService, PostDisasterUpdate } from '../services/postDisasterService';

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
      id={`post-disaster-tabpanel-${index}`}
      aria-labelledby={`post-disaster-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

// Sample data for post-disaster updates
const SAMPLE_UPDATES: PostDisasterUpdate[] = [
  { 
    id: 1, 
    locationName: 'Central Hospital', 
    type: 'hospital', 
    status: 'damaged',
    latitude: 40.712, 
    longitude: -74.006, 
    details: 'Structural damage to east wing, operating at 60% capacity. Emergency room still functional.',
    reportedBy: 'field_team_3',
    reportedAt: '2025-05-02T08:45:00Z',
    source: 'field',
    hasImage: true,
    verified: true
  },
  { 
    id: 2, 
    locationName: 'North Elementary School', 
    type: 'school', 
    status: 'damaged',
    latitude: 40.718, 
    longitude: -74.012, 
    details: 'Roof collapsed in gymnasium. Main building appears intact but needs assessment.',
    reportedBy: 'volunteer_sarah',
    reportedAt: '2025-05-01T15:20:00Z',
    source: 'field',
    hasImage: true,
    verified: false
  },
  { 
    id: 3, 
    locationName: 'Main Bridge', 
    type: 'infrastructure', 
    status: 'destroyed',
    latitude: 40.710, 
    longitude: -74.002, 
    details: 'Complete structural failure. Bridge has collapsed and is impassable.',
    reportedBy: 'news_agency_1',
    reportedAt: '2025-05-01T12:35:00Z',
    source: 'news',
    hasImage: true,
    verified: true
  },
  { 
    id: 4, 
    locationName: 'Community Center', 
    type: 'shelter', 
    status: 'operational',
    latitude: 40.715, 
    longitude: -74.008, 
    details: 'Functioning as emergency shelter. Currently housing 87 people. Supplies adequate for 48 hours.',
    reportedBy: 'emergency_services',
    reportedAt: '2025-05-02T10:15:00Z',
    source: 'official',
    hasImage: false,
    verified: true
  },
  { 
    id: 5, 
    locationName: 'Water Treatment Plant', 
    type: 'infrastructure', 
    status: 'damaged',
    latitude: 40.720, 
    longitude: -74.010, 
    details: 'Partial function. Filtration systems compromised. Water safety is questionable.',
    reportedBy: 'social_media_report',
    reportedAt: '2025-05-01T18:05:00Z',
    source: 'social',
    hasImage: false,
    verified: false
  },
];

export default function PostDisasterPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<keyof PostDisasterUpdate>('reportedAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  
  // New state for managing updates from the backend
  const [updates, setUpdates] = useState<PostDisasterUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // Load post-disaster updates when the component mounts and when tab changes to Shared Feed
  useEffect(() => {
    if (tabValue === 1) {
      fetchPostDisasterUpdates();
    }
  }, [tabValue]);

  // Function to fetch post-disaster updates from RAG database
  const fetchPostDisasterUpdates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, check if the backend services are available
      const healthStatus = await postDisasterService.checkServicesHealth();
      
      if (!healthStatus.allHealthy) {
        console.warn('Backend services are not fully operational:', healthStatus);
        throw new Error('Backend services are not fully available');
      }
      
      // Query the RAG database for user inputs with post-disaster context
      const response = await postDisasterService.queryRAG(
        "post_disaster_update", // Query for post-disaster updates specifically
        ["user_inputs"],        // Only search in user inputs collection
        100                     // Get up to 100 results
      );
      
      // Parse the results into PostDisasterUpdate objects
      const postDisasterUpdates: PostDisasterUpdate[] = [];
      
      if (response && response.results) {
        let idCounter = 1;
        
        for (const item of response.results) {
          try {
            const content = item.content;
            const lines = content.split('\n');
            
            // Extract data from lines using regex - fixed type issue by adding explicit string type
            const locationMatch = lines.find((line: string) => line.startsWith('Location:'))?.match(/Location: (.+) \((-?\d+\.?\d*), (-?\d+\.?\d*)\)/);
            const typeMatch = lines.find((line: string) => line.startsWith('Type:'))?.match(/Type: (.+)/);
            const statusMatch = lines.find((line: string) => line.startsWith('Status:'))?.match(/Status: (.+)/);
            const detailsMatch = lines.find((line: string) => line.startsWith('Details:'))?.match(/Details: (.+)/);
            const reportedByMatch = lines.find((line: string) => line.startsWith('Reported by:'))?.match(/Reported by: (.+)/);
            const sourceMatch = lines.find((line: string) => line.startsWith('Source:'))?.match(/Source: (.+)/);
            const verifiedMatch = lines.find((line: string) => line.startsWith('Verified:'))?.match(/Verified: (.+)/);
            
            if (locationMatch && typeMatch && statusMatch) {
              const update: PostDisasterUpdate = {
                id: idCounter++,
                locationName: locationMatch[1] || 'Unknown Location',
                type: typeMatch[1] || 'infrastructure',
                status: (statusMatch[1] || 'unknown') as 'operational' | 'damaged' | 'destroyed' | 'unknown',
                latitude: parseFloat(locationMatch[2] || '0'),
                longitude: parseFloat(locationMatch[3] || '0'),
                details: detailsMatch ? detailsMatch[1] : '',
                reportedBy: reportedByMatch ? reportedByMatch[1] : 'unknown',
                reportedAt: item.metadata?.timestamp || new Date().toISOString(),
                source: (sourceMatch ? sourceMatch[1] : 'field') as 'field' | 'social' | 'news' | 'official',
                hasImage: false, // Currently no image support in RAG storage
                verified: verifiedMatch ? verifiedMatch[1].toLowerCase() === 'yes' : false
              };
              
              postDisasterUpdates.push(update);
            }
          } catch (parseError) {
            console.error('Error parsing update:', parseError);
          }
        }
      }
      
      // If no updates found in RAG or something failed, show sample data as fallback
      if (postDisasterUpdates.length === 0) {
        console.log('No post-disaster updates found in RAG database, using sample data');
        setUpdates(SAMPLE_UPDATES);
        setSnackbarMessage('No updates found in database. Showing sample data.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      } else {
        console.log(`Found ${postDisasterUpdates.length} updates in RAG database`);
        setUpdates(postDisasterUpdates);
        setSnackbarMessage(`Loaded ${postDisasterUpdates.length} updates from database.`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      
    } catch (fetchError) {
      console.error('Error fetching updates:', fetchError);
      setError('Failed to load updates from backend. Showing sample data instead.');
      setUpdates(SAMPLE_UPDATES);
      setSnackbarMessage('Backend connection failed. Using sample data.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle form submission success
  const handleFormSubmitSuccess = (result: any) => {
    // Show success message
    setSnackbarMessage('Post-disaster update successfully added');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Refresh the data in the shared feed
    if (result && result.update) {
      // Either fetch all updates again or just add the new one to the existing array
      setUpdates(prevUpdates => [
        {
          ...result.update,
          id: prevUpdates.length + 1, // Assign a new ID
        },
        ...prevUpdates
      ]);
    }
    
    // Switch to the Shared Feed tab
    setTabValue(1);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchPostDisasterUpdates();
    setSnackbarMessage('Updates refreshed');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };
  
  // Close snackbar handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleStatusFilter = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const handleSourceFilter = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: keyof PostDisasterUpdate) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter and sort updates
  const filteredUpdates = updates
    .filter(update => 
      (searchTerm === '' || update.locationName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatuses.length === 0 || selectedStatuses.includes(update.status)) &&
      (selectedSources.length === 0 || selectedSources.includes(update.source))
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

  const statusOptions = ['operational', 'damaged', 'destroyed', 'unknown'];
  const sourceOptions = ['field', 'social', 'news', 'official'];

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'operational': return '#4caf50';
      case 'damaged': return '#ff9800';
      case 'destroyed': return '#f44336';
      default: return '#2196f3';
    }
  };

  const getSourceIcon = (source: string) => {
    switch(source) {
      case 'field': return <CameraAlt fontSize="small" />;
      case 'social': return <Twitter fontSize="small" />;
      case 'news': return <Public fontSize="small" />;
      case 'official': return <NewReleases fontSize="small" />;
      default: return undefined;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Post-Disaster Updates
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Collect and analyze real-time information after a disaster occurs
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="post-disaster data tabs"
        >
          <Tab label="Data Entry" />
          <Tab label="Shared Feed" />
          <Tab label="Social Media Monitor" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <DataEntryForm formType="post-disaster" onSubmitSuccess={handleFormSubmitSuccess} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {/* Updates Feed/Database View */}
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Showing {filteredUpdates.length} updates. Recent reports are prioritized.
          </Alert>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search updates..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: '400px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            variant="outlined" 
            startIcon={<FilterList />} 
            onClick={handleFilterClick}
            size="medium"
          >
            Filter
          </Button>
          
          {/* Add refresh button */}
          <Button
            variant="outlined"
            startIcon={isLoading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            size="medium"
          >
            Refresh
          </Button>
          
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={handleFilterClose}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2">Filter by Status</Typography>
            </MenuItem>
            <Divider />
            {statusOptions.map(status => (
              <MenuItem 
                key={status} 
                onClick={() => handleStatusFilter(status)}
                sx={{ 
                  bgcolor: selectedStatuses.includes(status) ? 'action.selected' : undefined 
                }}
              >
                <Chip 
                  size="small"
                  label={status}
                  sx={{ mr: 1, bgcolor: getStatusColor(status), color: 'white' }}
                />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem disabled>
              <Typography variant="subtitle2">Filter by Source</Typography>
            </MenuItem>
            <Divider />
            {sourceOptions.map(source => (
              <MenuItem 
                key={source} 
                onClick={() => handleSourceFilter(source)}
                sx={{ 
                  bgcolor: selectedSources.includes(source) ? 'action.selected' : undefined 
                }}
              >
                <Chip 
                  size="small"
                  icon={getSourceIcon(source)}
                  label={source}
                  sx={{ mr: 1 }}
                />
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </MenuItem>
            ))}
          </Menu>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            size="medium"
            onClick={() => setTabValue(0)} // Navigate to data entry tab when clicked
          >
            New Update
          </Button>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'locationName'}
                      direction={orderBy === 'locationName' ? order : 'asc'}
                      onClick={() => handleRequestSort('locationName')}
                    >
                      Location
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleRequestSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'reportedAt'}
                      direction={orderBy === 'reportedAt' ? order : 'asc'}
                      onClick={() => handleRequestSort('reportedAt')}
                    >
                      Reported
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="center">Verified</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUpdates
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((update) => {
                    // Format the timestamp for display
                    const reportTime = new Date(update.reportedAt);
                    const timeString = reportTime.toLocaleString();
                    
                    return (
                      <TableRow key={update.id}>
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {update.hasImage && (
                              <Avatar 
                                sx={{ width: 28, height: 28, mr: 1, bgcolor: getStatusColor(update.status) }}
                                variant="rounded"
                              >
                                <CameraAlt fontSize="small" />
                              </Avatar>
                            )}
                            <Box>
                              <Typography variant="body2">{update.locationName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {update.type}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={update.status} 
                            size="small"
                            sx={{ 
                              bgcolor: getStatusColor(update.status),
                              color: 'white',
                              textTransform: 'capitalize'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={getSourceIcon(update.source)}
                            label={update.source} 
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{timeString}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            by {update.reportedBy}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              maxWidth: '200px'
                            }}
                          >
                            {update.details}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {update.verified ? 
                            <Chip label="Verified" size="small" color="success" variant="outlined" /> :
                            <Chip label="Unverified" size="small" color="warning" variant="outlined" />
                          }
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" title="View details">
                            <VisibilityOutlined fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Edit">
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Delete">
                            <DeleteOutline fontSize="small" color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUpdates.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <SocialFeed />
      </TabPanel>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}