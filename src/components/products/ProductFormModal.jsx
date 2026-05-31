import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { FormField, inputClass } from '../ui/FormField';
import { SubmitButton } from '../ui/SubmitButton';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  brand: z.string().min(1, 'Brand is required').max(100),
  model: z.string().min(1, 'Model is required').max(100),
  price: z.number().positive('Selling price must be greater than 0'),
  purchase_price: z.number().positive('Purchase price must be greater than 0'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or more'),
  low_stock_threshold: z.number().int().min(1, 'Threshold must be at least 1'),
});

function emptyValues() {
  return {
    name: '',
    brand: '',
    model: '',
    price: '',
    purchase_price: '',
    quantity: '',
    low_stock_threshold: 5,
  };
}

function toFormValues(product) {
  if (!product) return emptyValues();
  return {
    name: product.name || '',
    brand: product.brand || '',
    model: product.model || '',
    price: product.price ?? '',
    purchase_price: product.purchase_price ?? '',
    quantity: product.quantity ?? '',
    low_stock_threshold: product.low_stock_threshold ?? 5,
  };
}

function parseSubmit(values) {
  return {
    name: values.name,
    brand: values.brand,
    model: values.model,
    price: parseFloat(values.price) || 0,
    purchase_price: parseFloat(values.purchase_price) || 0,
    quantity: parseInt(values.quantity, 10) || 0,
    low_stock_threshold: parseInt(values.low_stock_threshold, 10) || 5,
  };
}

const fields = [
  { key: 'name',                label: 'Product Name',           type: 'text',   required: true },
  { key: 'brand',               label: 'Brand',                  type: 'text',   required: true },
  { key: 'model',               label: 'Model',                  type: 'text',   required: true },
  { key: 'price',               label: 'Selling Price (UGX)',    type: 'number', required: true, min: 0, step: '0.01' },
  { key: 'purchase_price',      label: 'Purchase Price (UGX)',   type: 'number', required: true, min: 0, step: '0.01' },
  { key: 'quantity',            label: 'Quantity',               type: 'number', required: true, min: 0, step: 1 },
  { key: 'low_stock_threshold', label: 'Low Stock Alert Threshold', type: 'number', required: true, min: 1, step: 1 },
];

export default function ProductFormModal({ isOpen, mode, product, onClose, onSubmit, isSubmitting }) {
  const [values, setValues] = useState(emptyValues());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setValues(toFormValues(product));
      setErrors({});
    }
  }, [isOpen, product]);

  const handleChange = (field, rawValue) => {
    setValues((prev) => ({ ...prev, [field]: rawValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseSubmit(values);
    const result = productSchema.safeParse(parsed);
    if (!result.success) {
      const formErrors = {};
      result.error.errors.forEach((err) => {
        formErrors[err.path[0]] = err.message;
      });
      setErrors(formErrors);
      toast.warning('Please fix the form errors before submitting.', { duration: 3000 });
      return;
    }
    onSubmit(result.data);
  };

  // Two-column layout for number fields
  const topFields = fields.slice(0, 3);
  const bottomFields = fields.slice(3);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Product' : 'Edit Product'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name / Brand / Model */}
        <div className="space-y-4">
          {topFields.map((field) => (
            <FormField key={field.key} label={field.label} error={errors[field.key]} required={field.required}>
              <input
                type={field.type}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={inputClass(!!errors[field.key])}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            </FormField>
          ))}
        </div>

        {/* Prices / Qty / Threshold in 2-col grid */}
        <div className="grid grid-cols-2 gap-4">
          {bottomFields.map((field) => (
            <FormField
              key={field.key}
              label={field.label}
              error={errors[field.key]}
              required={field.required}
            >
              <input
                type={field.type}
                min={field.min}
                step={field.step}
                value={values[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={inputClass(!!errors[field.key])}
              />
            </FormField>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
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
            loadingText={mode === 'create' ? 'Adding...' : 'Saving...'}
          >
            {mode === 'create' ? 'Add Product' : 'Save Changes'}
          </SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
