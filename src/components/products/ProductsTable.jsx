import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, ArrowUpDown, ArrowRightLeft } from 'lucide-react';
import { formatUGX } from '../../utils/formatCurrency';

function getStockStatus(quantity, threshold) {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= threshold) return 'Low Stock';
  return 'In Stock';
}

function StatusBadge({ status }) {
  const styles = {
    'In Stock':     'bg-emerald-50  text-emerald-700  border-emerald-200  dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    'Low Stock':    'bg-amber-50    text-amber-700    border-amber-200    dark:bg-amber-900/30   dark:text-amber-400   dark:border-amber-800',
    'Out of Stock': 'bg-red-50      text-red-700      border-red-200      dark:bg-red-900/30     dark:text-red-400     dark:border-red-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles['In Stock']
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const columns = [
  { key: 'index',               label: '#' },
  { key: 'name',                label: 'Name' },
  { key: 'brand',               label: 'Brand' },
  { key: 'model',               label: 'Model' },
  { key: 'price',               label: 'Selling Price' },
  { key: 'purchase_price',      label: 'Purchase Price' },
  { key: 'quantity',            label: 'Qty' },
  { key: 'low_stock_threshold', label: 'Low Stock Alert' },
  { key: 'status',              label: 'Status' },
  { key: 'created_at',          label: 'Created' },
  { key: 'actions',             label: 'Actions' },
];

const rowVariants = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, x: -20 },
};

export default function ProductsTable({ products, sortKey, sortDir, onSort, onEdit, onDelete, onExport, pageOffset = 0, canEdit = true, canDelete = true }) {
  const handleSort = (key) => {
    if (!key || key === 'index' || key === 'actions') return;
    onSort(key);
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap ${
                    col.key !== 'index' && col.key !== 'actions'
                      ? 'cursor-pointer hover:text-foreground transition-colors'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {col.key !== 'index' && col.key !== 'actions' && (
                      <ArrowUpDown
                        size={13}
                        className={sortKey === col.key ? 'text-primary' : 'opacity-30'}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {products.map((product, idx) => (
                <motion.tr
                  key={product.id}
                  layout
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    layout: { type: 'spring', stiffness: 500, damping: 40 },
                    opacity: { duration: 0.18 },
                    y:       { duration: 0.18 },
                  }}
                  className={`border-b border-gray-50 dark:border-gray-800/60
                    hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-100
                    ${product._optimistic ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{pageOffset + idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.brand}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.model}</td>
                  <td className="px-4 py-3 text-foreground tabular-nums">{formatUGX(product.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{formatUGX(product.purchase_price)}</td>
                  <td className="px-4 py-3 text-foreground tabular-nums font-medium">{product.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.low_stock_threshold}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={getStockStatus(product.quantity, product.low_stock_threshold)} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onExport?.(product)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50
                                   dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                        title="Export"
                        disabled={product._optimistic}
                      >
                        <ArrowRightLeft size={15} />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-50
                                     dark:hover:text-amber-400 dark:hover:bg-amber-900/20 transition-colors"
                          title="Edit"
                          disabled={product._optimistic}
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(product)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50
                                     dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                          disabled={product._optimistic}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
