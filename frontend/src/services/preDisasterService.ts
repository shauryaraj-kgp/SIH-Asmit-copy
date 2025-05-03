import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

interface JobStatus {
  status: string;
  progress: number;
  result: any;
  error?: string;
}

interface LocationDataRequest {
  location: string;
  structures?: string[];
}

// Define structure type mapping for UI categories
const structureTypeMap: { [key: string]: string } = {
  'hospital': 'hospital',
  'school': 'school',
  'shelter': 'shelter',
  'fire_station': 'infrastructure',
  'police': 'infrastructure',
  'water': 'waterSource',
  'power': 'infrastructure'
};

export const preDisasterService = {
  // Collect pre-disaster data for a location
  collectLocationData: async (request: LocationDataRequest) => {
    const response = await axios.post(`${API_BASE_URL}/pre-disaster/collect`, request);
    return response.data;
  },
  
  // Check job status
  getJobStatus: async (jobId: string): Promise<JobStatus> => {
    const response = await axios.get(`${API_BASE_URL}/job/${jobId}`);
    return response.data;
  },
  
  // Utility function to convert OSM data to PreDisasterLocation format
  convertOSMToLocationData: (osmData: any) => {
    if (!osmData || !osmData.poi_data) {
      return [];
    }
    
    const locations: any[] = [];
    
    // Process each structure type
    Object.entries(osmData.poi_data).forEach(([structureType, pois]) => {
      // Skip if pois is not an array or is empty
      if (!Array.isArray(pois) || pois.length === 0) {
        return;
      }
      
      // Cast pois to array and process each POI
      (pois as any[]).forEach(poi => {
        // Skip invalid entries that don't have required coordinates
        if (typeof poi.latitude !== 'number' || typeof poi.longitude !== 'number') {
          return;
        }
      
        // Map OSM structure type to our UI categories if possible
        const mappedType = structureTypeMap[structureType] || structureType;
        
        // Create a standardized location object
        locations.push({
          id: poi.id || `${structureType}_${Math.random().toString(36).substr(2, 9)}`,
          name: poi.name || `Unnamed ${structureType.charAt(0).toUpperCase() + structureType.slice(1)}`,
          type: mappedType,
          latitude: poi.latitude,
          longitude: poi.longitude,
          details: poi.details || 'No details available',
          status: 'active',
          lastUpdated: poi.lastUpdated || new Date().toISOString()
        });
      });
    });
    
    return locations;
  },
  
  // Calculate progress stats by structure type
  calculateStructureProgress: (status: string, progress: number) => {
    // Base progress value
    const baseProgress = Math.max(0, Math.min(100, progress));
    
    // Different states have different progress distributions
    if (status === "completed") {
      return {
        hospitals: 100,
        schools: 100,
        infrastructure: 100,
        shelters: 100,
        waterSources: 100
      };
    } else if (status === "collecting_boundary") {
      return {
        hospitals: 100,
        schools: 100,
        infrastructure: 100,
        shelters: 100,
        waterSources: 100
      };
    } else if (status === "collecting_poi") {
      // Calculate proportional progress for each category
      const categoryProgress = Math.min(100, baseProgress * 1.5); // Scale up a bit for UI
      
      return {
        hospitals: categoryProgress,
        schools: categoryProgress,
        infrastructure: categoryProgress,
        shelters: categoryProgress,
        waterSources: categoryProgress
      };
    }
    
    // Default progress (initial state)
    return {
      hospitals: baseProgress,
      schools: baseProgress,
      infrastructure: baseProgress,
      shelters: baseProgress,
      waterSources: baseProgress
    };
  }
};