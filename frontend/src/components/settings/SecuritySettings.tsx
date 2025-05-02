import { useState } from 'react';
import {
  Box, Typography, Divider, Button, FormControlLabel,
  Switch, List, ListItem, ListItemText, TextField
} from '@mui/material';
import {
  Security, Password, History, SaveOutlined
} from '@mui/icons-material';

interface SecuritySettingsProps {
  onSave: (message?: string) => void;
}

export default function SecuritySettings({ onSave }: SecuritySettingsProps) {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    showLoginHistory: true
  });

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSettings(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSave = () => {
    onSave('Security settings updated successfully');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Security Settings</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Configure security options for your account
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 4 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.twoFactorAuth}
              onChange={handleSwitchChange}
              name="twoFactorAuth"
            />
          }
          label="Enable Two-Factor Authentication"
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Session Timeout (minutes)
        </Typography>
        <TextField
          type="number"
          InputProps={{ inputProps: { min: 5, max: 240 } }}
          name="sessionTimeout"
          value={settings.sessionTimeout}
          onChange={handleTextChange}
        />
      </Box>

      {settings.showLoginHistory && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recent Login Activity
          </Typography>
          <List dense>
            <ListItem divider>
              <ListItemText 
                primary="May 3, 2025 - 08:45 AM" 
                secondary="New York, USA (192.168.1.1)" 
              />
            </ListItem>
            <ListItem divider>
              <ListItemText 
                primary="May 1, 2025 - 03:22 PM" 
                secondary="New York, USA (192.168.1.1)" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="April 30, 2025 - 10:15 AM" 
                secondary="New York, USA (192.168.1.1)" 
              />
            </ListItem>
          </List>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          variant="outlined"
          startIcon={<Password />}
          color="primary"
        >
          Change Password
        </Button>
        <Button 
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
        >
          Save Security Settings
        </Button>
      </Box>
    </Box>
  );
}