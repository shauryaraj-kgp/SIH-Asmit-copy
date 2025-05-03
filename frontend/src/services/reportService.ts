import axios from 'axios';

// Use all three backend service URLs - each handles different aspects of reporting
const RAG_API_URL = 'http://localhost:8000'; // RAG.py service
const BRAVO_API_URL = 'http://localhost:8080'; // bravo-backend.py service
const SOCIAL_API_URL = 'http://localhost:8081'; // social_agent_api.py service

// Legacy API URL (kept for backward compatibility)
const API_BASE_URL = 'http://localhost:8000/api';

interface JobStatus {
  status: 'discovering' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: string;
  error?: string;
}

interface Report {
  id: string;
  title: string;
  date: string;
  type: 'job' | 'file';
}

export interface DisasterQuery {
  event_name: string;
  start_date: string;
  end_date: string;
}

export interface PostDisasterEntry {
  title: string;
  content: string;
  source?: string;
  url?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  status?: string;
  verified?: boolean;
}

export interface ReportResponse {
  report: string;
  sources: string[];
  event_name: string;
  start_date: string;
  end_date: string;
}

// Define the NewsItem interface for the RAG database
interface NewsItem {
  title: string;
  content: string;
  source?: string;
  url?: string;
}

export const reportService = {
  // Discover disaster data
  discoverDisasterData: async (query: string) => {
    const response = await axios.post(`${API_BASE_URL}/discover`, { query });
    return response.data;
  },
  
  // Generate a report
  generateReport: async (params: { discovery_file?: string, query?: string }) => {
    const response = await axios.post(`${API_BASE_URL}/generate-report`, params);
    return response.data;
  },
  
  // Check job status
  getJobStatus: async (jobId: string): Promise<JobStatus> => {
    const response = await axios.get(`${API_BASE_URL}/job/${jobId}`);
    return response.data;
  },
  
  // Get list of recent reports
  getRecentReports: async (): Promise<Report[]> => {
    const response = await axios.get(`${API_BASE_URL}/reports`);
    return response.data;
  },
  
  // Get a specific report
  getReport: async (reportId: string) => {
    const response = await axios.get(`${API_BASE_URL}/report/${reportId}`);
    return response.data;
  },
  
  // NEW FUNCTIONS FOR POST-DISASTER MANUAL ENTRIES
  
  // Submit a manual post-disaster entry to the RAG database
  submitPostDisasterEntry: async (entry: PostDisasterEntry): Promise<{ id: string; status: string }> => {
    try {
      // Format the entry as a NewsItem for the RAG database
      const newsItem: NewsItem = {
        title: entry.title,
        content: entry.content,
        source: entry.source || 'manual_entry',
        url: entry.url || `manual://${Date.now()}`
      };
      
      // Store in RAG database using the RAG.py endpoint
      const response = await axios.post(`${BRAVO_API_URL}/add/news`, newsItem);
      return response.data;
    } catch (error) {
      console.error('Error submitting post-disaster entry:', error);
      throw error;
    }
  },
  
  // Get shared feed from RAG database (Kerala floods)
  getSharedFeed: async (): Promise<any[]> => {
    try {
      // Query RAG database for Kerala floods
      const query = {
        query: "Kerala floods disaster information",
        collections: ["news"],
        limit: 15
      };
      
      const response = await axios.post(`${BRAVO_API_URL}/query`, query);
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching shared feed:', error);
      return [];
    }
  },
  
  // Generate a report from RAG database
  generateReportFromRAG: async (query: DisasterQuery): Promise<ReportResponse> => {
    try {
      const response = await axios.post(`${BRAVO_API_URL}/compile_report_from_rag`, query);
      return response.data;
    } catch (error) {
      console.error('Error generating report from RAG:', error);
      throw error;
    }
  },
  
  // Process a specific URL and save to RAG
  processURL: async (url: string): Promise<any> => {
    try {
      const response = await axios.post(`${BRAVO_API_URL}/process_url?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      console.error('Error processing URL:', error);
      throw error;
    }
  },
  
  // Check health of backends
  checkHealth: async (): Promise<any> => {
    try {
      // Try to check all services
      const services = {
        rag: { available: false, status: null },
        bravo: { available: false, status: null },
        social: { available: false, status: null }
      };
      
      // Use Promise.allSettled to check all services without failing if one is down
      const results = await Promise.allSettled([
        axios.get(`${RAG_API_URL}/health`),
        axios.get(`${BRAVO_API_URL}/health`),
        axios.get(`${SOCIAL_API_URL}/health`)
      ]);
      
      // Process RAG service result
      if (results[0].status === 'fulfilled') {
        services.rag.available = true;
        services.rag.status = results[0].value.data;
      }
      
      // Process BRAVO service result
      if (results[1].status === 'fulfilled') {
        services.bravo.available = true;
        services.bravo.status = results[1].value.data;
      }
      
      // Process Social service result
      if (results[2].status === 'fulfilled') {
        services.social.available = true;
        services.social.status = results[2].value.data;
      }
      
      // Determine overall health
      const allServicesUp = services.rag.available && services.bravo.available && services.social.available;
      const someServicesUp = services.rag.available || services.bravo.available || services.social.available;
      
      return {
        status: allServicesUp ? 'healthy' : (someServicesUp ? 'degraded' : 'down'),
        services,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking backend health:', error);
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  },
  
  // Retry mechanism for failed API calls
  withRetry: async <T>(apiCall: () => Promise<T>, retries: number = 2): Promise<T> => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        console.warn(`API call failed (attempt ${attempt + 1}/${retries + 1}):`, error);
        lastError = error;
        
        if (attempt < retries) {
          // Wait for an increasing amount of time before retrying
          const delayMs = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    throw lastError;
  },
  
  // Generate a social media-focused report
  generateSocialReport: async (query: DisasterQuery): Promise<ReportResponse> => {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/social_report`, query);
      return response.data;
    } catch (error) {
      console.error('Error generating social report:', error);
      throw error;
    }
  },
  
  // Generate a combined report from social media and news sources
  generateCombinedReport: async (query: DisasterQuery): Promise<ReportResponse> => {
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/combined_report`, query);
      return response.data;
    } catch (error) {
      console.error('Error generating combined report:', error);
      
      // Fallback to regular report from RAG if social media report fails
      console.log('Falling back to RAG-based report');
      return reportService.generateReportFromRAG(query);
    }
  }
};

export default reportService;