import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';

export function useFinanceRealtime(branchId) {
  const queryClient = useQueryClient();
  const channelName = `finance-realtime-${branchId}-${Date.now()}`;

  useEffect(() => {
    if (!branchId) return;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'finance_transactions', filter: `branch_id=eq.${branchId}` },
        (payload) => {
          const t = payload.new;
          queryClient.invalidateQueries({ queryKey: ['finance', 'balances'] });
          queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
          queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
          queryClient.invalidateQueries({ queryKey: ['finance', 'cashflow'] });

          if (t.transaction_type === 'capital_injection') {
            toast.info(`Capital injected — UGX ${Number(t.amount).toLocaleString('en-UG')} added to ${t.payment_mode}`);
          } else if (t.transaction_type === 'expense_payment') {
            toast.info(`Expense recorded — UGX ${Number(t.amount).toLocaleString('en-UG')} paid via ${t.payment_mode}`);
          } else if (t.transaction_type === 'owner_withdrawal') {
            toast.warning(`Withdrawal — UGX ${Number(t.amount).toLocaleString('en-UG')} taken from ${t.payment_mode}`);
          } else if (t.transaction_type === 'pos_sale_payment' || t.transaction_type === 'credit_payment_received') {
            toast.success(`Payment received — UGX ${Number(t.amount).toLocaleString('en-UG')} via ${t.payment_mode}`);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'payment_mode_balances', filter: `branch_id=eq.${branchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['finance', 'balances'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'expenses', filter: `branch_id=eq.${branchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'owner_withdrawals', filter: `branch_id=eq.${branchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['finance', 'withdrawals'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'capital_accounts', filter: `branch_id=eq.${branchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['finance', 'capital'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'goods_purchases', filter: `branch_id=eq.${branchId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['finance', 'purchases'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, queryClient, channelName]);
}
