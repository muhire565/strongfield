import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';

export function useProductsRealtime() {
  const queryClient = useQueryClient();
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!branchId) return;

    // Remove any stale channel before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`products:branch:${branchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          
          // Client-side filtering ensures we don't miss events due to Supabase type coercion quirks
          const isRelevant = 
            (newRow && String(newRow.branch_id) === String(branchId)) || 
            (oldRow && String(oldRow.branch_id) === String(branchId));

          if (!isRelevant) return;

          console.log(`[Realtime] 📦 Product ${eventType} received for branch ${branchId}`, payload);

          // Optimistically update the cache
          queryClient.setQueriesData(
            { queryKey: ['products'] },
            (prev) => {
              if (!Array.isArray(prev)) return prev;

              if (eventType === 'INSERT') {
                const exists = prev.some((p) => String(p.id) === String(newRow.id));
                return exists
                  ? prev.map((p) => (String(p.id) === String(newRow.id) ? { ...p, ...newRow, _optimistic: false } : p))
                  : [newRow, ...prev];
              }

              if (eventType === 'UPDATE') {
                return prev.map((p) =>
                  String(p.id) === String(newRow.id) ? { ...p, ...newRow, _optimistic: false } : p
                );
              }

              if (eventType === 'DELETE') {
                return prev.filter((p) => String(p.id) !== String(oldRow.id));
              }

              return prev;
            }
          );

          // Force an immediate background refetch to ensure perfect sync
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_exports',
        },
        (payload) => {
          const newRow = payload.new;
          const oldRow = payload.old;
          
          const isRelevant = 
            (newRow && (String(newRow.source_branch_id) === String(branchId) || String(newRow.target_branch_id) === String(branchId))) ||
            (oldRow && (String(oldRow.source_branch_id) === String(branchId) || String(oldRow.target_branch_id) === String(branchId)));

          if (isRelevant) {
            console.log(`[Realtime] 🔄 Export ${payload.eventType} received for branch ${branchId}`, payload);
            queryClient.invalidateQueries({ queryKey: ['product-exports'] });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.info(`[Realtime] ✓ Connected to products & exports for branch:${branchId}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error:', err);
          setTimeout(() => {
            if (channelRef.current) {
              channelRef.current.subscribe();
            }
          }, 3000);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [branchId, queryClient]);
}
