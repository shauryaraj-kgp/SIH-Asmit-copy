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
import { postDisasterService, DisasterEvent } from '../../services/postDisasterService';

// Backend social media post interface 
interface SocialPostBackend {
  content: string;
  metadata: {
    platform: string;
    username?: string;
    tags?: string[] | string;
    timestamp?: string;
    relevance_score?: number;
  };
}

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
  
  // New state for managing posts from backend
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch social media data when component mounts
    fetchSocialMediaData();
  }, []);
  
  const fetchSocialMediaData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Define a disaster event to query for - using a sample event
      const event: DisasterEvent = {
        event_name: "Sample Disaster", // Can be made dynamic based on user selection
        start_date: "2025-04-28", // One month before current date
        end_date: "2025-05-02", // Current date
        max_results: 20
      };
      
      // First, try to fetch social media data
      let socialData;
      try {
        // This triggers data collection and storage in RAG
        await postDisasterService.fetchSocialData(event);
        
        // Now query the RAG database for the stored social posts
        socialData = await postDisasterService.queryRAG(
          event.event_name, 
          ["socials"],
          30
        );
      } catch (error) {
        console.error("Error fetching social data:", error);
        throw new Error("Failed to fetch social media data");
      }
      
      // Transform backend data format to frontend format
      const transformedPosts: SocialPost[] = [];
      let idCounter = 1;
      
      if (socialData && socialData.results) {
        for (const item of socialData.results) {
          // Extract location mentions by looking for common location terms
          const locationMention = extractLocationMention(item.content);
          
          // Parse tags
          let tags: string[] = [];
          if (item.metadata.tags) {
            try {
              // Tags might be stored as a JSON string or as an array
              if (typeof item.metadata.tags === 'string') {
                if (item.metadata.tags.startsWith('[')) {
                  tags = JSON.parse(item.metadata.tags);
                } else {
                  tags = item.metadata.tags.split(',').map((tag: string) => tag.trim());
                }
              } else if (Array.isArray(item.metadata.tags)) {
                tags = item.metadata.tags;
              }
            } catch (e) {
              console.warn("Error parsing tags:", e);
            }
          }
          
          // Detect media by looking for URLs or media keywords
          const hasMedia = item.content.includes('http') || 
                          item.content.includes('photo') || 
                          item.content.includes('image') ||
                          item.content.includes('video');
          
          transformedPosts.push({
            id: idCounter++,
            platform: (item.metadata.platform?.toLowerCase() || 'twitter') as 'twitter' | 'facebook' | 'instagram' | string,
            username: item.metadata.username || "Unknown User",
            userHandle: `@${item.metadata.username?.toLowerCase().replace(/\s+/g, '_') || "user"}`,
            content: item.content,
            timestamp: item.metadata.timestamp || new Date().toISOString(),
            relevanceScore: item.metadata.relevance_score || Math.random() * 0.5 + 0.5, // Random score between 0.5 and 1.0
            locationMention,
            hasMedia,
            verified: Math.random() > 0.7, // Randomly assign verification status (70% unverified)
            saved: false,
            tags
          });
        }
      }
      
      // If we got data from the backend, use it; otherwise use sample data
      if (transformedPosts.length > 0) {
        setPosts(transformedPosts);
      } else {
        console.log("No social media data found, using sample data");
        setPosts(SAMPLE_POSTS);
      }
      
      setLastRefreshed(new Date());
      
    } catch (fetchError) {
      console.error("Error in fetchSocialMediaData:", fetchError);
      setError("Failed to load social media data. Using sample data instead.");
      setPosts(SAMPLE_POSTS);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to extract location mentions from post content
  const extractLocationMention = (content: string): string | undefined => {
    // Common location indicators
    const locationPatterns = [
      /at\s+([A-Z][a-z]+ (?:Road|Street|Avenue|Lane|Bridge|Hospital|School|Park|Center|Building|Plaza))/i,
      /in\s+([A-Z][a-z]+ (?:Park|Square|Mall|Center|Hospital|School))/i,
      /near\s+([A-Z][a-z]+ (?:Road|Street|Avenue|Lane|Bridge|Hospital|School|Park|Center|Building|Plaza))/i,
      /(\w+ (?:Bridge|Hospital|School|Airport|Station|Center))/i,
    ];
    
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return undefined;
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
            ' Fetching data...'}
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