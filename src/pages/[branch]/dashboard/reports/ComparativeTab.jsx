import React, { useState } from 'react';
import { GitCompare, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { useComparative } from '../../../../hooks/useReports';
import { formatUGX } from '../../../../utils/formatters';
import { printComparativeReport } from '../../../../utils/reportPdfGenerator';

export default function ComparativeTab() {
  const [p1From, setP1From] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [p1To, setP1To] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });
  const [p2From, setP2From] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [p2To, setP2To] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const { data, isLoading } = useComparative(p1From, p1To, p2From, p2To);

  const p1 = data?.income_statement_1 || {};
  const p2 = data?.income_statement_2 || {};

  function diff(v1, v2) {
    const d = (v2 || 0) - (v1 || 0);
    const pct = v1 ? ((d / v1) * 100).toFixed(1) : '0';
    return { val: d, pct, up: d >= 0 };
  }

  const metrics = [
    { label: 'Net Revenue', v1: (p1.revenue?.net_revenue || 0), v2: (p2.revenue?.net_revenue || 0) },
    { label: 'COGS', v1: (p1.cost_of_goods_sold?.cogs || 0), v2: (p2.cost_of_goods_sold?.cogs || 0), reverse: true },
    { label: 'Gross Profit', v1: (p1.gross_profit || 0), v2: (p2.gross_profit || 0) },
    { label: 'Operating Expenses', v1: (p1.operating_expenses?.total || 0), v2: (p2.operating_expenses?.total || 0), reverse: true },
    { label: 'Net Profit', v1: (p1.net_profit || 0), v2: (p2.net_profit || 0) },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card border border-border rounded-xl p-4">
        <div>
          <div className="text-sm font-semibold mb-2 flex items-center gap-2">
            <GitCompare className="w-4 h-4" /> Period 1
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={p1From} onChange={(e) => setP1From(e.target.value)} className="pos-input text-sm px-2 py-1.5 rounded-lg flex-1" />
            <span className="text-muted-foreground">to</span>
            <input type="date" value={p1To} onChange={(e) => setP1To(e.target.value)} className="pos-input text-sm px-2 py-1.5 rounded-lg flex-1" />
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-2 flex items-center gap-2">
            <GitCompare className="w-4 h-4" /> Period 2
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={p2From} onChange={(e) => setP2From(e.target.value)} className="pos-input text-sm px-2 py-1.5 rounded-lg flex-1" />
            <span className="text-muted-foreground">to</span>
            <input type="date" value={p2To} onChange={(e) => setP2To(e.target.value)} className="pos-input text-sm px-2 py-1.5 rounded-lg flex-1" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-3">Metric</th>
                <th className="text-right py-3 px-3">Period 1</th>
                <th className="text-right py-3 px-3">Period 2</th>
                <th className="text-right py-3 px-3">Change (UGX)</th>
                <th className="text-right py-3 px-3">Change (%)</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => {
                const d = diff(m.v1, m.v2);
                const isGood = m.reverse ? !d.up : d.up;
                return (
                  <tr key={m.label} className="border-b border-border/50">
                    <td className="py-3 px-3 font-medium">{m.label}</td>
                    <td className="py-3 px-3 text-right">USh {formatUGX(m.v1)}</td>
                    <td className="py-3 px-3 text-right">USh {formatUGX(m.v2)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`flex items-center justify-end gap-1 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                        {d.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        USh {formatUGX(Math.abs(d.val))}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-medium ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                        {d.up ? '+' : ''}{d.pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button onClick={() => printComparativeReport(data, `${p1From} to ${p1To}`, `${p2From} to ${p2To}`)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>
    </div>
  );
}
