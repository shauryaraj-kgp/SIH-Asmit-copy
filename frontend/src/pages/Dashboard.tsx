import { useState } from 'react';
import { 
  Paper, Typography, Box, Card, CardContent, 
  LinearProgress, Tabs, Tab
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { LocationOn, School, LocalHospital, BurstMode, Home } from '@mui/icons-material';

// Sample dashboard data
const SUMMARY_DATA = {
  affectedPeople: 15400,
  damagedBuildings: 2370,
  assessedLocations: 187,
  dataCompleteness: 68
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock data for status charts
  const chartData = {
    labels: ['Hospitals', 'Schools', 'Shelters', 'Roads', 'Bridges'],
    datasets: {
      operational: [85, 45, 90, 60, 30],
      damaged: [10, 40, 10, 20, 40],
      destroyed: [5, 15, 0, 20, 30],
    }
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Current disaster assessment status and key metrics
        </Typography>
      </Box>
      
      {/* Summary Cards - Using Flexbox instead of Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flexBasis: { xs: '100%', sm: '48%', md: '23%' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">Affected Area</Typography>
                  <Typography variant="h4">187 km²</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flexBasis: { xs: '100%', sm: '48%', md: '23%' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BurstMode sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">Field Reports</Typography>
                  <Typography variant="h4">432</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flexBasis: { xs: '100%', sm: '48%', md: '23%' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalHospital sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">People Affected</Typography>
                  <Typography variant="h4">15,400</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flexBasis: { xs: '100%', sm: '48%', md: '23%' } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Home sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">Damaged Buildings</Typography>
                  <Typography variant="h4">2,370</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Data Completeness */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Data Completeness</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flexBasis: { xs: '100%', md: '32%' } }}>
              <Typography variant="body2" color="text.secondary">Pre-Disaster Data</Typography>
              <LinearProgress 
                variant="determinate" 
                value={92} 
                sx={{ height: 10, borderRadius: 5, my: 1 }} 
              />
              <Typography variant="body2">92% complete</Typography>
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', md: '32%' } }}>
              <Typography variant="body2" color="text.secondary">Post-Disaster Data</Typography>
              <LinearProgress 
                variant="determinate" 
                value={68} 
                sx={{ height: 10, borderRadius: 5, my: 1 }} 
              />
              <Typography variant="body2">68% complete</Typography>
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', md: '32%' } }}>
              <Typography variant="body2" color="text.secondary">AI-Ready Data</Typography>
              <LinearProgress 
                variant="determinate" 
                value={53} 
                sx={{ height: 10, borderRadius: 5, my: 1 }} 
              />
              <Typography variant="body2">53% complete</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* Damage Assessment */}
      <Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Infrastructure Status</Typography>
          <Box sx={{ height: 300 }}>
            <BarChart
              xAxis={[{ 
                scaleType: 'band', 
                data: chartData.labels 
              }]}
              series={[
                {
                  data: chartData.datasets.operational,
                  label: 'Operational',
                  color: '#4caf50'
                },
                {
                  data: chartData.datasets.damaged,
                  label: 'Damaged',
                  color: '#ff9800'
                },
                {
                  data: chartData.datasets.destroyed,
                  label: 'Destroyed',
                  color: '#f44336'
                }
              ]}
            />
          </Box>
        </Paper>
      </Box>
      
      {/* Using the activeTab state with tabs (example) */}
      <Box sx={{ mt: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="data tabs">
          <Tab label="Overview" />
          <Tab label="Detailed Stats" />
          <Tab label="Timeline" />
        </Tabs>
      </Box>
    </>
  );
}