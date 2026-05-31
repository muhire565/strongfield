import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useExportProduct,
  useProductExports,
} from '../../hooks/useProducts';
import { useProductsRealtime } from '../../hooks/useProductsRealtime';
import { useDebounce } from '../../hooks/useDebounce';
import { PageTransition } from '../layout/PageTransition';
import ProductsHeader from './ProductsHeader';
import ProductsStatsBar from './ProductsStatsBar';
import ProductsTable from './ProductsTable';
import ProductFormModal from './ProductFormModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ExportProductModal from './ExportProductModal';
import ExportHistory from './ExportHistory';
import { Package, Plus } from 'lucide-react';

function getStockStatus(quantity, threshold) {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= threshold) return 'Low Stock';
  return 'In Stock';
}

// Improved skeleton with realistic varying widths
function SkeletonRow({ cols }) {
  const widths = [40, 80, 70, 70, 90, 90, 50, 80, 70, 80, 60];
  return (
    <tr className="border-b border-gray-50 dark:border-gray-800/60">
      {widths.map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {Array.from({ length: 11 }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ searchQuery, onAddProduct }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-700">
        <Package size={28} className="text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
        No products found
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs leading-relaxed">
        {searchQuery
          ? `No products match "${searchQuery}". Try a different search term.`
          : 'Get started by adding your first product to this branch.'}
      </p>
      {!searchQuery && (
        <button
          onClick={onAddProduct}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600
                     text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800
                     transition-colors shadow-sm hover:shadow-md"
        >
          <Plus size={16} />
          Add First Product
        </button>
      )}
    </motion.div>
  );
}

export default function ProductsPage() {
  // Activate realtime subscription
  useProductsRealtime();

  const profile = useAuthStore((s) => s.profile);
  const { data: products = [], isLoading } = useProducts();
  const { data: exports = [], isLoading: exportsLoading } = useProductExports();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const exportProduct = useExportProduct();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [activeTab, setActiveTab] = useState('products');

  const [modalMode, setModalMode] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exportTarget, setExportTarget] = useState(null);

  // 250ms debounce as per spec
  const debouncedSearch = useDebounce(search, 250);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term) ||
          p.model?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(
        (p) =>
          getStockStatus(p.quantity, p.low_stock_threshold)
            .toLowerCase()
            .replace(/\s+/g, '_') === statusFilter
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (sortKey === 'status') {
        aVal = getStockStatus(a.quantity, a.low_stock_threshold);
        bVal = getStockStatus(b.quantity, b.low_stock_threshold);
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase?.() ?? '';
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, debouncedSearch, statusFilter, sortKey, sortDir]);

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey]
  );

  const handleAdd = () => {
    setSelectedProduct(null);
    setModalMode('create');
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalMode('edit');
  };

  const handleDelete = (product) => setDeleteTarget(product);
  const handleExport = (product) => setExportTarget(product);

  // Mutations now carry their own toast calls — just handle modal closing here
  const handleSubmit = async (data) => {
    try {
      if (modalMode === 'create') {
        await createProduct.mutateAsync(data);
      } else {
        await updateProduct.mutateAsync({ id: selectedProduct.id, data });
      }
      setModalMode(null);
      setSelectedProduct(null);
    } catch {
      // Error toast is fired by the mutation hook — nothing to do here
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Error toast fired by mutation hook
    }
  };

  const handleExportSubmit = (payload, callbacks) => {
    exportProduct.mutate(
      { productId: exportTarget.id, payload },
      {
        onSuccess: (res) => {
          callbacks?.onSuccess?.(res);
        },
        onError: (err) => {
          callbacks?.onError?.(err);
        },
      }
    );
  };

  return (
    <PageTransition>
      {activeTab === 'products' && (
        <>
          <ProductsHeader
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAddClick={handleAdd}
          />
          <ProductsStatsBar products={products} />
        </>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-5 border-b border-border">
        {['products', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-3 px-1 text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'products' ? 'Products' : 'Export History'}
            {activeTab === tab && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isLoading ? (
              <TableSkeleton />
            ) : filteredProducts.length === 0 ? (
              <EmptyState searchQuery={debouncedSearch} onAddProduct={handleAdd} />
            ) : (
              <ProductsTable
                products={filteredProducts}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ExportHistory exports={exports} isLoading={exportsLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ProductFormModal
        isOpen={!!modalMode}
        mode={modalMode}
        product={selectedProduct}
        onClose={() => {
          setModalMode(null);
          setSelectedProduct(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        product={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isSubmitting={deleteProduct.isPending}
      />

      <ExportProductModal
        isOpen={!!exportTarget}
        product={exportTarget}
        currentBranchId={profile?.branch_id}
        onClose={() => setExportTarget(null)}
        onSubmit={handleExportSubmit}
        isSubmitting={exportProduct.isPending}
      />
    </PageTransition>
  );
}
