import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useSalesReport } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';

const groupOptions = [
  { key: 'day', label: 'By Day' },
  { key: 'week', label: 'By Week' },
  { key: 'month', label: 'By Month' },
  { key: 'product', label: 'By Product' },
  { key: 'staff', label: 'By Staff' },
  { key: 'payment_mode', label: 'By Payment Mode' },
  { key: 'client', label: 'By Client' },
];

export default function SalesReportTab() {
  const { fromDate, toDate } = useReportStore();
  const [groupBy, setGroupBy] = useState('day');
  const { data, isLoading } = useSalesReport(fromDate, toDate, groupBy);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>;
  }

  const rows = data?.rows || [];
  const totals = data?.totals || {};

  const headers = {
    day: ['Period', 'Transactions', 'Gross Sales', 'Discounts', 'Net Sales', 'Avg Sale'],
    week: ['Period', 'Transactions', 'Gross Sales', 'Discounts', 'Net Sales'],
    month: ['Period', 'Transactions', 'Gross Sales', 'Discounts', 'Net Sales'],
    product: ['Product', 'Brand', 'Units Sold', 'Revenue', 'Cost', 'Gross Margin', 'Margin %'],
    staff: ['Staff', 'Role', 'Transactions', 'Total Sales', 'Avg Sale', 'Discounts'],
    payment_mode: ['Mode', 'Transactions', 'Total Collected'],
    client: ['Client', 'Transactions', 'Total Purchases', 'Paid', 'Balance Due'],
  }[groupBy] || [];

  return (
    <div className="space-y-4">
      {/* Group selector */}
      <div className="flex flex-wrap gap-2">
        {groupOptions.map((g) => (
          <button key={g.key} onClick={() => setGroupBy(g.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              groupBy === g.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'
            }`}>
            {g.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {headers.map((h) => <th key={h} className="text-left py-3 px-3 font-semibold text-muted-foreground">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                {groupBy === 'day' && (
                  <>
                    <td className="py-2 px-3">{row.period}</td>
                    <td className="py-2 px-3">{row.transactions}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.gross_sales)}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.discounts)}</td>
                    <td className="py-2 px-3 font-medium">USh {formatUGX(row.net_sales)}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.avg_sale_value)}</td>
                  </>
                )}
                {groupBy === 'product' && (
                  <>
                    <td className="py-2 px-3">{row.product}</td>
                    <td className="py-2 px-3">{row.brand} {row.model}</td>
                    <td className="py-2 px-3">{row.units_sold}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.revenue)}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.cost)}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.gross_margin)}</td>
                    <td className="py-2 px-3">{row.gross_margin_pct}%</td>
                  </>
                )}
                {groupBy === 'staff' && (
                  <>
                    <td className="py-2 px-3">{row.staff_name}</td>
                    <td className="py-2 px-3">{row.role}</td>
                    <td className="py-2 px-3">{row.transactions}</td>
                    <td className="py-2 px-3 font-medium">USh {formatUGX(row.total_sales)}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.avg_sale)}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.discounts_given)}</td>
                  </>
                )}
                {groupBy === 'payment_mode' && (
                  <>
                    <td className="py-2 px-3 capitalize">{row.mode?.replace(/_/g, ' ')}</td>
                    <td className="py-2 px-3">{row.transactions}</td>
                    <td className="py-2 px-3 font-medium">USh {formatUGX(row.total_collected)}</td>
                  </>
                )}
                {groupBy === 'client' && (
                  <>
                    <td className="py-2 px-3">{row.client_name}</td>
                    <td className="py-2 px-3">{row.transactions}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.total_purchases)}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.total_paid)}</td>
                    <td className="py-2 px-3 font-medium">USh {formatUGX(row.balance_due)}</td>
                  </>
                )}
                {(groupBy === 'week' || groupBy === 'month') && (
                  <>
                    <td className="py-2 px-3">{row.period}</td>
                    <td className="py-2 px-3">{row.transactions}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.gross_sales)}</td>
                    <td className="py-2 px-3">USh {formatUGX(row.discounts)}</td>
                    <td className="py-2 px-3 font-medium">USh {formatUGX(row.net_sales)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">No sales data for this period.</div>
        )}
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
          <Download className="w-4 h-4" /> Download CSV
        </button>
      </div>
    </div>
  );
}
