import { useState } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Divider,
  Button, Snackbar, Alert
} from '@mui/material';
import {
  AccountCircle, Notifications, MapOutlined,
  Language, DataObject, Accessibility, Security, Backup
} from '@mui/icons-material';

// Import settings section components
import ProfileSettings from '../components/settings/ProfileSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import MapSettings from '../components/settings/MapSettings';
import DataSettings from '../components/settings/DataSettings';
import IntegrationSettings from '../components/settings/IntegrationSettings';
import AccessibilitySettings from '../components/settings/AccessibilitySettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import BackupSettings from '../components/settings/BackupSettings';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as const
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = (message: string = 'Settings saved successfully') => {
    // In a real app, this would save the settings to backend
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Configure application preferences and account settings
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<AccountCircle />} label="Profile" iconPosition="start" />
          <Tab icon={<Notifications />} label="Notifications" iconPosition="start" />
          <Tab icon={<MapOutlined />} label="Map" iconPosition="start" />
          <Tab icon={<DataObject />} label="Data" iconPosition="start" />
          <Tab icon={<Language />} label="Integrations" iconPosition="start" />
          <Tab icon={<Accessibility />} label="Accessibility" iconPosition="start" />
          <Tab icon={<Security />} label="Security" iconPosition="start" />
          <Tab icon={<Backup />} label="Backup & Restore" iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ProfileSettings onSave={handleSaveSettings} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <NotificationSettings onSave={handleSaveSettings} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <MapSettings onSave={handleSaveSettings} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <DataSettings onSave={handleSaveSettings} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <IntegrationSettings onSave={handleSaveSettings} />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <AccessibilitySettings onSave={handleSaveSettings} />
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <SecuritySettings onSave={handleSaveSettings} />
        </TabPanel>

        <TabPanel value={tabValue} index={7}>
          <BackupSettings onSave={handleSaveSettings} />
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}