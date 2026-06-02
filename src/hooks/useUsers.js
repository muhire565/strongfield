import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

function getAuthHeaders() {
  const session = useAuthStore.getState().session;
  return { Authorization: `Bearer ${session?.access_token || ''}` };
}

export function useUsers() {
  const queryClient = useQueryClient();
  const branchId = useAuthStore((s) => s.profile?.branch_id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch users');
      const json = await res.json();
      return json.data || [];
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!branchId) return;
    const filter = `branch_id=eq.${branchId}`;
    const channel = supabase
      .channel('profiles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter },
        () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, queryClient]);

  return { users: data, isLoading, error };
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create user');
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User "${data.full_name}" created`);
    },
    onError: (err) => toast.error('Failed to create user', { description: err.message }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update user');
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User "${data.full_name}" updated`);
    },
    onError: (err) => toast.error('Failed to update user', { description: err.message }),
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to block user');
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User "${data.full_name}" blocked`);
    },
    onError: (err) => toast.error('Failed to block user', { description: err.message }),
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_URL}/users/${id}/activate`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to unblock user');
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User "${data.full_name}" unblocked`);
    },
    onError: (err) => toast.error('Failed to unblock user', { description: err.message }),
  });
}

export function useTrackActivity() {
  const profile = useAuthStore((s) => s.profile);
  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      await fetch(`${API_URL}/users/${profile.id}/track`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
    },
  });
}
