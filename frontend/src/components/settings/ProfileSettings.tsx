import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Avatar,
  Divider, FormControl, InputLabel, Select,
  MenuItem, SelectChangeEvent
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

interface ProfileSettingsProps {
  onSave: (message?: string) => void;
}

export default function ProfileSettings({ onSave }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    organization: string;
    role: string;
    phoneNumber: string;
    bio: string;
    profileImage: File | null;
  }>({
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com',
    organization: 'Emergency Response Team',
    role: 'field_responder',
    phoneNumber: '+1 (555) 123-4567',
    bio: 'Emergency response specialist with 5 years of experience in disaster assessment and coordination.',
    profileImage: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setProfile(prev => ({ ...prev, role: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, you would handle file upload to a server
      // For now, just update the state with the file object
      setProfile(prev => ({ ...prev, profileImage: e.target.files![0] }));
    }
  };

  const handleSave = () => {
    // In a real app, you would send the profile data to a server here
    onSave('Profile settings updated successfully');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Profile Settings</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Manage your personal information and preferences
      </Typography>
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          sx={{ width: 100, height: 100, mb: 2 }} 
          alt={`${profile.firstName} ${profile.lastName}`}
          src={profile.profileImage ? URL.createObjectURL(profile.profileImage) : undefined}
        />
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCamera />}
          size="small"
        >
          Change Photo
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
          <TextField
            fullWidth
            label="Organization"
            name="organization"
            value={profile.organization}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '250px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={profile.role}
              label="Role"
              onChange={handleSelectChange}
            >
              <MenuItem value="field_responder">Field Responder</MenuItem>
              <MenuItem value="coordinator">Coordinator</MenuItem>
              <MenuItem value="data_analyst">Data Analyst</MenuItem>
              <MenuItem value="administrator">Administrator</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={profile.phoneNumber}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Bio"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />
        </Box>
      </Box>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          Save Profile
        </Button>
      </Box>
    </Box>
  );
}