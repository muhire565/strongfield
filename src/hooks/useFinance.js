import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { financeService } from '../services/financeService';

export function useBalances() {
  return useQuery({
    queryKey: ['finance', 'balances'],
    queryFn: () => financeService.getBalances().then(r => r.data),
  });
}

export function useCapital(params = {}) {
  return useQuery({
    queryKey: ['finance', 'capital', params],
    queryFn: () => financeService.listCapital(params).then(r => r.data),
  });
}

export function useInjectCapital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeService.injectCapital,
    onSuccess: (res) => {
      toast.success(`Capital injected — UGX ${formatUGX(res.data.new_balance)} new balance`);
      qc.invalidateQueries({ queryKey: ['finance', 'balances'] });
      qc.invalidateQueries({ queryKey: ['finance', 'capital'] });
      qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to inject capital'),
  });
}

export function useExpenses(params = {}) {
  return useQuery({
    queryKey: ['finance', 'expenses', params],
    queryFn: () => financeService.listExpenses(params).then(r => ({ data: r.data, count: r.count })),
  });
}

export function useRecordExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeService.recordExpense,
    onSuccess: (res) => {
      toast.success(`Expense recorded — ${res.data.expense_number}`);
      qc.invalidateQueries({ queryKey: ['finance', 'balances'] });
      qc.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to record expense'),
  });
}

export function useWithdrawals(params = {}) {
  return useQuery({
    queryKey: ['finance', 'withdrawals', params],
    queryFn: () => financeService.listWithdrawals(params).then(r => ({ data: r.data, count: r.count })),
  });
}

export function useRecordWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeService.recordWithdrawal,
    onSuccess: (res) => {
      toast.success(`Withdrawal recorded — ${res.data.withdrawal_number}`);
      qc.invalidateQueries({ queryKey: ['finance', 'balances'] });
      qc.invalidateQueries({ queryKey: ['finance', 'withdrawals'] });
      qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to record withdrawal'),
  });
}

export function usePurchases(params = {}) {
  return useQuery({
    queryKey: ['finance', 'purchases', params],
    queryFn: () => financeService.listPurchases(params).then(r => ({ data: r.data, count: r.count })),
  });
}

export function useRecordPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeService.recordPurchase,
    onSuccess: (res) => {
      toast.success(`Purchase recorded — ${res.data.purchase_number}`);
      qc.invalidateQueries({ queryKey: ['finance', 'balances'] });
      qc.invalidateQueries({ queryKey: ['finance', 'purchases'] });
      qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
      qc.invalidateQueries({ queryKey: ['finance', 'suppliers'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to record purchase'),
  });
}

export function useSuppliers(params = {}) {
  return useQuery({
    queryKey: ['finance', 'suppliers', params],
    queryFn: () => financeService.listSuppliers(params).then(r => ({ data: r.data, count: r.count })),
  });
}

export function useSupplier(id) {
  return useQuery({
    queryKey: ['finance', 'supplier', id],
    queryFn: () => financeService.getSupplier(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeService.createSupplier,
    onSuccess: () => {
      toast.success('Supplier created');
      qc.invalidateQueries({ queryKey: ['finance', 'suppliers'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to create supplier'),
  });
}

export function useSupplierPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => financeService.supplierPayment(id, body),
    onSuccess: (_, vars) => {
      toast.success('Supplier payment recorded');
      qc.invalidateQueries({ queryKey: ['finance', 'suppliers'] });
      qc.invalidateQueries({ queryKey: ['finance', 'supplier', vars.id] });
      qc.invalidateQueries({ queryKey: ['finance', 'balances'] });
      qc.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      qc.invalidateQueries({ queryKey: ['finance', 'purchases'] });
      qc.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
    onError: (err) => toast.error(err.message || 'Payment failed'),
  });
}

export function useTransactions(params = {}) {
  return useQuery({
    queryKey: ['finance', 'transactions', params],
    queryFn: () => financeService.listTransactions(params).then(r => ({ data: r.data, count: r.count })),
  });
}

export function useFinanceSummary(params = {}) {
  return useQuery({
    queryKey: ['finance', 'summary', params],
    queryFn: () => financeService.getSummary(params).then(r => r.data),
  });
}

export function useCashflow(params = {}) {
  return useQuery({
    queryKey: ['finance', 'cashflow', params],
    queryFn: () => financeService.getCashflow(params).then(r => r.data),
  });
}

function formatUGX(val) {
  if (val == null) return '0';
  return Number(val).toLocaleString('en-UG');
}
