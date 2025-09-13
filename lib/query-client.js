// lib/query-client.js
import { QueryClient } from '@tanstack/react-query';
import { apiClient, handleApiError } from './api-client.js';

/**
 * Create a single query client instance for LivReplenish with optimized settings
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache settings optimized for wellness app usage patterns
      staleTime: 1000 * 60 * 5, // 5 minutes - good balance for ritual data
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection time (was cacheTime)
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // UX optimizations for wellness app
      refetchOnWindowFocus: false, // Don't interrupt meditation sessions
      refetchOnMount: true,
      refetchOnReconnect: 'always', // Important for mobile users
      
      // Prevent automatic background updates during critical user sessions
      refetchInterval: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry on network errors or 5xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      // Global error handling for mutations
      onError: (error, variables, context) => {
        console.error('Mutation failed:', error);
      },
    },
  },
});

/**
 * LivReplenish Query Keys Factory - Centralized and type-safe query key management
 */
export const queryKeys = {
  // User-related queries
  user: {
    all: () => ['user'],
    profile: () => ['user', 'profile'],
    preferences: () => ['user', 'preferences'],
    stats: () => ['user', 'stats'],
  },
  
  // Plan-related queries
  plan: {
    all: () => ['plan'],
    today: () => ['plan', 'today'],
    date: (date) => ['plan', 'date', date],
    week: (startDate) => ['plan', 'week', startDate],
  },
  
  // Ritual-related queries
  rituals: {
    all: () => ['rituals'],
    detail: (ritualId) => ['rituals', 'detail', ritualId],
    completed: () => ['rituals', 'completed'],
    available: () => ['rituals', 'available'],
    categories: () => ['rituals', 'categories'],
  },
  
  // Progress-related queries
  progress: {
    all: () => ['progress'],
    overview: (timeRange = '30d') => ['progress', 'overview', timeRange],
    history: (timeRange = '30d') => ['progress', 'history', timeRange],
    vitality: (timeRange = '30d') => ['progress', 'vitality', timeRange],
    trends: (timeRange = '30d') => ['progress', 'trends', timeRange],
  },

  // Health and system queries
  health: () => ['health'],
};

/**
 * LivReplenish Query Functions - Reusable query functions with consistent error handling
 */
export const queryFunctions = {
  // User queries
  getUserProfile: async () => {
    const response = await apiClient.getUserProfile();
    return response.data;
  },
  
  getUserStats: async () => {
    const response = await apiClient.getUserStats();
    return response.data;
  },
  
  // Plan queries  
  getTodaysPlan: async () => {
    const response = await apiClient.getTodaysPlan();
    return response.data;
  },
  
  getPlanForDate: async (date) => {
    const response = await apiClient.getPlanForDate(date);
    return response.data;
  },
  
  // Ritual queries
  getRitualDetail: async (ritualId) => {
    const response = await apiClient.getRitual(ritualId);
    return response.data;
  },
  
  // Progress queries
  getProgress: async (timeRange = '30d') => {
    const response = await apiClient.getProgress(timeRange);
    return response.data;
  },
  
  getProgressHistory: async (timeRange = '30d') => {
    const response = await apiClient.getProgressHistory(timeRange);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await apiClient.healthCheck();
    return response.data;
  },
};

/**
 * LivReplenish Mutation Functions - Reusable mutation functions
 */
