import React, { useState, useEffect } from 'react';
import { useStockIn } from '../../hooks/useInventory';
import { Modal } from '../ui/Modal';
import { FormField, inputClass } from '../ui/FormField';
import { SubmitButton } from '../ui/SubmitButton';

export function StockInModal({ isOpen, product, onClose }) {
  const stockInMutation = useStockIn();
  
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setUnitCost('');
      setReferenceId('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrors({ quantity: 'Quantity must be a positive number' });
      return;
    }

    const payload = {
      quantity: qty,
      unit_cost: unitCost ? parseFloat(unitCost) : undefined,
      reference_id: referenceId || undefined,
      notes: notes || undefined,
    };

    stockInMutation.mutate(
      { productId: product.id, data: payload },
      { onSuccess: () => onClose() }
    );
  };

  const projectedQty = product.quantity + (parseInt(quantity, 10) || 0);
  const isLowStock = product.quantity <= product.low_stock_threshold;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Stock In — ${product.name}`}>
      <div className={`mb-6 p-3 rounded-lg border ${
        isLowStock ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      }`}>
        <p className={`text-sm ${isLowStock ? 'text-amber-800 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'}`}>
          Current Stock: <strong>{product.quantity}</strong> unit(s)
          {isLowStock && product.quantity > 0 && ' (Low Stock)'}
          {product.quantity === 0 && ' (Out of Stock)'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Quantity to Add" required error={errors.quantity}>
            <input
              type="number"
              className={inputClass(errors.quantity)}
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 10"
            />
            {quantity && (
              <p className="text-xs text-muted-foreground mt-1">
                Projected total: {projectedQty} unit(s)
              </p>
            )}
          </FormField>

          <FormField label="Unit Cost (UGX)" error={errors.unitCost}>
            <input
              type="number"
              className={inputClass(errors.unitCost)}
              min="0"
              step="100"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="Optional"
            />
          </FormField>
        </div>

        <FormField label="Reference / PO Number" error={errors.referenceId}>
          <input
            type="text"
            className={inputClass(errors.referenceId)}
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g. PO-2026-001"
            maxLength={100}
          />
        </FormField>

        <FormField label="Notes" error={errors.notes}>
          <textarea
            className={inputClass(errors.notes)}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this stock receipt..."
            rows={3}
            maxLength={500}
          />
        </FormField>

        <div className="pt-4 flex justify-end gap-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-sm text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <SubmitButton
            isLoading={stockInMutation.isPending}
            loadingText="Adding Stock..."
            variant="primary"
          >
            Add {quantity || 0} Units
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
