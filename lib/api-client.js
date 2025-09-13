// lib/api-client.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Custom API Error class for better error handling
 */
class ApiError extends Error {
  constructor(message, status, code, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
    
    // Ensure proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Enhanced API Client for LivReplenish
 * Handles all HTTP communication with the backend
 */
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Request interceptor for auth tokens
    this.authToken = null;
  }

  /**
   * Set authentication token for all requests
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Get headers with authentication if available
   */
  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * Core request method with comprehensive error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      ...options,
      headers: this.getHeaders(options.headers),
      credentials: 'include', // Important for cookies/authentication
    };

    try {
      const response = await fetch(url, config);
      
      // Get content type for proper parsing
      const contentType = response.headers.get('content-type') || '';
      let data = null;
      
      // Parse response based on content type
      if (contentType.includes('application/json')) {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else if (response.headers.get('content-length') !== '0') {
        // For binary data or other content types
        data = await response.blob();
      }

      // Handle non-successful responses
      if (!response.ok) {
        const errorMessage = this.extractErrorMessage(data, response);
        const errorCode = this.extractErrorCode(data, response);
        
        throw new ApiError(errorMessage, response.status, errorCode, data);
      }
      
      return {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      // Re-throw ApiError instances
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network and other errors
      if (error.name === 'TypeError' || error.name === 'NetworkError') {
        throw new ApiError(
          'Network error: Unable to connect to server',
          0,
          'NETWORK_ERROR'
        );
      }
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request was cancelled', 0, 'REQUEST_CANCELLED');
      }
      
      // Generic error fallback
      throw new ApiError(
        error.message || 'An unexpected error occurred',
        0,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Extract error message from response
   */
  extractErrorMessage(data, response) {
    if (data && typeof data === 'object') {
      return data.message || data.error || data.detail || `HTTP ${response.status}: ${response.statusText}`;
    }
    return `HTTP ${response.status}: ${response.statusText}`;
  }

  /**
   * Extract error code from response
   */
  extractErrorCode(data, response) {
    if (data && typeof data === 'object' && data.code) {
      return data.code;
    }
    
    // Map HTTP status codes to semantic codes
    const statusCodeMap = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };
    
    return statusCodeMap[response.status] || 'HTTP_ERROR';
  }

  // HTTP Methods with proper error handling
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams();
    
    // Handle nested objects and arrays in query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = null) {
    const options = { method: 'POST' };
    
    if (data !== null) {
      if (data instanceof FormData) {
        // Don't set Content-Type for FormData - let browser set it with boundary
        options.body = data;
        options.headers = { Accept: 'application/json' };
      } else {
        options.body = JSON.stringify(data);
      }
    }
    
    return this.request(endpoint, options);
  }

  async put(endpoint, data = null) {
    const options = { method: 'PUT' };
    
    if (data !== null) {
      if (data instanceof FormData) {
        options.body = data;
        options.headers = { Accept: 'application/json' };
      } else {
        options.body = JSON.stringify(data);
      }
    }
    
    return this.request(endpoint, options);
  }

  async patch(endpoint, data = null) {
    const options = { method: 'PATCH' };
    
    if (data !== null) {
      if (data instanceof FormData) {
        options.body = data;
        options.headers = { Accept: 'application/json' };
      } else {
        options.body = JSON.stringify(data);
      }
    }
    
    return this.request(endpoint, options);
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // =================================================================
  // LivReplenish-specific API endpoints
  // =================================================================

  // Authentication endpoints
  async login(credentials) {
    return this.post('/api/auth/login', credentials);
  }

  async logout() {
    return this.post('/api/auth/logout');
  }

  async refreshToken() {
    return this.post('/api/auth/refresh');
  }

  // User Profile endpoints
  async getUserProfile() {
    return this.get('/api/user/profile');
  }

  async updateUserPreferences(preferences) {
    return this.patch('/api/user/preferences', preferences);
  }

  async getUserStats() {
    return this.get('/api/user/stats');
  }

  // Onboarding endpoint
  async submitOnboarding(onboardingData) {
    return this.post('/api/onboarding', onboardingData);
  }

  // Daily Plan endpoints
  async getTodaysPlan() {
    return this.get('/api/plan/today');
  }

  async getPlanForDate(date) {
    return this.get(`/api/plan/date/${date}`);
  }

  // Ritual endpoints
  async getRitual(ritualId) {
    return this.get(`/api/rituals/${ritualId}`);
  }

  async completeRitual(ritualId, completionData = {}) {
    return this.post(`/api/rituals/${ritualId}/complete`, completionData);
  }

  async submitRitualFeedback(ritualId, feedback) {
    return this.post(`/api/rituals/${ritualId}/feedback`, feedback);
  }

  // Progress endpoints
  async getProgress(timeRange = '30d') {
    return this.get('/api/progress', { range: timeRange });
  }

  async getProgressHistory(timeRange = '30d') {
    return this.get('/api/progress/history', { range: timeRange });
  }

  // File upload endpoints
  async uploadRitualAudio(ritualId, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('audio', file);
    
    // Add additional data to form
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return this.post(`/api/rituals/${ritualId}/audio`, formData);
  }

  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data to form
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return this.post(endpoint, formData);
  }

  // Health check endpoint
  async healthCheck() {
    return this.get('/api/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export ApiError for use in components
export { ApiError };

// Enhanced error handler specifically for LivReplenish
export const handleApiError = (error, showNotification = null) => {
  console.error('LivReplenish API Error:', error);
  
  let message = 'An unexpected error occurred';
  let type = 'error';
  
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        message = 'Unable to connect to LivReplenish servers. Please check your internet connection.';
        break;
      case 'UNAUTHORIZED':
        message = 'Your session has expired. Please log in again to continue your wellness journey.';
        type = 'warning';
        break;
      case 'FORBIDDEN':
        message = 'You do not have permission to perform this action.';
        break;
      case 'NOT_FOUND':
        message = 'The requested ritual or resource was not found.';
        break;
      case 'VALIDATION_ERROR':
      case 'BAD_REQUEST':
        message = error.message || 'Please check your input and try again.';
        break;
      case 'RITUAL_NOT_AVAILABLE':
        message = 'This ritual is currently not available. Please try another one.';
        break;
      case 'PLAN_NOT_READY':
        message = 'Your daily plan is still being prepared. Please check back in a moment.';
        type = 'info';
        break;
      case 'AUDIO_LOAD_ERROR':
        message = 'Unable to load the ritual audio. Please check your connection and try again.';
        break;
      case 'RATE_LIMITED':
        message = 'Too many requests. Please wait a moment before trying again.';
        type = 'warning';
        break;
      case 'SERVICE_UNAVAILABLE':
        message = 'Our servers are temporarily unavailable. Please try again in a few moments.';
        break;
      default:
        if (error.status >= 500) {
          message = 'Our servers are experiencing issues. Please try again in a few moments.';
        } else {
          message = error.message || 'Something went wrong. Please try again.';
        }
    }
  }
  
  if (showNotification) {
    showNotification(message, type);
  }
  
  return { message, type };
};

// Helper function for retry logic with exponential backoff
export const retryApiCall = async (
  apiCall,
  options = {}
) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = (error) => {
      // Don't retry on client errors (4xx) except rate limits (429)
      if (error instanceof ApiError) {
        return !(error.status >= 400 && error.status < 500 && error.status !== 429);
      }
      return true;
    }
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (attempt < maxRetries - 1) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};