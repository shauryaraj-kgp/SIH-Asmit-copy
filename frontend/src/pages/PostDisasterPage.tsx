import { useState } from 'react';
import { 
  Box, Paper, Typography, Tabs, Tab, TextField, 
  Button, IconButton, Chip, Divider, Menu, MenuItem,
  InputAdornment, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  TableSortLabel, Avatar, Badge, Alert
} from '@mui/material';
import { 
  Search, Add, FilterList, CloudUpload, 
  DeleteOutline, EditOutlined, VisibilityOutlined,
  NewReleases, Twitter, Public, CameraAlt
} from '@mui/icons-material';
import DataEntryForm from '../components/forms/DataEntryForm';
import SocialFeed from '../components/feeds/SocialFeed';

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
interface PostDisasterUpdate {
  id: number;
  locationName: string;
  type: string;
  status: 'operational' | 'damaged' | 'destroyed' | 'unknown';
  latitude: number;
  longitude: number;
  details: string;
  reportedBy: string;
  reportedAt: string;
  source: 'field' | 'social' | 'news' | 'official';
  hasImage: boolean;
  verified: boolean;
}

// Sample post-disaster data
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
  const filteredUpdates = SAMPLE_UPDATES
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
        <DataEntryForm formType="post-disaster" />
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
          
          <Button variant="contained" startIcon={<Add />} size="medium">
            New Update
          </Button>
        </Box>
        
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
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <SocialFeed />
      </TabPanel>
    </Box>
  );
}