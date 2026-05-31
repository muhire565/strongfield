import React from 'react';
import { ArrowRightLeft, Loader2 } from 'lucide-react';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ExportHistory({ exports = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="card p-12 text-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading export history...</p>
      </div>
    );
  }

  if (exports.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <ArrowRightLeft size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No export history</h3>
        <p className="text-sm text-muted-foreground">
          Use the export button on any product to send stock to another branch.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Qty Exported</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">From Branch</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">To Branch</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Exported By</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {exports.map((exp) => (
              <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(exp.exported_at)}</td>
                <td className="px-4 py-3 text-foreground font-medium">
                  {exp.product?.name || `Product #${exp.product_id}`}
                </td>
                <td className="px-4 py-3 text-foreground">{exp.quantity_exported}</td>
                <td className="px-4 py-3 text-muted-foreground">{exp.source_branch?.name || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{exp.target_branch?.name || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{exp.exporter?.full_name || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate" title={exp.notes}>
                  {exp.notes || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
