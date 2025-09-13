// stores/interface-store.js
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

const useInterfaceStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Notification system
        notifications: [],
        
        // Loading states
        globalLoading: false,
        formSubmitting: false,
        
        // Progress tracking
        progressTimeRange: '30d',
        progressChartType: 'area',
        
        // User preferences
        theme: 'light',
        sidebarCollapsed: false,
        
        // Dashboard state
        dashboardData: null,
        lastUpdated: null,
        
        // Actions
        showNotification: (message, type = 'info', duration = 5000) => {
          const id = `notification-${Date.now()}-${Math.random()}`;
          const notification = {
            id,
            message,
            type,
            duration,
            timestamp: Date.now()
          };
          
          set((state) => ({
            notifications: [...state.notifications, notification]
          }));
          
          // Auto-remove notification after duration
          if (duration > 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, duration);
          }
          
          return id;
        },
        
        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        },
        
        clearAllNotifications: () => {
          set({ notifications: [] });
        },
        
        // Success notification helper
        showSuccessNotification: (message) => {
          return get().showNotification(message, 'success', 5000);
        },
        
        // Error notification helper
        showErrorNotification: (message) => {
          return get().showNotification(message, 'error', 7000);
        },
        
        // Warning notification helper
        showWarningNotification: (message) => {
          return get().showNotification(message, 'warning', 6000);
        },
        
        // Loading states
        setGlobalLoading: (loading) => {
          set({ globalLoading: loading });
        },
        
        setFormSubmitting: (submitting) => {
          set({ formSubmitting: submitting });
        },
        
        // Progress settings
        setProgressTimeRange: (range) => {
          set({ progressTimeRange: range });
        },
        
        setProgressChartType: (type) => {
          set({ progressChartType: type });
        },
        
        // Theme management
        setTheme: (theme) => {
          set({ theme });
          // Apply theme to document
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
          }
        },
        
        toggleTheme: () => {
          const currentTheme = get().theme;
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },
        
        // Sidebar management
        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed });
        },
        
        toggleSidebar: () => {
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
        },
        
        // Dashboard data management
        setDashboardData: (data) => {
          set({ 
            dashboardData: data, 
            lastUpdated: Date.now() 
          });
        },
        
        updateRitualStatus: (ritualId, completed) => {
          set((state) => {
            if (!state.dashboardData?.rituals) return state;
            
            const updatedRituals = state.dashboardData.rituals.map(ritual =>
              ritual.id === ritualId ? { ...ritual, completed } : ritual
            );
            
            return {
              dashboardData: {
                ...state.dashboardData,
                rituals: updatedRituals
              },
              lastUpdated: Date.now()
            };
          });
        },
        
        // Utility actions
        reset: () => {
          set({
            notifications: [],
            globalLoading: false,
            formSubmitting: false,
            progressTimeRange: '30d',
            progressChartType: 'area',
            theme: 'light',
            sidebarCollapsed: false,
            dashboardData: null,
            lastUpdated: null
          });
        },
        
        // Batch operations
        batchUpdate: (updates) => {
          set((state) => ({ ...state, ...updates }));
        }
      }),
      {
        name: 'livreplenish-interface-store',
        partialize: (state) => ({
          // Only persist these values
          progressTimeRange: state.progressTimeRange,
          progressChartType: state.progressChartType,
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed
        }),
        version: 1,
        migrate: (persistedState, version) => {
          // Handle store migrations if needed
          if (version === 0) {
            // Migration from version 0 to 1
            return {
              ...persistedState,
              progressChartType: 'area' // Set default for new field
            };
          }
          return persistedState;
        }
      }
    )
  )
);

// Selector hooks for better performance
export const useNotifications = () => useInterfaceStore((state) => state.notifications);
export const useGlobalLoading = () => useInterfaceStore((state) => state.globalLoading);
export const useFormSubmitting = () => useInterfaceStore((state) => state.formSubmitting);
export const useTheme = () => useInterfaceStore((state) => state.theme);
export const useDashboardData = () => useInterfaceStore((state) => state.dashboardData);

// Action-only hooks for components that only need actions
export const useNotificationActions = () => useInterfaceStore((state) => ({
  showNotification: state.showNotification,
  removeNotification: state.removeNotification,
  clearAllNotifications: state.clearAllNotifications,
  showSuccessNotification: state.showSuccessNotification,
  showErrorNotification: state.showErrorNotification,
  showWarningNotification: state.showWarningNotification
}));

export const useLoadingActions = () => useInterfaceStore((state) => ({
  setGlobalLoading: state.setGlobalLoading,
  setFormSubmitting: state.setFormSubmitting
}));

export const useProgressActions = () => useInterfaceStore((state) => ({
  setProgressTimeRange: state.setProgressTimeRange,
  setProgressChartType: state.setProgressChartType
}));

export const useThemeActions = () => useInterfaceStore((state) => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme
}));

export const useDashboardActions = () => useInterfaceStore((state) => ({
  setDashboardData: state.setDashboardData,
  updateRitualStatus: state.updateRitualStatus
}));

export default useInterfaceStore;