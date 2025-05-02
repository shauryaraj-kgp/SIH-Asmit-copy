import { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box, Paper, Typography, TextField, Button,
  MenuItem, FormControl, InputLabel, Select, SelectChangeEvent,
  FormControlLabel, Switch, Divider, Snackbar, Alert
} from '@mui/material';
import { PhotoCamera, Send, Save } from '@mui/icons-material';

interface DataEntryFormProps {
  formType?: 'pre-disaster' | 'post-disaster';
}

interface FormValues {
  locationName: string;
  latitude: string;
  longitude: string;
  category: string;
  details: string;
  status: string;
  image: File | null;
  verified: boolean;
}

export default function DataEntryForm({ formType = 'pre-disaster' }: DataEntryFormProps) {
  const [formValues, setFormValues] = useState<FormValues>({
    locationName: '',
    latitude: '',
    longitude: '',
    category: '',
    details: '',
    status: formType === 'post-disaster' ? 'operational' : '',
    image: null,
    verified: false
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as const
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormValues(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, this would send data to the backend
    console.log('Submitting form data:', formValues);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Data successfully submitted!',
      severity: 'success'
    });
    
    // Clear form (in a real app you might want to keep some fields)
    setFormValues({
      locationName: '',
      latitude: '',
      longitude: '',
      category: '',
      details: '',
      status: formType === 'post-disaster' ? 'operational' : '',
      image: null,
      verified: false
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {formType === 'pre-disaster' ? 'Pre-Disaster Data Entry' : 'Post-Disaster Update'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        {/* Form Fields Container */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Location Name */}
          <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
            <TextField
              required
              fullWidth
              label="Location Name"
              name="locationName"
              value={formValues.locationName}
              onChange={handleChange}
            />
          </Box>
          
          {/* Latitude */}
          <Box sx={{ flexBasis: { xs: '100%', sm: '23%' } }}>
            <TextField
              required
              fullWidth
              label="Latitude"
              name="latitude"
              type="number"
              inputProps={{ step: 'any' }}
              value={formValues.latitude}
              onChange={handleChange}
            />
          </Box>
          
          {/* Longitude */}
          <Box sx={{ flexBasis: { xs: '100%', sm: '23%' } }}>
            <TextField
              required
              fullWidth
              label="Longitude"
              name="longitude"
              type="number"
              inputProps={{ step: 'any' }}
              value={formValues.longitude}
              onChange={handleChange}
            />
          </Box>
          
          {/* Category */}
          <Box sx={{ flexBasis: { xs: '100%', sm: formType === 'post-disaster' ? '48%' : '100%' } }}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formValues.category}
                label="Category"
                onChange={handleSelectChange}
              >
                <MenuItem value="hospital">Hospital</MenuItem>
                <MenuItem value="school">School</MenuItem>
                <MenuItem value="shelter">Shelter</MenuItem>
                <MenuItem value="infrastructure">Infrastructure</MenuItem>
                <MenuItem value="residential">Residential Area</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Status (for post-disaster only) */}
          {formType === 'post-disaster' && (
            <Box sx={{ flexBasis: { xs: '100%', sm: '48%' } }}>
              <FormControl fullWidth required>
                <InputLabel>Current Status</InputLabel>
                <Select
                  name="status"
                  value={formValues.status}
                  label="Current Status"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="operational">Operational</MenuItem>
                  <MenuItem value="damaged">Damaged</MenuItem>
                  <MenuItem value="destroyed">Destroyed</MenuItem>
                  <MenuItem value="unknown">Unknown</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          
          {/* Details */}
          <Box sx={{ flexBasis: '100%' }}>
            <TextField
              fullWidth
              label="Details"
              name="details"
              multiline
              rows={4}
              value={formValues.details}
              onChange={handleChange}
            />
          </Box>
          
          {/* Image Upload */}
          <Box sx={{ flexBasis: '100%' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {formValues.image && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                File selected: {formValues.image.name}
              </Typography>
            )}
          </Box>
          
          {/* Verification (for post-disaster only) */}
          {formType === 'post-disaster' && (
            <Box sx={{ flexBasis: '100%' }}>
              <FormControlLabel
                control={
                  <Switch
                    name="verified"
                    checked={formValues.verified}
                    onChange={handleSwitchChange}
                  />
                }
                label="I verify this information is accurate and current"
              />
            </Box>
          )}
          
          {/* Form Buttons */}
          <Box sx={{ flexBasis: '100%' }}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<Save />}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}