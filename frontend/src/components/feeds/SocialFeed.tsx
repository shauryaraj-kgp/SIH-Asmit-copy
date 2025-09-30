import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, InputAdornment, 
  Button, Card, CardContent, CardHeader, Avatar,
  Chip, IconButton, Divider, Alert, CardActions,
  Tabs, Tab, Switch, FormControlLabel, CircularProgress
} from '@mui/material';
import {
  Twitter, Facebook, VerifiedUser, Search, Save,
  LocationOn, Public, ThumbUp, Comment, Share, Refresh
} from '@mui/icons-material';
import { postDisasterService } from '../../services/postDisasterService';

// Frontend social media post interface for display
interface SocialPost {
  id: number;
  platform: 'twitter' | 'facebook' | 'instagram' | string;
  username: string;
  userHandle: string;
  content: string;
  timestamp: string;
  relevanceScore: number;
  locationMention?: string;
  hasMedia: boolean;
  verified: boolean;
  saved: boolean;
  tags?: string[];
}

// Sample data as fallback
const SAMPLE_POSTS: SocialPost[] = [
  {
    id: 1,
    platform: 'twitter',
    username: 'Mumbai Mirror',
    userHandle: '@mumbaimirror',
    content: 'BREAKING: Gateway of India area severely affected by coastal flooding. Colaba Causeway underwater. Avoid Marine Drive and Gateway area. #MumbaiFloods #Colaba',
    timestamp: '2025-05-01T12:15:00Z',
    relevanceScore: 0.92,
    locationMention: 'Gateway of India',
    hasMedia: true,
    verified: true,
    saved: true
  },
  {
    id: 2,
    platform: 'twitter',
    username: 'Priya Sharma',
    userHandle: '@priya_mumbai',
    content: 'Just evacuated from Colaba Market area. Water level rising rapidly near Sassoon Dock. Navy personnel helping with rescue operations. #ColabaFloods #Mumbai',
    timestamp: '2025-05-01T12:35:00Z',
    relevanceScore: 0.85,
    locationMention: 'Colaba Market',
    hasMedia: true,
    verified: false,
    saved: false
  },
  {
    id: 3,
    platform: 'facebook',
    username: 'Mumbai Police',
    userHandle: 'MumbaiPoliceOfficial',
    content: 'URGENT: Gateway Relief Shelter at Colaba is operational. 500+ people evacuated from Colaba, Navy Nagar areas. Food and medical aid available. Contact 100 for emergency. #MumbaiPolice #Colaba',
    timestamp: '2025-05-01T14:05:00Z',
    relevanceScore: 0.94,
    locationMention: 'Gateway Relief Shelter',
    hasMedia: false,
    verified: true,
    saved: true
  },
  {
    id: 4,
    platform: 'twitter',
    username: 'Rajesh Kumar',
    userHandle: '@rajesh_colaba',
    content: 'Water supply disrupted in Colaba area. BMC tankers deployed near Colaba Bus Depot. Avoid drinking tap water until further notice. #ColabaWaterCrisis #Mumbai',
    timestamp: '2025-05-01T15:22:00Z',
    relevanceScore: 0.78,
    locationMention: 'Colaba Bus Depot',
    hasMedia: false,
    verified: false,
    saved: false
  },
  {
    id: 5,
    platform: 'facebook',
    username: 'Colaba General Hospital',
    userHandle: 'ColabaGeneralHospital',
    content: 'Colaba General Hospital emergency services running 24/7. East wing damaged but ER operational. Ambulance services available. Contact 022-2287-1234 for emergencies. #ColabaHospital #Mumbai',
    timestamp: '2025-05-01T13:10:00Z',
    relevanceScore: 0.96,
    locationMention: 'Colaba General Hospital',
    hasMedia: true,
    verified: true,
    saved: true
  },
  {
    id: 6,
    platform: 'twitter',
    username: 'Mumbai Watch',
    userHandle: '@mumbai_watch',
    content: 'CONFIRMED HOTSPOT: Colaba General Hospital area. High footfall due to medical emergencies. Traffic diverted via Colaba Causeway. #ColabaHotspot #MumbaiFloods #verified',
    timestamp: '2025-05-02T09:05:00Z',
    relevanceScore: 0.91,
    locationMention: 'Colaba General Hospital',
    hasMedia: false,
    verified: true,
    saved: true
  },
  {
    id: 7,
    platform: 'twitter',
    username: 'Navy Nagar Residents',
    userHandle: '@navynagar_mumbai',
    content: 'HOTSPOT VERIFIED: Navy Nagar Public School serving as relief center. 200+ families from Colaba area taking shelter. Navy personnel coordinating relief. #NavyNagar #ColabaRelief #verified',
    timestamp: '2025-05-02T09:20:00Z',
    relevanceScore: 0.89,
    locationMention: 'Navy Nagar Public School',
    hasMedia: true,
    verified: true,
    saved: false
  },
  {
    id: 8,
    platform: 'twitter',
    username: 'Mumbai Port Trust',
    userHandle: '@mumbai_port',
    content: 'Sassoon Dock Jetty declared HOTSPOT. Fishing boats damaged, dock operations suspended. Relief boats deployed from Mumbai Port. #SassoonDock #ColabaPort #verified',
    timestamp: '2025-05-02T09:32:00Z',
    relevanceScore: 0.9,
    locationMention: 'Sassoon Dock Jetty',
    hasMedia: true,
    verified: true,
    saved: true
  },
  {
    id: 9,
    platform: 'twitter',
    username: 'Mumbai Traffic Police',
    userHandle: '@mumtraffic',
    content: 'Colaba Jetty Bridge HOTSPOT: Bridge partially damaged, traffic restricted. Use alternative routes via Colaba Causeway or Marine Drive. #ColabaTraffic #MumbaiFloods #verified',
    timestamp: '2025-05-02T09:40:00Z',
    relevanceScore: 0.84,
    locationMention: 'Colaba Jetty Bridge',
    hasMedia: false,
    verified: true,
    saved: false
  },
  {
    id: 10,
    platform: 'twitter',
    username: 'BMC Colaba',
    userHandle: '@bmc_colaba',
    content: 'Gateway Relief Shelter HOTSPOT: 300+ evacuees from Colaba, Navy Nagar, and Fort areas. Medical camp operational. Food distribution ongoing. #GatewayShelter #ColabaRelief #verified',
    timestamp: '2025-05-02T09:55:00Z',
    relevanceScore: 0.93,
    locationMention: 'Gateway Relief Shelter',
    hasMedia: false,
    verified: true,
    saved: true
  },
  {
    id: 11,
    platform: 'twitter',
    username: 'MSEB Colaba',
    userHandle: '@mseb_colaba',
    content: 'Colaba Substation HOTSPOT: Power restoration in progress. 50% of Colaba area still without electricity. Generator backup at hospitals. #ColabaPower #MumbaiElectricity #verified',
    timestamp: '2025-05-02T10:05:00Z',
    relevanceScore: 0.87,
    locationMention: 'Colaba Substation',
    hasMedia: false,
    verified: true,
    saved: false
  },
  {
    id: 12,
    platform: 'facebook',
    username: 'Colaba Residents Association',
    userHandle: 'ColabaResidents',
    content: 'UPDATE: Colaba Causeway partially cleared. Local shops in Colaba Market reopening. Water level receding near Gateway of India. Community kitchen operational at Colaba Social Hall. #ColabaRecovery #Mumbai',
    timestamp: '2025-05-02T10:30:00Z',
    relevanceScore: 0.88,
    locationMention: 'Colaba Causeway',
    hasMedia: true,
    verified: true,
    saved: true
  },
  {
    id: 13,
    platform: 'twitter',
    username: 'Mumbai Fire Brigade',
    userHandle: '@mumbaifire',
    content: 'Fire rescue operations at Colaba Fort area. 15 families evacuated from waterlogged buildings. Fire station at Colaba responding to calls. #ColabaFireRescue #MumbaiFire',
    timestamp: '2025-05-02T11:15:00Z',
    relevanceScore: 0.82,
    locationMention: 'Colaba Fort',
    hasMedia: true,
    verified: true,
    saved: false
  },
  {
    id: 14,
    platform: 'twitter',
    username: 'Indian Navy',
    userHandle: '@indiannavy',
    content: 'Navy personnel deployed for rescue operations in Colaba and Navy Nagar areas. Naval helicopters conducting aerial survey. INS Mumbai coordinating relief efforts. #IndianNavy #ColabaRescue',
    timestamp: '2025-05-02T11:45:00Z',
    relevanceScore: 0.95,
    locationMention: 'Navy Nagar',
    hasMedia: true,
    verified: true,
    saved: true
  },
  {
    id: 15,
    platform: 'facebook',
    username: 'Colaba Social Workers',
    userHandle: 'ColabaSocialWorkers',
    content: 'Community relief center at Colaba Social Hall serving 500+ people. Hot meals, medical aid, and temporary shelter available. Volunteers from Colaba community actively helping. #ColabaCommunity #MumbaiRelief',
    timestamp: '2025-05-02T12:00:00Z',
    relevanceScore: 0.86,
    locationMention: 'Colaba Social Hall',
    hasMedia: false,
    verified: true,
    saved: true
  }
];

