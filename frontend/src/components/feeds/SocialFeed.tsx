import { useState } from 'react';
import {
  Box, Paper, Typography, TextField, InputAdornment, 
  Button, Card, CardContent, CardHeader, Avatar,
  Chip, IconButton, Divider, Alert, CardActions,
  Tabs, Tab, Switch, FormControlLabel
} from '@mui/material';
import {
  Twitter, Facebook, VerifiedUser, Search, Save,
  LocationOn, Public, ThumbUp, Comment, Share
} from '@mui/icons-material';

// Sample social media posts
interface SocialPost {
  id: number;
  platform: 'twitter' | 'facebook' | 'instagram';
  username: string;
  userHandle: string;
  content: string;
  timestamp: string;
  relevanceScore: number;
  locationMention?: string;
  hasMedia: boolean;
  verified: boolean;
  saved: boolean;
}

const SAMPLE_POSTS: SocialPost[] = [
  {
    id: 1,
    platform: 'twitter',
    username: 'Local News Network',
    userHandle: '@localnews',
    content: 'BREAKING: Main Bridge has collapsed following the earthquake. Avoid downtown area. Emergency services are responding. #DisasterResponse',
    timestamp: '2025-05-01T12:15:00Z',
    relevanceScore: 0.92,
    locationMention: 'Main Bridge',
    hasMedia: true,
    verified: true,
    saved: true
  },
  {
    id: 2,
    platform: 'twitter',
    username: 'Sarah Johnson',
    userHandle: '@sarah_j',
    content: 'Just passed by North Elementary School - roof of the gym has caved in. Rest of building looks ok from outside. #earthquake',
    timestamp: '2025-05-01T12:35:00Z',
    relevanceScore: 0.85,
    locationMention: 'North Elementary School',
    hasMedia: true,
    verified: false,
    saved: false
  },
  {
    id: 3,
    platform: 'facebook',
    username: 'Community Emergency Group',
    userHandle: 'CommunityEmergency',
    content: 'UPDATE: Community Center is now open as an emergency shelter. We have capacity for about 200 people. Basic supplies and medical aid available. Please share with those in need.',
    timestamp: '2025-05-01T14:05:00Z',
    relevanceScore: 0.94,
    locationMention: 'Community Center',
    hasMedia: false,
    verified: true,
    saved: true
  },
  {
    id: 4,
    platform: 'twitter',
    username: 'Mark Wilson',
    userHandle: '@mark_wils',
    content: 'Water coming out of tap looks brown. Anyone else experiencing this? Could the water treatment plant be affected? #earthquake #cityneedstoknow',
    timestamp: '2025-05-01T15:22:00Z',
    relevanceScore: 0.78,
    locationMention: 'Water Treatment Plant',
    hasMedia: false,
    verified: false,
    saved: false
  },
  {
    id: 5,
    platform: 'facebook',
    username: 'Central Hospital',
    userHandle: 'CentralHospitalOfficial',
    content: 'Central Hospital east wing has sustained damage. ER remains OPEN. Please only come if you have a genuine emergency. Non-critical patients are being diverted to South Medical Center.',
    timestamp: '2025-05-01T13:10:00Z',
    relevanceScore: 0.96,
    locationMention: 'Central Hospital',
    hasMedia: true,
    verified: true,
    saved: true
  },
];

export default function SocialFeed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedTab, setFeedTab] = useState(0);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  
  const handleFeedTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setFeedTab(newValue);
  };

  const handleVerifiedToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowVerifiedOnly(event.target.checked);
  };

  // Filter posts based on search and verification status
  const filteredPosts = SAMPLE_POSTS
    .filter(post => 
      (searchTerm === '' || 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.locationMention?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!showVerifiedOnly || post.verified)
    )
    // For "Saved" tab, show only saved posts
    .filter(post => feedTab !== 1 || post.saved);

  const getPlatformColor = (platform: string): string => {
    switch(platform) {
      case 'twitter': return '#1DA1F2';
      case 'facebook': return '#4267B2';
      case 'instagram': return '#C13584';
      default: return '#757575';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case 'twitter': return <Twitter />;
      case 'facebook': return <Facebook />;
      default: return <Public />;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const toggleSaved = (id: number) => {
    // In a real app, this would update the state or backend
    console.log(`Toggle saved state for post ${id}`);
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Social Media Monitoring
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Track and analyze social media posts related to the disaster for real-time updates
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Search for keywords or locations..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={showVerifiedOnly} 
                onChange={handleVerifiedToggle} 
                color="primary" 
              />
            }
            label="Verified sources only"
          />
        </Box>
        
        <Tabs 
          value={feedTab} 
          onChange={handleFeedTabChange} 
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Posts" />
          <Tab label="Saved Posts" />
          <Tab label="High Relevance" />
        </Tabs>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          Monitoring 14 keywords across 5 social platforms. Last updated 2 minutes ago.
        </Alert>
      </Paper>
      
      {filteredPosts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No matching posts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters to see more results
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredPosts.map((post) => (
            <Card key={post.id} sx={{ mb: 2 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: getPlatformColor(post.platform) }}>
                    {getPlatformIcon(post.platform)}
                  </Avatar>
                }
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{post.username}</Typography>
                    {post.verified && (
                      <VerifiedUser 
                        fontSize="small" 
                        color="primary"
                        titleAccess="Verified Account"
                      />
                    )}
                  </Box>
                }
                subheader={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {post.userHandle} · {formatDate(post.timestamp)}
                    </Typography>
                  </Box>
                }
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={`Relevance: ${Math.round(post.relevanceScore * 100)}%`}
                      size="small"
                      color={post.relevanceScore > 0.8 ? "success" : "default"}
                      sx={{ mr: 1 }}
                    />
                    <IconButton 
                      onClick={() => toggleSaved(post.id)} 
                      color={post.saved ? "primary" : "default"}
                    >
                      <Save />
                    </IconButton>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>
                {post.locationMention && (
                  <Chip
                    icon={<LocationOn />}
                    label={post.locationMention}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                )}
                {post.hasMedia && (
                  <Box 
                    sx={{ 
                      height: 120, 
                      bgcolor: 'action.hover', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Media content available (displayed in actual implementation)
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Button size="small" startIcon={<ThumbUp />}>Like</Button>
                  <Button size="small" startIcon={<Comment />}>Comment</Button>
                  <Button size="small" startIcon={<Share />}>Share</Button>
                </Box>
                <Button 
                  size="small" 
                  variant="contained" 
                  color="primary"
                >
                  Add to Updates
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}