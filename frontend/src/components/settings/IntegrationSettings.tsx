import { useState } from 'react';
import {
  Box, Typography, Divider, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, Switch, Button,
  TextField, Paper
} from '@mui/material';
import {
  CloudOutlined, Link, LinkOff, AddLink,
  Twitter, Public, Api, SaveOutlined
} from '@mui/icons-material';

interface IntegrationSettingsProps {
  onSave: (message?: string) => void;
}

export default function IntegrationSettings({ onSave }: IntegrationSettingsProps) {
  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'Twitter API', connected: true, apiKey: '•••••••••••••••••' },
    { id: 2, name: 'Weather Service', connected: true, apiKey: '•••••••••••••••••' },
    { id: 3, name: 'Mapping Provider', connected: true, apiKey: '•••••••••••••••••' },
    { id: 4, name: 'Government Data Portal', connected: false, apiKey: '' },
    { id: 5, name: 'Emergency Alert System', connected: true, apiKey: '•••••••••••••••••' }
  ]);

  const [newIntegration, setNewIntegration] = useState({
    name: '',
    apiKey: ''
  });

  const handleToggleConnection = (id: number) => {
    setIntegrations(integrations.map(integration => 
      integration.id === id ? { ...integration, connected: !integration.connected } : integration
    ));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewIntegration(prev => ({ ...prev, [name]: value }));
  };

  const handleAddIntegration = () => {
    if (newIntegration.name && newIntegration.apiKey) {
      setIntegrations([
        ...integrations,
        {
          id: Math.max(...integrations.map(i => i.id)) + 1,
          name: newIntegration.name,
          apiKey: newIntegration.apiKey,
          connected: true
        }
      ]);
      setNewIntegration({ name: '', apiKey: '' });
    }
  };

  const handleSave = () => {
    onSave('Integration settings updated successfully');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Integrations & API Connections</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Manage connections to external services and data providers
      </Typography>
      <Divider sx={{ my: 2 }} />

      <List>
        {integrations.map((integration) => (
          <ListItem key={integration.id} divider>
            <ListItemIcon>
              {integration.connected ? 
                <Link color="primary" /> : 
                <LinkOff color="disabled" />
              }
            </ListItemIcon>
            <ListItemText 
              primary={integration.name} 
              secondary={integration.connected ? 
                `Connected • Key: ${integration.apiKey}` : 
                'Not connected'
              }
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={integration.connected}
                onChange={() => handleToggleConnection(integration.id)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Paper sx={{ mt: 4, p: 2, bgcolor: 'background.default' }}>
        <Typography variant="subtitle2" gutterBottom>
          Add New Integration
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <Box sx={{ flex: '5 1 250px' }}>
            <TextField
              fullWidth
              label="Service Name"
              name="name"
              value={newIntegration.name}
              onChange={handleInputChange}
            />
          </Box>
          <Box sx={{ flex: '5 1 250px' }}>
            <TextField
              fullWidth
              label="API Key"
              name="apiKey"
              value={newIntegration.apiKey}
              onChange={handleInputChange}
              type="password"
            />
          </Box>
          <Box sx={{ flex: '2 1 100px' }}>
            <Button
              variant="outlined"
              startIcon={<AddLink />}
              onClick={handleAddIntegration}
              fullWidth
            >
              Add
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Available Integration Services
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button variant="outlined" startIcon={<Twitter />}>
            Twitter
          </Button>
          <Button variant="outlined" startIcon={<Public />}>
            OpenStreetMap
          </Button>
          <Button variant="outlined" startIcon={<CloudOutlined />}>
            Weather APIs
          </Button>
          <Button variant="outlined" startIcon={<Api />}>
            Government Portals
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
        >
          Save Integration Settings
        </Button>
      </Box>
    </Box>
  );
}