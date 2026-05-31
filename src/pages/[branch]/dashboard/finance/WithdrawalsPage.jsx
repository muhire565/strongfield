import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { useBalances, useWithdrawals, useRecordWithdrawal } from '../../../../hooks/useFinance';
import { useFinanceRealtime } from '../../../../hooks/useFinanceRealtime';
import { formatUGX } from '../../../../utils/formatters';
import { toast } from 'sonner';

const modeLabels = { cash: 'Cash', mtn_mobile_money: 'MTN Mobile Money', airtel_money: 'Airtel Money', bank_transfer: 'Bank Transfer' };
const purposeLabels = { personal_savings: 'Personal Savings', school_fees: 'School Fees', household: 'Household', salary_to_self: 'Salary to Self', loan_repayment: 'Loan Repayment', investment: 'Investment', other: 'Other' };

export default function WithdrawalsPage() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id;
  useFinanceRealtime(branchId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', payment_mode: 'cash', purpose: 'personal_savings', description: '', reference_number: '' });

  const { data: balances } = useBalances();
  const { data: withdrawalsResp } = useWithdrawals({ limit: 50 });
  const recordMut = useRecordWithdrawal();

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
    recordMut.mutate({ ...form, amount: amountVal }, {
      onSuccess: (res) => {
        setShowForm(false);
        setForm({ amount: '', payment_mode: 'cash', purpose: 'personal_savings', description: '', reference_number: '' });
        const newBal = res.data?.new_balance || (currentBal - amountVal);
        if (newBal < 50000) toast.warning(`${modeLabels[form.payment_mode]} balance is now low (UGX ${formatUGX(newBal)}). Consider injecting capital.`);
      },
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="w-6 h-6" /> Owner Withdrawals</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Record Withdrawal
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium mb-1">Purpose</label>
                <select value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="w-full px-3 py-2 pos-input">
                  {Object.entries(purposeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reference No.</label>
                <input type="text" value={form.reference_number} onChange={e => setForm({ ...form, reference_number: e.target.value })}
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
                {recordMut.isPending ? 'Processing...' : 'Record Withdrawal'}
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
            <th className="text-left px-4 py-3 font-medium">Amount</th>
            <th className="text-left px-4 py-3 font-medium">Mode</th>
            <th className="text-left px-4 py-3 font-medium">Purpose</th>
            <th className="text-left px-4 py-3 font-medium">Description</th>
          </tr></thead>
          <tbody>
            {withdrawalsResp?.data?.length > 0 ? withdrawalsResp.data.map(w => (
              <tr key={w.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{w.withdrawal_number}</td>
                <td className="px-4 py-3">{new Date(w.withdrawal_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-bold text-orange-400">USh {formatUGX(w.amount)}</td>
                <td className="px-4 py-3">{modeLabels[w.payment_mode]}</td>
                <td className="px-4 py-3 capitalize">{purposeLabels[w.purpose] || w.purpose}</td>
                <td className="px-4 py-3">{w.description}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No withdrawals recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
