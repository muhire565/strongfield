import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { inventoryService } from '../services/inventoryService';

export function useProductMovements(productId, filters = {}) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['movements', 'product', productId, filters],
    queryFn:  () => inventoryService.getMovements(productId, filters),
    staleTime: 15_000,
    enabled:  !!productId && !!branchId,
  });
}

export function useAllMovements(filters = {}) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['movements', branchId, filters],
    queryFn:  () => inventoryService.getAllMovements(filters),
    staleTime: 15_000,
    enabled:  !!branchId,
  });
}
