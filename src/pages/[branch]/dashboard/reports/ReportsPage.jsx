import React from 'react';
import {
  LayoutDashboard, FileText, Scale, Banknote, ShoppingCart,
  Package, Users, CreditCard, Landmark, BookOpen,
  GitCompare, BarChart3, TrendingUp
} from 'lucide-react';
import { useReportStore } from '../../../../store/useReportStore';
import PeriodSelector from '../../../../components/reports/PeriodSelector';
import DashboardTab from './DashboardTab';
import IncomeStatementTab from './IncomeStatementTab';
import BalanceSheetTab from './BalanceSheetTab';
import CashFlowTab from './CashFlowTab';
import SalesReportTab from './SalesReportTab';
import InventoryReportTab from './InventoryReportTab';
import CreditReportTab from './CreditReportTab';
import ExpensesReportTab from './ExpensesReportTab';
import OwnerEquityTab from './OwnerEquityTab';
import TrialBalanceTab from './TrialBalanceTab';
import GeneralLedgerTab from './GeneralLedgerTab';
import ComparativeTab from './ComparativeTab';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'income', label: 'Income Statement', icon: TrendingUp },
  { key: 'balance', label: 'Balance Sheet', icon: Scale },
  { key: 'cashflow', label: 'Cash Flow', icon: Banknote },
  { key: 'sales', label: 'Sales Report', icon: ShoppingCart },
  { key: 'inventory', label: 'Inventory', icon: Package },
  { key: 'credit', label: 'Credit Report', icon: Users },
  { key: 'expenses', label: 'Expenses', icon: CreditCard },
  { key: 'equity', label: 'Owner Equity', icon: Landmark },
  { key: 'ledger', label: 'General Ledger', icon: BookOpen },
  { key: 'comparative', label: 'Comparative', icon: GitCompare },
];

export default function ReportsPage() {
  const { activeTab, setActiveTab } = useReportStore();

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'income': return <IncomeStatementTab />;
      case 'balance': return <BalanceSheetTab />;
      case 'cashflow': return <CashFlowTab />;
      case 'sales': return <SalesReportTab />;
      case 'inventory': return <InventoryReportTab />;
      case 'credit': return <CreditReportTab />;
      case 'expenses': return <ExpensesReportTab />;
      case 'equity': return <OwnerEquityTab />;
      case 'ledger': return <GeneralLedgerTab />;
      case 'comparative': return <ComparativeTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-sm text-muted-foreground">Financial intelligence & analytics</p>
          </div>
        </div>
        <PeriodSelector />
      </div>

      {/* Tabs */}
      <div className="border-b border-border overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max pb-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="min-h-[400px]">
        {renderTab()}
      </div>
    </div>
  );
}
