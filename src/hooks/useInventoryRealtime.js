import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

// Helper — enriches a raw product row with computed fields
function enrichProduct(p) {
  const qty = p.quantity ?? 0;
  const threshold = p.low_stock_threshold ?? 5;
  return {
    ...p,
    stock_value: parseFloat(((p.price || 0) * qty).toFixed(2)),
    stock_status: qty === 0 ? 'Out of Stock' : qty <= threshold ? 'Low Stock' : 'In Stock',
  };
}

export function useInventoryRealtime() {
  const queryClient   = useQueryClient();
  const branchId      = useAuthStore((s) => s.profile?.branch_id);
  const productsRef   = useRef(null);
  const movementsRef  = useRef(null);

  useEffect(() => {
    if (!branchId) return;

    // ── Channel 1: Products table ────────────────────────────────
    if (productsRef.current) supabase.removeChannel(productsRef.current);

    productsRef.current = supabase
      .channel(`inventory:products:${branchId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'products',
      }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        
        // Client-side filtering
        const isRelevant = 
            (newRow && String(newRow.branch_id) === String(branchId)) || 
            (oldRow && String(oldRow.branch_id) === String(branchId));

        if (!isRelevant) return;

        // Update inventory query cache
        queryClient.setQueriesData({ queryKey: ['inventory'], exact: false }, (prev) => {
          if (!Array.isArray(prev)) return prev;

          if (eventType === 'INSERT') {
            const enriched = enrichProduct(newRow);
            const exists = prev.some((p) => String(p.id) === String(newRow.id));
            return exists
              ? prev.map((p) => String(p.id) === String(newRow.id) ? enriched : p)
              : [enriched, ...prev];
          }
          if (eventType === 'UPDATE') {
            return prev.map((p) => String(p.id) === String(newRow.id) ? { ...p, ...enrichProduct(newRow) } : p);
          }
          if (eventType === 'DELETE') {
            return prev.filter((p) => String(p.id) !== String(oldRow.id));
          }
          return prev;
        });

        // Also update the open product detail panel if it is for this product
        if (eventType === 'UPDATE') {
          queryClient.setQueriesData(
            { queryKey: ['inventory', 'product', newRow.id], exact: false },
            (prev) => prev ? { ...prev, ...enrichProduct(newRow) } : prev
          );
        }

        // Invalidate summary stats
        queryClient.invalidateQueries({ queryKey: ['inventory', 'summary'] });
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setTimeout(() => productsRef.current?.subscribe(), 3000);
        }
      });

    // ── Channel 2: Stock movements table ────────────────────────
    if (movementsRef.current) supabase.removeChannel(movementsRef.current);

    movementsRef.current = supabase
      .channel(`inventory:movements:${branchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'stock_movements',
      }, (payload) => {
        const { new: newMovement } = payload;
        
        if (String(newMovement.branch_id) !== String(branchId)) return;

        // Prepend new movement to the all-movements list
        queryClient.setQueriesData({ queryKey: ['movements', branchId], exact: false }, (prev) => {
          if (!Array.isArray(prev)) return prev;
          const exists = prev.some((m) => String(m.id) === String(newMovement.id));
          return exists ? prev : [newMovement, ...prev];
        });

        // Prepend to this product's movement list (if detail panel is open)
        queryClient.setQueriesData(
          { queryKey: ['movements', 'product', newMovement.product_id], exact: false },
          (prev) => {
            if (!Array.isArray(prev)) return prev;
            const exists = prev.some((m) => String(m.id) === String(newMovement.id));
            return exists ? prev : [newMovement, ...prev];
          }
        );

        // Show ambient toast for movements initiated by OTHER users
        const currentUserId = useAuthStore.getState().profile?.id;
        if (String(newMovement.performed_by) !== String(currentUserId)) {
          const typeLabel = {
            stock_in:   '📦 Stock received',
            stock_out:  '📤 Stock removed',
            sale:       '💳 Sale recorded',
            export:     '🚚 Stock exported',
            import:     '📥 Stock imported',
            adjustment: '🔧 Stock adjusted',
          }[newMovement.movement_type] ?? 'Stock updated';

          toast.info(`${typeLabel}`, {
            description: `${newMovement.quantity} unit(s) — updated by another user`,
            duration: 3000,
          });
        }
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setTimeout(() => movementsRef.current?.subscribe(), 3000);
        }
      });

    return () => {
      if (productsRef.current)  supabase.removeChannel(productsRef.current);
      if (movementsRef.current) supabase.removeChannel(movementsRef.current);
      productsRef.current  = null;
      movementsRef.current = null;
    };
  }, [branchId, queryClient]);
}
