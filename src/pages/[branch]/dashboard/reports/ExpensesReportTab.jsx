import React from 'react';
import { Download } from 'lucide-react';
import { useExpensesReport } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';

export default function ExpensesReportTab() {
  const { fromDate, toDate } = useReportStore();
  const { data, isLoading } = useExpensesReport(fromDate, toDate);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>;
  }

  const d = data || {};
  const byCat = d.by_category || [];
  const top = d.top_expenses || [];

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="bg-card border border-border rounded-xl p-5 text-center">
        <div className="text-sm text-muted-foreground mb-1">Total Expenses</div>
        <div className="text-3xl font-bold text-red-400">USh {formatUGX(d.total)}</div>
      </div>

      {/* By Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">By Category</h3>
          <div className="space-y-3">
            {byCat.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{cat.category.replace(/_/g, ' ')}</span>
                  <span className="font-medium">USh {formatUGX(cat.amount)} ({cat.count})</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${d.total ? (cat.amount / d.total * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Expenses */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Top Expenses</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {top.map((e, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border/30 text-sm">
                <div>
                  <div className="font-medium">{e.description}</div>
                  <div className="text-xs text-muted-foreground capitalize">{e.category?.replace(/_/g, ' ')} • {e.expense_date}</div>
                </div>
                <div className="font-bold">USh {formatUGX(e.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
