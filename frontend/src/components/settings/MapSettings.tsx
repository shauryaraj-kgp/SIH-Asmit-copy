import { useState } from 'react';
import {
  Box, Typography, Divider, FormControl, InputLabel,
  Select, MenuItem, SelectChangeEvent, TextField,
  Button, Slider, FormControlLabel, Switch, RadioGroup,
  Radio, FormLabel
} from '@mui/material';
import { SaveOutlined, RefreshOutlined } from '@mui/icons-material';

interface MapSettingsProps {
  onSave: (message?: string) => void;
}

export default function MapSettings({ onSave }: MapSettingsProps) {
  const [settings, setSettings] = useState({
    defaultMapStyle: 'streets',
    defaultLatitude: 40.712,
    defaultLongitude: -74.006,
    defaultZoom: 12,
    showLegend: true,
    showScale: true,
    show3DBuildings: true,
    mapLayerOpacity: 80,
    unitSystem: 'metric',
    colorScheme: 'standard'
  });

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // For latitude and longitude, handle as numbers
    if (name === 'defaultLatitude' || name === 'defaultLongitude') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setSettings(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSliderChange = (name: string) => (_event: Event, newValue: number | number[]) => {
    setSettings(prev => ({ ...prev, [name]: newValue as number }));
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, unitSystem: (event.target as HTMLInputElement).value }));
  };

  const handleColorSchemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, colorScheme: (event.target as HTMLInputElement).value }));
  };

  const handleSave = () => {
    onSave('Map settings updated successfully');
  };

  const handleReset = () => {
    setSettings({
      defaultMapStyle: 'streets',
      defaultLatitude: 40.712,
      defaultLongitude: -74.006,
      defaultZoom: 12,
      showLegend: true,
      showScale: true,
      show3DBuildings: true,
      mapLayerOpacity: 80,
      unitSystem: 'metric',
      colorScheme: 'standard'
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Map Settings</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Configure map display preferences and default behaviors
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Default Map Style</InputLabel>
            <Select
              name="defaultMapStyle"
              value={settings.defaultMapStyle}
              label="Default Map Style"
              onChange={handleSelectChange}
            >
              <MenuItem value="streets">Streets</MenuItem>
              <MenuItem value="satellite">Satellite</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="light">Light</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Default Zoom Level</InputLabel>
            <Select
              name="defaultZoom"
              value={settings.defaultZoom.toString()}
              label="Default Zoom Level"
              onChange={(e) => {
                setSettings(prev => ({ ...prev, defaultZoom: parseInt(e.target.value) }));
              }}
            >
              {[...Array(15)].map((_, i) => (
                <MenuItem key={i+5} value={i+5}>{i+5}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px' }}>
          <TextField
            fullWidth
            label="Default Latitude"
            name="defaultLatitude"
            type="number"
            inputProps={{ step: 0.000001 }}
            value={settings.defaultLatitude}
            onChange={handleTextChange}
            margin="normal"
          />
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px' }}>
          <TextField
            fullWidth
            label="Default Longitude"
            name="defaultLongitude"
            type="number"
            inputProps={{ step: 0.000001 }}
            value={settings.defaultLongitude}
            onChange={handleTextChange}
            margin="normal"
          />
        </Box>

        <Box sx={{ width: '100%', mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Map Layer Opacity
          </Typography>
          <Slider
            value={settings.mapLayerOpacity}
            onChange={handleSliderChange('mapLayerOpacity')}
            aria-labelledby="map-opacity-slider"
            valueLabelDisplay="auto"
            step={5}
            marks
            min={0}
            max={100}
          />
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px', mt: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Unit System</FormLabel>
            <RadioGroup
              value={settings.unitSystem}
              onChange={handleRadioChange}
            >
              <FormControlLabel value="metric" control={<Radio />} label="Metric (km, m)" />
              <FormControlLabel value="imperial" control={<Radio />} label="Imperial (mi, ft)" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '250px', mt: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Color Scheme</FormLabel>
            <RadioGroup
              value={settings.colorScheme}
              onChange={handleColorSchemeChange}
            >
              <FormControlLabel value="standard" control={<Radio />} label="Standard" />
              <FormControlLabel value="colorblind" control={<Radio />} label="Colorblind-friendly" />
              <FormControlLabel value="highContrast" control={<Radio />} label="High Contrast" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ width: '100%', mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showLegend}
                  onChange={handleSwitchChange}
                  name="showLegend"
                />
              }
              label="Show Map Legend"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showScale}
                  onChange={handleSwitchChange}
                  name="showScale"
                />
              }
              label="Show Scale Bar"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.show3DBuildings}
                  onChange={handleSwitchChange}
                  name="show3DBuildings"
                />
              }
              label="Show 3D Buildings"
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<RefreshOutlined />}
          onClick={handleReset}
        >
          Reset to Default
        </Button>
        <Button 
          variant="contained" 
          startIcon={<SaveOutlined />}
          onClick={handleSave}
        >
          Save Map Settings
        </Button>
      </Box>
    </Box>
  );
}