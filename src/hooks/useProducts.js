import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { productsService } from '../services/productsService';
import { toast } from 'sonner';

// Stable base key — used by realtime hook and all mutations with exact:false
export const PRODUCTS_BASE_KEY = ['products'];

export function useProducts(filters = {}) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: [...PRODUCTS_BASE_KEY, branchId, filters],
    queryFn: () => productsService.list(filters),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!branchId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const branchId = useAuthStore((s) => s.profile?.branch_id);

  return useMutation({
    mutationFn: (data) => productsService.create(data),

    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_BASE_KEY });
      const snapshot = queryClient.getQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false });

      const tempId = `temp_${Date.now()}`;
      queryClient.setQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false }, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return [
          { ...newProduct, id: tempId, branch_id: branchId, created_at: new Date().toISOString(), _optimistic: true },
          ...prev,
        ];
      });

      return { snapshot, tempId };
    },

    onSuccess: (createdProduct, _vars, context) => {
      // Replace temp row with real server row
      queryClient.setQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false }, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((p) => (p.id === context.tempId ? { ...createdProduct, _optimistic: false } : p));
      });
      toast.success('Product added', {
        description: `${createdProduct.name} has been added to inventory.`,
      });
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        context.snapshot.forEach(([key, value]) => queryClient.setQueryData(key, value));
      }
      toast.error('Failed to add product', {
        description: 'Please check your connection and try again.',
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => productsService.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_BASE_KEY });
      const snapshot = queryClient.getQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false });

      queryClient.setQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false }, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((p) => (p.id === id ? { ...p, ...data, _optimistic: true } : p));
      });

      return { snapshot };
    },

    onSuccess: (updatedProduct) => {
      queryClient.setQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false }, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((p) =>
          p.id === updatedProduct.id ? { ...updatedProduct, _optimistic: false } : p
        );
      });
      toast.success('Product updated', {
        description: `${updatedProduct.name} has been saved successfully.`,
      });
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        context.snapshot.forEach(([key, value]) => queryClient.setQueryData(key, value));
      }
      toast.error('Failed to update product', {
        description: 'Your changes could not be saved. Please try again.',
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => productsService.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_BASE_KEY });
      const snapshot = queryClient.getQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false });

      queryClient.setQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false }, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.filter((p) => p.id !== id);
      });

      return { snapshot };
    },

    onSuccess: () => {
      toast.success('Product deleted', {
        description: 'The product has been removed from inventory.',
      });
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        context.snapshot.forEach(([key, value]) => queryClient.setQueryData(key, value));
      }
      toast.error('Failed to delete product', {
        description: 'The product could not be deleted. Please try again.',
      });
    },
  });
}

export function useExportProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, payload }) => productsService.export(productId, payload),

    onMutate: async ({ productId, payload }) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_BASE_KEY });
      const snapshot = queryClient.getQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false });

      // Optimistically deduct exported quantity from source product
      queryClient.setQueriesData({ queryKey: PRODUCTS_BASE_KEY, exact: false }, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((p) =>
          p.id === productId
            ? { ...p, quantity: Math.max(0, p.quantity - payload.quantity), _optimistic: true }
            : p
        );
      });

      return { snapshot };
    },

    onSuccess: (result, { payload }) => {
      // Clear _optimistic flag
      queryClient.invalidateQueries({ queryKey: PRODUCTS_BASE_KEY });
      toast.success('Export successful', {
        description: `${payload.quantity} unit(s) exported successfully.`,
        duration: 5000,
      });
    },

    onError: (err, _vars, context) => {
      if (context?.snapshot) {
        context.snapshot.forEach(([key, value]) => queryClient.setQueryData(key, value));
      }
      const message = err?.message || 'Export failed. Please try again.';
      toast.error('Export failed', { description: message });
    },
  });
}

export function useProductExports() {
  return useQuery({
    queryKey: ['product-exports'],
    queryFn: () => productsService.listExports(),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
