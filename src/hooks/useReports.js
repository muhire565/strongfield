import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { reportsService } from '../services/reportsService';

const STALE = 5 * 60_000;

function useBranchId() {
  return useAuthStore((s) => s.profile?.branch_id);
}

export function useIncomeStatement(from, to) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'income', branchId, from, to],
    queryFn: () => reportsService.incomeStatement(from, to),
    enabled: !!branchId && !!from && !!to,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useBalanceSheet(asAt) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'balance', branchId, asAt],
    queryFn: () => reportsService.balanceSheet(asAt),
    enabled: !!branchId && !!asAt,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useCashFlow(from, to) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'cashflow', branchId, from, to],
    queryFn: () => reportsService.cashFlow(from, to),
    enabled: !!branchId && !!from && !!to,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useSalesReport(from, to, groupBy = 'day') {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'sales', branchId, from, to, groupBy],
    queryFn: () => reportsService.salesReport(from, to, groupBy),
    enabled: !!branchId && !!from && !!to,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useInventoryReport(from, to) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'inventory', branchId, from, to],
    queryFn: () => reportsService.inventoryReport(from, to),
    enabled: !!branchId && !!from && !!to,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useCreditReport(from, to) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'credit', branchId, from, to],
    queryFn: () => reportsService.creditReport(from, to),
    enabled: !!branchId && !!from && !!to,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function usePaymentModeReport(from, to) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'pmodes', branchId, from, to],
    queryFn: () => reportsService.paymentModeReport(from, to),
    enabled: !!branchId && !!from && !!to,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useExpensesReport(from, to) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'expenses', branchId, from, to],
    queryFn: () => reportsService.expensesReport(from, to),
    enabled: !!branchId && !!from && !!to,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useOwnerEquity(from, to) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'equity', branchId, from, to],
    queryFn: () => reportsService.ownerEquity(from, to),
    enabled: !!branchId && !!from && !!to,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useTrialBalance(asAt) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'trial', branchId, asAt],
    queryFn: () => reportsService.trialBalance(asAt),
    enabled: !!branchId && !!asAt,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useGeneralLedger(from, to, type) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'ledger', branchId, from, to, type],
    queryFn: () => reportsService.generalLedger(from, to, type),
    enabled: !!branchId && !!from && !!to,
    staleTime: 2 * 60_000, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useComparative(p1From, p1To, p2From, p2To) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'comparative', branchId, p1From, p1To, p2From, p2To],
    queryFn: () => reportsService.comparative(p1From, p1To, p2From, p2To),
    enabled: !!branchId && !!p1From && !!p1To && !!p2From && !!p2To,
    staleTime: STALE, refetchOnWindowFocus: false, retry: 1,
  });
}

export function useReportSummary(from, to) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: ['reports', 'summary', branchId, from, to],
    queryFn: () => reportsService.summary(from, to),
    enabled: !!branchId && !!from && !!to,
    staleTime: 2 * 60_000, refetchOnWindowFocus: false, retry: 1,
  });
}
