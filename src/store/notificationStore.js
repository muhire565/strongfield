import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  panelOpen: false,
  activityPanelOpen: false,
  lastViewedAt: (() => {
    try {
      const raw = localStorage.getItem('activity_last_viewed');
      return raw ? new Date(raw) : null;
    } catch {
      return null;
    }
  })(),

  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  closePanel: () => set({ panelOpen: false }),
  openPanel: () => set({ panelOpen: true }),

  toggleActivityPanel: () => set((s) => ({ activityPanelOpen: !s.activityPanelOpen })),
  closeActivityPanel: () => set({ activityPanelOpen: false }),
  openActivityPanel: () => set({ activityPanelOpen: true }),

  markActivityViewed: () => {
    const now = new Date().toISOString();
    localStorage.setItem('activity_last_viewed', now);
    set({ lastViewedAt: new Date(now) });
  },
}));
