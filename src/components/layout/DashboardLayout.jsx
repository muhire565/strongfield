import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Users, ShoppingCart, Package, LogOut, Menu, X, Zap, Warehouse, ShoppingBag, ChevronDown, ChevronUp, Landmark, BarChart3 } from 'lucide-react';
import { PageTransition } from './PageTransition';
import { productsService } from '../../services/productsService';

export default function DashboardLayout({ branchName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const { profile, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const branchColor = branchName === 'HIGHWAY' ? '#3b82f6' : '#14b8a6';
  const branchId = profile?.branch_id;

  const toggleMenu = (name) => setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));

  const handleLogout = async () => {
    await logout();
    navigate(`/${branchName.toLowerCase()}/login`);
  };

  const navItems = [
    { name: 'Overview',  path: `/${branchName.toLowerCase()}/dashboard`,          icon: LayoutDashboard, roles: ['admin', 'sales', 'stock_manager'] },
    { name: 'Users',     path: `/${branchName.toLowerCase()}/admin`,               icon: Users,           roles: ['admin'] },
    { name: 'Products',  path: `/${branchName.toLowerCase()}/dashboard/products`,  icon: Package,         roles: ['admin'] },
    { name: 'Inventory', path: `/${branchName.toLowerCase()}/dashboard/inventory`, icon: Warehouse,       roles: ['admin'] },
    { 
      name: 'POS', 
      icon: ShoppingBag, 
      roles: ['admin'],
      subItems: [
        { name: 'New Sale', path: `/${branchName.toLowerCase()}/dashboard/pos/new` },
        { name: 'Sales', path: `/${branchName.toLowerCase()}/dashboard/pos/sales` },
        { name: 'Quotations', path: `/${branchName.toLowerCase()}/dashboard/pos/quotations` },
        { name: 'Clients', path: `/${branchName.toLowerCase()}/dashboard/pos/clients` },
        { name: 'Payments', path: `/${branchName.toLowerCase()}/dashboard/pos/payments` },
      ]
    },
    {
      name: 'Finance',
      icon: Landmark,
      roles: ['admin'],
      subItems: [
        { name: 'Overview', path: `/${branchName.toLowerCase()}/dashboard/finance` },
        { name: 'Capital', path: `/${branchName.toLowerCase()}/dashboard/finance/capital` },
        { name: 'Expenses', path: `/${branchName.toLowerCase()}/dashboard/finance/expenses` },
        { name: 'Withdrawals', path: `/${branchName.toLowerCase()}/dashboard/finance/withdrawals` },
        { name: 'Purchases', path: `/${branchName.toLowerCase()}/dashboard/finance/purchases` },
        { name: 'Ledger', path: `/${branchName.toLowerCase()}/dashboard/finance/ledger` },
      ]
    },
    { name: 'Reports',   path: `/${branchName.toLowerCase()}/dashboard/reports`,  icon: BarChart3,       roles: ['admin'] },
    { name: 'Sales',     path: `/${branchName.toLowerCase()}/sales`,               icon: ShoppingCart,    roles: ['admin', 'sales'] },
    { name: 'Stock',     path: `/${branchName.toLowerCase()}/stock`,               icon: Package,         roles: ['admin', 'stock_manager'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(profile?.role));

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    const titles = {
      dashboard: 'Overview',
      admin:     'User Management',
      products:  'Products',
      inventory: 'Inventory',
      sales:     'Sales List',
      stock:     'Stock & Inventory',
      new:       'New Sale',
      quotations:'Quotations',
      clients:   'Clients',
      payments:  'Payments Summary',
      finance:   'Finance',
      capital:   'Capital',
      expenses:  'Expenses',
      withdrawals: 'Withdrawals',
      purchases: 'Purchases',
      ledger:    'Ledger',
      reports:   'Reports',
    };
    return titles[path] || 'Dashboard';
  };

  const handleProductsHover = () => {
    if (!branchId) return;
    queryClient.prefetchQuery({
      queryKey: ['products', branchId, {}],
      queryFn: () => productsService.list(),
      staleTime: 30 * 1000,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: branchColor }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-foreground">{branchName}</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-foreground p-1">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 h-full flex flex-col">
          <div className="hidden md:flex items-center space-x-3 mb-8 px-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${branchColor}, ${branchColor}dd)` }}
            >
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm tracking-wide">{branchName}</p>
              <p className="text-xs text-muted-foreground">Strongfield Electrical</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              
              if (item.subItems) {
                const isAnyChildActive = item.subItems.some(sub => location.pathname === sub.path);
                const isOpen = openMenus[item.name] !== undefined ? openMenus[item.name] : isAnyChildActive;

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isAnyChildActive ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground hover:bg-accent`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </div>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isOpen && (
                      <div className="pl-9 space-y-1">
                        {item.subItems.map(sub => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <button
                              key={sub.path}
                              onClick={() => {
                                navigate(sub.path);
                                setSidebarOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                                isSubActive
                                  ? 'text-primary bg-primary/10'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                              }`}
                            >
                              {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.path;
              const isProducts = item.name === 'Products';
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  onMouseEnter={isProducts ? handleProductsHover : undefined}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  style={isActive ? { background: `linear-gradient(135deg, ${branchColor}, ${branchColor}cc)` } : {}}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-border mt-auto">
            <div className="flex items-center space-x-3 px-3 py-3 mb-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${branchColor}, ${branchColor}bb)` }}
              >
                {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-card/80 backdrop-blur-md border-b border-border z-10 sticky top-0">
          <h2 className="text-lg font-bold text-foreground">{getPageTitle()}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome back, <span className="text-foreground font-medium">{profile?.full_name}</span>
            </span>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
