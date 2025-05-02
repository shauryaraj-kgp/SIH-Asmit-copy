import { useState } from 'react';
import { 
  Box, Paper, Typography, Tabs, Tab, TextField, 
  Button, IconButton, Chip, Divider, Menu, MenuItem,
  InputAdornment, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  TableSortLabel
} from '@mui/material';
import { 
  Search, Add, FilterList, CloudUpload, CloudDownload, 
  DeleteOutline, EditOutlined, VisibilityOutlined, Sort
} from '@mui/icons-material';
import DataEntryForm from '../components/forms/DataEntryForm';

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
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

// Sample data for the pre-disaster database
interface PreDisasterLocation {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  occupancy?: number;
  details?: string;
  dateAdded: string;
  addedBy: string;
  tags: string[];
}

const SAMPLE_LOCATIONS: PreDisasterLocation[] = [
  { 
    id: 1, 
    name: 'Central Hospital', 
    type: 'hospital', 
    latitude: 40.712, 
    longitude: -74.006, 
    occupancy: 350, 
    details: 'Main regional hospital with emergency facilities',
    dateAdded: '2025-04-15',
    addedBy: 'admin_user',
    tags: ['emergency', 'healthcare']
  },
  { 
    id: 2, 
    name: 'North Elementary School', 
    type: 'school', 
    latitude: 40.718, 
    longitude: -74.012, 
    occupancy: 520, 
    details: 'Elementary school with gymnasium that can serve as temporary shelter',
    dateAdded: '2025-04-16',
    addedBy: 'data_collector1',
    tags: ['education', 'shelter']
  },
  { 
    id: 3, 
    name: 'Main Bridge', 
    type: 'infrastructure', 
    latitude: 40.710, 
    longitude: -74.002, 
    details: 'Critical connection between east and west districts',
    dateAdded: '2025-04-20',
    addedBy: 'admin_user',
    tags: ['transport', 'critical']
  },
  { 
    id: 4, 
    name: 'Community Center', 
    type: 'shelter', 
    latitude: 40.715, 
    longitude: -74.008, 
    occupancy: 200, 
    details: 'Designated emergency shelter with backup generator',
    dateAdded: '2025-04-18',
    addedBy: 'volunteer_john',
    tags: ['shelter', 'community']
  },
  { 
    id: 5, 
    name: 'Water Treatment Plant', 
    type: 'infrastructure', 
    latitude: 40.720, 
    longitude: -74.010, 
    details: 'Primary municipal water treatment facility',
    dateAdded: '2025-04-22',
    addedBy: 'data_collector1',
    tags: ['utility', 'critical', 'water']
  },
];

export default function PreDisasterPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<keyof PreDisasterLocation>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleTypeFilter = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

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

  // Filter and sort locations
  const filteredLocations = SAMPLE_LOCATIONS
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

  const locationTypes = Array.from(new Set(SAMPLE_LOCATIONS.map(loc => loc.type)));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Pre-Disaster Data Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Collect and manage baseline information about community facilities and infrastructure
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="pre-disaster data tabs"
        >
          <Tab label="Data Entry" />
          <Tab label="Database" />
          <Tab label="Data Import" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <DataEntryForm formType="pre-disaster" />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {/* Database View */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search locations..."
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
              <Typography variant="subtitle2">Filter by Type</Typography>
            </MenuItem>
            <Divider />
            {locationTypes.map(type => (
              <MenuItem 
                key={type} 
                onClick={() => handleTypeFilter(type)}
                sx={{ 
                  bgcolor: selectedTypes.includes(type) ? 'action.selected' : undefined 
                }}
              >
                <Chip 
                  size="small"
                  label={type}
                  sx={{ mr: 1 }}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Menu>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button startIcon={<CloudDownload />} size="medium">
            Export
          </Button>
          
          <Button variant="contained" startIcon={<Add />} size="medium">
            New Entry
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="medium">
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
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'type'}
                    direction={orderBy === 'type' ? order : 'asc'}
                    onClick={() => handleRequestSort('type')}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'latitude'}
                    direction={orderBy === 'latitude' ? order : 'asc'}
                    onClick={() => handleRequestSort('latitude')}
                  >
                    Coordinates
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'occupancy'}
                    direction={orderBy === 'occupancy' ? order : 'asc'}
                    onClick={() => handleRequestSort('occupancy')}
                  >
                    Occupancy
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'dateAdded'}
                    direction={orderBy === 'dateAdded' ? order : 'asc'}
                    onClick={() => handleRequestSort('dateAdded')}
                  >
                    Date Added
                  </TableSortLabel>
                </TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLocations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((location) => (
                  <TableRow key={location.id}>
                    <TableCell component="th" scope="row">
                      {location.name}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={location.type} 
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </TableCell>
                    <TableCell>{location.occupancy || 'N/A'}</TableCell>
                    <TableCell>{location.dateAdded}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {location.tags.map(tag => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
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
                ))}
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
      
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Import Pre-Disaster Data</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Import baseline community data from existing sources like government databases, OpenStreetMap, or other GIS systems.
          </Typography>
          
          <Box sx={{ 
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            mb: 3,
            textAlign: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.02)'
          }}>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop Files Here
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Supported formats: CSV, GeoJSON, KML, Shapefile (.zip)
            </Typography>
            <Button 
              variant="contained"
              component="label"
            >
              Select Files
              <input
                type="file"
                hidden
                multiple
              />
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Import from External Sources
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Button variant="outlined">
              OpenStreetMap
            </Button>
            <Button variant="outlined">
              Government Databases
            </Button>
            <Button variant="outlined">
              Google Maps
            </Button>
            <Button variant="outlined">
              Census Data
            </Button>
          </Box>
        </Paper>
      </TabPanel>
    </Box>
  );
}