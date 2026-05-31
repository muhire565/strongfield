import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export function FormField({ label, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-xs text-red-500 flex items-center gap-1"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <AlertCircle size={11} className="flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Shared input className — import and apply to all inputs/textareas
export const inputClass = (hasError = false) =>
  `w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white dark:bg-gray-800
   text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
   transition-all duration-150 disabled:bg-gray-50 disabled:text-gray-400
   dark:border-gray-700 dark:focus:border-blue-500
   ${hasError ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-200'}`;
