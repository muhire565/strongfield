import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, ChevronRight } from 'lucide-react';
import { formatUGX } from '../../utils/formatCurrency';
import { formatDistanceToNow } from 'date-fns';
import { StockStatusBadge } from './StockStatusBadge';

export function InventoryTable({ 
  products, 
  isLoading, 
  onStockIn, 
  onStockOut, 
  onEdit, 
  onDelete, 
  onRowClick 
}) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center text-muted-foreground animate-pulse">
        Loading inventory...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
        <p className="text-muted-foreground">No products match your search/filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Selling Price</th>
              <th className="px-4 py-3 font-medium">Purchase Price</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium text-center">Low Stock Alert</th>
              <th className="px-4 py-3 font-medium">Stock Value</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Updated</th>
              <th className="px-4 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence>
              {products.map((product, index) => {
                const isOut = product.stock_status === 'Out of Stock';
                const isLow = product.stock_status === 'Low Stock';

                return (
                  <motion.tr
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: product._optimistic === false ? 0.6 : 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => onRowClick(product)}
                  >
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{product.brand}</td>
                    <td className="px-4 py-3 text-muted-foreground">{product.model}</td>
                    <td className="px-4 py-3 text-foreground">{formatUGX(product.price)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatUGX(product.purchase_price)}</td>
                    <td className="px-4 py-3 font-bold">
                      <span className={isOut ? 'text-red-600 dark:text-red-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{product.low_stock_threshold}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatUGX(product.stock_value)}
                    </td>
                    <td className="px-4 py-3">
                      <StockStatusBadge status={product.stock_status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(product.updated_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onStockIn(product)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
                          title="Stock In"
                        >
                          <ArrowUpCircle size={18} />
                        </button>
                        <button
                          onClick={() => onStockOut(product)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          title="Stock Out"
                        >
                          <ArrowDownCircle size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-md transition-colors opacity-50 cursor-not-allowed"
                          title="Edit (Go to Products module)"
                          disabled
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-50 cursor-not-allowed"
                          title="Delete (Go to Products module)"
                          disabled
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => onRowClick(product)}
                          className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                          title="View Details"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
