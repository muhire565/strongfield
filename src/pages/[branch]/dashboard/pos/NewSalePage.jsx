import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../../store/authStore';
import { useProducts } from '../../../../hooks/useProducts';
import { useCreateSale, useClients } from '../../../../hooks/usePOS';
import { usePOSRealtime } from '../../../../hooks/usePOSRealtime';
import {
  Search, ShoppingCart, Trash2, Plus, Minus, CreditCard,
  Banknote, Check, CheckCircle2, Smartphone, RefreshCw, Receipt, Eye, X
} from 'lucide-react';
import { toast } from 'sonner';

const fmt = (val) =>
  new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(val ?? 0);

const PAYMENT_MODES = [
  { id: 'cash',             label: 'Cash',        icon: Banknote },
  { id: 'mtn_mobile_money', label: 'MTN MoMo',    icon: Smartphone },
  { id: 'airtel_money',     label: 'Airtel Money', icon: Smartphone },
  { id: 'bank_transfer',    label: 'Bank',         icon: CreditCard },
];

export default function NewSalePage() {
  usePOSRealtime();

  const profile = useAuthStore(s => s.profile);
  const branchId = profile?.branch_id;

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`pos_cart_${branchId}`)) || []; }
    catch { return []; }
  });
  const [selectedClient, setSelectedClient] = useState(null);
  const [saleType, setSaleType]   = useState('cash_sale');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [amountPaidStr, setAmountPaidStr]       = useState('');
  const [discountAmountStr, setDiscountAmountStr] = useState('');
  const [successSale, setSuccessSale] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: productsData, isLoading: loadingProducts } = useProducts();
  const { data: clientsData } = useClients();
  const createSaleMut = useCreateSale();

  const products = productsData || [];
  const clients  = clientsData  || [];

  useEffect(() => {
    localStorage.setItem(`pos_cart_${branchId}`, JSON.stringify(cart));
  }, [cart, branchId]);

  // Auto-fill exact amount for cash sales (no Exact button needed)
  useEffect(() => {
    if (saleType === 'cash_sale') {
      setAmountPaidStr(totalAmount > 0 ? totalAmount.toFixed(0) : '');
    } else {
      setAmountPaidStr('');
    }
  }, [subtotal, discountAmount, totalAmount, saleType]);

  /* ── Maths ── */
  const subtotal       = cart.reduce((a, i) => a + i.unit_price * i.quantity, 0);
  const discountAmount = Math.max(0, parseFloat(discountAmountStr) || 0);
  const totalAmount    = Math.max(0, subtotal - discountAmount);
  const amountPaid     = parseFloat(amountPaidStr) || 0;
  const balanceDue     = Math.max(0, totalAmount - amountPaid);
  const change         = amountPaid > totalAmount ? amountPaid - totalAmount : 0;

  /* ── Search filter ── */
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.model?.toLowerCase().includes(q)
    );
  }, [search, products]);

  /* ── Cart ops ── */
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= (product.quantity ?? 0)) {
          toast.error(`Only ${product.quantity} in stock`); return prev;
        }
        return prev.map(i => i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1, line_total: (i.quantity + 1) * i.unit_price }
          : i);
      }
      if ((product.quantity ?? 0) <= 0) { toast.error('Out of stock'); return prev; }
      return [...prev, {
        product_id: product.id, product_name: product.name,
        brand: product.brand,  model: product.model,
        unit_price: product.price, quantity: 1,
        discount_amount: 0, line_total: product.price,
      }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id !== id) return item;
      const p = products.find(x => x.id === id);
      const newQ = item.quantity + delta;
      if (newQ <= 0) return item;
      if (p && newQ > (p.quantity ?? 0)) { toast.error(`Only ${p.quantity} in stock`); return item; }
      return { ...item, quantity: newQ, line_total: newQ * item.unit_price };
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product_id !== id));

  const resetSale = () => {
    setCart([]); setAmountPaidStr(''); setDiscountAmountStr('');
    setSelectedClient(null); setSaleType('cash_sale');
    setPaymentMode('cash'); setSuccessSale(null);
  };

  /* ── Checkout ── */
  const handleCheckout = () => {
    if (cart.length === 0) return toast.error('Add products to cart first');
    if (saleType === 'credit_sale' && !selectedClient)
      return toast.error('Select a client for credit sales');

    const effectivePaid = (amountPaidStr === '' && saleType === 'cash_sale')
      ? totalAmount : amountPaid;

    if (effectivePaid > totalAmount + 0.001)
      return toast.error('Amount paid cannot exceed the total');
    if (saleType === 'cash_sale' && effectivePaid < totalAmount - 0.001)
      return toast.error('Cash sales must be paid in full');

    createSaleMut.mutate({
      client_id: selectedClient?.id ?? null,
      sale_type: saleType,
      subtotal,
      discount_amount: discountAmount,
      discount_type: discountAmount > 0 ? 'fixed' : 'none',
      discount_value: discountAmount,
      tax_rate: 0, tax_amount: 0,
      total_amount: totalAmount,
      amount_paid: effectivePaid,
      payment_mode: effectivePaid > 0 ? paymentMode : null,
      items: cart,
    }, {
      onSuccess: (data) => {
        setSuccessSale({ ...data, total_amount: totalAmount, amount_paid: effectivePaid });
        setShowPreview(false);
        localStorage.removeItem(`pos_cart_${branchId}`);
      },
      onError: (err) => {
        toast.error('Sale failed', { description: err?.message || 'Check your connection and try again.' });
      },
    });
  };

  /* ══════════════════════════════════════════════
     SUCCESS SCREEN
  ══════════════════════════════════════════════ */
  if (successSale) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex items-center justify-center p-6"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="text-green-600" size={52} strokeWidth={1.5} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold text-foreground">Sale Complete!</h2>
            <p className="text-muted-foreground mt-1">Transaction processed successfully</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-muted/50 rounded-xl p-5 text-left space-y-3 border border-border"
          >
            {successSale.sale_number && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Receipt size={14} /> Invoice #</span>
                <span className="font-bold text-primary font-mono">{successSale.sale_number}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold text-foreground">{fmt(successSale.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold text-green-600">{fmt(successSale.amount_paid)}</span>
            </div>
            {successSale.amount_paid > successSale.total_amount && (
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Change</span>
                <span className="font-bold text-orange-500">{fmt(successSale.amount_paid - successSale.total_amount)}</span>
              </div>
            )}
            {successSale.balance_due > 0 && (
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Balance Due</span>
                <span className="font-bold text-destructive">{fmt(successSale.balance_due)}</span>
              </div>
            )}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            onClick={resetSale}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            New Sale
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /* ══════════════════════════════════════════════
     MAIN POS LAYOUT
  ══════════════════════════════════════════════ */
  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">

      {/* ── LEFT: Products table ── */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={18} />
            <input
              type="text"
              placeholder="Search products by name, brand, model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pos-input w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingProducts ? (
            <div className="flex flex-col justify-center items-center h-full gap-4 text-muted-foreground">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full gap-3 text-muted-foreground opacity-60">
              <Search size={48} strokeWidth={1} />
              <p className="font-medium">{search ? 'No products match your search' : 'No products found'}</p>
              {search && <button onClick={() => setSearch('')} className="text-sm text-primary hover:underline">Clear search</button>}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Brand</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Product Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Model</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">Unit Price</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-center">Stock</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-center">Add</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map(product => {
                  const inCart    = cart.find(c => c.product_id === product.id)?.quantity || 0;
                  const available = (product.quantity ?? 0) - inCart;
                  const outOfStock = available <= 0;
                  return (
                    <motion.tr
                      layout key={product.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`transition-colors ${outOfStock ? 'opacity-50 bg-muted/20' : 'hover:bg-muted/30'}`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{product.brand}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{product.model}</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">{fmt(product.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          available === 0 ? 'bg-destructive/10 text-destructive'
                          : available <= 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                        }`}>
                          {available === 0 ? 'Out of stock' : `${available} left`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => !outOfStock && addToCart(product)}
                          disabled={outOfStock}
                          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                            outOfStock
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-primary text-primary-foreground hover:scale-110 hover:shadow-lg active:scale-95'
                          }`}
                        >
                          <Plus size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart & Checkout ── */}
      <div className="w-full lg:w-[450px] flex flex-col bg-card rounded-xl border border-border shadow-sm lg:self-start">

        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="text-primary" size={22} />
            <h2 className="text-lg font-bold text-foreground">Current Sale</h2>
            {cart.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          <button
            onClick={() => { if (cart.length === 0 || window.confirm('Clear cart?')) resetSale(); }}
            disabled={cart.length === 0}
            className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
            title="Clear cart"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Sale type + Client */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {['cash_sale', 'credit_sale'].map(type => (
              <button
                key={type}
                onClick={() => setSaleType(type)}
                className={`py-2 rounded-lg font-medium text-sm transition-all border ${
                  saleType === type
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {type === 'cash_sale' ? 'Cash Sale' : 'Credit Sale'}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={selectedClient?.id || ''}
              onChange={e => {
                const c = clients.find(cl => cl.id === parseInt(e.target.value));
                setSelectedClient(c || null);
              }}
              className="pos-input w-full pl-3 pr-8 py-2.5 text-sm appearance-none"
            >
              <option value="">— Select Client (Optional for Cash) —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Cart items */}
        <div className="overflow-y-auto p-4 space-y-2 min-h-[160px] max-h-[40vh]">
          <AnimatePresence>
            {cart.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40 space-y-3 py-10"
              >
                <ShoppingCart size={44} strokeWidth={1} />
                <p className="text-sm">Cart is empty</p>
              </motion.div>
            )}
            {cart.map(item => (
              <motion.div
                key={item.product_id} layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-semibold text-foreground truncate text-sm">{item.product_name}</div>
                  <div className="text-xs text-muted-foreground">{fmt(item.unit_price)} / unit · Total: <span className="font-medium text-foreground">{fmt(item.line_total)}</span></div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-muted rounded-lg overflow-hidden border border-border">
                    <button onClick={() => updateQuantity(item.product_id, -1)} className="px-2 py-1 hover:bg-card transition-colors text-foreground">
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-center font-bold text-sm text-foreground min-w-[28px]">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, 1)} className="px-2 py-1 hover:bg-card transition-colors text-foreground">
                      <Plus size={12} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.product_id)} className="text-muted-foreground hover:text-destructive p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Checkout panel */}
        <div className="p-4 border-t border-border bg-muted/10 space-y-4">
          {/* Subtotal / Discount / Total */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discount</span>
              <input
                type="number" value={discountAmountStr} min="0"
                onChange={e => setDiscountAmountStr(e.target.value)}
                placeholder="0"
                className="pos-input w-28 text-right px-3 py-1.5 text-sm"
              />
            </div>
            <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{fmt(totalAmount)}</span>
            </div>
          </div>

          {/* Amount Paid */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount Paid</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 font-semibold text-xs">UGX</span>
              <input
                type="number" value={amountPaidStr} min="0"
                onChange={e => setAmountPaidStr(e.target.value)}
                placeholder={totalAmount > 0 ? totalAmount.toFixed(0) : '0'}
                className="pos-input w-full pl-12 pr-4 py-3 font-bold text-base"
              />
            </div>
            {/* Live feedback */}
            {amountPaid > 0 && (
              <div className="flex justify-between text-xs font-medium px-1">
                {change > 0 ? (
                  <span className="text-orange-500">Change: {fmt(change)}</span>
                ) : balanceDue > 0 ? (
                  <span className="text-destructive">Balance due: {fmt(balanceDue)}</span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1"><Check size={12} /> Exact payment</span>
                )}
              </div>
            )}
          </div>

          {/* Payment Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_MODES.map(mode => {
                const Icon = mode.icon;
                const selected = paymentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setPaymentMode(mode.id)}
                    className={`relative flex items-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/80'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{mode.label}</span>
                    {selected && (
                      <span className="absolute top-1 right-1">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview button */}
          <button
            onClick={() => setShowPreview(true)}
            disabled={cart.length === 0}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Eye size={20} /> Preview Sale — {fmt(totalAmount)}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
         PREVIEW MODAL
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <Receipt className="text-primary" size={22} />
                  <h2 className="text-lg font-bold">Sale Preview</h2>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Items */}
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Items</h3>
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.product_id} className="flex justify-between items-center p-3 bg-muted/40 rounded-lg border border-border">
                      <div>
                        <div className="font-medium text-sm">{item.product_name}</div>
                        <div className="text-xs text-muted-foreground">{fmt(item.unit_price)} × {item.quantity}</div>
                      </div>
                      <div className="font-bold text-sm">{fmt(item.line_total)}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{fmt(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Discount</span>
                      <span className="font-medium text-green-600">- {fmt(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                    <span>Total</span>
                    <span className="text-primary">{fmt(totalAmount)}</span>
                  </div>
                </div>

                {/* Payment details */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm border border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sale Type</span>
                    <span className="font-medium">{saleType === 'cash_sale' ? 'Cash Sale' : 'Credit Sale'}</span>
                  </div>
                  {selectedClient && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client</span>
                      <span className="font-medium">{selectedClient.full_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Mode</span>
                    <span className="font-medium">{PAYMENT_MODES.find(m => m.id === paymentMode)?.label || paymentMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-bold">{fmt(parseFloat(amountPaidStr) || 0)}</span>
                  </div>
                  {change > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Change</span>
                      <span className="font-bold text-orange-500">{fmt(change)}</span>
                    </div>
                  )}
                  {balanceDue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Balance Due</span>
                      <span className="font-bold text-destructive">{fmt(balanceDue)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 border-t border-border space-y-3 bg-muted/10">
                <button
                  onClick={handleCheckout}
                  disabled={createSaleMut.isPending}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {createSaleMut.isPending ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><Check size={20} /> Confirm Sale</>
                  )}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-full py-3 border border-border rounded-xl font-medium text-sm hover:bg-muted transition-colors"
                >
                  Back to Edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
