import { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box, Paper, Typography, TextField, Button,
  MenuItem, FormControl, InputLabel, Select, SelectChangeEvent,
  FormControlLabel, Switch, Divider, Snackbar, Alert,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Send, Save } from '@mui/icons-material';
import { postDisasterService, PostDisasterUpdate } from '../../services/postDisasterService';

interface DataEntryFormProps {
  formType?: 'pre-disaster' | 'post-disaster';
  onSubmitSuccess?: (data: any) => void;
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

export default function DataEntryForm({ formType = 'pre-disaster', onSubmitSuccess }: DataEntryFormProps) {
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
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formType === 'post-disaster') {
        // Create a post-disaster update object
        const update: PostDisasterUpdate = {
          locationName: formValues.locationName,
          type: formValues.category,
          status: formValues.status as 'operational' | 'damaged' | 'destroyed' | 'unknown',
          latitude: parseFloat(formValues.latitude),
          longitude: parseFloat(formValues.longitude),
          details: formValues.details,
          reportedBy: 'web_user', // In a real app, get from user profile
          reportedAt: new Date().toISOString(),
          source: 'field', // Manual entry is field data
          hasImage: formValues.image !== null,
          verified: formValues.verified
        };

        // Store in RAG database
        const result = await postDisasterService.storePostDisasterUpdate(update);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Post-disaster update successfully submitted and stored in database!',
          severity: 'success'
        });
        
        // Call the success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess(result);
        }
      } else {
        // Pre-disaster logic (to be implemented separately)
        console.log('Submitting pre-disaster form data:', formValues);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Pre-disaster data successfully submitted!',
          severity: 'success'
        });
      }
      
      // Clear form
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
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Error submitting data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
            />
          </Box>
          
          {/* Category */}
          <Box sx={{ flexBasis: { xs: '100%', sm: formType === 'post-disaster' ? '48%' : '100%' } }}>
            <FormControl fullWidth required disabled={submitting}>
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
              <FormControl fullWidth required disabled={submitting}>
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
              disabled={submitting}
            />
          </Box>
          
          {/* Image Upload */}
          <Box sx={{ flexBasis: '100%' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              disabled={submitting}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
                disabled={submitting}
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
                    disabled={submitting}
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
                disabled={submitting}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitting ? <CircularProgress size={24} color="inherit" /> : <Send />}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
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