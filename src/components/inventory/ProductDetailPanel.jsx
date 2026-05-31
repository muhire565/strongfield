import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpCircle, ArrowDownCircle, Pencil, ArrowRightLeft } from 'lucide-react';
import { useProductDetail } from '../../hooks/useInventory';
import { formatUGX } from '../../utils/formatCurrency';
import { StockStatusBadge } from './StockStatusBadge';
import { MovementHistoryTimeline } from './MovementHistoryTimeline';

export function ProductDetailPanel({ productId, isOpen, onClose, onStockIn, onStockOut }) {
  const { data: product, isLoading } = useProductDetail(productId);

  // Prevent closing when clicking inside the panel
  const handlePanelClick = (e) => e.stopPropagation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col"
            onClick={handlePanelClick}
          >
            {isLoading || !product ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Loading details...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-border bg-muted/20">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-foreground mb-1">{product.name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{product.brand}</span>
                      <span>•</span>
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{product.model}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Available Stock</span>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-foreground">{product.quantity}</span>
                        <StockStatusBadge status={product.stock_status} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-px bg-border border-b border-border">
                  <div className="bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-1">Selling Price</p>
                    <p className="font-semibold text-sm">{formatUGX(product.price)}</p>
                  </div>
                  <div className="bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-1">Purchase Price</p>
                    <p className="font-semibold text-sm">{formatUGX(product.purchase_price)}</p>
                  </div>
                  <div className="bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-1">Stock Value</p>
                    <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">{formatUGX(product.stock_value)}</p>
                  </div>
                  <div className="bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-1">Low Stock Alert At</p>
                    <p className="font-semibold text-sm text-amber-600 dark:text-amber-400">{product.low_stock_threshold} units</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-b border-border grid grid-cols-4 gap-2 bg-muted/10">
                  <button
                    onClick={() => onStockIn(product)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-colors group"
                  >
                    <ArrowUpCircle size={20} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Stock In</span>
                  </button>
                  <button
                    onClick={() => onStockOut(product)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors group"
                  >
                    <ArrowDownCircle size={20} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Stock Out</span>
                  </button>
                  <button
                    onClick={() => {/* Edit triggers standard edit modal, perhaps later */}}
                    className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors group opacity-50 cursor-not-allowed"
                    title="Edit via Products page"
                  >
                    <Pencil size={20} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Edit</span>
                  </button>
                  <button
                    onClick={() => {/* Export triggers export modal, perhaps later */}}
                    className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 transition-colors group opacity-50 cursor-not-allowed"
                    title="Export via Products page"
                  >
                    <ArrowRightLeft size={20} className="mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Export</span>
                  </button>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto p-6 bg-card">
                  <MovementHistoryTimeline productId={productId} />
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
