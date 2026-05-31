import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { useTransactions } from '../../../../hooks/useFinance';
import { useFinanceRealtime } from '../../../../hooks/useFinanceRealtime';
import { formatUGX } from '../../../../utils/formatters';

const typeColors = {
  capital_injection: 'bg-blue-500/20 text-blue-400',
  expense_payment: 'bg-red-500/20 text-red-400',
  owner_withdrawal: 'bg-orange-500/20 text-orange-400',
  goods_purchase: 'bg-purple-500/20 text-purple-400',
  pos_sale_payment: 'bg-emerald-500/20 text-emerald-400',
  credit_payment_received: 'bg-teal-500/20 text-teal-400',
  pos_refund: 'bg-pink-500/20 text-pink-400',
  inter_mode_transfer: 'bg-amber-500/20 text-amber-400',
  adjustment: 'bg-gray-500/20 text-gray-400',
};

const modeLabels = { cash: 'Cash', mtn_mobile_money: 'MTN Mobile Money', airtel_money: 'Airtel Money', bank_transfer: 'Bank Transfer' };

function typeLabel(t) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function LedgerPage() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id;
  useFinanceRealtime(branchId);

  const [filters, setFilters] = useState({ from_date: '', to_date: '', transaction_type: '', payment_mode: '', direction: '' });
  const { data: txnsResp, isLoading } = useTransactions({ limit: 50, ...filters });

  const exportCSV = () => {
    const rows = txnsResp?.data || [];
    if (!rows.length) return;
    const headers = ['Date', 'Type', 'Direction', 'Mode', 'Amount', 'Balance After', 'Description', 'Reference', 'By'];
    const csv = [
      headers.join(','),
      ...rows.map(r => [
        new Date(r.transaction_date).toLocaleString(),
        r.transaction_type,
        r.direction,
        r.payment_mode,
        r.amount,
        r.balance_after,
        `"${(r.description || '').replace(/"/g, '""')}"`,
        `"${(r.reference_id || '').replace(/"/g, '""')}"`,
        r.performer?.full_name || '',
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Transaction Ledger</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <input type="date" value={filters.from_date} onChange={e => setFilters({ ...filters, from_date: e.target.value })}
            className="w-full px-2 py-1.5 pos-input text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <input type="date" value={filters.to_date} onChange={e => setFilters({ ...filters, to_date: e.target.value })}
            className="w-full px-2 py-1.5 pos-input text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Type</label>
          <select value={filters.transaction_type} onChange={e => setFilters({ ...filters, transaction_type: e.target.value })}
            className="w-full px-2 py-1.5 pos-input text-sm">
            <option value="">All Types</option>
            <option value="capital_injection">Capital Injection</option>
            <option value="expense_payment">Expense Payment</option>
            <option value="owner_withdrawal">Owner Withdrawal</option>
            <option value="goods_purchase">Goods Purchase</option>
            <option value="pos_sale_payment">POS Sale Payment</option>
            <option value="credit_payment_received">Credit Payment</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Mode</label>
          <select value={filters.payment_mode} onChange={e => setFilters({ ...filters, payment_mode: e.target.value })}
            className="w-full px-2 py-1.5 pos-input text-sm">
            <option value="">All Modes</option>
            {Object.entries(modeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Direction</label>
          <select value={filters.direction} onChange={e => setFilters({ ...filters, direction: e.target.value })}
            className="w-full px-2 py-1.5 pos-input text-sm">
            <option value="">All</option>
            <option value="credit">Credit (In)</option>
            <option value="debit">Debit (Out)</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-left px-4 py-3 font-medium">Type</th>
            <th className="text-left px-4 py-3 font-medium">Dir</th>
            <th className="text-left px-4 py-3 font-medium">Mode</th>
            <th className="text-right px-4 py-3 font-medium">Amount</th>
            <th className="text-right px-4 py-3 font-medium">Balance After</th>
            <th className="text-left px-4 py-3 font-medium">Description</th>
            <th className="text-left px-4 py-3 font-medium">By</th>
          </tr></thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td></tr>)
            ) : txnsResp?.data?.length > 0 ? txnsResp.data.map(t => (
              <tr key={t.id} className={`border-t border-border hover:bg-muted/30 transition-colors ${t.direction === 'debit' ? 'bg-red-500/[0.02]' : 'bg-emerald-500/[0.02]'}`}>
                <td className="px-4 py-3 whitespace-nowrap">{new Date(t.transaction_date).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs ${typeColors[t.transaction_type] || 'bg-gray-500/20 text-gray-400'}`}>{typeLabel(t.transaction_type)}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold ${t.direction === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.direction === 'credit' ? '▲' : '▼'}
                  </span>
                </td>
                <td className="px-4 py-3">{modeLabels[t.payment_mode] || t.payment_mode}</td>
                <td className={`px-4 py-3 text-right font-bold ${t.direction === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.direction === 'credit' ? '+' : '-'} USh {formatUGX(t.amount)}
                </td>
                <td className="px-4 py-3 text-right">USh {formatUGX(t.balance_after)}</td>
                <td className="px-4 py-3 max-w-xs truncate">{t.description}</td>
                <td className="px-4 py-3 whitespace-nowrap">{t.performer?.full_name || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
