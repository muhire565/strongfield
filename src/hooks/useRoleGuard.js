import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ROLE_ROUTES = {
  sales: [
    '/dashboard',
    '/dashboard/pos',
    '/dashboard/pos/new',
    '/dashboard/pos/sales',
    '/dashboard/pos/quotations',
    '/dashboard/pos/clients',
    '/dashboard/pos/payments',
  ],
  stock_manager: [
    '/dashboard',
    '/dashboard/products',
    '/dashboard/inventory',
  ],
  admin: [
    '/dashboard',
    '/admin',
    '/dashboard/pos',
    '/dashboard/pos/new',
    '/dashboard/pos/sales',
    '/dashboard/pos/quotations',
    '/dashboard/pos/clients',
    '/dashboard/pos/payments',
    '/dashboard/products',
    '/dashboard/inventory',
    '/dashboard/reports',
    '/dashboard/finance',
    '/dashboard/finance/capital',
    '/dashboard/finance/expenses',
    '/dashboard/finance/withdrawals',
    '/dashboard/finance/purchases',
    '/dashboard/finance/ledger',
  ],
};

export function useRoleGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role || 'sales';

  useEffect(() => {
    const allowed = ROLE_ROUTES[role] || ROLE_ROUTES.sales;
    const path = location.pathname;
    // Extract the route part after the branch prefix, e.g. /highway/dashboard/pos/new -> /dashboard/pos/new
    const segments = path.split('/');
    // path is like /highway/dashboard/pos/new
    // We need to check if the path (without branch prefix) starts with any allowed route
    const pathWithoutBranch = '/' + segments.slice(2).join('/');

    const isAllowed = allowed.some((route) => pathWithoutBranch === route || pathWithoutBranch.startsWith(route + '/'));

    if (!isAllowed) {
      // Navigate to dashboard overview, preserving branch prefix
      const branchPrefix = '/' + segments[1];
      navigate(branchPrefix + '/dashboard', { replace: true });
    }
  }, [location.pathname, role, navigate]);
}
