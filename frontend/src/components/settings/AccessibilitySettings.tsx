import { useState } from 'react';
import {
  Box, Typography, Divider, FormControlLabel,
  Switch, Slider, Button, FormControl, InputLabel,
  Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';

interface AccessibilitySettingsProps {
  onSave: (message?: string) => void;
}

export default function AccessibilitySettings({ onSave }: AccessibilitySettingsProps) {
  const [settings, setSettings] = useState({
    highContrastMode: false,
    largeText: false,
    reduceMotion: false,
    screenReaderOptimized: false,
    textZoomLevel: 100,
    fontFamily: 'system'
  });

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setSettings(prev => ({ ...prev, fontFamily: event.target.value }));
  };

  const handleZoomChange = (_event: Event, newValue: number | number[]) => {
    setSettings(prev => ({ ...prev, textZoomLevel: newValue as number }));
  };

  const handleSave = () => {
    onSave('Accessibility settings updated successfully');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Accessibility Settings</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Customize the application for better accessibility
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Display Options
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.highContrastMode}
                onChange={handleSwitchChange}
                name="highContrastMode"
              />
            }
            label="High Contrast Mode"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.largeText}
                onChange={handleSwitchChange}
                name="largeText"
              />
            }
            label="Large Text"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.reduceMotion}
                onChange={handleSwitchChange}
                name="reduceMotion"
              />
            }
            label="Reduce Motion"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.screenReaderOptimized}
                onChange={handleSwitchChange}
                name="screenReaderOptimized"
              />
            }
            label="Screen Reader Optimized"
          />
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Text Zoom Level: {settings.textZoomLevel}%
        </Typography>
        <Slider
          value={settings.textZoomLevel}
          onChange={handleZoomChange}
          aria-labelledby="text-zoom-slider"
          valueLabelDisplay="auto"
          step={10}
          marks
          min={80}
          max={150}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Font Family</InputLabel>
          <Select
            value={settings.fontFamily}
            label="Font Family"
            onChange={handleSelectChange}
          >
            <MenuItem value="system">System Default</MenuItem>
            <MenuItem value="sans-serif">Sans-serif</MenuItem>
            <MenuItem value="serif">Serif</MenuItem>
            <MenuItem value="monospace">Monospace</MenuItem>
            <MenuItem value="dyslexic">OpenDyslexic</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
        >
          Save Accessibility Settings
        </Button>
      </Box>
    </Box>
  );
}