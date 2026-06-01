import React from 'react';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'sales', label: 'Sales', types: ['sale_completed', 'payment_received', 'credit_balance_cleared', 'quotation_converted'] },
  { key: 'inventory', label: 'Inventory', types: ['low_stock', 'out_of_stock', 'stock_in', 'product_exported', 'product_imported'] },
  { key: 'finance', label: 'Finance', types: ['capital_injected', 'expense_recorded', 'large_withdrawal'] },
  { key: 'system', label: 'System', types: ['new_user_created'] },
];

export function NotificationFilterTabs({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            value === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-accent text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function getTypesForTab(tabKey) {
  const t = TABS.find((x) => x.key === tabKey);
  return t?.types || [];
}
