import React, { useState, useEffect } from 'react';
import { useStockOut } from '../../hooks/useInventory';
import { Modal } from '../ui/Modal';
import { FormField, inputClass } from '../ui/FormField';
import { SubmitButton } from '../ui/SubmitButton';

export function StockOutModal({ isOpen, product, onClose }) {
  const stockOutMutation = useStockOut();
  
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('stock_out');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setReason('stock_out');
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
      setErrors({ quantity: 'Quantity must be greater than zero.' });
      return;
    }

    if (qty > product.quantity) {
      setErrors({ quantity: `Cannot remove more than available stock (${product.quantity} units).` });
      return;
    }

    if (!reason) {
      setErrors({ reason: 'Please select a reason for stock removal.' });
      return;
    }

    const payload = {
      quantity: qty,
      reason,
      reference_id: referenceId || undefined,
      notes: notes || undefined,
    };

    stockOutMutation.mutate(
      { productId: product.id, data: payload },
      { onSuccess: () => onClose() }
    );
  };

  const projectedQty = product.quantity - (parseInt(quantity, 10) || 0);
  const isZero = projectedQty <= 0 && quantity !== '';
  const isLow = !isZero && projectedQty <= product.low_stock_threshold && quantity !== '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Stock Out — ${product.name}`}>
      <div className="mb-6 p-3 rounded-lg border bg-muted/50 border-border">
        <p className="text-sm text-foreground">
          Available Stock: <strong>{product.quantity}</strong> unit(s)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Quantity to Remove" required error={errors.quantity}>
            <input
              type="number"
              className={inputClass(errors.quantity)}
              min="1"
              max={product.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 5"
            />
            {quantity && (
              <p className={`text-xs mt-1 font-medium ${isZero ? 'text-red-600 dark:text-red-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                Remaining: {projectedQty} unit(s)
                {isZero && ' (Out of stock)'}
                {isLow && ' (Low stock)'}
              </p>
            )}
          </FormField>

          <FormField label="Reason" required error={errors.reason}>
            <select
              className={inputClass(errors.reason)}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="stock_out">General Stock Out (Damage/Loss)</option>
              <option value="sale">Recorded Sale</option>
              <option value="adjustment">Inventory Adjustment</option>
            </select>
          </FormField>
        </div>

        <FormField label="Reference Number" error={errors.referenceId}>
          <input
            type="text"
            className={inputClass(errors.referenceId)}
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g. INV-2026-001"
            maxLength={100}
          />
        </FormField>

        <FormField label="Notes" error={errors.notes}>
          <textarea
            className={inputClass(errors.notes)}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for removal..."
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
            isLoading={stockOutMutation.isPending}
            loadingText="Removing..."
            variant="danger"
          >
            Remove {quantity || 0} Units
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
