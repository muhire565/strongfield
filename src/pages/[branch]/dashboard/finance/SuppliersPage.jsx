import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ArrowLeft, Phone, Mail, MapPin, Package, CreditCard, AlertTriangle, X, Download, Printer } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';
import { useSuppliers, useSupplier, useSupplierPayment, useCreateSupplier } from '../../../../hooks/useFinance';
import { useFinanceRealtime } from '../../../../hooks/useFinanceRealtime';
import { formatUGX } from '../../../../utils/formatters';
import { toast } from 'sonner';

const modeLabels = { cash: 'Cash', mtn_mobile_money: 'MTN Mobile Money', airtel_money: 'Airtel Money', bank_transfer: 'Bank Transfer' };
const statusLabels = { unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid' };
const statusColors = { unpaid: 'bg-red-500/20 text-red-400', partial: 'bg-amber-500/20 text-amber-400', paid: 'bg-emerald-500/20 text-emerald-400' };

function printSupplierStatement(supplier, statement) {
  const w = window.open('', '_blank');
  const rows = statement.map(s => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${s.date}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${s.type === 'purchase' ? 'Purchase' : 'Payment'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${s.reference}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${s.type === 'purchase' ? formatUGX(s.amount) : '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${s.type === 'payment' ? formatUGX(s.amount) : '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${formatUGX(s.running_balance)}</td>
    </tr>
  `).join('');
  w.document.write(`
    <html><head><title>Supplier Statement — ${supplier.name}</title></head>
    <body style="font-family:Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#333;">
      <h2 style="margin-bottom:4px;">Supplier Statement</h2>
      <p style="margin-top:0;color:#666;"><strong>${supplier.name}</strong> ${supplier.contact ? ' | ' + supplier.contact : ''}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:14px;">
        <thead style="background:#f5f5f5;">
          <tr>
            <th style="padding:10px;text-align:left;">Date</th>
            <th style="padding:10px;text-align:left;">Type</th>
            <th style="padding:10px;text-align:left;">Reference</th>
            <th style="padding:10px;text-align:right;">Debit</th>
            <th style="padding:10px;text-align:right;">Credit</th>
            <th style="padding:10px;text-align:right;">Balance</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot style="font-weight:bold;background:#f9f9f9;">
          <tr>
            <td style="padding:10px;" colspan="5">Total Balance Due</td>
            <td style="padding:10px;text-align:right;">${formatUGX(supplier.balance_due)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:30px;font-size:12px;color:#999;">Generated on ${new Date().toLocaleDateString()}</p>
    </body></html>
  `);
  w.document.close();
  w.print();
}

export default function SuppliersPage() {
  const { profile } = useAuthStore();
  const branchId = profile?.branch_id;
  useFinanceRealtime(branchId);

  const [view, setView] = useState('list'); // 'list' | 'detail'
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', email: '', address: '', notes: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_mode: 'cash', reference_number: '' });

  const { data: suppliersResp } = useSuppliers({ search, limit: 100 });
  const { data: detailResp, isLoading: detailLoading } = useSupplier(selectedId);
  const createSupplierMut = useCreateSupplier();
  const paymentMut = useSupplierPayment();

  const suppliers = suppliersResp?.data || [];
  const selectedSupplier = detailResp?.supplier || null;
  const purchases = detailResp?.purchases || [];
  const statement = detailResp?.statement || [];

  const handleCreateSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return toast.error('Name is required');
    createSupplierMut.mutate(newSupplier, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewSupplier({ name: '', contact: '', email: '', address: '', notes: '' });
      }
    });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount) || 0;
    if (amount <= 0) return toast.error('Amount must be greater than zero');
    if (selectedSupplier && amount > selectedSupplier.balance_due) return toast.error('Payment exceeds balance due');

    paymentMut.mutate(
      { id: selectedId, amount, payment_mode: paymentForm.payment_mode, reference_number: paymentForm.reference_number },
      {
        onSuccess: () => {
          setShowPaymentModal(false);
          setPaymentForm({ amount: '', payment_mode: 'cash', reference_number: '' });
        }
      }
    );
  };

  const openDetail = (s) => {
    setSelectedId(s.id);
    setView('detail');
  };

  if (view === 'detail' && selectedId) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setView('list'); setSelectedId(null); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{selectedSupplier?.name || '...'}</h1>
            {selectedSupplier?.contact && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" /> {selectedSupplier.contact}
              </div>
            )}
          </div>
        </div>

        {detailLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 h-24 animate-pulse" />
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl h-48 animate-pulse" />
          </div>
        )}

        {!detailLoading && selectedSupplier && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="text-sm text-muted-foreground mb-1">Total Purchases</div>
                <div className="text-2xl font-bold">USh {formatUGX(selectedSupplier.total_purchases)}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="text-sm text-muted-foreground mb-1">Total Paid</div>
                <div className="text-2xl font-bold text-emerald-400">USh {formatUGX(selectedSupplier.total_paid)}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="text-sm text-muted-foreground mb-1">Balance Due</div>
                <div className="text-2xl font-bold text-amber-400">USh {formatUGX(selectedSupplier.balance_due)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Payment Statement</h2>
              <div className="flex items-center gap-2">
                {statement.length > 0 && (
                  <button
                    onClick={() => printSupplierStatement(selectedSupplier, statement)}
                    className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <Printer className="w-4 h-4" /> Print Statement
                  </button>
                )}
                {selectedSupplier.balance_due > 0 && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" /> Make Payment
                  </button>
                )}
              </div>
            </div>

            {statement.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
                No transactions recorded for this supplier yet.
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground bg-muted/30">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Reference</th>
                        <th className="text-left py-3 px-4">Details</th>
                        <th className="text-right py-3 px-4">Debit</th>
                        <th className="text-right py-3 px-4">Credit</th>
                        <th className="text-right py-3 px-4">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.map((s, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="py-3 px-4 whitespace-nowrap">{s.date}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.type === 'purchase' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                            }`}>
                              {s.type === 'purchase' ? 'Purchase' : 'Payment'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{s.reference}</td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="truncate">{s.description}</div>
                            {s.type === 'purchase' && s.items && s.items.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {s.items.map((it, idx) => (
                                  <span key={idx}>{it.item_name} ({it.quantity}x)</span>
                                )).reduce((prev, curr, idx) => idx === 0 ? [curr] : [...prev, ', ', curr], [])}
                              </div>
                            )}
                            {s.type === 'payment' && s.payment_mode && (
                              <div className="text-xs text-muted-foreground mt-0.5">{modeLabels[s.payment_mode] || s.payment_mode}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {s.type === 'purchase' ? formatUGX(s.amount) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-emerald-400">
                            {s.type === 'payment' ? formatUGX(s.amount) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold">
                            {formatUGX(s.running_balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30 font-bold">
                        <td className="py-3 px-4" colSpan="6">Total Balance Due</td>
                        <td className="py-3 px-4 text-right text-amber-400">{formatUGX(selectedSupplier.balance_due)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Modal */}
            <AnimatePresence>
              {showPaymentModal && selectedSupplier && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">Pay {selectedSupplier.name}</h3>
                      <button onClick={() => setShowPaymentModal(false)} className="p-1 rounded hover:bg-muted transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Balance Due:</span> <span className="font-bold text-amber-400">USh {formatUGX(selectedSupplier.balance_due)}</span></div>
                    </div>
                    <form onSubmit={handlePayment} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Amount (UGX)</label>
                        <input type="number" min="1" max={selectedSupplier.balance_due} step="any" required
                          value={paymentForm.amount}
                          onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                          className="w-full px-3 py-2 pos-input" placeholder="Enter amount" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Payment Mode</label>
                        <select value={paymentForm.payment_mode}
                          onChange={e => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                          className="w-full px-3 py-2 pos-input">
                          {Object.entries(modeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Reference Number</label>
                        <input type="text" value={paymentForm.reference_number}
                          onChange={e => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                          className="w-full px-3 py-2 pos-input" placeholder="Receipt or transfer ref" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={paymentMut.isPending}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-40">
                          {paymentMut.isPending ? 'Processing...' : 'Record Payment'}
                        </button>
                        <button type="button" onClick={() => setShowPaymentModal(false)}
                          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Suppliers</h1>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-80 px-3 py-2 pos-input text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.length > 0 ? suppliers.map(s => (
          <motion.div
            key={s.id}
            layout
            onClick={() => openDetail(s)}
            className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/40 transition-colors space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                {s.contact && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {s.contact}</div>}
              </div>
              {s.balance_due > 0 ? (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">Owing</span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">Paid</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Total Purchases</div>
                <div className="font-medium">USh {formatUGX(s.total_purchases)}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Balance Due</div>
                <div className={`font-medium ${s.balance_due > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>USh {formatUGX(s.balance_due)}</div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
            {search ? 'No suppliers match your search' : 'No suppliers yet. Add your first supplier to start tracking.'}
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      <AnimatePresence>
        {showAddModal && (
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
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateSupplier} className="space-y-3">
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
                  <button type="button" onClick={() => setShowAddModal(false)}
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
