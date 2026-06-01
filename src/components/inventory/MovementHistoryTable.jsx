import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Search, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAllMovements } from '../../hooks/useStockMovements';
import { MovementTypeBadge } from './MovementTypeBadge';
import { inputClass } from '../ui/FormField';
import Papa from 'papaparse';
import Pagination from '../ui/Pagination';

export function MovementHistoryTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: movementsData, isLoading } = useAllMovements({
    page,
    limit,
    type: filterType || undefined,
    search: searchTerm || undefined,
  });

  const movements = movementsData?.data || [];
  const total = movementsData?.count || 0;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterType]);

  const types = [
    { label: 'All', value: '' },
    { label: 'Stock In', value: 'stock_in' },
    { label: 'Stock Out', value: 'stock_out' },
    { label: 'Sale', value: 'sale' },
    { label: 'Export', value: 'export' },
    { label: 'Import', value: 'import' },
    { label: 'Adjustment', value: 'adjustment' },
  ];

  const handleExportCSV = () => {
    if (!movements.length) return;
    
    const csvData = movements.map(m => ({
      Date: format(new Date(m.performed_at), 'yyyy-MM-dd HH:mm'),
      Product: m.product?.name,
      Type: m.movement_type,
      Quantity: m.quantity,
      'Qty Before': m.quantity_before,
      'Qty After': m.quantity_after,
      'Performed By': m.performer?.full_name,
      Reference: m.reference_id || '',
      Notes: m.notes || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `movement-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className={`${inputClass()} pl-9 w-full sm:w-64`}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className={`${inputClass()} w-full sm:w-40`}
          >
            {types.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!movements.length}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Date & Time</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Change</th>
                <th className="px-4 py-3 font-medium text-center">Before → After</th>
                <th className="px-4 py-3 font-medium">Performed By</th>
                <th className="px-4 py-3 font-medium">Ref / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading movement history...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-muted-foreground">
                    No movements found matching your criteria.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isIncrease = m.quantity_after > m.quantity_before;
                  const diff = Math.abs(m.quantity_after - m.quantity_before);

                  return (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {format(new Date(m.performed_at), 'dd MMM yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {m.product?.name}
                      </td>
                      <td className="px-4 py-3">
                        <MovementTypeBadge type={m.movement_type} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center font-bold ${isIncrease ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isIncrease ? <ArrowUp size={12} className="mr-0.5" /> : <ArrowDown size={12} className="mr-0.5" />}
                          {diff}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                          <span className="line-through decoration-muted-foreground/30">{m.quantity_before}</span>
                          <span>→</span>
                          <span className="font-medium text-foreground">{m.quantity_after}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {m.performer?.full_name || 'System'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px] truncate text-muted-foreground" title={m.notes}>
                          {m.reference_id && <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded mr-2">{m.reference_id}</span>}
                          {m.notes || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
