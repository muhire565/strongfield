import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useNotificationsRealtime } from '../../hooks/useNotificationsRealtime';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ActivityFeedPanel } from '../activity/ActivityFeedPanel';

function getPageTitle(pathname) {
  const path = pathname.split('/').pop();
  const titles = {
    dashboard: 'Overview',
    admin: 'User Management',
    products: 'Products',
    inventory: 'Inventory',
    sales: 'Sales List',
    stock: 'Stock & Inventory',
    new: 'New Sale',
    quotations: 'Quotations',
    clients: 'Clients',
    payments: 'Payments Summary',
    finance: 'Finance',
    capital: 'Capital',
    expenses: 'Expenses',
    withdrawals: 'Withdrawals',
    purchases: 'Purchases',
    ledger: 'Ledger',
    reports: 'Reports',
  };
  return titles[path] || 'Dashboard';
}

export default function DashboardLayout({ branchName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useNotificationsRealtime();
  useRoleGuard();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar branchName={branchName} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="lg:ml-[240px] transition-all duration-300">
        <TopBar
          title={getPageTitle(location.pathname)}
          branchName={branchName}
          onToggleMobileSidebar={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-8 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>

      <ActivityFeedPanel />
    </div>
  );
}
