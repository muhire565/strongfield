import React from 'react';
import { Download } from 'lucide-react';
import { useIncomeStatement } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';

function Row({ label, value, indent = false, isTotal = false, isSub = false }) {
  return (
    <div className={`flex justify-between items-center py-2 ${isTotal ? 'border-t border-border' : ''} ${isSub ? 'border-b-2 border-border' : ''}`}>
      <span className={`${indent ? 'pl-6 text-muted-foreground' : ''} ${isTotal || isSub ? 'font-bold' : ''}`}>
        {label}
      </span>
      <span className={`text-right ${isTotal || isSub ? 'font-bold' : ''}`}>
        {typeof value === 'number' ? `USh ${formatUGX(value)}` : value}
      </span>
    </div>
  );
}

export default function IncomeStatementTab() {
  const { fromDate, toDate } = useReportStore();
  const { data, isLoading } = useIncomeStatement(fromDate, toDate);

  if (isLoading) {
    return <div className="space-y-3">
      {[...Array(12)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
    </div>;
  }

  const d = data || {};
  const rev = d.revenue || {};
  const cogs = d.cost_of_goods_sold || {};
  const opex = d.operating_expenses || {};

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">INCOME STATEMENT</h2>
        <p className="text-sm text-muted-foreground">For the period: {d.period?.from} to {d.period?.to}</p>
      </div>

      <div className="space-y-1 text-sm sm:text-base">
        <Row label="REVENUE" isTotal />
        <Row label="Gross Sales" value={rev.gross_sales} indent />
        <Row label="Less: Discounts" value={rev.discounts_given} indent />
        <Row label="Less: Refunds" value={rev.refunds} indent />
        <Row label="Net Revenue" value={rev.net_revenue} isTotal />

        <div className="h-4" />
        <Row label="COST OF GOODS SOLD" isTotal />
        <Row label="Opening Stock Value" value={cogs.opening_stock_value} indent />
        <Row label="Add: Purchases During Period" value={cogs.purchases_during_period} indent />
        <Row label="Less: Closing Stock Value" value={cogs.closing_stock_value} indent />
        <Row label="Cost of Goods Sold" value={cogs.cogs} isTotal />

        <div className="h-4" />
        <Row label="GROSS PROFIT" value={d.gross_profit} isSub />
        <Row label="" value={`${d.gross_margin_pct}%`} />

        <div className="h-4" />
        <Row label="OPERATING EXPENSES" isTotal />
        {(opex.by_category || []).map((cat) => (
          <Row key={cat.category} label={cat.category} value={cat.amount} indent />
        ))}
        <Row label="Total Operating Expenses" value={opex.total} isTotal />

        <div className="h-4" />
        <Row label="NET PROFIT / (LOSS)" value={d.net_profit} isSub />
        <Row label="" value={`${d.net_margin_pct}%`} />
      </div>

      <div className="flex justify-end mt-6">
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>
    </div>
  );
}
