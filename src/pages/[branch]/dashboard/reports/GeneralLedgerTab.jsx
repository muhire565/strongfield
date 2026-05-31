import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useGeneralLedger } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';

const modes = [
  { key: '', label: 'All' },
  { key: 'cash', label: 'Cash' },
  { key: 'mtn_mobile_money', label: 'MTN MoMo' },
  { key: 'airtel_money', label: 'Airtel Money' },
  { key: 'bank_transfer', label: 'Bank Transfer' },
];

export default function GeneralLedgerTab() {
  const { fromDate, toDate } = useReportStore();
  const [mode, setMode] = useState('');
  const { data, isLoading } = useGeneralLedger(fromDate, toDate, mode || undefined);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>;
  }

  const d = data || {};
  const rows = d.rows || [];

  return (
    <div className="space-y-4">
      {/* Mode filter */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === m.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Opening / Closing */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground">Opening Balance</div>
          <div className="text-xl font-bold">USh {formatUGX(d.opening_balance)}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground">Closing Balance</div>
          <div className="text-xl font-bold">USh {formatUGX(d.closing_balance)}</div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-2">Date</th>
              <th className="text-left py-2 px-2">Reference</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-right py-2 px-2">Debit</th>
              <th className="text-right py-2 px-2">Credit</th>
              <th className="text-right py-2 px-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2 px-2 whitespace-nowrap">{r.date}</td>
                <td className="py-2 px-2 text-muted-foreground">{r.reference || '-'}</td>
                <td className="py-2 px-2 capitalize">{r.type?.replace(/_/g, ' ')}</td>
                <td className="py-2 px-2 text-right">{r.debit > 0 ? `USh ${formatUGX(r.debit)}` : '-'}</td>
                <td className="py-2 px-2 text-right">{r.credit > 0 ? `USh ${formatUGX(r.credit)}` : '-'}</td>
                <td className="py-2 px-2 text-right font-medium">USh {formatUGX(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-6 text-center text-muted-foreground text-sm">No transactions for this period.</p>}
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>
    </div>
  );
}