export const mutationFunctions = {
  // Onboarding
  submitOnboarding: async (data) => {
    const response = await apiClient.submitOnboarding(data);
    return response.data;
  },
  
  // Ritual interactions
  completeRitual: async ({ ritualId, completionData = {} }) => {
    const response = await apiClient.completeRitual(ritualId, completionData);
    return response.data;
  },
  
  submitRitualFeedback: async ({ ritualId, feedback }) => {
    const response = await apiClient.submitRitualFeedback(ritualId, feedback);
    return response.data;
  },
  
  // User preferences
  updateUserPreferences: async (preferences) => {
    const response = await apiClient.updateUserPreferences(preferences);
    return response.data;
  },
  
  // File upload
  uploadFile: async ({ endpoint, file, additionalData = {} }) => {
    const response = await apiClient.uploadFile(endpoint, file, additionalData);
    return response.data;
  },
  
  uploadRitualAudio: async ({ ritualId, file, additionalData = {} }) => {
    const response = await apiClient.uploadRitualAudio(ritualId, file, additionalData);
    return response.data;
  },

  // Authentication
  login: async (credentials) => {
    const response = await apiClient.login(credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.logout();
    return response.data;
  },
};

/**
 * Configure default query behaviors for different data types
 */
queryClient.setQueryDefaults(queryKeys.user.all(), {
  staleTime: 1000 * 60 * 10, // User data is more stable - 10 minutes
  gcTime: 1000 * 60 * 60, // Keep user data cached for 1 hour
});

queryClient.setQueryDefaults(queryKeys.plan.all(), {
  staleTime: 1000 * 60 * 2, // Plan data changes more frequently - 2 minutes
  gcTime: 1000 * 60 * 15, // Keep plan data for 15 minutes
});

queryClient.setQueryDefaults(queryKeys.rituals.all(), {
  staleTime: 1000 * 60 * 30, // Ritual data is relatively stable - 30 minutes
  gcTime: 1000 * 60 * 60, // Keep ritual data for 1 hour
});

queryClient.setQueryDefaults(queryKeys.progress.all(), {
  staleTime: 1000 * 60 * 5, // Progress data updates regularly - 5 minutes
  gcTime: 1000 * 60 * 30, // Keep progress data for 30 minutes
});

/**
 * Helper functions to invalidate related queries after mutations
 */
export const invalidateQueries = {
  // User-related invalidations
  userProfile: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() }),
  userStats: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.stats() }),
  allUser: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.all() }),
  
  // Plan-related invalidations
  todaysPlan: () => queryClient.invalidateQueries({ queryKey: queryKeys.plan.today() }),
  planForDate: (date) => queryClient.invalidateQueries({ queryKey: queryKeys.plan.date(date) }),
  allPlans: () => queryClient.invalidateQueries({ queryKey: queryKeys.plan.all() }),
  
  // Ritual-related invalidations
  ritual: (ritualId) => queryClient.invalidateQueries({ queryKey: queryKeys.rituals.detail(ritualId) }),
  completedRituals: () => queryClient.invalidateQueries({ queryKey: queryKeys.rituals.completed() }),
  allRituals: () => queryClient.invalidateQueries({ queryKey: queryKeys.rituals.all() }),
  
  // Progress-related invalidations
  progress: (timeRange) => queryClient.invalidateQueries({ queryKey: queryKeys.progress.overview(timeRange) }),
  progressHistory: (timeRange) => queryClient.invalidateQueries({ queryKey: queryKeys.progress.history(timeRange) }),
  allProgress: () => queryClient.invalidateQueries({ queryKey: queryKeys.progress.all() }),

  // Complex invalidation scenarios
  afterRitualCompletion: (ritualId) => {
    invalidateQueries.todaysPlan();
    invalidateQueries.ritual(ritualId);
    invalidateQueries.completedRituals();
    invalidateQueries.userStats();
    invalidateQueries.allProgress();
  },

  afterOnboarding: () => {
    invalidateQueries.allUser();
    invalidateQueries.todaysPlan();
  },

  afterPreferenceUpdate: () => {
    invalidateQueries.userProfile();
    // Plans might change based on preferences
    invalidateQueries.allPlans();
  },
};

/**
 * Prefetch functions for better UX in LivReplenish
 */
export const prefetchQueries = {
  // Prefetch today's plan when user logs in or app starts
  todaysPlan: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.plan.today(),
      queryFn: queryFunctions.getTodaysPlan,
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  },
  
  // Prefetch user profile for quick access
  userProfile: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(),
      queryFn: queryFunctions.getUserProfile,
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  },

  // Prefetch ritual details when hovering over ritual cards or navigating
  ritual: async (ritualId) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.rituals.detail(ritualId),
      queryFn: () => queryFunctions.getRitualDetail(ritualId),
      staleTime: 1000 * 60 * 30, // 30 minutes
    });
  },

  // Prefetch progress data for dashboard
  progress: async (timeRange = '30d') => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.progress.overview(timeRange),
      queryFn: () => queryFunctions.getProgress(timeRange),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },

  // Prefetch next day's plan in the evening
  tomorrowsPlan: async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    await queryClient.prefetchQuery({
      queryKey: queryKeys.plan.date(tomorrowStr),
      queryFn: () => queryFunctions.getPlanForDate(tomorrowStr),
      staleTime: 1000 * 60 * 30, // 30 minutes
    });
  },
};

/**
 * Optimistic updates for better UX
 */
