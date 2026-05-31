import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSales, useSaleDetail, useRecordPayment, useVoidSale } from '../../../../hooks/usePOS';
import { usePOSRealtime } from '../../../../hooks/usePOSRealtime';
import { Search, Filter, Receipt, MoreVertical, CheckCircle, Clock, XCircle, CreditCard, X, Printer, Banknote, Smartphone, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { printInvoice } from '../../../../utils/pdfGenerator';

const formatCurrency = (val) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(val);

export default function SalesListPage() {
  usePOSRealtime();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [voidConfirm, setVoidConfirm] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const recordPaymentMut = useRecordPayment();
  const voidSaleMut = useVoidSale();

  const { data: salesData, isLoading } = useSales(statusFilter ? { status: statusFilter } : {});
  const { data: saleDetailData } = useSaleDetail(selectedSale?.id);
  const sales = salesData || [];
  const detailSale = saleDetailData || selectedSale;

  const filteredSales = sales.filter(s => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return s.sale_number.toLowerCase().includes(lower) || 
           s.client?.full_name?.toLowerCase().includes(lower);
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      partial: 'bg-blue-100 text-blue-800 border-blue-200',
      paid_in_full: 'bg-green-100 text-green-800 border-green-200',
      voided: 'bg-red-100 text-red-800 border-red-200',
    };
    const icons = {
      pending: Clock,
      partial: CreditCard,
      paid_in_full: CheckCircle,
      voided: XCircle,
    };
    const Icon = icons[status] || Clock;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[status]}`}>
        <Icon size={12} className="mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Ledger</h1>
          <p className="text-muted-foreground">View and manage all branch sales</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 bg-muted/10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={18} />
            <input 
              type="text" 
              placeholder="Search by invoice number or client name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pos-input w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pos-input px-3 py-2 text-sm appearance-none pr-8"
            >
              <option value="">All Statuses</option>
              <option value="paid_in_full">Paid in Full</option>
              <option value="partial">Partial Payment</option>
              <option value="pending">Pending</option>
              <option value="voided">Voided</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Invoice #</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Date</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Client</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Items</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border text-right">Total</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border text-right">Balance</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Status</th>
                <th className="p-4 border-b border-border"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan="8" className="p-8 text-center text-muted-foreground">Loading sales...</td></tr>
              ) : filteredSales.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-muted-foreground">No sales found.</td></tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setSelectedSale(sale)}>
                    <td className="p-4 font-medium text-foreground">
                      <div className="flex items-center space-x-2">
                        <Receipt size={16} className="text-primary/70" />
                        <span>{sale.sale_number}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{format(new Date(sale.created_at), 'dd MMM yyyy, HH:mm')}</td>
                    <td className="p-4 text-foreground">{sale.client?.full_name || <span className="text-muted-foreground italic">Walk-in</span>}</td>
                    <td className="p-4 text-muted-foreground text-sm">{sale.items[0]?.count || 0}</td>
                    <td className="p-4 font-semibold text-foreground text-right">{formatCurrency(sale.total_amount)}</td>
                    <td className="p-4 text-muted-foreground text-right">{sale.balance_due > 0 ? <span className="text-destructive font-medium">{formatCurrency(sale.balance_due)}</span> : '-'}</td>
                    <td className="p-4">{getStatusBadge(sale.status)}</td>
                    <td className="p-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-over Panel (Simplified) */}
      <AnimatePresence>
        {selectedSale && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSale(null)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{detailSale.sale_number}</h2>
                  <p className="text-sm text-muted-foreground">{format(new Date(detailSale.created_at), 'PPP p')}</p>
                </div>
                <button onClick={() => setSelectedSale(null)} className="p-2 bg-background rounded-full hover:bg-muted text-muted-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Customer Info</h3>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <p className="font-medium text-foreground">{detailSale.client?.full_name || 'Walk-in Customer'}</p>
                    <p className="text-sm text-muted-foreground">{detailSale.sale_type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment Summary</h3>
                  <div className="bg-background border border-border rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-semibold text-foreground">{formatCurrency(detailSale.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="text-green-600 font-medium">{formatCurrency(detailSale.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border font-bold">
                      <span className="text-foreground">Balance Due</span>
                      <span className={detailSale.balance_due > 0 ? 'text-destructive' : 'text-primary'}>
                        {formatCurrency(detailSale.balance_due)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {detailSale.items && detailSale.items.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items Sold</h3>
                    <div className="space-y-2">
                      {detailSale.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-background border border-border rounded-lg p-3 text-sm">
                          <div>
                            <p className="font-medium text-foreground">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">{item.brand} {item.model}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.line_total)}</p>
                            <p className="text-xs text-muted-foreground">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment History */}
                {detailSale.payments && detailSale.payments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment History</h3>
                    <div className="space-y-2">
                      {detailSale.payments.map((p, i) => (
                        <div key={i} className="flex items-center justify-between bg-background border border-border rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2">
                            {p.payment_mode === 'cash' ? <Banknote size={14} className="text-green-600" /> : <Smartphone size={14} className="text-primary" />}
                            <span className="text-muted-foreground">{p.payment_mode.replace(/_/g, ' ')}</span>
                            {p.reference_number && <span className="text-xs text-muted-foreground">Ref: {p.reference_number}</span>}
                          </div>
                          <span className="font-bold text-green-600">{formatCurrency(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {detailSale.balance_due > 0 && detailSale.status !== 'voided' && (
                    <button onClick={() => { setPaymentModalOpen(true); setPaymentAmount(detailSale.balance_due.toString()); }}
                      className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2">
                      <CreditCard size={18} />
                      <span>Record Payment</span>
                    </button>
                  )}
                  <button
                    onClick={() => printInvoice(detailSale)}
                    className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2">
                    <Printer size={18} />
                    <span>Print Invoice</span>
                  </button>
                </div>

                {detailSale.status !== 'voided' && (
                  <button onClick={() => setVoidConfirm(true)}
                    className="w-full py-2 text-destructive text-sm hover:bg-destructive/10 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <AlertTriangle size={14} />
                    Void Sale
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {paymentModalOpen && selectedSale && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPaymentModalOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-[70] p-4"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Record Payment</h2>
                  <button onClick={() => setPaymentModalOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors"><X size={18} /></button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Invoice</span><span className="font-medium">{detailSale.sale_number}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Balance Due</span><span className="font-bold text-destructive">{formatCurrency(detailSale.balance_due)}</span></div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</label>
                    <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                      className="pos-input w-full mt-1 px-3 py-2 text-sm" max={detailSale.balance_due}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                    <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                      className="pos-input w-full mt-1 px-3 py-2 text-sm appearance-none">
                      <option value="cash">Cash</option>
                      <option value="mtn_mobile_money">MTN Mobile Money</option>
                      <option value="airtel_money">Airtel Money</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  {(paymentMode === 'mtn_mobile_money' || paymentMode === 'airtel_money' || paymentMode === 'bank_transfer') && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference Number</label>
                      <input type="text" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)}
                        placeholder="Transaction ID / Bank ref"
                        className="pos-input w-full mt-1 px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const amt = parseFloat(paymentAmount);
                    if (!amt || amt <= 0) return;
                    if (amt > detailSale.balance_due) {
                      toast.error('Payment exceeds outstanding balance');
                      return;
                    }
                    recordPaymentMut.mutate({
                      saleId: detailSale.id,
                      data: { amount: amt, payment_mode: paymentMode, reference_number: paymentRef || null }
                    }, {
                      onSuccess: () => {
                        setPaymentModalOpen(false);
                        setPaymentAmount('');
                        setPaymentRef('');
                        setSelectedSale(null);
                      }
                    });
                  }}
                  disabled={recordPaymentMut.isPending}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  {recordPaymentMut.isPending ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Void Confirmation */}
      <AnimatePresence>
        {voidConfirm && selectedSale && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setVoidConfirm(false)}
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-[70] p-4"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className="text-destructive" />
                  <h2 className="text-lg font-bold text-foreground">Void Sale</h2>
                </div>
                <p className="text-muted-foreground text-sm">
                  This will reverse all stock deductions and client balances for <strong>{detailSale.sale_number}</strong>. This action cannot be undone.
                </p>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason (optional)</label>
                  <input type="text" value={voidReason} onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="e.g. Wrong items, customer cancelled"
                    className="pos-input w-full mt-1 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setVoidConfirm(false)} className="flex-1 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      voidSaleMut.mutate({ id: detailSale.id, reason: voidReason }, {
                        onSuccess: () => {
                          setVoidConfirm(false);
                          setVoidReason('');
                          setSelectedSale(null);
                        }
                      });
                    }}
                    disabled={voidSaleMut.isPending}
                    className="flex-1 py-3 bg-destructive text-white rounded-lg font-bold hover:bg-destructive/90 transition-colors disabled:opacity-40"
                  >
                    {voidSaleMut.isPending ? 'Voiding...' : 'Confirm Void'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
