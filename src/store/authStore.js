import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  setSession: async (session, user, profile) => {
    if (session?.access_token && session?.refresh_token) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }
    set({ session, user, profile, loading: false });
  },

  clearSession: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, loading: false });
  },

  // Initialize from existing supabase session
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Fetch profile
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (res.ok) {
          const { data } = await res.json();
          set({ session, user: session.user, profile: data.profile, loading: false });
        } else {
          await supabase.auth.signOut();
          set({ session: null, user: null, profile: null, loading: false });
        }
      } else {
        set({ session: null, user: null, profile: null, loading: false });
      }
    } catch (error) {
      console.error('Auth initialization error', error);
      set({ session: null, user: null, profile: null, loading: false });
    }
  },

  logout: async () => {
    await get().clearSession();
  }
}));
