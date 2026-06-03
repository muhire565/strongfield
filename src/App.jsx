import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Eagerly loaded
import Home from './pages/Home';
import HighwayLogin from './pages/highway/Login';
import MainLogin from './pages/main/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy loaded dashboards
const AdminDashboardHighway = lazy(() => import('./pages/highway/dashboard/AdminDashboard'));
const SalesDashboardHighway = lazy(() => import('./pages/highway/dashboard/SalesDashboard'));
const StockDashboardHighway = lazy(() => import('./pages/highway/dashboard/StockDashboard'));

const AdminDashboardMain = lazy(() => import('./pages/main/dashboard/AdminDashboard'));
const SalesDashboardMain = lazy(() => import('./pages/main/dashboard/SalesDashboard'));
const StockDashboardMain = lazy(() => import('./pages/main/dashboard/StockDashboard'));

const ProductsPageHighway = lazy(() => import('./pages/highway/dashboard/ProductsPage'));
const ProductsPageMain = lazy(() => import('./pages/main/dashboard/ProductsPage'));

const InventoryPage = lazy(() => import('./pages/[branch]/dashboard/InventoryPage'));

const NewSalePage = lazy(() => import('./pages/[branch]/dashboard/pos/NewSalePage'));
const SalesListPage = lazy(() => import('./pages/[branch]/dashboard/pos/SalesListPage'));
const QuotationsListPage = lazy(() => import('./pages/[branch]/dashboard/pos/QuotationsListPage'));
const ClientsPage = lazy(() => import('./pages/[branch]/dashboard/pos/ClientsPage'));
const PaymentsSummaryPage = lazy(() => import('./pages/[branch]/dashboard/pos/PaymentsSummaryPage'));

const FinanceOverviewPage = lazy(() => import('./pages/[branch]/dashboard/finance/FinanceOverviewPage'));
const CapitalPage = lazy(() => import('./pages/[branch]/dashboard/finance/CapitalPage'));
const ExpensesPage = lazy(() => import('./pages/[branch]/dashboard/finance/ExpensesPage'));
const WithdrawalsPage = lazy(() => import('./pages/[branch]/dashboard/finance/WithdrawalsPage'));
const PurchasesPage = lazy(() => import('./pages/[branch]/dashboard/finance/PurchasesPage'));
const SuppliersPage = lazy(() => import('./pages/[branch]/dashboard/finance/SuppliersPage'));
const LedgerPage = lazy(() => import('./pages/[branch]/dashboard/finance/LedgerPage'));
const OverviewPage = lazy(() => import('./pages/[branch]/dashboard/OverviewPage'));
const ReportsPage = lazy(() => import('./pages/[branch]/dashboard/reports/ReportsPage'));

