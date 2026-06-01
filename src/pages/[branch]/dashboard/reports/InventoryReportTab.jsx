import React from 'react';
import { AlertTriangle, PackageX, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { useInventoryReport } from '../../../../hooks/useReports';
import { useReportStore } from '../../../../store/useReportStore';
import { formatUGX } from '../../../../utils/formatters';
import { printInventoryReport } from '../../../../utils/reportPdfGenerator';

function Card({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

export default function InventoryReportTab() {
  const { fromDate, toDate } = useReportStore();
  const { data, isLoading } = useInventoryReport(fromDate, toDate);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>;
  }

  const d = data || {};
  const ms = d.stock_movement_summary || {};

  return (
    <div className="space-y-6">
      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card icon={TrendingUp} label="Total Products" value={d.total_products} color="text-blue-400" />
        <Card icon={TrendingUp} label="Total Units" value={d.total_units} color="text-emerald-400" />
        <Card icon={TrendingUp} label="Potential Sales Value" value={`USh ${formatUGX(d.total_stock_value)}`} color="text-purple-400" />
        <Card icon={TrendingDown} label="Stock Value" value={`USh ${formatUGX(d.total_cost_value)}`} color="text-orange-400" />
      </div>

      {/* Movement Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(ms).map(([k, v]) => (
          <div key={k} className="bg-muted/30 border border-border rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</div>
            <div className="text-lg font-bold">{v}</div>
          </div>
        ))}
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold">Low Stock Items</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(d.low_stock_items || []).map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-border/30">
                <span>{item.name} ({item.brand} {item.model})</span>
                <span className="text-amber-400 font-medium">{item.quantity} / {item.low_stock_threshold}</span>
              </div>
            ))}
            {(d.low_stock_items || []).length === 0 && <p className="text-sm text-muted-foreground">No low stock items.</p>}
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <PackageX className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold">Out of Stock</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(d.out_of_stock_items || []).map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-border/30">
                <span>{item.name} ({item.brand} {item.model})</span>
                <span className="text-red-400 font-medium">0</span>
              </div>
            ))}
            {(d.out_of_stock_items || []).length === 0 && <p className="text-sm text-muted-foreground">All products in stock.</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => printInventoryReport(d)} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>
    </div>
  );
}
