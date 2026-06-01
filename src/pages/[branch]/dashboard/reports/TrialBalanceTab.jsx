import React from 'react';
import { AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { useTrialBalance } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';
import { printTrialBalanceReport } from '../../../../utils/reportPdfGenerator';

export default function TrialBalanceTab() {
  const { toDate } = useReportStore();
  const { data, isLoading } = useTrialBalance(toDate);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>;
  }

  const d = data || {};
  const accounts = d.accounts || [];

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">TRIAL BALANCE</h2>
        <p className="text-sm text-muted-foreground">As at: {d.as_at}</p>
      </div>

      {!d.balanced && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-3 rounded-lg text-sm font-medium">
          <AlertTriangle className="w-5 h-5" /> Trial balance is NOT balanced. Debits ≠ Credits.
        </div>
      )}
      {d.balanced && (
        <div className="mb-4 flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" /> Trial Balance is BALANCED
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Account</th>
            <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Debit</th>
            <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Credit</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-2 px-3">{acc.account}</td>
              <td className="py-2 px-3 text-right">{acc.debit > 0 ? `USh ${formatUGX(acc.debit)}` : '-'}</td>
              <td className="py-2 px-3 text-right">{acc.credit > 0 ? `USh ${formatUGX(acc.credit)}` : '-'}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-border font-bold">
            <td className="py-3 px-3">TOTAL</td>
            <td className="py-3 px-3 text-right">USh {formatUGX(d.total_debit)}</td>
            <td className="py-3 px-3 text-right">USh {formatUGX(d.total_credit)}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end mt-6">
        <button onClick={() => printTrialBalanceReport(d)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>
    </div>
  );
}
