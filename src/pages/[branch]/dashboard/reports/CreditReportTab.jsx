import React from 'react';
import { Download } from 'lucide-react';
import { useCreditReport } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';

function Kpi({ label, value, color = 'text-foreground' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

export default function CreditReportTab() {
  const { fromDate, toDate } = useReportStore();
  const { data, isLoading } = useCreditReport(fromDate, toDate);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>;
  }

  const d = data || {};
  const ledger = d.client_ledger || [];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Total Credit Issued" value={`USh ${formatUGX(d.total_credit_sales)}`} />
        <Kpi label="Total Collected" value={`USh ${formatUGX(d.total_collected)}`} color="text-emerald-400" />
        <Kpi label="Outstanding" value={`USh ${formatUGX(d.total_outstanding)}`} color="text-amber-400" />
        <Kpi label="Collection Rate" value={`${d.collection_rate_pct}%`} color="text-blue-400" />
      </div>

      {/* Client Ledger */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto p-4">
        <h3 className="font-semibold mb-3">Client Ledger</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-2">Client</th>
              <th className="text-right py-2 px-2">Total Invoiced</th>
              <th className="text-right py-2 px-2">Paid</th>
              <th className="text-right py-2 px-2">Balance</th>
              <th className="text-right py-2 px-2">Oldest Unpaid</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((c, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2 px-2 font-medium">{c.client_name}</td>
                <td className="py-2 px-2 text-right">USh {formatUGX(c.total_invoiced)}</td>
                <td className="py-2 px-2 text-right text-emerald-400">USh {formatUGX(c.total_paid)}</td>
                <td className="py-2 px-2 text-right font-bold text-amber-400">USh {formatUGX(c.balance_due)}</td>
                <td className="py-2 px-2 text-right text-muted-foreground">{c.oldest_unpaid_date || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ledger.length === 0 && <p className="py-6 text-center text-muted-foreground text-sm">No credit clients in this period.</p>}
      </div>
    </div>
  );
}
