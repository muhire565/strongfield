import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../../hooks/useInventory';
import { useInventoryRealtime } from '../../../hooks/useInventoryRealtime';
import { PageTransition } from '../../../components/layout/PageTransition';
import { Search, Filter, Warehouse, History } from 'lucide-react';
import { inputClass } from '../../../components/ui/FormField';

import InventoryStatsBar from '../../../components/inventory/InventoryStatsBar';
import { InventoryTable } from '../../../components/inventory/InventoryTable';
import { MovementHistoryTable } from '../../../components/inventory/MovementHistoryTable';
import { ProductDetailPanel } from '../../../components/inventory/ProductDetailPanel';
import { StockInModal } from '../../../components/inventory/StockInModal';
import { StockOutModal } from '../../../components/inventory/StockOutModal';

export default function InventoryPage() {
  // Activate realtime subscription for this page
  useInventoryRealtime();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'history'
  
  // Inventory Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: inventoryData, isLoading } = useInventory({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    limit: 100, // Load enough for client side display
  });

  const products = Array.isArray(inventoryData) ? inventoryData : (inventoryData?.data || []);

  // Modals & Panels State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailPanelOpen, setDetailPanelOpen] = useState(false);
  const [stockInProduct, setStockInProduct] = useState(null);
  const [stockOutProduct, setStockOutProduct] = useState(null);

  const handleRowClick = (product) => {
    setSelectedProduct(product);
    setDetailPanelOpen(true);
  };

  const handleStockIn = (product) => {
    setStockInProduct(product);
  };

  const handleStockOut = (product) => {
    setStockOutProduct(product);
  };

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'history', label: 'Movement History', icon: History },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage stock movements and view deep inventory analytics.</p>
        </div>

        <InventoryStatsBar />

        {/* Tab Navigation */}
        <div className="border-b border-border">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="inventory-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'inventory' ? (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Inventory Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex flex-1 gap-3 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${inputClass()} pl-9`}
                    />
                  </div>
                  <div className="relative w-40">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`${inputClass()} pl-9`}
                    >
                      <option value="">All Status</option>
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </div>

              <InventoryTable
                products={products}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onStockIn={handleStockIn}
                onStockOut={handleStockOut}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MovementHistoryTable />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals & Panels */}
      {selectedProduct && (
        <ProductDetailPanel
          productId={selectedProduct.id}
          isOpen={isDetailPanelOpen}
          onClose={() => setDetailPanelOpen(false)}
          onStockIn={(p) => {
            setDetailPanelOpen(false);
            setStockInProduct(p);
          }}
          onStockOut={(p) => {
            setDetailPanelOpen(false);
            setStockOutProduct(p);
          }}
        />
      )}

      <StockInModal
        isOpen={!!stockInProduct}
        product={stockInProduct}
        onClose={() => setStockInProduct(null)}
      />

      <StockOutModal
        isOpen={!!stockOutProduct}
        product={stockOutProduct}
        onClose={() => setStockOutProduct(null)}
      />
    </PageTransition>
  );
}
