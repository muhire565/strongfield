import React from 'react';
import { Download } from 'lucide-react';
import { useOwnerEquity } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';
import { printOwnerEquityReport } from '../../../../utils/reportPdfGenerator';

function Row({ label, value, isTotal = false }) {
  return (
    <div className={`flex justify-between py-2 ${isTotal ? 'border-t-2 border-border font-bold' : ''}`}>
      <span className={isTotal ? 'font-semibold' : ''}>{label}</span>
      <span className={isTotal ? 'font-bold' : ''}>USh {formatUGX(value)}</span>
    </div>
  );
}

export default function OwnerEquityTab() {
  const { fromDate, toDate } = useReportStore();
  const { data, isLoading } = useOwnerEquity(fromDate, toDate);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>;
  }

  const d = data || {};
  const cap = d.capital_injections || {};
  const wd = d.owner_drawings || {};
  const move = d.equity_movement || [];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">STATEMENT OF CHANGES IN OWNER'S EQUITY</h2>
          <p className="text-sm text-muted-foreground">{d.period?.from} to {d.period?.to}</p>
        </div>

        <div className="space-y-1 text-sm sm:text-base">
          <Row label="Opening Equity (start of period)" value={d.opening_equity} isTotal />
          <div className="h-2" />
          <Row label="Add: Capital Injected During Period" value={cap.total} />
          <div className="text-xs text-muted-foreground pl-4">{cap.count} injection(s)</div>
          <Row label="Add: Net Profit for Period" value={d.net_profit_for_period} />
          <Row label="Less: Owner Drawings During Period" value={wd.total} />
          <div className="text-xs text-muted-foreground pl-4">{wd.count} withdrawal(s)</div>
          <div className="h-2" />
          <Row label="Closing Equity (end of period)" value={d.closing_equity} isTotal />
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={() => printOwnerEquityReport(d)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Movement Log */}
      {move.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <h3 className="font-semibold mb-3">Equity Movement Log</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-left py-2 px-2">Event</th>
                <th className="text-right py-2 px-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {move.map((m, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-2">{m.date}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      m.type === 'credit' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {m.event}
                    </span>
                  </td>
                  <td className={`py-2 px-2 text-right font-medium ${m.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                    USh {formatUGX(m.amount)}
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
