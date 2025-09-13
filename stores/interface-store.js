// stores/interface-store.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useInterfaceStore = create(
  devtools(
    (set, get) => ({
      // Navigation state
      isMenuOpen: false,
      setIsMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

      // Global loading states
      isGlobalLoading: false,
      setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

      // Notification system
      notifications: [],
      showNotification: (message, type = 'info', duration = 5000) => {
        const id = Date.now().toString();
        const notification = {
          id,
          message,
          type, // 'success', 'error', 'warning', 'info'
          timestamp: Date.now(),
        };
        
        set((state) => ({
          notifications: [...state.notifications, notification]
        }));

        // Auto-remove notification
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          }));
        }, duration);
      },
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Modal states
      activeModal: null,
      setActiveModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),

      // Form states
      formSubmitting: false,
      setFormSubmitting: (submitting) => set({ formSubmitting: submitting }),

      // Theme preferences
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Ritual player states
      isRitualPlayerOpen: false,
      activeRitualId: null,
      setRitualPlayer: (isOpen, ritualId = null) => set({
        isRitualPlayerOpen: isOpen,
        activeRitualId: ritualId
      }),

      // Progress filters
      progressTimeRange: '30d',
      setProgressTimeRange: (range) => set({ progressTimeRange: range }),
      progressChartType: 'area',
      setProgressChartType: (type) => set({ progressChartType: type }),

      // User preferences
      soundEnabled: true,
      notificationsEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'livreplenish-interface',
    }
  )
);

export default useInterfaceStore;