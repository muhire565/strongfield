import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Banknote, Smartphone, CreditCard, Landmark,
  TrendingUp, Activity, ArrowDownLeft, ArrowUpRight,
  Package, AlertTriangle, PackageX, Boxes, BarChart3,
  ShoppingCart, CircleDollarSign,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useBalances, useFinanceSummary } from '../../../hooks/useFinance';
import { useSummary as usePOSSummary } from '../../../hooks/usePOS';
import { useInventorySummary } from '../../../hooks/useInventory';
import { useFinanceRealtime } from '../../../hooks/useFinanceRealtime';
import { formatUGX } from '../../../utils/formatters';

/* ------------------------------------------------------------------ */
/*  Reusable stat card                                                 */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, subValue, color = 'text-foreground', href, delay = 0 }) {
  const Wrapper = href ? motion.a : motion.div;
  const wrapperProps = href ? { href, onClick: (e) => { e.preventDefault(); } } : {};

  return (
    <Wrapper
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}
      {...wrapperProps}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('400', '500/15').replace('500', '500/15').replace('600', '500/15')}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <div className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</div>
      {subValue && <div className="text-xs text-muted-foreground mt-1">{subValue}</div>}
    </Wrapper>
  );
}

/* ------------------------------------------------------------------ */
/*  Section divider                                                    */
/* ------------------------------------------------------------------ */
function SectionTitle({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-2">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="text-lg font-semibold">{title}</h2>
      {count !== undefined && (
        <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
          {count} cards
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function OverviewPage() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id;
  const isStockManager = profile?.role === 'stock_manager';

  useFinanceRealtime(branchId);

  /* ── Data ── */
  const { data: balances } = useBalances();
  const { data: finSummary } = useFinanceSummary({});
  const { data: posSummary } = usePOSSummary();
  const { data: invSummary } = useInventorySummary();

  /* ── Derived values ── */
  const balMap = useMemo(() => {
    const m = {};
    (balances || []).forEach(b => { m[b.payment_mode] = Number(b.balance); });
    return m;
  }, [balances]);

  const totalFunds = Object.values(balMap).reduce((a, b) => a + b, 0);

  const totalProducts = invSummary?.total ?? 0;
  const lowStock = invSummary?.lowStock ?? 0;
  const outOfStock = invSummary?.outOfStock ?? 0;
  const stockValue = invSummary?.stockValue ?? 0;
  const potentialProfit = invSummary?.potentialProfit ?? 0;


  const todaySales = posSummary?.sale_count ?? 0;
  const todayRevenue = posSummary?.total_revenue ?? 0;
  const todayPaid = posSummary?.total_paid ?? 0;

  const fin = finSummary || {};
  const capital = fin.capital?.total_injected ?? 0;
  const revenue = fin.revenue?.total_collected ?? 0;
  const expenses = fin.expenses?.total ?? 0;
  const withdrawals = fin.withdrawals?.total ?? 0;
  const grossProfit = fin.gross_profit ?? 0;
  const netProfit = fin.net_profit ?? 0;

  /* ── Card definitions (order of importance) ── */
  const cards = [
    ...(!isStockManager ? [{
      /* ===== SECTION 1: LIQUID MONEY (most important) ===== */
      section: 'Liquid Money',
      sectionIcon: Wallet,
      items: [
        { icon: Wallet, label: 'Total Available Funds', value: `USh ${formatUGX(totalFunds)}`, color: 'text-primary', delay: 0 },
        { icon: Banknote, label: 'Cash Balance', value: `USh ${formatUGX(balMap.cash || 0)}`, color: 'text-emerald-400', delay: 0.02 },
        { icon: Smartphone, label: 'MTN Mobile Money', value: `USh ${formatUGX(balMap.mtn_mobile_money || 0)}`, color: 'text-yellow-400', delay: 0.04 },
        { icon: Smartphone, label: 'Airtel Money', value: `USh ${formatUGX(balMap.airtel_money || 0)}`, color: 'text-red-400', delay: 0.06 },
        { icon: CreditCard, label: 'Bank Transfer', value: `USh ${formatUGX(balMap.bank_transfer || 0)}`, color: 'text-blue-400', delay: 0.08 },
      ]
    }] : []),

    ...(!isStockManager ? [{
      /* ===== SECTION 2: TODAY'S BUSINESS ===== */
      section: "Today's Business",
      sectionIcon: ShoppingCart,
      items: [
        { icon: ShoppingCart, label: 'Sales Today', value: todaySales.toString(), subValue: `USh ${formatUGX(todayRevenue)} revenue`, color: 'text-emerald-400', delay: 0.10 },
        { icon: CircleDollarSign, label: 'Collected Today', value: `USh ${formatUGX(todayPaid)}`, color: 'text-teal-400', delay: 0.12 },
        { icon: ArrowDownLeft, label: 'Cash Collected', value: `USh ${formatUGX(posSummary?.cash || 0)}`, color: 'text-emerald-400', delay: 0.14 },
        { icon: ArrowDownLeft, label: 'MoMo Collected', value: `USh ${formatUGX((posSummary?.mtn_mobile_money || 0) + (posSummary?.airtel_money || 0))}`, color: 'text-yellow-400', delay: 0.16 },
      ]
    }] : []),

    /* ===== SECTION 3: STOCK ALERTS ===== */
    {
      section: 'Stock Alerts',
      sectionIcon: AlertTriangle,
      items: [
        { icon: PackageX, label: 'Out of Stock', value: outOfStock.toString(), color: outOfStock > 0 ? 'text-red-500' : 'text-emerald-400', delay: 0.18 },
        { icon: AlertTriangle, label: 'Low Stock', value: lowStock.toString(), color: lowStock > 0 ? 'text-amber-400' : 'text-emerald-400', delay: 0.20 },
        { icon: Boxes, label: 'Total Products', value: totalProducts.toString(), color: 'text-blue-400', delay: 0.22 },
        ...(!isStockManager ? [{ icon: BarChart3, label: 'Stock Value', value: `USh ${formatUGX(stockValue)}`, color: 'text-purple-400', delay: 0.24 }] : []),
      ]
    },

    ...(!isStockManager ? [{
      /* ===== SECTION 4: PROFITABILITY ===== */
      section: 'Profitability',
      sectionIcon: TrendingUp,
      items: [
        { icon: TrendingUp, label: 'Gross Profit', value: `USh ${formatUGX(grossProfit)}`, color: grossProfit >= 0 ? 'text-teal-400' : 'text-red-400', delay: 0.26 },
        { icon: Activity, label: 'Net Profit', value: `USh ${formatUGX(netProfit)}`, color: netProfit >= 0 ? 'text-purple-400' : 'text-red-500', delay: 0.28 },
        { icon: TrendingUp, label: 'Potential Profit (Stock)', value: `USh ${formatUGX(potentialProfit)}`, color: 'text-indigo-400', delay: 0.30 },
      ]
    }] : []),

    ...(!isStockManager ? [{
      /* ===== SECTION 5: FINANCIAL DEEP DIVE ===== */
      section: 'Financial Health',
      sectionIcon: Landmark,
      items: [
        { icon: Landmark, label: 'Total Capital Injected', value: `USh ${formatUGX(capital)}`, color: 'text-blue-400', delay: 0.32 },
        { icon: ArrowDownLeft, label: 'Revenue Collected (All Time)', value: `USh ${formatUGX(revenue)}`, color: 'text-emerald-400', delay: 0.34 },
        { icon: ArrowUpRight, label: 'Total Expenses', value: `USh ${formatUGX(expenses)}`, color: 'text-red-400', delay: 0.36 },
        { icon: Wallet, label: 'Total Withdrawals', value: `USh ${formatUGX(withdrawals)}`, color: 'text-orange-400', delay: 0.38 },
      ]
    }] : []),

  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile?.branch_name || 'Branch'} — {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium">
          <Wallet className="w-4 h-4" />
          USh {formatUGX(totalFunds)}
        </div>
      </div>

      {/* Sections */}
      {cards.map((section) => (
        <div key={section.section}>
          <SectionTitle
            icon={section.sectionIcon}
            title={section.section}
            count={section.items.length}
          />
          <div className={`grid gap-3 sm:gap-4 ${
            section.items.length === 1 ? 'grid-cols-1 max-w-xs' :
            section.items.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            section.items.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {section.items.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
