import React from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ShoppingCart,
  ArrowRightLeft,
  PackageCheck,
  SlidersHorizontal,
  PackagePlus,
  Activity
} from 'lucide-react';

const movementConfig = {
  stock_in:   { label: 'Stock In',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', icon: ArrowUpCircle    },
  stock_out:  { label: 'Stock Out',  color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',         icon: ArrowDownCircle  },
  sale:       { label: 'Sale',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',       icon: ShoppingCart     },
  export:     { label: 'Export',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',   icon: ArrowRightLeft   },
  import:     { label: 'Import',     color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',       icon: PackageCheck     },
  adjustment: { label: 'Adjustment', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',     icon: SlidersHorizontal },
  initial:    { label: 'Initial',    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',       icon: PackagePlus      },
};

export function MovementTypeBadge({ type, showIcon = true }) {
  const config = movementConfig[type] || { label: type, color: 'bg-gray-100 text-gray-600', icon: Activity };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>
      {showIcon && <Icon size={14} />}
      {config.label}
    </span>
  );
}
