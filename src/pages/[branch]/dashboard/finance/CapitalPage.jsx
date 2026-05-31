import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Landmark, Wallet } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { useBalances, useCapital, useInjectCapital } from '../../../../hooks/useFinance';
import { useFinanceRealtime } from '../../../../hooks/useFinanceRealtime';
import { formatUGX } from '../../../../utils/formatters';
import { toast } from 'sonner';

const modeLabels = { cash: 'Cash', mtn_mobile_money: 'MTN Mobile Money', airtel_money: 'Airtel Money', bank_transfer: 'Bank Transfer' };

export default function CapitalPage() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id;
  useFinanceRealtime(branchId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', payment_mode: 'cash', description: '', source: 'personal_savings' });

  const { data: balances } = useBalances();
  const { data: capitalResp } = useCapital({ limit: 50 });
  const injectMut = useInjectCapital();

  const balMap = {};
  (balances || []).forEach(b => { balMap[b.payment_mode] = Number(b.balance); });

  const currentBal = balMap[form.payment_mode] || 0;
  const projectedBal = currentBal + (parseFloat(form.amount) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error('Amount must be greater than zero');
    if (!form.description.trim()) return toast.error('Description is required');
    injectMut.mutate({
      amount,
      payment_mode: form.payment_mode,
      description: form.description,
      source: form.source,
    }, {
      onSuccess: () => {
        setShowForm(false);
        setForm({ amount: '', payment_mode: 'cash', description: '', source: 'personal_savings' });
      },
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Landmark className="w-6 h-6" /> Capital Injections</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Inject Capital
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-xl p-6 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (UGX)</label>
                <input type="number" min="1" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Mode</label>
                <select value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })}
                  className="w-full px-3 py-2 pos-input">
                  {Object.entries(modeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                  className="w-full px-3 py-2 pos-input">
                  <option value="personal_savings">Personal Savings</option>
                  <option value="business_loan">Business Loan</option>
                  <option value="reinvestment">Reinvestment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {form.amount ? (
                <span>{modeLabels[form.payment_mode]} balance: <b>USh {formatUGX(currentBal)}</b> → <b>USh {formatUGX(projectedBal)}</b></span>
              ) : (
                <span>Current {modeLabels[form.payment_mode]} balance: <b>USh {formatUGX(currentBal)}</b></span>
              )}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={injectMut.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-40">
                {injectMut.isPending ? 'Processing...' : 'Inject Capital'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Mode</th>
              <th className="text-left px-4 py-3 font-medium">Source</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-left px-4 py-3 font-medium">By</th>
            </tr>
          </thead>
          <tbody>
            {capitalResp?.length > 0 ? capitalResp.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">{new Date(c.injection_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-bold text-emerald-400">USh {formatUGX(c.amount)}</td>
                <td className="px-4 py-3">{modeLabels[c.payment_mode]}</td>
                <td className="px-4 py-3 capitalize">{c.source?.replace(/_/g, ' ') || '-'}</td>
                <td className="px-4 py-3">{c.description}</td>
                <td className="px-4 py-3">{c.injected_by_user?.full_name || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No capital injections recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
