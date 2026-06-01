import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { inventoryService } from '../services/inventoryService';
import { toast } from 'sonner';

function getStockStatus(quantity, threshold) {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= threshold) return 'Low Stock';
  return 'In Stock';
}

export function useInventory(filters = {}) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['inventory', branchId, filters],
    queryFn:  () => inventoryService.list(filters),
    staleTime: 30_000,
    enabled:  !!branchId,
    refetchOnWindowFocus: true, // keep true for robustness
  });
}

export function useProductDetail(productId) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['inventory', 'product', productId, branchId],
    queryFn:  () => inventoryService.getOne(productId),
    staleTime: 15_000,
    enabled:  !!productId && !!branchId,
  });
}

export function useInventorySummary() {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['inventory', 'summary', branchId],
    queryFn:  () => inventoryService.getSummary(),
    staleTime: 30_000,
    enabled:  !!branchId,
  });
}

export function useStockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }) => inventoryService.stockIn(productId, data),

    onMutate: async ({ productId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      const snapshot = queryClient.getQueriesData({ queryKey: ['inventory'], exact: false });

      // Optimistic: increment quantity
      queryClient.setQueriesData({ queryKey: ['inventory'], exact: false }, (prev) => {
        if (!prev) return prev;
        const list = Array.isArray(prev) ? prev : (prev.data || []);
        if (!Array.isArray(list)) return prev;
        const updated = list.map((p) => {
          if (p.id !== productId) return p;
          const newQty = p.quantity + data.quantity;
          return {
            ...p,
            quantity: newQty,
            stock_value: parseFloat(((p.purchase_price || 0) * newQty).toFixed(2)),
            potential_sales_value: parseFloat(((p.price || 0) * newQty).toFixed(2)),
            stock_status: getStockStatus(newQty, p.low_stock_threshold),
          };
        });
        return Array.isArray(prev) ? updated : { ...prev, data: updated };
      });

      return { snapshot };
    },

    onSuccess: (res, { data }) => {
      toast.success('Stock added successfully', {
        description: `${data.quantity} unit(s) added. New total: ${res.data.quantity_after}`,
      });
    },

    onError: (err, _vars, context) => {
      context?.snapshot?.forEach(([key, value]) => queryClient.setQueryData(key, value));
      const message = err?.response?.data?.error || 'Failed to add stock. Please try again.';
      toast.error('Stock In failed', { description: message });
    },
  });
}

export function useStockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }) => inventoryService.stockOut(productId, data),

    onMutate: async ({ productId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      const snapshot = queryClient.getQueriesData({ queryKey: ['inventory'], exact: false });

      queryClient.setQueriesData({ queryKey: ['inventory'], exact: false }, (prev) => {
        if (!prev) return prev;
        const list = Array.isArray(prev) ? prev : (prev.data || []);
        if (!Array.isArray(list)) return prev;
        const updated = list.map((p) => {
          if (p.id !== productId) return p;
          const newQty = Math.max(0, p.quantity - data.quantity);
          return {
            ...p,
            quantity: newQty,
            stock_value: parseFloat(((p.purchase_price || 0) * newQty).toFixed(2)),
            potential_sales_value: parseFloat(((p.price || 0) * newQty).toFixed(2)),
            stock_status: getStockStatus(newQty, p.low_stock_threshold),
          };
        });
        return Array.isArray(prev) ? updated : { ...prev, data: updated };
      });

      return { snapshot };
    },

    onSuccess: (res, { data }) => {
      const remaining = res.data.quantity_after;
      toast.success('Stock removed successfully', {
        description: `${data.quantity} unit(s) removed. Remaining: ${remaining}`,
      });
      if (remaining === 0) {
        toast.warning('Product is now out of stock', {
          description: 'Consider restocking this item soon.',
          duration: 6000,
        });
      } else if (remaining <= 5) {
        toast.warning('Low stock alert', {
          description: `Only ${remaining} unit(s) remaining.`,
          duration: 6000,
        });
      }
    },

    onError: (err, _vars, context) => {
      context?.snapshot?.forEach(([key, value]) => queryClient.setQueryData(key, value));
      const message = err?.response?.data?.error || 'Failed to remove stock. Please try again.';
      toast.error('Stock Out failed', { description: message });
    },
  });
}
