import React from 'react';
import { Download } from 'lucide-react';
import { useCashFlow } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';
import { printCashFlowReport } from '../../../../utils/reportPdfGenerator';

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 border-b border-border pb-1">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, isTotal = false, isSub = false }) {
  const num = typeof value === 'number' ? value : 0;
  const fmt = `USh ${formatUGX(Math.abs(num))}`;
  return (
    <div className={`flex justify-between py-1.5 ${isTotal || isSub ? 'border-t border-border font-bold' : ''}`}>
      <span className={isTotal || isSub ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
      <span className={`text-right ${num < 0 ? 'text-red-400' : ''}`}>
        {num < 0 ? `(${fmt})` : fmt}
      </span>
    </div>
  );
}

export default function CashFlowTab() {
  const { fromDate, toDate } = useReportStore();
  const { data, isLoading } = useCashFlow(fromDate, toDate);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(12)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>;
  }

  const d = data || {};
  const op = d.operating_activities || {};
  const fin = d.financing_activities || {};
  const daily = d.daily_breakdown || [];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">STATEMENT OF CASH FLOWS</h2>
          <p className="text-sm text-muted-foreground">{d.period?.from} to {d.period?.to}</p>
        </div>

        <Section title="Operating Activities">
          <Row label="Cash Received from Customers" value={op.cash_received_from_customers} />
          <Row label="Cash Paid for Business Expenses" value={-op.cash_paid_for_expenses} />
          <Row label="Cash Paid for Stock Purchases" value={-op.cash_paid_for_goods} />
          <Row label="Net Cash from Operating Activities" value={op.net_operating_cash_flow} isTotal />
        </Section>

        <Section title="Financing Activities">
          <Row label="Capital Injected by Owner" value={fin.capital_injected} />
          <Row label="Owner Withdrawals" value={-fin.owner_withdrawals} />
          <Row label="Net Cash from Financing Activities" value={fin.net_financing_cash_flow} isTotal />
        </Section>

        <div className="border-t-2 border-border pt-3">
          <Row label="NET CHANGE IN CASH" value={d.net_change_in_cash} isSub />
          <Row label="Opening Cash Balance" value={d.opening_cash_balance} />
          <Row label="Closing Cash Balance" value={d.closing_cash_balance} isSub />
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={() => printCashFlowReport(d)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Daily Breakdown */}
      {daily.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3">Daily Cash Movement</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-right py-2 px-2">Inflows</th>
                <th className="text-right py-2 px-2">Outflows</th>
                <th className="text-right py-2 px-2">Net</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((day) => (
                <tr key={day.date} className="border-b border-border/50">
                  <td className="py-2 px-2">{day.date}</td>
                  <td className="text-right py-2 px-2 text-emerald-400">USh {formatUGX(day.inflows)}</td>
                  <td className="text-right py-2 px-2 text-red-400">USh {formatUGX(day.outflows)}</td>
                  <td className={`text-right py-2 px-2 font-medium ${day.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    USh {formatUGX(day.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
