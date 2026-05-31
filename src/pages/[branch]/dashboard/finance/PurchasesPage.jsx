import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { useBalances, usePurchases, useRecordPurchase } from '../../../../hooks/useFinance';
import { useFinanceRealtime } from '../../../../hooks/useFinanceRealtime';
import { formatUGX } from '../../../../utils/formatters';
import { toast } from 'sonner';

const modeLabels = { cash: 'Cash', mtn_mobile_money: 'MTN Mobile Money', airtel_money: 'Airtel Money', bank_transfer: 'Bank Transfer' };
const statusLabels = { unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid' };
const statusColors = { unpaid: 'bg-red-500/20 text-red-400', partial: 'bg-amber-500/20 text-amber-400', paid: 'bg-emerald-500/20 text-emerald-400' };

export default function PurchasesPage() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id;
  useFinanceRealtime(branchId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplier_name: '', supplier_contact: '', description: '', total_amount: '', amount_paid: '', payment_mode: 'cash', reference_number: '', purchase_date: new Date().toISOString().split('T')[0] });

  const { data: balances } = useBalances();
  const { data: purchasesResp } = usePurchases({ limit: 50 });
  const recordMut = useRecordPurchase();

  const balMap = {};
  (balances || []).forEach(b => { balMap[b.payment_mode] = Number(b.balance); });
  const currentBal = balMap[form.payment_mode] || 0;
  const totalVal = parseFloat(form.total_amount) || 0;
  const paidVal = parseFloat(form.amount_paid) || 0;
  const balanceDue = totalVal - paidVal;
  const insufficient = paidVal > 0 && paidVal > currentBal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalVal <= 0) return toast.error('Total amount must be greater than zero');
    if (paidVal < 0 || paidVal > totalVal) return toast.error('Amount paid must be between 0 and total amount');
    if (insufficient) return toast.error(`Insufficient ${modeLabels[form.payment_mode]} balance for payment`);
    recordMut.mutate({ ...form, total_amount: totalVal, amount_paid: paidVal }, { onSuccess: () => { setShowForm(false); setForm({ supplier_name: '', supplier_contact: '', description: '', total_amount: '', amount_paid: '', payment_mode: 'cash', reference_number: '', purchase_date: new Date().toISOString().split('T')[0] }); } });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="w-6 h-6" /> Goods Purchases</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Record Purchase
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier Name</label>
                <input type="text" required value={form.supplier_name} onChange={e => setForm({ ...form, supplier_name: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier Contact</label>
                <input type="text" value={form.supplier_contact} onChange={e => setForm({ ...form, supplier_contact: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Amount (UGX)</label>
                <input type="number" min="1" required value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount Paid Now (UGX)</label>
                <input type="number" min="0" required value={form.amount_paid} onChange={e => setForm({ ...form, amount_paid: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Mode</label>
                <select value={form.payment_mode} onChange={e => setForm({ ...form, payment_mode: e.target.value })} className="w-full px-3 py-2 pos-input">
                  {Object.entries(modeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reference / Invoice No.</label>
                <input type="text" value={form.reference_number} onChange={e => setForm({ ...form, reference_number: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Date</label>
                <input type="date" required value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
            </div>
            {totalVal > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Balance Due: <b className="text-foreground">USh {formatUGX(balanceDue)}</b></span>
                {paidVal > 0 && (
                  <span>
                    {insufficient ? (
                      <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Only USh {formatUGX(currentBal)} available in {modeLabels[form.payment_mode]}</span>
                    ) : (
                      <span className="text-muted-foreground">{modeLabels[form.payment_mode]} after payment: <b>USh {formatUGX(currentBal - paidVal)}</b></span>
                    )}
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={recordMut.isPending || insufficient} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-40">
                {recordMut.isPending ? 'Processing...' : 'Record Purchase'}
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
            <th className="text-left px-4 py-3 font-medium">Supplier</th>
            <th className="text-left px-4 py-3 font-medium">Description</th>
            <th className="text-left px-4 py-3 font-medium">Total</th>
            <th className="text-left px-4 py-3 font-medium">Paid</th>
            <th className="text-left px-4 py-3 font-medium">Balance</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody>
            {purchasesResp?.data?.length > 0 ? purchasesResp.data.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{p.purchase_number}</td>
                <td className="px-4 py-3">{new Date(p.purchase_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{p.supplier_name}</td>
                <td className="px-4 py-3">{p.description}</td>
                <td className="px-4 py-3 font-bold">USh {formatUGX(p.total_amount)}</td>
                <td className="px-4 py-3 text-emerald-400">USh {formatUGX(p.amount_paid)}</td>
                <td className="px-4 py-3 text-amber-400">USh {formatUGX(p.balance_due)}</td>
                <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs ${statusColors[p.payment_status]}`}>{statusLabels[p.payment_status]}</span></td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No purchases recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
