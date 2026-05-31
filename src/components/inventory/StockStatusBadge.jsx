import React from 'react';

export function StockStatusBadge({ status }) {
  let colorClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  
  if (status === 'In Stock') {
    colorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
  } else if (status === 'Low Stock') {
    colorClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
  } else if (status === 'Out of Stock') {
    colorClass = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
}