export default function SocialFeed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedTab, setFeedTab] = useState(0);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  
  // Use sample posts directly
  const [posts, setPosts] = useState<SocialPost[]>(SAMPLE_POSTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(new Date());

  useEffect(() => {
    // Set sample posts immediately
    setPosts(SAMPLE_POSTS);
    setLastRefreshed(new Date());
  }, []);
  
  const fetchSocialMediaData = async () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate a brief loading state
    setTimeout(() => {
      setPosts(SAMPLE_POSTS);
      setLastRefreshed(new Date());
      setIsLoading(false);
    }, 500);
  };
  
  
  const handleFeedTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setFeedTab(newValue);
  };

  const handleVerifiedToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowVerifiedOnly(event.target.checked);
  };

  const handleRefresh = () => {
    fetchSocialMediaData();
  };

  // Filter posts based on search and verification status
  const filteredPosts = posts
    .filter(post => 
      (searchTerm === '' || 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.locationMention?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!showVerifiedOnly || post.verified)
    )
    // For "Saved" tab, show only saved posts
    .filter(post => feedTab !== 1 || post.saved)
    // For "High Relevance" tab, show only posts with relevance score > 0.7
    .filter(post => feedTab !== 2 || post.relevanceScore > 0.7);

  const getPlatformColor = (platform: string): string => {
    switch(platform.toLowerCase()) {
      case 'twitter': return '#1DA1F2';
      case 'facebook': return '#4267B2';
      case 'instagram': return '#C13584';
      default: return '#757575';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'twitter': return <Twitter />;
      case 'facebook': return <Facebook />;
      default: return <Public />;
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return "Unknown date";
    }
  };

  const toggleSaved = (id: number) => {
    // Update local state
    setPosts(posts.map(post => 
      post.id === id ? { ...post, saved: !post.saved } : post
    ));
  };

  // Create post-disaster update from social media post
  const createUpdateFromPost = (post: SocialPost) => {
    // Convert social media post to post-disaster update format and store in RAG
    if (post.locationMention) {
      const update = {
        locationName: post.locationMention,
        type: 'infrastructure', // Default type
        status: 'unknown' as 'unknown', // Default status
        latitude: 0, // We don't have coordinates
        longitude: 0, // We don't have coordinates
        details: post.content,
        reportedBy: post.username,
        reportedAt: post.timestamp,
        source: 'social' as 'social',
        hasImage: post.hasMedia,
        verified: post.verified
      };
      
      // Store the update
      postDisasterService.storePostDisasterUpdate(update)
        .then(() => {
          console.log("Created post-disaster update from social post:", post.id);
          alert("Update added to the Shared Feed");
        })
        .catch(error => {
          console.error("Failed to create update from social post:", error);
          alert("Failed to add update to Shared Feed");
        });
    } else {
      alert("Cannot create update: No location information in this post");
    }
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
          
          <Button
            variant="outlined"
            startIcon={isLoading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            size="small"
          >
            Refresh
          </Button>
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
          Monitoring social media for disaster updates. 
          {lastRefreshed ? 
            ` Last updated ${new Date(lastRefreshed).toLocaleTimeString()}` : 
            ' Ready'}
        </Alert>
      </Paper>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : filteredPosts.length === 0 ? (
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
                {post.tags && post.tags.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {post.tags.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={`#${tag}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                )}
                {post.hasMedia && (
                  <Box 
                    sx={{ 
                      height: 120, 
                      bgcolor: 'action.hover', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 1
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
                  onClick={() => createUpdateFromPost(post)}
                  disabled={!post.locationMention}
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