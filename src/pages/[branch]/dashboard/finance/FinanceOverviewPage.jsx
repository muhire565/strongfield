import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Activity, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { useBalances, useFinanceSummary, useCashflow, useTransactions } from '../../../../hooks/useFinance';
import { useFinanceRealtime } from '../../../../hooks/useFinanceRealtime';
import { formatUGX } from '../../../../utils/formatters';

const modeIcons = {
  cash: Banknote,
  mtn_mobile_money: Smartphone,
  airtel_money: Smartphone,
  bank_transfer: CreditCard,
};

const modeLabels = {
  cash: 'Cash',
  mtn_mobile_money: 'MTN Mobile Money',
  airtel_money: 'Airtel Money',
  bank_transfer: 'Bank Transfer',
};

const periodOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

function getPeriodDates(period) {
  const today = new Date();
  const to = today.toISOString().split('T')[0];
  let from = to;
  if (period === 'today') {
    from = to;
  } else if (period === 'week') {
    const d = new Date(); d.setDate(d.getDate() - 7); from = d.toISOString().split('T')[0];
  } else if (period === 'month') {
    const d = new Date(); d.setMonth(d.getMonth() - 1); from = d.toISOString().split('T')[0];
  } else if (period === 'year') {
    const d = new Date(); d.setFullYear(d.getFullYear() - 1); from = d.toISOString().split('T')[0];
  } else if (period === 'all') {
    return {};
  }
  return { from_date: from, to_date: to };
}

export default function FinanceOverviewPage() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id;
  const [period, setPeriod] = useState('month');

  useFinanceRealtime(branchId);

  const dateParams = useMemo(() => getPeriodDates(period), [period]);
  const { data: balances, isLoading: balLoading } = useBalances();
  const { data: summary, isLoading: sumLoading } = useFinanceSummary(dateParams);
  const { data: cashflow } = useCashflow(dateParams);
  const { data: recentTxns } = useTransactions({ limit: 10, ...dateParams });

  const balMap = useMemo(() => {
    const m = {};
    (balances || []).forEach(b => { m[b.payment_mode] = Number(b.balance); });
    return m;
  }, [balances]);

  const totalFunds = Object.values(balMap).reduce((a, b) => a + b, 0);

  const summaryCards = summary ? [
    { label: 'Total Capital Injected', value: summary.capital?.total_injected || 0, color: 'text-blue-400', icon: Landmark },
    { label: 'Revenue Collected', value: summary.revenue?.total_collected || 0, color: 'text-emerald-400', icon: ArrowDownLeft },
    { label: 'Total Expenses', value: summary.expenses?.total || 0, color: 'text-red-400', icon: ArrowUpRight },
    { label: 'Total Withdrawals', value: summary.withdrawals?.total || 0, color: 'text-orange-400', icon: Wallet },
    { label: 'Gross Profit', value: summary.gross_profit || 0, color: 'text-teal-400', icon: TrendingUp },
    { label: 'Net Profit', value: summary.net_profit || 0, color: summary.net_profit >= 0 ? 'text-purple-400' : 'text-red-500', icon: Activity },
  ] : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Finance Overview</h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          {periodOptions.map(o => (
            <button
              key={o.value}
              onClick={() => setPeriod(o.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${period === o.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Mode Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['cash', 'mtn_mobile_money', 'airtel_money', 'bank_transfer'].map(mode => {
          const Icon = modeIcons[mode] || Wallet;
          const balance = balMap[mode] || 0;
          return (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{modeLabels[mode]}</span>
              </div>
              <div className={`text-2xl font-bold ${balance <= 0 ? 'text-red-500' : 'text-foreground'}`}>
                USh {formatUGX(balance)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total Available Funds */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
        <div className="text-sm text-muted-foreground mb-1">Total Available Funds</div>
        <div className="text-4xl font-extrabold text-primary">USh {formatUGX(totalFunds)}</div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sumLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-28" />
          ))
        ) : (
          summaryCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <div className={`text-xl font-bold ${card.color}`}>
                USh {formatUGX(card.value)}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Cashflow & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Cashflow</h3>
          {cashflow && cashflow.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {cashflow.map(day => {
                const max = Math.max(day.inflow, day.outflow) || 1;
                const inPct = (day.inflow / max) * 100;
                const outPct = (day.outflow / max) * 100;
                return (
                  <div key={day.date} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{day.date}</span>
                      <span>In: <span className="text-emerald-400">{formatUGX(day.inflow)}</span> · Out: <span className="text-red-400">{formatUGX(day.outflow)}</span></span>
                    </div>
                    <div className="flex gap-1 h-6">
                      <div className="bg-emerald-500/20 rounded-l overflow-hidden" style={{ width: `${inPct}%` }}>
                        <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                      </div>
                      <div className="bg-red-500/20 rounded-r overflow-hidden" style={{ width: `${outPct}%` }}>
                        <div className="h-full bg-red-500" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-8 text-center">No cashflow data for this period</div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          {recentTxns?.data?.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentTxns.data.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.direction === 'credit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {t.direction === 'credit' ? '▲' : '▼'}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.transaction_type.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground">{t.payment_mode.replace(/_/g, ' ')} · {new Date(t.transaction_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${t.direction === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.direction === 'credit' ? '+' : '-'} USh {formatUGX(t.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">Bal: {formatUGX(t.balance_after)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-8 text-center">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
