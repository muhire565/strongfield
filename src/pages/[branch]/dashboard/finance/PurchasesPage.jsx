import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, AlertTriangle, Trash2, Package, UserPlus, ChevronDown, Search, X } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { useBalances, usePurchases, useRecordPurchase, useSuppliers, useCreateSupplier } from '../../../../hooks/useFinance';
import { useFinanceRealtime } from '../../../../hooks/useFinanceRealtime';
import { formatUGX } from '../../../../utils/formatters';
import { toast } from 'sonner';

const modeLabels = { cash: 'Cash', mtn_mobile_money: 'MTN Mobile Money', airtel_money: 'Airtel Money', bank_transfer: 'Bank Transfer' };
const statusLabels = { unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid' };
const statusColors = { unpaid: 'bg-red-500/20 text-red-400', partial: 'bg-amber-500/20 text-amber-400', paid: 'bg-emerald-500/20 text-emerald-400' };

const emptyItem = () => ({ item_name: '', quantity: '', unit_price: '' });

export default function PurchasesPage() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id;
  useFinanceRealtime(branchId);

  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([emptyItem()]);
  const [form, setForm] = useState({
    supplier_id: '', supplier_name: '', supplier_contact: '', amount_paid: '',
    payment_mode: 'cash', reference_number: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', email: '', address: '' });

  const dropdownRef = useRef(null);

  const { data: balances } = useBalances();
  const { data: purchasesResp } = usePurchases({ limit: 50 });
  const { data: suppliersResp } = useSuppliers({ search: supplierSearch, limit: 50 });
  const recordMut = useRecordPurchase();
  const createSupplierMut = useCreateSupplier();

  const suppliers = suppliersResp?.data || [];

  const balMap = {};
  (balances || []).forEach(b => { balMap[b.payment_mode] = Number(b.balance); });
  const currentBal = balMap[form.payment_mode] || 0;

  const totalAmount = useMemo(() =>
    items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0), 0),
  [items]);

  const paidVal = parseFloat(form.amount_paid) || 0;
  const balanceDue = totalAmount - paidVal;
  const insufficient = paidVal > 0 && paidVal > currentBal;

  const selectedSupplier = suppliers.find(s => String(s.id) === form.supplier_id);

  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const removeItem = (idx) => {
    setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [emptyItem()]);
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);

  const resetForm = () => {
    setItems([emptyItem()]);
    setForm({ supplier_id: '', supplier_name: '', supplier_contact: '', amount_paid: '', payment_mode: 'cash', reference_number: '', purchase_date: new Date().toISOString().split('T')[0] });
    setSupplierSearch('');
  };

  const selectSupplier = (s) => {
    setForm({ ...form, supplier_id: String(s.id), supplier_name: s.name, supplier_contact: s.contact || '' });
    setSupplierDropdownOpen(false);
    setSupplierSearch('');
  };

  const clearSupplier = () => {
    setForm({ ...form, supplier_id: '', supplier_name: '', supplier_contact: '' });
    setSupplierSearch('');
  };

  const handleSubmitNewSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return toast.error('Supplier name is required');
    createSupplierMut.mutate(newSupplier, {
      onSuccess: (res) => {
        selectSupplier(res.data);
        setShowNewSupplierModal(false);
        setNewSupplier({ name: '', contact: '', email: '', address: '' });
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items
      .map(it => ({ item_name: it.item_name.trim(), quantity: parseFloat(it.quantity), unit_price: parseFloat(it.unit_price) }))
      .filter(it => it.item_name && it.quantity > 0 && it.unit_price >= 0);

    if (!form.supplier_name.trim() && !form.supplier_id) return toast.error('Select or enter a supplier');
    if (validItems.length === 0) return toast.error('Add at least one valid item');
    if (totalAmount <= 0) return toast.error('Total amount must be greater than zero');
    if (paidVal < 0 || paidVal > totalAmount) return toast.error('Amount paid must be between 0 and total amount');
    if (insufficient) return toast.error(`Insufficient ${modeLabels[form.payment_mode]} balance for payment`);

    const payload = { ...form, items: validItems, amount_paid: paidVal };
    if (form.supplier_id) {
      payload.supplier_id = Number(form.supplier_id);
      delete payload.supplier_name;
      delete payload.supplier_contact;
    }

    recordMut.mutate(payload, { onSuccess: () => { setShowForm(false); resetForm(); } });
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSupplierDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <motion.form
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5 overflow-hidden"
          >
            {/* Supplier selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Supplier</label>
              <div className="relative" ref={dropdownRef}>
                {selectedSupplier ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{selectedSupplier.name}</div>
                      {selectedSupplier.contact && <div className="text-xs text-muted-foreground">{selectedSupplier.contact}</div>}
                    </div>
                    <button type="button" onClick={clearSupplier} className="p-1 rounded hover:bg-muted transition-colors">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div
                      onClick={() => setSupplierDropdownOpen(true)}
                      className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground flex-1">Search or select supplier...</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {supplierDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                    >
                      <div className="p-2 border-b border-border">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Type to search suppliers..."
                          value={supplierSearch}
                          onChange={e => setSupplierSearch(e.target.value)}
                          className="w-full px-3 py-1.5 pos-input text-sm"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {suppliers.length > 0 ? suppliers.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => selectSupplier(s)}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors text-sm"
                          >
                            <div className="font-medium">{s.name}</div>
                            {s.contact && <div className="text-xs text-muted-foreground">{s.contact}</div>}
                            {s.balance_due > 0 && <div className="text-xs text-amber-400">Balance due: USh {formatUGX(s.balance_due)}</div>}
                          </button>
                        )) : (
                          <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                            {supplierSearch ? 'No suppliers found' : 'No suppliers yet'}
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => { setSupplierDropdownOpen(false); setShowNewSupplierModal(true); }}
                          className="flex items-center gap-1.5 w-full px-3 py-2 text-sm text-primary hover:bg-muted/50 rounded transition-colors"
                        >
                          <UserPlus className="w-4 h-4" /> Add new supplier
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Manual fallback when no supplier selected */}
              {!selectedSupplier && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input type="text" required value={form.supplier_name}
                      onChange={e => setForm({ ...form, supplier_name: e.target.value })}
                      className="w-full px-3 py-2 pos-input text-sm" placeholder="Or type new supplier name" />
                  </div>
                  <div>
                    <input type="text" value={form.supplier_contact}
                      onChange={e => setForm({ ...form, supplier_contact: e.target.value })}
                      className="w-full px-3 py-2 pos-input text-sm" placeholder="Contact (optional)" />
                  </div>
                </div>
              )}
            </div>

            {/* Items section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-1.5"><Package className="w-4 h-4 text-primary" /> Items Purchased</h3>
                <button type="button" onClick={addItem}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-muted/30 md:bg-transparent rounded-lg p-3 md:p-0">
                    <div className="md:col-span-5">
                      <label className="md:hidden text-xs text-muted-foreground mb-0.5 block">Item Name</label>
                      <input type="text" required placeholder="Item name" value={item.item_name}
                        onChange={e => updateItem(idx, 'item_name', e.target.value)}
                        className="w-full px-3 py-2 pos-input text-sm" />
                    </div>
                    <div className="grid grid-cols-2 md:col-span-2 gap-2">
                      <div>
                        <label className="md:hidden text-xs text-muted-foreground mb-0.5 block">Qty</label>
                        <input type="number" min="0.01" step="any" required placeholder="Qty" value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 pos-input text-sm" />
                      </div>
                      <div>
                        <label className="md:hidden text-xs text-muted-foreground mb-0.5 block">Unit Price</label>
                        <input type="number" min="0" step="any" required placeholder="Unit price" value={item.unit_price}
                          onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                          className="w-full px-3 py-2 pos-input text-sm" />
                      </div>
                    </div>
                    <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        USh {formatUGX((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0))}
                      </span>
                      <button type="button" onClick={() => removeItem(idx)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end text-sm font-bold text-foreground">
                Total: USh {formatUGX(totalAmount)}
              </div>
            </div>

            {/* Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount Paid Now (UGX)</label>
                <input type="number" min="0" max={totalAmount} step="any" required value={form.amount_paid}
                  onChange={e => setForm({ ...form, amount_paid: e.target.value })}
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
                <label className="block text-sm font-medium mb-1">Reference / Invoice No.</label>
                <input type="text" value={form.reference_number}
                  onChange={e => setForm({ ...form, reference_number: e.target.value })}
                  className="w-full px-3 py-2 pos-input" placeholder="Invoice #123" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Date</label>
                <input type="date" required value={form.purchase_date}
                  onChange={e => setForm({ ...form, purchase_date: e.target.value })}
                  className="w-full px-3 py-2 pos-input" />
              </div>
            </div>

            {totalAmount > 0 && (
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
              <button type="submit" disabled={recordMut.isPending || insufficient || totalAmount <= 0}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-40">
                {recordMut.isPending ? 'Processing...' : 'Record Purchase'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Purchases table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>
            <th className="text-left px-4 py-3 font-medium">#</th>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-left px-4 py-3 font-medium">Supplier</th>
            <th className="text-left px-4 py-3 font-medium">Items</th>
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
                <td className="px-4 py-3 text-muted-foreground">{p.purchase_items?.[0]?.count ?? (p.description ? p.description.split(',').length : '—')}</td>
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

      {/* New Supplier Modal */}
      <AnimatePresence>
        {showNewSupplierModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Add New Supplier</h3>
                <button type="button" onClick={() => setShowNewSupplierModal(false)}
                  className="p-1 rounded hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitNewSupplier} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" required value={newSupplier.name}
                    onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    className="w-full px-3 py-2 pos-input" placeholder="Supplier name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact</label>
                  <input type="text" value={newSupplier.contact}
                    onChange={e => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                    className="w-full px-3 py-2 pos-input" placeholder="Phone or email" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={newSupplier.email}
                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full px-3 py-2 pos-input" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input type="text" value={newSupplier.address}
                    onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className="w-full px-3 py-2 pos-input" placeholder="Business address" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={createSupplierMut.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-40">
                    {createSupplierMut.isPending ? 'Creating...' : 'Create Supplier'}
                  </button>
                  <button type="button" onClick={() => setShowNewSupplierModal(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
