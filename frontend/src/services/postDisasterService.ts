import axios from 'axios';

// API endpoints for different services
const RAG_API_URL = 'http://localhost:8000'; // RAG.py service
const BRAVO_API_URL = 'http://localhost:8080'; // bravo-backend.py service
const SOCIAL_API_URL = 'http://localhost:8081'; // social_agent_api.py service

// Interfaces
export interface DisasterEvent {
  event_name: string;
  start_date: string;
  end_date: string;
  query?: string;
  max_results?: number;
}

export interface DisasterReport {
  report: string;
  sources: string[];
  event_name: string;
  start_date: string;
  end_date: string;
}

export interface UserInput {
  content: string;
  user_id?: string;
  context?: string;
}

export interface SocialPost {
  content: string;
  platform: string;
  username?: string;
  tags?: string[];
}

export interface NewsItem {
  title: string;
  content: string;
  source?: string;
  url?: string;
}

export interface PostDisasterUpdate {
  id?: number;
  locationName: string;
  type: string;
  status: 'operational' | 'damaged' | 'destroyed' | 'unknown';
  latitude: number;
  longitude: number;
  details: string;
  reportedBy: string;
  reportedAt: string;
  source: 'field' | 'social' | 'news' | 'official';
  hasImage: boolean;
  verified: boolean;
}

// Post-Disaster Service
export const postDisasterService = {
  // RAG Database Integration
  
  // Add user input to RAG
  addUserInput: async (input: UserInput) => {
    try {
      const response = await axios.post(`${RAG_API_URL}/add/user`, input);
      return response.data;
    } catch (error) {
      console.error('Error adding user input to RAG:', error);
      throw error;
    }
  },
  
  // Add news item to RAG
  addNewsItem: async (item: NewsItem) => {
    try {
      const response = await axios.post(`${RAG_API_URL}/add/news`, item);
      return response.data;
    } catch (error) {
      console.error('Error adding news item to RAG:', error);
      throw error;
    }
  },
  
  // Add social post to RAG
  addSocialPost: async (post: SocialPost) => {
    try {
      const response = await axios.post(`${RAG_API_URL}/add/social`, post);
      return response.data;
    } catch (error) {
      console.error('Error adding social post to RAG:', error);
      throw error;
    }
  },
  
  // Query RAG database
  queryRAG: async (query: string, collections: string[] = ['news', 'socials', 'user_inputs'], limit: number = 5) => {
    try {
      const response = await axios.post(`${RAG_API_URL}/query`, {
        query,
        collections,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Error querying RAG:', error);
      throw error;
    }
  },
  
  // Bravo Backend Integration
  
  // Generate report from RAG database
  generateReport: async (event: DisasterEvent): Promise<DisasterReport> => {
    try {
      const response = await axios.post(`${BRAVO_API_URL}/compile_report_from_rag`, event);
      return response.data;
    } catch (error) {
      console.error('Error generating report from RAG:', error);
      throw error;
    }
  },
  
  // Process a specific URL for information
  processUrl: async (url: string) => {
    try {
      const response = await axios.post(`${BRAVO_API_URL}/process_url?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      console.error('Error processing URL:', error);
      throw error;
    }
  },
  
  // Check RAG and Bravo API health
  checkServicesHealth: async () => {
    try {
      const ragHealth = await axios.get(`${RAG_API_URL}/health`);
      const bravoHealth = await axios.get(`${BRAVO_API_URL}/health`);
      
      return {
        rag: ragHealth.data,
        bravo: bravoHealth.data,
        allHealthy: ragHealth.status === 200 && bravoHealth.status === 200
      };
    } catch (error) {
      console.error('Error checking services health:', error);
      return {
        rag: { status: 'error' },
        bravo: { status: 'error' },
        allHealthy: false,
        error: error
      };
    }
  },
  
  // Social Media Integration
  
  // Fetch social media data for an event
  fetchSocialData: async (event: DisasterEvent) => {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/fetch_social_data`, event);
      return response.data;
    } catch (error) {
      console.error('Error fetching social data:', error);
      throw error;
    }
  },
  
  // Generate social media report
  generateSocialReport: async (event: DisasterEvent): Promise<DisasterReport> => {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/social_report`, event);
      return response.data;
    } catch (error) {
      console.error('Error generating social report:', error);
      throw error;
    }
  },
  
  // Generate combined report (news + social)
  generateCombinedReport: async (event: DisasterEvent): Promise<DisasterReport> => {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/combined_report`, event);
      return response.data;
    } catch (error) {
      console.error('Error generating combined report:', error);
      throw error;
    }
  },
  
  // Store a post-disaster update in RAG
  storePostDisasterUpdate: async (update: PostDisasterUpdate) => {
    try {
      // Format the update as user input for RAG
      const userInput: UserInput = {
        content: `Location: ${update.locationName} (${update.latitude}, ${update.longitude})
Type: ${update.type}
Status: ${update.status}
Details: ${update.details}
Reported by: ${update.reportedBy}
Source: ${update.source}
Verified: ${update.verified ? 'Yes' : 'No'}`,
        context: `post_disaster_update_${update.type}_${update.status}`
      };
      
      // Store in RAG database
      const response = await postDisasterService.addUserInput(userInput);
      
      return {
        success: true,
        id: response.id,
        update
      };
    } catch (error) {
      console.error('Error storing post-disaster update:', error);
      throw error;
    }
  }
};