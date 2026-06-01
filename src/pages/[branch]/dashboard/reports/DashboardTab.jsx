import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Package, Download } from 'lucide-react';
import { useReportSummary } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';
import { printDashboardReport } from '../../../../utils/reportPdfGenerator';

function KpiCard({ icon: Icon, label, value, change, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}
      className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10"><Icon className="w-5 h-5 text-primary" /></div>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
    </motion.div>
  );
}

function SummaryRow({ label, value, isTotal, isPct }) {
  return (
    <div className={`flex justify-between items-center py-2 border-b border-border/50 ${isTotal ? 'font-bold' : ''}`}>
      <span className={isTotal ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
      <span className={isTotal ? 'text-foreground font-bold' : isPct ? 'text-muted-foreground' : ''}>
        {value}
      </span>
    </div>
  );
}

export default function DashboardTab() {
  const { fromDate, toDate } = useReportStore();
  const { data, isLoading } = useReportSummary(fromDate, toDate);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  const d = data || {};

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Net Revenue" value={`USh ${formatUGX(d.revenue || 0)}`} delay={0} />
        <KpiCard icon={TrendingUp} label="Net Profit" value={`USh ${formatUGX(d.net_profit || 0)}`} delay={0.05} />
        <KpiCard icon={TrendingDown} label="Total Expenses" value={`USh ${formatUGX(d.expenses || 0)}`} delay={0.1} />
        <KpiCard icon={Users} label="Outstanding Receivables" value={`USh ${formatUGX(d.accounts_receivable || 0)}`} delay={0.15} />
      </div>

      <div className="flex justify-end">
        <button onClick={() => printDashboardReport(d, fromDate, toDate)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>
      {/* Summary Table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
        <div className="space-y-1 max-w-lg">
          <SummaryRow label="Gross Sales" value={`USh ${formatUGX(d.revenue || 0)}`} />
          <SummaryRow label="Discounts Given" value={`USh 0`} />
          <SummaryRow label="Net Revenue" value={`USh ${formatUGX(d.revenue || 0)}`} isTotal />
          <div className="h-px bg-border my-2" />
          <SummaryRow label="Cost of Goods Sold" value={`USh ${formatUGX((d.revenue || 0) - (d.gross_profit || 0))}`} />
          <SummaryRow label="Gross Profit" value={`USh ${formatUGX(d.gross_profit || 0)}`} isTotal />
          <SummaryRow label="Gross Margin" value={`${d.revenue ? Math.round(((d.gross_profit || 0) / d.revenue) * 100) : 0}%`} isPct />
          <div className="h-px bg-border my-2" />
          <SummaryRow label="Operating Expenses" value={`USh ${formatUGX(d.expenses || 0)}`} />
          <SummaryRow label="Net Profit" value={`USh ${formatUGX(d.net_profit || 0)}`} isTotal />
          <SummaryRow label="Net Margin" value={`${d.revenue ? Math.round(((d.net_profit || 0) / d.revenue) * 100) : 0}%`} isPct />
        </div>
      </div>
    </div>
  );
}
