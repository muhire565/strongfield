import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export function usePOSRealtime() {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const branchId = profile?.branch_id;
  const channelName = useRef(`pos-realtime-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (!branchId) return;

    // Filter to only this branch
    const filter = `branch_id=eq.${branchId}`;

    const channel = supabase
      .channel(channelName)
      // Listen to sales
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales', filter },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['pos', 'sales'] });
          if (payload.eventType === 'INSERT') {
            const sale = payload.new;
            // Ambient toast if it wasn't us (we don't have served_by in context easily, but we can check if it's a new sale)
            if (sale.served_by !== profile.id) {
              toast.info(`New sale recorded`, { description: `${sale.sale_number} for UGX ${sale.total_amount}` });
            }
          } else {
            queryClient.invalidateQueries({ queryKey: ['pos', 'sale', payload.new.id] });
          }
        }
      )
      // Listen to payments
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payments', filter },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['pos', 'sales'] });
          queryClient.invalidateQueries({ queryKey: ['pos', 'sale', payload.new.sale_id] });
          queryClient.invalidateQueries({ queryKey: ['pos', 'clients'] });
          queryClient.invalidateQueries({ queryKey: ['pos', 'payments'] });
          
          if (payload.new.received_by !== profile.id) {
            toast.info(`Payment received`, { description: `UGX ${payload.new.amount} via ${payload.new.payment_mode}` });
          }
        }
      )
      // Listen to clients
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['pos', 'clients'] });
          if (payload.eventType === 'UPDATE') {
            queryClient.invalidateQueries({ queryKey: ['pos', 'client', payload.new.id] });
          }
        }
      )
      // Listen to quotations
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotations', filter },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['pos', 'quotations'] });
          if (payload.eventType === 'UPDATE' && payload.new.status === 'converted' && payload.old.status !== 'converted') {
             toast.success(`Quotation converted`, { description: `${payload.new.quote_number} is now a sale` });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, queryClient, profile]);
}
