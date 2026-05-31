import React, { useState } from 'react';
import { useProductMovements } from '../../hooks/useStockMovements';

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};
import { MovementTypeBadge } from './MovementTypeBadge';
import { ArrowUp, ArrowDown, History, Loader2 } from 'lucide-react';

export function MovementHistoryTimeline({ productId }) {
  const [filterType, setFilterType] = useState('');
  
  const { data: movementsData, isLoading } = useProductMovements(productId, {
    limit: 20,
    type: filterType || undefined
  });

  const movements = movementsData?.data || [];

  const filters = [
    { label: 'All', value: '' },
    { label: 'Stock In', value: 'stock_in' },
    { label: 'Stock Out', value: 'stock_out' },
    { label: 'Sale', value: 'sale' },
    { label: 'Export', value: 'export' },
    { label: 'Import', value: 'import' },
    { label: 'Adj.', value: 'adjustment' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <History size={16} /> Movement History
          <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
            {movementsData?.count || 0}
          </span>
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 pb-2">
        {filters.map(f => (
          <button
            key={f.label}
            onClick={() => setFilterType(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {movements.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
          No movements found for this filter.
        </div>
      ) : (
        <div className="relative pl-3 border-l-2 border-border/50 space-y-6 mt-4">
          {movements.map((m) => {
            const isIncrease = m.quantity_after > m.quantity_before;
            const diff = Math.abs(m.quantity_after - m.quantity_before);

            return (
              <div key={m.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-border ring-4 ring-background" />
                
                <div className="pl-3">
                  <div className="flex items-start justify-between mb-1">
                    <MovementTypeBadge type={m.movement_type} />
                    <time className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDate(m.performed_at)}
                    </time>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 font-medium text-sm">
                      <span className="text-muted-foreground line-through decoration-muted-foreground/30">{m.quantity_before}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{m.quantity_after}</span>
                    </div>
                    
                    <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${
                      isIncrease ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40' : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/40'
                    }`}>
                      {isIncrease ? <ArrowUp size={12} className="mr-0.5"/> : <ArrowDown size={12} className="mr-0.5"/>}
                      {diff}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                    <span className="font-medium text-foreground">{m.performer?.full_name || 'System'}</span>
                    {m.performer?.role && (
                      <span className="bg-muted px-1.5 rounded text-[10px] uppercase tracking-wider">{m.performer.role}</span>
                    )}
                  </p>

                  {(m.notes || m.reference_id) && (
                    <div className="mt-2 text-xs bg-muted/50 p-2.5 rounded-md border border-border">
                      {m.reference_id && (
                        <p className="font-mono text-muted-foreground mb-1">Ref: {m.reference_id}</p>
                      )}
                      {m.notes && <p className="italic text-foreground">"{m.notes}"</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
