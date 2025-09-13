// stores/interface-store.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useInterfaceStore = create()(
  devtools(
    persist(
      (set, get) => ({
        // Navigation state
        isMenuOpen: false,
        currentPage: 'dashboard',
        
        // Loading states
        isLoading: false,
        loadingMessage: '',
        
        // Notifications
        notifications: [],
        notificationCounter: 0,
        
        // Modal states
        isModalOpen: false,
        modalContent: null,
        modalType: 'default',
        
        // Theme and preferences
        theme: 'light',
        reducedMotion: false,
        soundEnabled: true,
        
        // Navigation actions
        setIsMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
        setCurrentPage: (page) => set({ currentPage: page }),
        
        // Loading actions
        setIsLoading: (loading, message = '') => set({ 
          isLoading: loading, 
          loadingMessage: message 
        }),
        
        // Notification actions
        addNotification: (notification) => {
          const { notifications, notificationCounter } = get();
          const newNotification = {
            id: notificationCounter + 1,
            timestamp: new Date().toISOString(),
            type: 'info',
            autoClose: true,
            duration: 5000,
            ...notification,
          };
          
          set({
            notifications: [...notifications, newNotification],
            notificationCounter: notificationCounter + 1,
          });
          
          // Auto remove notification after duration
          if (newNotification.autoClose) {
            setTimeout(() => {
              get().removeNotification(newNotification.id);
            }, newNotification.duration);
          }
        },
        
        removeNotification: (id) => {
          const { notifications } = get();
          set({
            notifications: notifications.filter(n => n.id !== id),
          });
        },
        
        clearAllNotifications: () => set({ notifications: [] }),
        
        // Modal actions
        openModal: (content, type = 'default') => set({
          isModalOpen: true,
          modalContent: content,
          modalType: type,
        }),
        
        closeModal: () => set({
          isModalOpen: false,
          modalContent: null,
          modalType: 'default',
        }),
        
        // Theme and preference actions
        setTheme: (theme) => set({ theme }),
        toggleTheme: () => {
          const { theme } = get();
          set({ theme: theme === 'light' ? 'dark' : 'light' });
        },
        
        setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
        setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
        
        // Utility actions
        showSuccessNotification: (message) => {
          get().addNotification({
            message,
            type: 'success',
            duration: 4000,
          });
        },
        
        showErrorNotification: (message) => {
          get().addNotification({
            message,
            type: 'error',
            duration: 6000,
          });
        },
        
        showWarningNotification: (message) => {
          get().addNotification({
            message,
            type: 'warning',
            duration: 5000,
          });
        },
        
        showInfoNotification: (message) => {
          get().addNotification({
            message,
            type: 'info',
            duration: 4000,
          });
        },
      }),
      {
        name: 'interface-store',
        partialize: (state) => ({
          theme: state.theme,
          reducedMotion: state.reducedMotion,
          soundEnabled: state.soundEnabled,
        }),
      }
    ),
    {
      name: 'interface-store',
    }
  )
);

export default useInterfaceStore;