function LoadingFallback() {
  return (
    <div className="flex-1 h-full flex items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  const initializeAuth = useAuthStore(state => state.initialize);
  const loading = useAuthStore(state => state.loading);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Highway Routes */}
        <Route path="/highway/login" element={<HighwayLogin />} />
        <Route path="/highway" element={<ProtectedRoute branchName="HIGHWAY" />}>
          <Route element={<DashboardLayout branchName="HIGHWAY" />}>
            <Route path="dashboard" element={
              <Suspense fallback={<LoadingFallback />}>
                <OverviewPage />
              </Suspense>
            } />
            <Route path="admin" element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboardHighway />
              </Suspense>
            } />
            <Route path="sales" element={
              <Suspense fallback={<LoadingFallback />}>
                <SalesDashboardHighway />
              </Suspense>
            } />
            <Route path="stock" element={
              <Suspense fallback={<LoadingFallback />}>
                <StockDashboardHighway />
              </Suspense>
            } />
            <Route path="dashboard/products" element={
              <Suspense fallback={<LoadingFallback />}>
                <ProductsPageHighway />
              </Suspense>
            } />
            <Route path="dashboard/inventory" element={
              <Suspense fallback={<LoadingFallback />}>
                <InventoryPage />
              </Suspense>
            } />
            <Route path="dashboard/pos/new" element={
              <Suspense fallback={<LoadingFallback />}><NewSalePage /></Suspense>
            } />
            <Route path="dashboard/pos/sales" element={
              <Suspense fallback={<LoadingFallback />}><SalesListPage /></Suspense>
            } />
            <Route path="dashboard/pos/quotations" element={
              <Suspense fallback={<LoadingFallback />}><QuotationsListPage /></Suspense>
            } />
            <Route path="dashboard/pos/clients" element={
              <Suspense fallback={<LoadingFallback />}><ClientsPage /></Suspense>
            } />
            <Route path="dashboard/pos/payments" element={
              <Suspense fallback={<LoadingFallback />}><PaymentsSummaryPage /></Suspense>
            } />
            <Route path="dashboard/finance" element={
              <Suspense fallback={<LoadingFallback />}><FinanceOverviewPage /></Suspense>
            } />
            <Route path="dashboard/finance/capital" element={
              <Suspense fallback={<LoadingFallback />}><CapitalPage /></Suspense>
            } />
            <Route path="dashboard/finance/expenses" element={
              <Suspense fallback={<LoadingFallback />}><ExpensesPage /></Suspense>
            } />
            <Route path="dashboard/finance/withdrawals" element={
              <Suspense fallback={<LoadingFallback />}><WithdrawalsPage /></Suspense>
            } />
            <Route path="dashboard/finance/purchases" element={
              <Suspense fallback={<LoadingFallback />}><PurchasesPage /></Suspense>
            } />
            <Route path="dashboard/finance/suppliers" element={
              <Suspense fallback={<LoadingFallback />}><SuppliersPage /></Suspense>
            } />
            <Route path="dashboard/finance/ledger" element={
              <Suspense fallback={<LoadingFallback />}><LedgerPage /></Suspense>
            } />
            <Route path="dashboard/reports" element={
              <Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense>
            } />
          </Route>
        </Route>

        {/* Main Routes */}
        <Route path="/main/login" element={<MainLogin />} />
        <Route path="/main" element={<ProtectedRoute branchName="MAIN" />}>
          <Route element={<DashboardLayout branchName="MAIN" />}>
            <Route path="dashboard" element={
              <Suspense fallback={<LoadingFallback />}>
                <OverviewPage />
              </Suspense>
            } />
            <Route path="admin" element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboardMain />
              </Suspense>
            } />
            <Route path="sales" element={
              <Suspense fallback={<LoadingFallback />}>
                <SalesDashboardMain />
              </Suspense>
            } />
            <Route path="stock" element={
              <Suspense fallback={<LoadingFallback />}>
                <StockDashboardMain />
              </Suspense>
            } />
            <Route path="dashboard/products" element={
              <Suspense fallback={<LoadingFallback />}>
                <ProductsPageMain />
              </Suspense>
            } />
            <Route path="dashboard/inventory" element={
              <Suspense fallback={<LoadingFallback />}>
                <InventoryPage />
              </Suspense>
            } />
            <Route path="dashboard/pos/new" element={
              <Suspense fallback={<LoadingFallback />}><NewSalePage /></Suspense>
            } />
            <Route path="dashboard/pos/sales" element={
              <Suspense fallback={<LoadingFallback />}><SalesListPage /></Suspense>
            } />
            <Route path="dashboard/pos/quotations" element={
              <Suspense fallback={<LoadingFallback />}><QuotationsListPage /></Suspense>
            } />
            <Route path="dashboard/pos/clients" element={
              <Suspense fallback={<LoadingFallback />}><ClientsPage /></Suspense>
            } />
            <Route path="dashboard/pos/payments" element={
              <Suspense fallback={<LoadingFallback />}><PaymentsSummaryPage /></Suspense>
            } />
            <Route path="dashboard/finance" element={
              <Suspense fallback={<LoadingFallback />}><FinanceOverviewPage /></Suspense>
            } />
            <Route path="dashboard/finance/capital" element={
              <Suspense fallback={<LoadingFallback />}><CapitalPage /></Suspense>
            } />
            <Route path="dashboard/finance/expenses" element={
              <Suspense fallback={<LoadingFallback />}><ExpensesPage /></Suspense>
            } />
            <Route path="dashboard/finance/withdrawals" element={
              <Suspense fallback={<LoadingFallback />}><WithdrawalsPage /></Suspense>
            } />
            <Route path="dashboard/finance/purchases" element={
              <Suspense fallback={<LoadingFallback />}><PurchasesPage /></Suspense>
            } />
            <Route path="dashboard/finance/suppliers" element={
              <Suspense fallback={<LoadingFallback />}><SuppliersPage /></Suspense>
            } />
            <Route path="dashboard/finance/ledger" element={
              <Suspense fallback={<LoadingFallback />}><LedgerPage /></Suspense>
            } />
            <Route path="dashboard/reports" element={
              <Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense>
            } />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
