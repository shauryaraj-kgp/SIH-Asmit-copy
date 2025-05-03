import axios from 'axios';

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
  }
};

export default reportService;