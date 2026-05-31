import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SubmitButton } from '../ui/SubmitButton';

export default function DeleteConfirmDialog({ isOpen, product, onCancel, onConfirm, isSubmitting }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="" size="sm">
      <div className="flex gap-4">
        {/* Warning icon */}
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
          <TriangleAlert size={20} className="text-red-500" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Delete Product
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {product?.name}
            </span>
            ?{' '}
            This action cannot be undone and will permanently remove the product from inventory.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <SubmitButton
          onClick={onConfirm}
          isLoading={isSubmitting}
          loadingText="Deleting..."
          variant="danger"
        >
          Delete Product
        </SubmitButton>
      </div>
    </Modal>
  );
}
