import { useState } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Stepper, Step, StepLabel, TextField, MenuItem,
  FormControl, InputLabel, Select, SelectChangeEvent,
  FormControlLabel, Checkbox, LinearProgress,
  Card, CardContent, CardHeader, IconButton,
  List, ListItem, ListItemIcon, ListItemText,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  ExpandMore, Download, Print, Share, Description,
  CloudDownload, Check, LocationOn, LocalHospital,
  School, Home, WaterDrop, Construction, Warning
} from '@mui/icons-material';

export default function ReportsPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [reportType, setReportType] = useState('situational');
  const [region, setRegion] = useState('');
  const [timeframe, setTimeframe] = useState('48h');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'overview', 'infrastructure', 'medical', 'shelter', 'needs'
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };
  
  const handleRegionChange = (event: SelectChangeEvent) => {
    setRegion(event.target.value);
  };
  
  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value);
  };
  
  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setGenerationProgress(progress);
      
      if (progress === 100) {
        clearInterval(interval);
        setIsGenerating(false);
        setReportGenerated(true);
      }
    }, 500);
  };
  
  // Define steps for report generation process
  const steps = ['Select Report Type', 'Choose Parameters', 'Configure Sections', 'Generate Report'];
  
  // Sample recent reports data
  const recentReports = [
    { id: 1, name: 'Initial Disaster Assessment', date: '2025-05-01 14:30', type: 'Situational' },
    { id: 2, name: '24-Hour Update Report', date: '2025-05-02 12:00', type: 'Update' },
    { id: 3, name: 'Infrastructure Damage Report', date: '2025-05-02 16:45', type: 'Focused' }
  ];
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        AI-Generated Reports
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Generate comprehensive disaster assessment reports using collected data
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Left column - Report Generator */}
        <Box sx={{ flexBasis: { xs: '100%', md: '65%' } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Report Generator</Typography>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {activeStep === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Select the type of report you want to generate
                </Typography>
                <FormControl fullWidth sx={{ mt: 2, mb: 4 }}>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={handleReportTypeChange}
                  >
                    <MenuItem value="situational">Situational Overview</MenuItem>
                    <MenuItem value="damage">Damage Assessment</MenuItem>
                    <MenuItem value="needs">Needs Analysis</MenuItem>
                    <MenuItem value="response">Response Planning</MenuItem>
                    <MenuItem value="custom">Custom Report</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}
            
            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Define report parameters
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 2 }}>
                  <FormControl sx={{ minWidth: 250, flexGrow: 1 }}>
                    <InputLabel>Geographic Region</InputLabel>
                    <Select
                      value={region}
                      label="Geographic Region"
                      onChange={handleRegionChange}
                    >
                      <MenuItem value="all">All Affected Areas</MenuItem>
                      <MenuItem value="downtown">Downtown District</MenuItem>
                      <MenuItem value="north">Northern Region</MenuItem>
                      <MenuItem value="coastal">Coastal Areas</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Timeframe</InputLabel>
                    <Select
                      value={timeframe}
                      label="Timeframe"
                      onChange={handleTimeframeChange}
                    >
                      <MenuItem value="24h">Last 24 Hours</MenuItem>
                      <MenuItem value="48h">Last 48 Hours</MenuItem>
                      <MenuItem value="week">Last Week</MenuItem>
                      <MenuItem value="all">All Data</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <TextField
                  fullWidth
                  label="Report Title"
                  placeholder="Enter a title for your report"
                  variant="outlined"
                  sx={{ mt: 2, mb: 4 }}
                  defaultValue={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`}
                />
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}
            
            {activeStep === 2 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Select sections to include in the report
                </Typography>
                <List>
                  <ListItem
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedSections.includes('overview')}
                        onChange={() => handleSectionToggle('overview')}
                      />
                    }
                  >
                    <ListItemIcon>
                      <Warning />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Situation Overview" 
                      secondary="General assessment of the current disaster situation"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedSections.includes('infrastructure')}
                        onChange={() => handleSectionToggle('infrastructure')}
                      />
                    }
                  >
                    <ListItemIcon>
                      <Construction />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Infrastructure Status" 
                      secondary="Roads, bridges, utilities, and communication networks"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedSections.includes('medical')}
                        onChange={() => handleSectionToggle('medical')}
                      />
                    }
                  >
                    <ListItemIcon>
                      <LocalHospital />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Medical Facilities" 
                      secondary="Status of hospitals and healthcare services"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedSections.includes('shelter')}
                        onChange={() => handleSectionToggle('shelter')}
                      />
                    }
                  >
                    <ListItemIcon>
                      <Home />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Shelter Information" 
                      secondary="Available emergency shelters and capacity"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedSections.includes('water')}
                        onChange={() => handleSectionToggle('water')}
                      />
                    }
                  >
                    <ListItemIcon>
                      <WaterDrop />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Water & Sanitation" 
                      secondary="Clean water access and sanitation facilities"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedSections.includes('education')}
                        onChange={() => handleSectionToggle('education')}
                      />
                    }
                  >
                    <ListItemIcon>
                      <School />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Education Facilities" 
                      secondary="Status of schools and education continuity"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedSections.includes('needs')}
                        onChange={() => handleSectionToggle('needs')}
                      />
                    }
                  >
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Priority Needs" 
                      secondary="Identified needs and resource requirements"
                    />
                  </ListItem>
                </List>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}
            
            {activeStep === 3 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Generate and preview your report
                </Typography>
                
                {!isGenerating && !reportGenerated && (
                  <Paper sx={{ p: 3, my: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>Report Type:</Typography>
                      <Typography variant="body1">
                        {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>Geographic Region:</Typography>
                      <Typography variant="body1">
                        {region ? region.charAt(0).toUpperCase() + region.slice(1) : 'All Affected Areas'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>Timeframe:</Typography>
                      <Typography variant="body1">
                        {timeframe === '24h' ? 'Last 24 Hours' : 
                         timeframe === '48h' ? 'Last 48 Hours' : 
                         timeframe === 'week' ? 'Last Week' : 'All Data'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2">Selected Sections:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {selectedSections.map(section => (
                        <Typography 
                          key={section} 
                          variant="body2" 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.contrastText', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1 
                          }}
                        >
                          {section.charAt(0).toUpperCase() + section.slice(1)}
                        </Typography>
                      ))}
                    </Box>
                    
                    <Button
                      variant="contained"
                      onClick={handleGenerateReport}
                      sx={{ mt: 3 }}
                      fullWidth
                    >
                      Generate Report
                    </Button>
                  </Paper>
                )}
                
                {isGenerating && (
                  <Box sx={{ my: 4, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Generating your report...
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={generationProgress} 
                      sx={{ height: 10, borderRadius: 5, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {generationProgress}% complete
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Analyzing data from {timeframe === '24h' ? 'the last 24 hours' : 
                                            timeframe === '48h' ? 'the last 48 hours' : 
                                            timeframe === 'week' ? 'the last week' : 'all available time periods'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {reportGenerated && (
                  <Box>
                    <Paper sx={{ p: 3, my: 3, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                        <Typography variant="h6">
                          Situational Report - {new Date().toLocaleDateString()}
                        </Typography>
                        <Box>
                          <IconButton size="small" title="Download PDF">
                            <Download />
                          </IconButton>
                          <IconButton size="small" title="Print Report">
                            <Print />
                          </IconButton>
                          <IconButton size="small" title="Share Report">
                            <Share />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      {/* Example report content with accordions */}
                      <Box>
                        <Accordion defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Situation Overview</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" paragraph>
                              The earthquake that struck on May 1, 2025, at 10:15 AM local time has affected an estimated 15,400 people across the region. The most severely impacted areas include downtown and northern districts, with significant infrastructure damage reported. Initial assessments indicate a 6.4 magnitude event with shallow depth, explaining the extensive structural damage observed.
                            </Typography>
                            <Typography variant="body2" paragraph>
                              Emergency response operations are underway, with primary focus on search and rescue, medical treatment, and establishing temporary shelter. Local authorities have activated the emergency response plan and requested additional resources from neighboring regions.
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Infrastructure Status</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" paragraph>
                              <strong>Roads and Bridges:</strong> The Main Bridge connecting east and west districts has collapsed and is completely impassable. Three major roads have been damaged with significant cracks, and five secondary roads are blocked by debris. Alternative routes have been established but are experiencing heavy congestion.
                            </Typography>
                            <Typography variant="body2" paragraph>
                              <strong>Utilities:</strong> Power outages affect approximately 40% of the affected area. The Water Treatment Plant is operating at reduced capacity (estimated 60%), with water quality concerns reported in the northern district. Cell phone networks are operational but experiencing congestion.
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Medical Facilities</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" paragraph>
                              Central Hospital has sustained damage to its east wing but remains operational for emergency services. Current occupancy is at 85% capacity with 42 disaster-related admissions. South Medical Center is fully operational and has established additional triage areas to accommodate overflow patients.
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Priority Needs</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" component="div">
                              <strong>Immediate priorities (0-48 hours):</strong>
                              <ul>
                                <li>Search and rescue teams for downtown collapsed structures</li>
                                <li>Medical supplies, particularly trauma kits and IV fluids</li>
                                <li>Emergency shelter capacity for approximately 500 displaced people</li>
                                <li>Water purification supplies for northern district</li>
                                <li>Temporary bridges or solutions for east-west transit</li>
                              </ul>
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                      
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          variant="outlined"
                          onClick={() => {
                            setActiveStep(0);
                            setReportGenerated(false);
                          }}
                        >
                          Create New Report
                        </Button>
                        <Button variant="contained">
                          Share Report
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                )}
                
                {!reportGenerated && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Right column - Recent Reports */}
        <Box sx={{ flexBasis: { xs: '100%', md: '30%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Reports</Typography>
            <List dense>
              {recentReports.map(report => (
                <ListItem 
                  key={report.id}
                  secondaryAction={
                    <IconButton edge="end" size="small">
                      <CloudDownload fontSize="small" />
                    </IconButton>
                  }
                  sx={{ 
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    pl: 2,
                    mb: 1,
                    borderRadius: '4px',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Description fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={report.name}
                    secondary={`${report.type} • ${report.date}`}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Report Templates
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Check fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Situation Report (SITREP)" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Check fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Damage Assessment" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Check fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Needs Analysis" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Check fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Response Plan" />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}