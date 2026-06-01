import React from 'react';
import {
  Receipt,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Package,
  ArrowRightCircle,
  PackageCheck,
  FileText,
  UserPlus,
  Coins,
  ReceiptText,
  BanknoteX,
  Activity,
} from 'lucide-react';

const EVENT_ICON_MAP = {
  sale_completed: { icon: Receipt, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  payment_received: { icon: Banknote, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  credit_balance_cleared: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  low_stock: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  out_of_stock: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  stock_in: { icon: Package, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  product_exported: { icon: ArrowRightCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  product_imported: { icon: PackageCheck, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  quotation_converted: { icon: FileText, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  new_user_created: { icon: UserPlus, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  capital_injected: { icon: Coins, color: 'text-green-400', bg: 'bg-green-500/10' },
  expense_recorded: { icon: ReceiptText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  large_withdrawal: { icon: BanknoteX, color: 'text-red-400', bg: 'bg-red-500/10' },
  stock_out: { icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  export: { icon: ArrowRightCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  import: { icon: PackageCheck, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  adjustment: { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  sale: { icon: Receipt, color: 'text-teal-400', bg: 'bg-teal-500/10' },
};

export function ActivityIcon({ eventType, size = 18 }) {
  const config = EVENT_ICON_MAP[eventType] || { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-500/10' };
  const Icon = config.icon;
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
      <Icon size={size} className={config.color} />
    </div>
  );
}
