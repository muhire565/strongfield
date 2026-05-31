import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Receipt, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { useBalances, useExpenses, useRecordExpense } from '../../../../hooks/useFinance';
import { useFinanceRealtime } from '../../../../hooks/useFinanceRealtime';
import { formatUGX } from '../../../../utils/formatters';
import { toast } from 'sonner';

const modeLabels = { cash: 'Cash', mtn_mobile_money: 'MTN Mobile Money', airtel_money: 'Airtel Money', bank_transfer: 'Bank Transfer' };
const catLabels = { rent: 'Rent', electricity: 'Electricity', water: 'Water', salaries: 'Salaries', transport: 'Transport', marketing: 'Marketing', maintenance: 'Maintenance', supplies: 'Supplies', bank_charges: 'Bank Charges', communication: 'Communication', other: 'Other' };
const catColors = { rent: 'bg-blue-500/20 text-blue-400', electricity: 'bg-blue-500/20 text-blue-400', water: 'bg-blue-500/20 text-blue-400', salaries: 'bg-purple-500/20 text-purple-400', transport: 'bg-amber-500/20 text-amber-400', marketing: 'bg-amber-500/20 text-amber-400', maintenance: 'bg-teal-500/20 text-teal-400', supplies: 'bg-teal-500/20 text-teal-400', bank_charges: 'bg-red-500/20 text-red-400', communication: 'bg-gray-500/20 text-gray-400', other: 'bg-gray-500/20 text-gray-400' };

export default function ExpensesPage() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id;
  useFinanceRealtime(branchId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'rent', description: '', amount: '', payment_mode: 'cash', vendor: '', reference_number: '', expense_date: new Date().toISOString().split('T')[0] });

  const { data: balances } = useBalances();
  const { data: expensesResp } = useExpenses({ limit: 50 });
  const recordMut = useRecordExpense();

  const balMap = {};
  (balances || []).forEach(b => { balMap[b.payment_mode] = Number(b.balance); });
  const currentBal = balMap[form.payment_mode] || 0;
  const amountVal = parseFloat(form.amount) || 0;
  const insufficient = amountVal > currentBal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amountVal <= 0) return toast.error('Amount must be greater than zero');
    if (!form.description.trim()) return toast.error('Description is required');
    if (insufficient) return toast.error(`Insufficient ${modeLabels[form.payment_mode]} balance`);
    recordMut.mutate({ ...form, amount: amountVal }, { onSuccess: () => { setShowForm(false); setForm({ category: 'rent', description: '', amount: '', payment_mode: 'cash', vendor: '', reference_number: '', expense_date: new Date().toISOString().split('T')[0] }); } });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="w-6 h-6" /> Expenses</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Record Expense
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 pos-input">
                  {Object.entries(catLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (UGX)</label>
                <input type="number" min="1" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Mode</label>
                <select value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })} className="w-full px-3 py-2 pos-input">
                  {Object.entries(modeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vendor / Paid To</label>
                <input type="text" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reference / Receipt No.</label>
                <input type="text" value={form.reference_number} onChange={e => setForm({ ...form, reference_number: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" required value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
            </div>
            {form.amount && (
              <div className="text-sm">
                {insufficient ? (
                  <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Insufficient {modeLabels[form.payment_mode]} balance. Available: USh {formatUGX(currentBal)}</span>
                ) : (
                  <span className="text-muted-foreground">{modeLabels[form.payment_mode]} balance after: <b>USh {formatUGX(currentBal - amountVal)}</b></span>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={recordMut.isPending || insufficient} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-40">
                {recordMut.isPending ? 'Processing...' : 'Record Expense'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className="text-left px-4 py-3 font-medium">#</th>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-left px-4 py-3 font-medium">Category</th>
            <th className="text-left px-4 py-3 font-medium">Description</th>
            <th className="text-left px-4 py-3 font-medium">Vendor</th>
            <th className="text-left px-4 py-3 font-medium">Amount</th>
            <th className="text-left px-4 py-3 font-medium">Mode</th>
          </tr></thead>
          <tbody>
            {expensesResp?.data?.length > 0 ? expensesResp.data.map(e => (
              <tr key={e.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{e.expense_number}</td>
                <td className="px-4 py-3">{new Date(e.expense_date).toLocaleDateString()}</td>
                <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${catColors[e.category] || catColors.other}`}>{catLabels[e.category] || e.category}</span></td>
                <td className="px-4 py-3">{e.description}</td>
                <td className="px-4 py-3">{e.vendor || '-'}</td>
                <td className="px-4 py-3 font-bold text-red-400">USh {formatUGX(e.amount)}</td>
                <td className="px-4 py-3">{modeLabels[e.payment_mode]}</td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No expenses recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
