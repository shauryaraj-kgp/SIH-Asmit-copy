import axios from 'axios';

// Use both backend URLs
const API_BASE_URL = 'http://localhost:8000/api';
const BRAVO_API_URL = 'http://localhost:8080';

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
      const response = await axios.get(`${BRAVO_API_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking backend health:', error);
      return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};

export default reportService;