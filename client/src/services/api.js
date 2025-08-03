import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for video processing
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const videoAPI = {
  // Process a YouTube video
  processVideo: async (youtubeUrl) => {
    const response = await api.post('/videos/process', { youtubeUrl });
    return response.data;
  },

  // Get all videos
  getVideos: async () => {
    const response = await api.get('/videos');
    return response.data;
  },

  // Get a specific video
  getVideo: async (videoId) => {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },

  // Delete a video
  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  }
};

export const analysisAPI = {
  // Generate educational paragraph
  generateParagraph: async (videoId) => {
    const response = await api.post(`/analysis/generate-paragraph/${videoId}`);
    return response.data;
  },

  // Extract images from video
  extractImages: async (videoId, count = 8) => {
    const response = await api.post(`/analysis/extract-images/${videoId}`, { count });
    return response.data;
  },

  // Get full analysis (paragraph + images)
  getFullAnalysis: async (videoId, imageCount = 8) => {
    const response = await api.post(`/analysis/full-analysis/${videoId}`, { imageCount });
    return response.data;
  },

  // Get image by reference number
  getImageByReference: async (videoId, referenceNumber) => {
    const response = await api.get(`/analysis/image/${videoId}/${referenceNumber}`);
    return response.data;
  }
};

export default api;