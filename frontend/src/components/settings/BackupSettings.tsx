import { useState } from 'react';
import {
  Box, Typography, Divider, Button, List,
  ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, LinearProgress, FormControl, FormLabel,
  RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import {
  CloudUpload, CloudDownload, Delete,
  SaveOutlined, Schedule
} from '@mui/icons-material';

interface BackupSettingsProps {
  onSave: (message?: string) => void;
}

export default function BackupSettings({ onSave }: BackupSettingsProps) {
  const [backupSchedule, setBackupSchedule] = useState('weekly');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const handleBackupScheduleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBackupSchedule((event.target as HTMLInputElement).value);
  };

  const simulateBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simulate backup process
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          onSave('Backup completed successfully');
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const handleSave = () => {
    onSave('Backup settings updated successfully');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Backup & Restore</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Manage data backups and restoration
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Automatic Backup Schedule
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={backupSchedule}
            onChange={handleBackupScheduleChange}
          >
            <FormControlLabel value="daily" control={<Radio />} label="Daily" />
            <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
            <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
            <FormControlLabel value="never" control={<Radio />} label="Never (Manual only)" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Manual Backup & Restore
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={simulateBackup}
            disabled={isBackingUp}
          >
            Create Backup Now
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudDownload />}
          >
            Restore from Backup
          </Button>
        </Box>

        {isBackingUp && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={backupProgress} 
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Creating backup... {backupProgress}%
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Backup History
        </Typography>
        <List>
          <ListItem divider>
            <ListItemText
              primary="Full Backup"
              secondary="May 3, 2025 - 09:00 AM • 15.4 MB"
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="download">
                <CloudDownload />
              </IconButton>
              <IconButton edge="end" aria-label="delete">
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem divider>
            <ListItemText
              primary="Full Backup"
              secondary="April 26, 2025 - 09:00 AM • 14.8 MB"
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="download">
                <CloudDownload />
              </IconButton>
              <IconButton edge="end" aria-label="delete">
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Full Backup"
              secondary="April 19, 2025 - 09:00 AM • 14.2 MB"
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="download">
                <CloudDownload />
              </IconButton>
              <IconButton edge="end" aria-label="delete">
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<Schedule />}
        >
          View Backup Schedule
        </Button>
        <Button 
          variant="contained"
          startIcon={<SaveOutlined />}
          onClick={handleSave}
        >
          Save Backup Settings
        </Button>
      </Box>
    </Box>
  );
}