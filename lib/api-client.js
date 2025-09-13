// lib/api-client.js
import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development') {
      const endTime = new Date();
      const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Handle unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
          break;
        case 403:
          // Handle forbidden
          console.error('Access forbidden:', data?.message);
          break;
        case 404:
          // Handle not found
          console.error('Resource not found:', error.config?.url);
          break;
        case 422:
          // Handle validation errors
          console.error('Validation error:', data?.errors || data?.message);
          break;
        case 500:
          // Handle server errors
          console.error('Server error:', data?.message);
          break;
        default:
          console.error(`API Error ${status}:`, data?.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  
  // User endpoints
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  
  // Onboarding
  SUBMIT_ONBOARDING: '/onboarding/submit',
  
  // Dashboard
  TODAY_PLAN: '/dashboard/today',
  USER_STATS: '/dashboard/stats',
  
  // Rituals
  RITUALS: '/rituals',
  RITUAL_DETAILS: (id) => `/rituals/${id}`,
  COMPLETE_RITUAL: (id) => `/rituals/${id}/complete`,
  START_RITUAL: (id) => `/rituals/${id}/start`,
  
  // Progress
  PROGRESS: '/progress',
  PROGRESS_HISTORY: (timeRange) => `/progress/history?range=${timeRange}`,
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
};

// Utility function for handling API errors
export const handleApiError = (error, showNotification) => {
  let message = 'Something went wrong. Please try again.';
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message === 'Network Error') {
    message = 'Network error. Please check your connection.';
  } else if (error.code === 'ECONNABORTED') {
    message = 'Request timeout. Please try again.';
  }
  
  if (showNotification) {
    showNotification(message, 'error');
  }
  
  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
};

// Enhanced API client with better error handling and retry logic
export const apiClient = {
  // Auth methods
  auth: {
    login: async (credentials) => {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, credentials);
      
      // Store token if login successful
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      return response;
    },
    
    logout: async () => {
      try {
        await axiosInstance.post(API_ENDPOINTS.LOGOUT);
      } finally {
        // Always clear token, even if logout request fails
        localStorage.removeItem('auth_token');
      }
    },
    
    register: (userData) => axiosInstance.post(API_ENDPOINTS.REGISTER, userData),
    
    refreshToken: async () => {
      const response = await axiosInstance.post(API_ENDPOINTS.REFRESH_TOKEN);
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response;
    }
  },
  
  // User methods
  user: {
    getProfile: () => axiosInstance.get(API_ENDPOINTS.USER_PROFILE),
    updateProfile: (data) => axiosInstance.put(API_ENDPOINTS.UPDATE_PROFILE, data)
  },
  
  // Onboarding
  onboarding: {
    submit: (data) => axiosInstance.post(API_ENDPOINTS.SUBMIT_ONBOARDING, data)
  },
  
  // Dashboard methods
  dashboard: {
    getTodayPlan: async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.TODAY_PLAN);
        return response;
      } catch (error) {
        // Return mock data in development if API fails
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock data for dashboard');
          return {
            data: {
              vitalityScore: 78,
              streak: 7,
              rituals: [
                {
                  id: 1,
                  name: 'Morning Mindfulness',
                  type: 'meditation',
                  duration: 600,
                  completed: false,
                  difficulty: 'beginner',
                  description: 'Start your day with focused breathing and gentle awareness.',
                  benefits: ['Stress Relief', 'Focus'],
                  estimatedImpact: 12
                },
                {
                  id: 2,
                  name: 'Focus Flow',
                  type: 'focus',
                  duration: 900,
                  completed: true,
                  difficulty: 'intermediate',
                  description: 'Deep work preparation with concentration techniques.',
                  benefits: ['Productivity', 'Mental Clarity'],
                  estimatedImpact: 18
                }
              ]
            }
          };
        }
        throw error;
      }
    },
    
    getStats: () => axiosInstance.get(API_ENDPOINTS.USER_STATS)
  },
  
  // Ritual methods
  rituals: {
    getAll: () => axiosInstance.get(API_ENDPOINTS.RITUALS),
    getById: (id) => axiosInstance.get(API_ENDPOINTS.RITUAL_DETAILS(id)),
    complete: (id) => axiosInstance.post(API_ENDPOINTS.COMPLETE_RITUAL(id)),
    start: (id) => axiosInstance.post(API_ENDPOINTS.START_RITUAL(id))
  },
  
  // Progress methods
  progress: {
    get: (timeRange = '30d') => axiosInstance.get(API_ENDPOINTS.PROGRESS_HISTORY(timeRange)),
    
    // Get progress with retry logic
    getWithRetry: async (timeRange = '30d', maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await axiosInstance.get(API_ENDPOINTS.PROGRESS_HISTORY(timeRange));
          return response;
        } catch (error) {
          if (attempt === maxRetries) {
            throw error;
          }
          
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  },
  
  // Notifications
  notifications: {
    getAll: () => axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS),
    markAsRead: (id) => axiosInstance.patch(API_ENDPOINTS.MARK_NOTIFICATION_READ(id))
  },
  
  // Generic methods for custom endpoints
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data, config = {}) => axiosInstance.put(url, data, config),
  patch: (url, data, config = {}) => axiosInstance.patch(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
};

// Helper function for handling file uploads
export const uploadFile = async (file, endpoint, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  };
  
  return axiosInstance.post(endpoint, formData, config);
};

// Helper function for download files
export const downloadFile = async (url, filename) => {
  try {
    const response = await axiosInstance.get(url, {
      responseType: 'blob',
    });
    
    // Create download link
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return response;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await axiosInstance.get('/health', { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', message: error.message };
  }
};

export default apiClient;