import { useState } from 'react';
import {
  Box, Typography, Divider, FormControl, InputLabel,
  Select, MenuItem, SelectChangeEvent, FormControlLabel,
  Switch, Button, TextField, Chip
} from '@mui/material';
import { SaveOutlined, AutoAwesome, DeleteSweep } from '@mui/icons-material';

interface DataSettingsProps {
  onSave: (message?: string) => void;
}

export default function DataSettings({ onSave }: DataSettingsProps) {
  const [settings, setSettings] = useState({
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12hour',
    dataRefreshInterval: '5min',
    enableDataCache: true,
    enableAutoSync: true,
    aiDataProcessing: true,
    relevanceThreshold: 60,
    dataSources: ['field', 'social', 'news', 'sensors', 'government'],
    dataRetentionPeriod: '90days'
  });

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleToggleDataSource = (source: string) => {
    setSettings(prev => {
      if (prev.dataSources.includes(source)) {
        return { ...prev, dataSources: prev.dataSources.filter(s => s !== source) };
      } else {
        return { ...prev, dataSources: [...prev.dataSources, source] };
      }
    });
  };

  const handleSave = () => {
    onSave('Data settings updated successfully');
  };

  const handleClearCache = () => {
    // In a real app, this would clear the data cache
    onSave('Data cache cleared successfully');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Data Settings</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Configure how disaster data is processed, displayed, and stored
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Date Format</InputLabel>
            <Select
              name="dateFormat"
              value={settings.dateFormat}
              label="Date Format"
              onChange={handleSelectChange}
            >
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Time Format</InputLabel>
            <Select
              name="timeFormat"
              value={settings.timeFormat}
              label="Time Format"
              onChange={handleSelectChange}
            >
              <MenuItem value="12hour">12-hour (AM/PM)</MenuItem>
              <MenuItem value="24hour">24-hour</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Data Refresh Interval</InputLabel>
            <Select
              name="dataRefreshInterval"
              value={settings.dataRefreshInterval}
              label="Data Refresh Interval"
              onChange={handleSelectChange}
            >
              <MenuItem value="1min">Every minute</MenuItem>
              <MenuItem value="5min">Every 5 minutes</MenuItem>
              <MenuItem value="15min">Every 15 minutes</MenuItem>
              <MenuItem value="30min">Every 30 minutes</MenuItem>
              <MenuItem value="1hour">Every hour</MenuItem>
              <MenuItem value="manual">Manual refresh only</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Data Retention Period</InputLabel>
            <Select
              name="dataRetentionPeriod"
              value={settings.dataRetentionPeriod}
              label="Data Retention Period"
              onChange={handleSelectChange}
            >
              <MenuItem value="30days">30 days</MenuItem>
              <MenuItem value="90days">90 days</MenuItem>
              <MenuItem value="180days">180 days</MenuItem>
              <MenuItem value="1year">1 year</MenuItem>
              <MenuItem value="permanent">Permanent</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ width: '100%', mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Data Sources
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {['field', 'social', 'news', 'sensors', 'government', 'satellite'].map(source => (
              <Chip 
                key={source}
                label={source.charAt(0).toUpperCase() + source.slice(1)}
                onClick={() => handleToggleDataSource(source)}
                color={settings.dataSources.includes(source) ? 'primary' : 'default'}
                variant={settings.dataSources.includes(source) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ width: '100%', mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            AI & Data Processing
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.aiDataProcessing}
                  onChange={handleSwitchChange}
                  name="aiDataProcessing"
                />
              }
              label="Enable AI-powered data processing"
            />
            
            <TextField
              label="Minimum Relevance Score Threshold (%)"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={settings.relevanceThreshold}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                relevanceThreshold: parseInt(e.target.value) || 0 
              }))}
              disabled={!settings.aiDataProcessing}
              sx={{ mt: 2 }}
            />
          </Box>
        </Box>

        <Box sx={{ width: '100%', mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableDataCache}
                  onChange={handleSwitchChange}
                  name="enableDataCache"
                />
              }
              label="Enable data caching for offline access"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableAutoSync}
                  onChange={handleSwitchChange}
                  name="enableAutoSync"
                />
              }
              label="Enable automatic data synchronization"
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          color="error"
          startIcon={<DeleteSweep />}
          onClick={handleClearCache}
        >
          Clear Data Cache
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={() => onSave('AI model retraining initiated')}
          >
            Retrain AI Models
          </Button>
          <Button 
            variant="contained"
            startIcon={<SaveOutlined />}
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </Box>
      </Box>
    </Box>
  );
}