import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export function useNotificationsRealtime() {
  const queryClient = useQueryClient();
  const branchId = useAuthStore((s) => s.profile?.branch_id);

  useEffect(() => {
    if (!branchId) return;

    const channel = supabase
      .channel(`notifications:${branchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `branch_id=eq.${branchId}`,
        },
        (payload) => {
          const notif = payload.new;

          // 1. Prepend to notification list cache
          queryClient.setQueriesData({ queryKey: ['notifications'] }, (prev) => {
            if (!prev || typeof prev !== 'object') return prev;
            if (Array.isArray(prev)) return [notif, ...prev];
            if (Array.isArray(prev.data)) {
              return { ...prev, data: [notif, ...prev.data] };
            }
            return prev;
          });

          // 2. Increment unread count
          queryClient.setQueryData(['notifications', 'unread-count'], (prev) => ({
            count: (prev?.count ?? 0) + 1,
          }));

          // 3. Show Sonner toast for high-priority types
          const highPriority = ['out_of_stock', 'large_withdrawal', 'credit_balance_cleared'];
          const medPriority = ['low_stock', 'payment_received', 'sale_completed'];

          if (highPriority.includes(notif.type)) {
            toast.warning(notif.title, { description: notif.description, duration: 6000 });
          } else if (medPriority.includes(notif.type)) {
            toast.info(notif.title, { description: notif.description, duration: 4000 });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, queryClient]);
}
