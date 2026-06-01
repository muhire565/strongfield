import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posService } from '../services/posService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

// Clients
export function useClients(filters = {}) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['pos', 'clients', branchId, filters],
    queryFn: () => posService.listClients(filters),
    enabled: !!branchId,
    staleTime: 60_000,
  });
}

export function useClientDetail(id) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['pos', 'client', id, branchId],
    queryFn: () => posService.getClient(id),
    enabled: !!id && !!branchId,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => posService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'clients'] });
      toast.success('Client created successfully');
    },
    onError: (err) => toast.error('Failed to create client', { description: err.message }),
  });
}

// Sales
export function usePartialPaymentCount() {
  const { data } = useSales({ status: 'partial', limit: 1 });
  return data?.count ?? 0;
}

export function useSales(filters = {}) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['pos', 'sales', branchId, filters],
    queryFn: () => posService.listSales(filters),
    enabled: !!branchId,
  });
}

export function useSaleDetail(id) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['pos', 'sale', id, branchId],
    queryFn: () => posService.getSale(id),
    enabled: !!id && !!branchId,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => posService.createSale(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Sale confirmed', { description: `Invoice: ${res.sale_number}` });
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || err.message;
      toast.error('Failed to confirm sale', { description: msg });
    },
  });
}

// Payments
export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ saleId, data }) => posService.recordPayment(saleId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'sale'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'client'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'payments'] });
      toast.success('Payment recorded', { description: `New Balance: UGX ${res.data.new_balance}` });
    },
    onError: (err) => toast.error('Failed to record payment', { description: err.message }),
  });
}

export function usePaymentsByMode(filters = {}) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['pos', 'payments', 'mode', branchId, filters],
    queryFn: () => posService.getPaymentsByMode(filters),
    enabled: !!branchId,
  });
}

// Summary
export function useSummary() {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['pos', 'summary', branchId],
    queryFn: () => posService.getSummary(),
    enabled: !!branchId,
    staleTime: 30_000,
  });
}

// Quotations
export function useQuotations(filters = {}) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['pos', 'quotations', branchId, filters],
    queryFn: () => posService.listQuotations(filters),
    enabled: !!branchId,
  });
}

export function useQuotationDetail(id) {
  const branchId = useAuthStore((s) => s.profile?.branch_id);
  return useQuery({
    queryKey: ['pos', 'quotation', id, branchId],
    queryFn: () => posService.getQuotation(id),
    enabled: !!id && !!branchId,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => posService.createQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'quotations'] });
      toast.success('Quotation created');
    },
    onError: (err) => toast.error('Failed to create quotation', { description: err.message }),
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => posService.updateQuotation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'quotations'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'quotation'] });
      toast.success('Quotation updated');
    },
    onError: (err) => toast.error('Failed to update quotation', { description: err.message }),
  });
}

export function useConvertQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => posService.convertQuotation(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'quotations'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Quotation converted to sale', { description: `Invoice: ${res.data.sale_number}` });
    },
    onError: (err) => toast.error('Conversion failed', { description: err.message }),
  });
}

export function useCancelQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => posService.cancelQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'quotations'] });
      toast.success('Quotation cancelled');
    },
    onError: (err) => toast.error('Failed to cancel quotation', { description: err.message }),
  });
}

// Void Sale
export function useVoidSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => posService.voidSale(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'sales'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'sale'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Sale voided');
    },
    onError: (err) => toast.error('Failed to void sale', { description: err.message }),
  });
}
