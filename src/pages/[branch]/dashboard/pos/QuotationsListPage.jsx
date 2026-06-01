import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuotations, useCreateQuotation, useConvertQuotation, useCancelQuotation } from '../../../../hooks/usePOS';
import { useClients } from '../../../../hooks/usePOS';
import { usePOSRealtime } from '../../../../hooks/usePOSRealtime';
import { useProducts } from '../../../../hooks/useProducts';
import { Search, Filter, FileText, X, ArrowRightLeft, Ban, CheckCircle, Clock, Send, Plus, Trash2, PlusCircle, MinusCircle, CalendarDays, StickyNote, Printer, MessageCircle } from 'lucide-react';
import Pagination from '../../../../components/ui/Pagination';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { printQuotation } from '../../../../utils/pdfGenerator';
import { openWhatsApp, buildQuotationSummary, downloadBlob, shareFile } from '../../../../utils/shareUtils';
import { generateQuotationPdfBlob } from '../../../../utils/pdfBlobGenerator';
import { posService } from '../../../../services/posService';

const formatCurrency = (val) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(val);

const STATUS_CONFIG = {
  draft:     { class: 'bg-gray-100 text-gray-800 border-gray-200',    icon: FileText,    label: 'Draft' },
  sent:      { class: 'bg-blue-100 text-blue-800 border-blue-200',     icon: Send,        label: 'Sent' },
  accepted:  { class: 'bg-teal-100 text-teal-800 border-teal-200',     icon: CheckCircle, label: 'Accepted' },
  converted: { class: 'bg-green-100 text-green-800 border-green-200',  icon: ArrowRightLeft, label: 'Converted' },
  expired:   { class: 'bg-amber-100 text-amber-800 border-amber-200',  icon: Clock,       label: 'Expired' },
  cancelled: { class: 'bg-red-100 text-red-800 border-red-200',        icon: Ban,         label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.class}`}>
      <Icon size={12} className="mr-1" />
      {config.label}
    </span>
  );
}

export default function QuotationsListPage() {
  usePOSRealtime();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;
  const [convertQuote, setConvertQuote] = useState(null);
  const [saleType, setSaleType] = useState('cash_sale');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');

  const { data: quotesData, isLoading } = useQuotations({
    status: statusFilter || undefined,
    search: search || undefined,
    page,
    limit,
  });
  const quotes = quotesData?.data || [];
  const total = quotesData?.count || 0;

  const convertMut = useConvertQuotation();
  const cancelMut = useCancelQuotation();
  const createQuoteMut = useCreateQuotation();

  // ── Create Quotation Modal State ──
  const [showCreate, setShowCreate] = useState(false);
  const [quoteClientId, setQuoteClientId] = useState('');
  const [quoteValidUntil, setQuoteValidUntil] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteDiscountAmount, setQuoteDiscountAmount] = useState('');
  const [quoteItems, setQuoteItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  const { data: clientsData } = useClients();
  const { data: productsData } = useProducts();
  const clients = clientsData || [];
  const products = productsData || [];

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return [];
    return products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.model?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [productSearch, products]);

  const quoteSubtotal = quoteItems.reduce((a, i) => a + i.unit_price * i.quantity, 0);
  const quoteDiscount = Math.max(0, parseFloat(quoteDiscountAmount) || 0);
  const quoteTotal = Math.max(0, quoteSubtotal - quoteDiscount);

  const addItem = (product) => {
    setQuoteItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i => i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1, line_total: (i.quantity + 1) * i.unit_price }
          : i);
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        brand: product.brand,
        model: product.model,
        unit_price: product.price,
        purchase_price: product.purchase_price || 0,
        quantity: 1,
        discount_amount: 0,
        line_total: product.price,
      }];
    });
    setProductSearch('');
  };

  const updateItemQty = (productId, delta) => {
    setQuoteItems(prev => prev.map(item => {
      if (item.product_id !== productId) return item;
      const newQ = item.quantity + delta;
      if (newQ <= 0) return item;
      return { ...item, quantity: newQ, line_total: newQ * item.unit_price };
    }));
  };

  const removeItem = (productId) => setQuoteItems(prev => prev.filter(i => i.product_id !== productId));

  const handleCreateQuotation = () => {
    if (quoteItems.length === 0) return toast.error('Add at least one product');
    const clientName = quoteClientId
      ? clients.find(c => c.id.toString() === quoteClientId)?.full_name || null
      : null;
    createQuoteMut.mutate({
      client_id: quoteClientId ? parseInt(quoteClientId) : null,
      client_name_snapshot: clientName,
      subtotal: quoteSubtotal,
      discount_amount: quoteDiscount,
      discount_type: quoteDiscount > 0 ? 'fixed' : 'none',
      discount_value: quoteDiscount,
      tax_rate: 0,
      tax_amount: 0,
      total_amount: quoteTotal,
      valid_until: quoteValidUntil || null,
      notes: quoteNotes || null,
      items: quoteItems.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        brand: i.brand,
        model: i.model,
        quantity: i.quantity,
        unit_price: i.unit_price,
        purchase_price: i.purchase_price || 0,
        discount_amount: i.discount_amount,
        line_total: i.line_total,
      })),
    }, {
      onSuccess: () => {
        setShowCreate(false);
        setQuoteClientId('');
        setQuoteValidUntil('');
        setQuoteNotes('');
        setQuoteDiscountAmount('');
        setQuoteItems([]);
      }
    });
  };

  const handleCancel = (id) => {
    if (!window.confirm('Cancel this quotation?')) return;
    cancelMut.mutate(id);
  };

  const handlePrintQuote = async (id) => {
    try {
      const quote = await posService.getQuotation(id);
      printQuotation(quote);
    } catch (err) {
      toast.error('Failed to load quotation for printing');
    }
  };

  const handleShareQuote = async (id) => {
    try {
      const quote = await posService.getQuotation(id);
      openWhatsApp({ text: buildQuotationSummary(quote) });
    } catch (err) {
      toast.error('Failed to load quotation for sharing');
    }
  };

  const handleSharePdfQuote = async (id) => {
    try {
      const quote = await posService.getQuotation(id);
      const blob = generateQuotationPdfBlob(quote);
      const filename = `Quotation_${quote.quote_number || id}.pdf`;
      const shared = await shareFile(blob, filename, `Quotation ${quote.quote_number}`);
      if (!shared) {
        downloadBlob(blob, filename);
        toast.success('PDF downloaded. Attach it in WhatsApp to share.');
      }
    } catch {
      toast.error('Failed to generate quotation PDF');
    }
  };

  const handleConvert = () => {
    if (!convertQuote) return;
    const amt = parseFloat(amountPaid) || 0;
    if (amt > convertQuote.total_amount) {
      toast.error('Amount paid cannot exceed total');
      return;
    }
    convertMut.mutate({
      id: convertQuote.id,
      data: {
        sale_type: saleType,
        amount_paid: amt,
        payment_mode: amt > 0 ? paymentMode : null,
        reference_number: referenceNumber || null,
      }
    }, {
      onSuccess: () => setConvertQuote(null),
    });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quotations</h1>
          <p className="text-muted-foreground">Manage quotes and proforma invoices</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Create Quotation
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 bg-muted/10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={18} />
            <input
              type="text"
              placeholder="Search by quote number or client..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pos-input w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="pos-input px-3 py-2 text-sm appearance-none pr-8"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="converted">Converted</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Quote #</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Client</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Date</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Valid Until</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border text-right">Total</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Status</th>
                <th className="p-4 border-b border-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan="7" className="p-8 text-center text-muted-foreground">Loading quotations...</td></tr>
              ) : quotes.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-muted-foreground">No quotations found.</td></tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 font-medium text-foreground">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} className="text-primary/70" />
                        <span>{q.quote_number}</span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{q.client?.full_name || q.client_name_snapshot || <span className="text-muted-foreground italic">Walk-in</span>}</td>
                    <td className="p-4 text-muted-foreground text-sm">{format(new Date(q.created_at), 'dd MMM yyyy')}</td>
                    <td className="p-4 text-muted-foreground text-sm">{q.valid_until ? format(new Date(q.valid_until), 'dd MMM yyyy') : '-'}</td>
                    <td className="p-4 font-semibold text-foreground text-right">{formatCurrency(q.total_amount)}</td>
                    <td className="p-4"><StatusBadge status={q.status} /></td>
                    <td className="p-4 text-right space-x-1">
                      {q.status === 'draft' && (
                        <>
                          <button onClick={() => setConvertQuote(q)} className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Convert</button>
                          <button onClick={() => handleCancel(q.id)} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-destructive hover:text-white transition-colors">Cancel</button>
                        </>
                      )}
                      {q.status === 'accepted' && (
                        <button onClick={() => setConvertQuote(q)} className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">Convert</button>
                      )}
                      {q.status === 'converted' && (
                        <span className="text-xs text-muted-foreground">→ {q.converted_to_sale_id}</span>
                      )}
                      {q.status !== 'cancelled' && (
                        <>
                          <button onClick={() => handlePrintQuote(q.id)} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors inline-flex items-center gap-1">
                            <Printer size={12} /> Print
                          </button>
                          <button onClick={() => handleShareQuote(q.id)} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 transition-colors inline-flex items-center gap-1">
                            <MessageCircle size={12} /> Text
                          </button>
                          <button onClick={() => handleSharePdfQuote(q.id)} className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors inline-flex items-center gap-1">
                            <FileText size={12} /> PDF
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onChange={setPage}
        />
      </div>

      {/* Convert Modal */}
      <AnimatePresence>
        {convertQuote && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConvertQuote(null)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Convert to Sale</h2>
                  <button onClick={() => setConvertQuote(null)} className="p-1 hover:bg-muted rounded-full transition-colors"><X size={18} /></button>
                </div>
                <p className="text-muted-foreground text-sm">Converting <strong>{convertQuote.quote_number}</strong> — Total: {formatCurrency(convertQuote.total_amount)}</p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sale Type</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {['cash_sale', 'credit_sale'].map(type => (
                        <button key={type} onClick={() => setSaleType(type)}
                          className={`py-2 rounded-lg text-sm font-medium border transition-all ${saleType === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}>
                          {type === 'cash_sale' ? 'Cash Sale' : 'Credit Sale'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount Paid Now</label>
                    <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder={convertQuote.total_amount.toFixed(0)}
                      className="pos-input w-full mt-1 px-3 py-2 text-sm"
                    />
                  </div>
                  {parseFloat(amountPaid) > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                      <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                        className="pos-input w-full mt-1 px-3 py-2 text-sm appearance-none">
                        <option value="cash">Cash</option>
                        <option value="mtn_mobile_money">MTN Mobile Money</option>
                        <option value="airtel_money">Airtel Money</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                      {(paymentMode === 'mtn_mobile_money' || paymentMode === 'airtel_money' || paymentMode === 'bank_transfer') && (
                        <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="Reference number"
                          className="pos-input w-full mt-2 px-3 py-2 text-sm"
                        />
                      )}
                    </div>
                  )}
                </div>

                <button onClick={handleConvert} disabled={convertMut.isPending}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-40">
                  {convertMut.isPending ? 'Converting...' : 'Convert to Sale'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Quotation Modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-[70] p-4"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Create Quotation</h2>
                  <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-muted rounded-full transition-colors"><X size={18} /></button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-5">
                  {/* Client */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</label>
                    <select value={quoteClientId} onChange={(e) => setQuoteClientId(e.target.value)}
                      className="pos-input w-full mt-1 px-3 py-2 text-sm appearance-none">
                      <option value="">Walk-in Customer</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>
                      ))}
                    </select>
                  </div>

                  {/* Valid Until + Notes row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <CalendarDays size={12} /> Valid Until
                      </label>
                      <input type="date" value={quoteValidUntil} onChange={(e) => setQuoteValidUntil(e.target.value)}
                        className="pos-input w-full mt-1 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <StickyNote size={12} /> Notes
                      </label>
                      <input type="text" value={quoteNotes} onChange={(e) => setQuoteNotes(e.target.value)}
                        placeholder="Optional notes..." className="pos-input w-full mt-1 px-3 py-2 text-sm" />
                    </div>
                  </div>

                  {/* Product Search */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Products</label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={16} />
                      <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products by name, brand or model..."
                        className="pos-input w-full pl-10 pr-4 py-2 text-sm"
                      />
                      {filteredProducts.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                          {filteredProducts.map(p => (
                            <button key={p.id} onClick={() => addItem(p)}
                              className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors flex items-center justify-between text-sm">
                              <span>{p.name} <span className="text-muted-foreground text-xs">{p.brand} {p.model}</span></span>
                              <span className="font-medium">{formatCurrency(p.price)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cart Table */}
                  {quoteItems.length > 0 && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="p-3 font-medium text-muted-foreground">Product</th>
                            <th className="p-3 font-medium text-muted-foreground text-right">Qty</th>
                            <th className="p-3 font-medium text-muted-foreground text-right">Unit</th>
                            <th className="p-3 font-medium text-muted-foreground text-right">Total</th>
                            <th className="p-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {quoteItems.map(item => (
                            <tr key={item.product_id}>
                              <td className="p-3">
                                <p className="font-medium">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">{item.brand} {item.model}</p>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => updateItemQty(item.product_id, -1)} className="p-1 hover:bg-muted rounded"><MinusCircle size={14} /></button>
                                  <span className="w-6 text-center">{item.quantity}</span>
                                  <button onClick={() => updateItemQty(item.product_id, 1)} className="p-1 hover:bg-muted rounded"><PlusCircle size={14} /></button>
                                </div>
                              </td>
                              <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                              <td className="p-3 text-right font-medium">{formatCurrency(item.line_total)}</td>
                              <td className="p-3 text-right">
                                <button onClick={() => removeItem(item.product_id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Discount */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discount Amount</label>
                    <input type="number" value={quoteDiscountAmount} onChange={(e) => setQuoteDiscountAmount(e.target.value)}
                      placeholder="0" className="pos-input w-full mt-1 px-3 py-2 text-sm" />
                  </div>

                  {/* Totals */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatCurrency(quoteSubtotal)}</span>
                    </div>
                    {quoteDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-destructive">-{formatCurrency(quoteDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border font-bold text-base">
                      <span>Total</span>
                      <span className="text-foreground">{formatCurrency(quoteTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-border">
                  <button onClick={handleCreateQuotation} disabled={createQuoteMut.isPending || quoteItems.length === 0}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-40">
                    {createQuoteMut.isPending ? 'Creating...' : 'Create Quotation'}
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