export const optimisticUpdates = {
  // Optimistically update ritual completion
  completeRitual: (ritualId, completionData = {}) => {
    // Update ritual detail
    queryClient.setQueryData(queryKeys.rituals.detail(ritualId), (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        completed: true,
        completedAt: new Date().toISOString(),
        ...completionData,
      };
    });

    // Update today's plan if it contains this ritual
    queryClient.setQueryData(queryKeys.plan.today(), (oldData) => {
      if (!oldData?.rituals) return oldData;
      return {
        ...oldData,
        rituals: oldData.rituals.map(ritual =>
          ritual.id === ritualId 
            ? { 
                ...ritual, 
                completed: true,
                completedAt: new Date().toISOString(),
                ...completionData 
              }
            : ritual
        ),
      };
    });

    // Optimistically update user stats
    queryClient.setQueryData(queryKeys.user.stats(), (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        ritualsCompleted: (oldData.ritualsCompleted || 0) + 1,
        totalMinutesMeditated: (oldData.totalMinutesMeditated || 0) + (completionData.duration || 0),
      };
    });
  },

  // Optimistically update user preferences
  updatePreferences: (newPreferences) => {
    queryClient.setQueryData(queryKeys.user.profile(), (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        preferences: {
          ...oldData.preferences,
          ...newPreferences,
        },
      };
    });
  },

  // Optimistically add ritual feedback
  addRitualFeedback: (ritualId, feedback) => {
    queryClient.setQueryData(queryKeys.rituals.detail(ritualId), (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        feedback: {
          ...oldData.feedback,
          userFeedback: feedback,
          submittedAt: new Date().toISOString(),
        },
      };
    });
  },
};

/**
 * Data synchronization helpers
 */
export const syncData = {
  // Ensure critical data is fresh
  ensureFreshTodaysPlan: async () => {
    await queryClient.invalidateQueries({ 
      queryKey: queryKeys.plan.today(),
      exact: true 
    });
  },

  // Background sync for offline-first approach
  backgroundSync: async () => {
    try {
      // Silently refresh critical data in background
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: queryKeys.plan.today() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.user.stats() }),
      ]);
    } catch (error) {
      console.warn('Background sync failed:', error);
    }
  },

  // Sync after network reconnection
  syncAfterReconnect: async () => {
    await queryClient.invalidateQueries();
    await queryClient.refetchQueries();
  },
};

/**
 * Global error handler for queries
 */
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'error') {
    const { query, error } = event;
    
    // Skip error handling if query has custom error handling
    if (query.meta?.skipGlobalErrorHandler) {
      return;
    }

    console.error('Query failed:', query.queryKey, error);
    
    // Handle specific error types
    handleApiError(error);
  }
});

/**
 * Global success handler for mutations
 */
queryClient.getMutationCache().subscribe((event) => {
  if (event.type === 'success') {
    const { mutation } = event;
    
    // Log successful mutations for analytics
    console.info('Mutation succeeded:', mutation.options.mutationKey);
  }
});

/**
 * Network status monitoring
 */
export const networkStatusQueries = {
  // Set up health monitoring
  setupNetworkMonitoring: () => {
    return queryClient.ensureQueryData({
      queryKey: queryKeys.health(),
      queryFn: queryFunctions.healthCheck,
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60, // 1 minute
      retry: 1, // Only retry once for health checks
      meta: {
        skipGlobalErrorHandler: true, // Don't show errors for health checks
      },
    });
  },

  // Check if we're online and server is reachable
  isOnline: async () => {
    try {
      await queryFunctions.healthCheck();
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Query client utilities for debugging and development
 */
export const devUtils = {
  // Log all cached queries (development only)
  logCachedQueries: () => {
    if (process.env.NODE_ENV === 'development') {
      console.table(
        queryClient.getQueryCache().getAll().map(query => ({
          key: JSON.stringify(query.queryKey),
          state: query.state.status,
          dataUpdatedAt: new Date(query.state.dataUpdatedAt),
          errorUpdatedAt: new Date(query.state.errorUpdatedAt),
        }))
      );
    }
  },

  // Clear all caches (useful for testing)
  clearAllCaches: () => {
    queryClient.clear();
  },

  // Get cache statistics
  getCacheStats: () => ({
    queryCount: queryClient.getQueryCache().getAll().length,
    mutationCount: queryClient.getMutationCache().getAll().length,
  }),
};

export default queryClient;