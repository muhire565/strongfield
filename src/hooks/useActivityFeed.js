import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';

export function useActivityFeed(filters = {}) {
  return useQuery({
    queryKey: ['activity', filters],
    queryFn: () => notificationService.activity(filters),
    staleTime: 30_000,
  });
}

export function useActivityRealtime() {
  const queryClient = useQueryClient();
  const branchId = useAuthStore((s) => s.profile?.branch_id);

  useEffect(() => {
    if (!branchId) return;

    // Subscribe to multiple tables that feed into activity
    const channels = [];

    const stockChannel = supabase
      .channel(`activity-stock:${branchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stock_movements', filter: `branch_id=eq.${branchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity'] });
        }
      )
      .subscribe();
    channels.push(stockChannel);

    const paymentsChannel = supabase
      .channel(`activity-payments:${branchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payments', filter: `branch_id=eq.${branchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity'] });
        }
      )
      .subscribe();
    channels.push(paymentsChannel);

    const salesChannel = supabase
      .channel(`activity-sales:${branchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales', filter: `branch_id=eq.${branchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity'] });
        }
      )
      .subscribe();
    channels.push(salesChannel);

    const notifChannel = supabase
      .channel(`activity-notifications:${branchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `branch_id=eq.${branchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activity'] });
        }
      )
      .subscribe();
    channels.push(notifChannel);

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [branchId, queryClient]);
}
