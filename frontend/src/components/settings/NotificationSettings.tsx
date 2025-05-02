import { useState } from 'react';
import {
  Box, Typography, Divider, FormGroup, FormControlLabel,
  Switch, List, ListItem, ListItemText, Slider, Button,
  ListItemIcon, Chip
} from '@mui/material';
import {
  NotificationsActive, Email, Sms, NotificationsOff,
  PriorityHigh, Warning
} from '@mui/icons-material';

interface NotificationSettingsProps {
  onSave: (message?: string) => void;
}

export default function NotificationSettings({ onSave }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    desktopAlerts: true,
    criticalUpdatesOnly: false,
    muteAllNotifications: false,
    notificationThreshold: 70
  });

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    
    // Special handling for "mute all" which overrides other settings
    if (name === 'muteAllNotifications' && checked) {
      setSettings(prev => ({
        ...prev,
        muteAllNotifications: true,
        emailNotifications: false,
        smsNotifications: false,
        pushNotifications: false,
        desktopAlerts: false
      }));
    } else if (name === 'muteAllNotifications' && !checked) {
      setSettings(prev => ({
        ...prev,
        muteAllNotifications: false,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        desktopAlerts: true
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: checked }));
    }
  };

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setSettings(prev => ({ ...prev, notificationThreshold: newValue as number }));
  };

  const handleSave = () => {
    onSave('Notification preferences updated successfully');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Notification Settings</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Configure how and when you want to receive alerts and updates
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Notification Methods
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleSwitchChange}
                name="emailNotifications"
                disabled={settings.muteAllNotifications}
              />
            }
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.smsNotifications}
                onChange={handleSwitchChange}
                name="smsNotifications"
                disabled={settings.muteAllNotifications}
              />
            }
            label="SMS Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.pushNotifications}
                onChange={handleSwitchChange}
                name="pushNotifications"
                disabled={settings.muteAllNotifications}
              />
            }
            label="Push Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.desktopAlerts}
                onChange={handleSwitchChange}
                name="desktopAlerts"
                disabled={settings.muteAllNotifications}
              />
            }
            label="Desktop Alerts"
          />
        </FormGroup>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Notification Preferences
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.criticalUpdatesOnly}
                onChange={handleSwitchChange}
                name="criticalUpdatesOnly"
                disabled={settings.muteAllNotifications}
              />
            }
            label="Only receive critical updates"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.muteAllNotifications}
                onChange={handleSwitchChange}
                name="muteAllNotifications"
                color="error"
              />
            }
            label="Mute all notifications"
          />
        </FormGroup>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Relevance Threshold
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Only receive notifications for events with relevance score above:
        </Typography>
        <Box sx={{ px: 2, py: 1 }}>
          <Slider
            value={settings.notificationThreshold}
            onChange={handleSliderChange}
            aria-labelledby="notification-threshold-slider"
            valueLabelDisplay="auto"
            step={5}
            marks
            min={0}
            max={100}
            disabled={settings.muteAllNotifications}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">Low Priority</Typography>
            <Typography variant="caption" color="text.secondary">High Priority</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Notification Categories
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PriorityHigh color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Critical Alerts" 
              secondary="Immediate life-threatening situations" 
            />
            <Chip size="small" label="Always On" color="error" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Warning color="warning" />
            </ListItemIcon>
            <ListItemText 
              primary="Infrastructure Updates" 
              secondary="Changes to critical infrastructure status" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Email color="info" />
            </ListItemIcon>
            <ListItemText 
              primary="Daily Summaries" 
              secondary="Daily recap of important events" 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Sms color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="System Notifications" 
              secondary="Updates about the platform and features" 
            />
          </ListItem>
        </List>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<NotificationsOff />}
          onClick={() => setSettings(prev => ({
            ...prev,
            muteAllNotifications: true,
            emailNotifications: false,
            smsNotifications: false,
            pushNotifications: false,
            desktopAlerts: false
          }))}
        >
          Mute All
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<NotificationsActive />}
          onClick={() => setSettings(prev => ({
            ...prev,
            muteAllNotifications: false,
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            desktopAlerts: true
          }))}
        >
          Enable All
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </Box>
    </Box>
  );
}