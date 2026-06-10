import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Landmark,
  Receipt,
  ClipboardList,
  Package,
  BarChart3,
  Wallet,
  Banknote,
  ReceiptText,
  ArrowUpCircle,
  Users,
  LogOut,
  ChevronDown,
  Store,
  Wifi,
  WifiOff,
  FileText,
} from 'lucide-react';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarSection } from './SidebarSection';
import { useAuthStore } from '../../store/authStore';
import { useInventory } from '../../hooks/useInventory';
import { useUnreadCount } from '../../hooks/useNotifications';
import { usePartialPaymentCount } from '../../hooks/usePOS';
import { useRealtimeStatus } from '../../hooks/useRealtimeStatus';

function useSidebarExpandState(key, defaultValue = true) {
  const [open, setOpen] = useState(() => {
    try {
      const stored = sessionStorage.getItem(`sidebar_expand_${key}`);
      return stored === null ? defaultValue : stored === 'true';
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(`sidebar_expand_${key}`, String(open));
    } catch {
      // noop
    }
  }, [key, open]);
  return [open, setOpen];
}

function ExpandableGroup({ label, icon: Icon, children, badge, autoExpandPaths = [] }) {
  const location = useLocation();
  const isActivePath = autoExpandPaths.some((p) => location.pathname.startsWith(p));
  const [open, setOpen] = useSidebarExpandState(label, isActivePath);
  const hasBadge = badge != null && badge > 0;

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-foreground`}
      >
        <Icon size={18} />
        <span className="flex-1 text-left">{label}</span>
        {hasBadge && (
          <span className="min-w-[20px] h-5 flex items-center justify-center text-[11px] font-bold text-white bg-red-500 rounded-full px-1.5">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-9 pr-1 pt-0.5 pb-1 space-y-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ branchName, mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuthStore();
  const status = useRealtimeStatus();
  const prefix = `/${branchName?.toLowerCase?.() || ''}`;

  // Live badge data
  const { data: inventoryData } = useInventory();
  const { data: unreadData } = useUnreadCount();
  const partialCount = usePartialPaymentCount();
  const lowStockCount = inventoryData?.data
    ? inventoryData.data.filter((p) => (p.quantity || 0) <= (p.low_stock_threshold || 0)).length
    : 0;
  const unreadCount = unreadData?.count ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate(`${prefix}/login`);
    if (onCloseMobile) onCloseMobile();
  };

  const isConnected = status === 'connected';

  return (
    <>
      {/* Desktop sidebar (always visible) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] bg-card border-r border-border z-50">
        <SidebarContent
          prefix={prefix}
          branchName={branchName}
          profile={profile}
          lowStockCount={lowStockCount}
          unreadCount={unreadCount}
          partialCount={partialCount}
          isConnected={isConnected}
          location={location}
          onLogout={handleLogout}
          onNavClick={() => {}}
        />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-card border-r border-border z-50 flex flex-col lg:hidden"
            >
              <SidebarContent
                prefix={prefix}
                branchName={branchName}
                profile={profile}
                lowStockCount={lowStockCount}
                unreadCount={unreadCount}
                partialCount={partialCount}
                isConnected={isConnected}
                location={location}
                onLogout={handleLogout}
                onNavClick={onCloseMobile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ prefix, branchName, profile, lowStockCount, unreadCount, partialCount, isConnected, location, onLogout, onNavClick }) {
  const posBadge = partialCount ?? 0;
  const role = profile?.role || 'sales';
  const isAdmin = role === 'admin';
  const isSales = role === 'sales';
  const isStockManager = role === 'stock_manager';

  return (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
        <Store className="w-6 h-6 text-teal-400 mr-2" />
        <span className="font-bold text-lg text-foreground tracking-tight">Strongfield EMS</span>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* All roles: Overview */}
        <SidebarSection>
          <SidebarNavItem to={`${prefix}/dashboard`} icon={LayoutDashboard} label="Overview" exact onClick={onNavClick} />
          {isAdmin && (
            <SidebarNavItem to={`${prefix}/admin`} icon={Users} label="Users" onClick={onNavClick} />
          )}
        </SidebarSection>

        {/* POS section: visible to admin and sales only */}
        {(isAdmin || isSales) && (
          <SidebarSection title="Point of Sale">
            <ExpandableGroup
              label="POS"
              icon={ShoppingCart}
              badge={posBadge}
              autoExpandPaths={[`${prefix}/dashboard/pos`]}
            >
              <SidebarNavItem to={`${prefix}/dashboard/pos/new`} label="New Sale" onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/pos/sales`} label="Sales" badge={posBadge} onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/pos/quotations`} label="Quotations" onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/pos/clients`} label="Clients" onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/pos/payments`} label="Payments" onClick={onNavClick} />
            </ExpandableGroup>
          </SidebarSection>
        )}

        {/* Business section: visible to admin and stock_manager */}
        {(isAdmin || isStockManager) && (
          <SidebarSection title="Business">
            <SidebarNavItem to={`${prefix}/dashboard/products`} icon={Package} label="Products" onClick={onNavClick} />
            <SidebarNavItem to={`${prefix}/dashboard/inventory`} icon={ClipboardList} label="Inventory" badge={lowStockCount} badgeColor="bg-amber-500" onClick={onNavClick} />
            {isAdmin && (
              <SidebarNavItem to={`${prefix}/dashboard/reports`} icon={BarChart3} label="Reports" onClick={onNavClick} />
            )}
          </SidebarSection>
        )}

        {/* Finance section: admin only */}
        {isAdmin && (
          <SidebarSection title="Finance">
            <ExpandableGroup
              label="Finance"
              icon={Landmark}
              autoExpandPaths={[`${prefix}/dashboard/finance`]}
            >
              <SidebarNavItem to={`${prefix}/dashboard/finance`} label="Overview" onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/finance/capital`} label="Capital" onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/finance/expenses`} label="Expenses" onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/finance/withdrawals`} label="Withdrawals" onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/finance/purchases`} label="Purchases" onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/finance/suppliers`} label="Suppliers" onClick={onNavClick} />
              <SidebarNavItem to={`${prefix}/dashboard/finance/ledger`} label="Ledger" onClick={onNavClick} />
            </ExpandableGroup>
          </SidebarSection>
        )}
      </div>

      {/* Footer: user + logout + status */}
      <div className="shrink-0 border-t border-border px-4 py-3 space-y-3">
        {/* Connection status */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {isConnected ? (
            <>
              <Wifi size={12} className="text-green-400" />
              <span className="text-green-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-red-400" />
              <span className="text-red-400">Offline</span>
            </>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold text-xs">
            {(profile?.full_name || profile?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || profile?.username || 'User'}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] text-muted-foreground truncate capitalize">{profile?.role || 'Member'}</p>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">· {branchName}</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
