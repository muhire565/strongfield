import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { FormField, inputClass } from '../ui/FormField';
import { SubmitButton } from '../ui/SubmitButton';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function fetchBranches() {
  const res = await fetch(`${API_URL}/branches`);
  const json = await res.json();
  return json.data || [];
}

export default function ExportProductModal({
  isOpen,
  product,
  currentBranchId,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const [branches, setBranches] = useState([]);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const toastIdRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTargetBranchId('');
      setQuantity('1');
      setNotes('');
      setError('');
      fetchBranches().then(setBranches);
    }
  }, [isOpen]);

  const otherBranches = useMemo(
    () => branches.filter((b) => b.id !== currentBranchId),
    [branches, currentBranchId]
  );

  const targetBranch = useMemo(
    () => otherBranches.find((b) => b.id === targetBranchId),
    [otherBranches, targetBranchId]
  );

  const maxQty = product?.quantity ?? 0;
  const qtyNum = parseInt(quantity, 10) || 0;
  const remaining = maxQty - qtyNum;
  const isOverStock = qtyNum > maxQty;
  const isLowAfterExport = !isOverStock && product && remaining <= (product.low_stock_threshold ?? 5);

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!targetBranchId) {
      setError('Please select a destination branch.');
      return;
    }
    if (qtyNum < 1) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (isOverStock) {
      setError(`Insufficient stock. Available: ${maxQty}, Requested: ${qtyNum}`);
      return;
    }

    // Use toast.loading pattern — resolved in parent via onSuccess/onError in the mutation
    toastIdRef.current = toast.loading('Exporting product...');
    onSubmit(
      {
        target_branch_id: targetBranchId,
        quantity: qtyNum,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          toast.success(`Export to ${targetBranch?.display_name || 'branch'} complete`, {
            id: toastIdRef.current,
            description: `${qtyNum} unit(s) of "${product.name}" exported successfully.`,
            duration: 5000,
          });
          setTimeout(onClose, 300);
        },
        onError: (err) => {
          toast.error('Export failed', {
            id: toastIdRef.current,
            description: err?.message || 'Something went wrong. Please try again.',
          });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Product" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product summary card */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {product.brand} · {product.model}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1.5">
                Available:{' '}
                <span className="font-bold text-gray-900 dark:text-white">{product.quantity}</span>{' '}
                units
              </p>
            </div>
          </div>
        </div>

        {/* Branch selector — card-based radio buttons */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export to Branch <span className="text-red-500">*</span>
          </p>
          {otherBranches.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Loading branches…</p>
          ) : (
            <div className="grid gap-2">
              {otherBranches.map((branch) => {
                const selected = branch.id === targetBranchId;
                return (
                  <motion.button
                    key={branch.id}
                    type="button"
                    onClick={() => setTargetBranchId(branch.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left
                      transition-all duration-150 cursor-pointer
                      ${selected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                        ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${selected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                        {branch.display_name}
                      </p>
                    </div>
                    {selected && (
                      <CheckCircle2 size={16} className="ml-auto text-blue-500 flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quantity */}
        <FormField
          label="Quantity to Export"
          error={isOverStock ? `Max available: ${maxQty}` : undefined}
          required
        >
          <input
            type="number"
            min={1}
            max={maxQty}
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setError(''); }}
            className={inputClass(isOverStock)}
          />
          {/* Real-time remaining helper */}
          <AnimatePresence>
            {qtyNum > 0 && !isOverStock && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs mt-1 flex items-center gap-1 ${
                  isLowAfterExport ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {isLowAfterExport && <AlertTriangle size={11} className="flex-shrink-0" />}
                After export:{' '}
                <span className="font-semibold">{remaining}</span> unit{remaining !== 1 ? 's' : ''} remaining
                {isLowAfterExport && ' — below low stock threshold'}
              </motion.p>
            )}
          </AnimatePresence>
        </FormField>

        {/* Notes */}
        <FormField label="Notes (optional)">
          <textarea
            rows={2}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass(false) + ' resize-none'}
            placeholder="Add any notes about this export…"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{notes.length}/500</p>
        </FormField>

        {/* Inline validation error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 text-sm rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <SubmitButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Exporting..."
            disabled={isOverStock || !targetBranchId || isSubmitting}
          >
            {targetBranch ? `Export to ${targetBranch.display_name}` : 'Export'}
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
