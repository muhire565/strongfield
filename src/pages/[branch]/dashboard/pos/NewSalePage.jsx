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

  /* ── Maths ── */
  const subtotal       = cart.reduce((a, i) => a + i.unit_price * i.quantity, 0);
  const discountAmount = Math.max(0, parseFloat(discountAmountStr) || 0);
  const totalAmount    = Math.max(0, subtotal - discountAmount);
  const amountPaid     = parseFloat(amountPaidStr) || 0;
  const balanceDue     = Math.max(0, totalAmount - amountPaid);
  const change         = amountPaid > totalAmount ? amountPaid - totalAmount : 0;

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

  const updateUnitPrice = (id, newPrice) => {
    setCart(prev => prev.map(item => {
      if (item.product_id !== id) return item;
      const price = parseFloat(newPrice);
      const validPrice = isNaN(price) || price < 0 ? 0 : price;
      return { ...item, unit_price: validPrice, line_total: item.quantity * validPrice };
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
    <div className="h-full flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">

      {/* ── TOP SECTION: Metadata ── */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Client Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              Customer Name
              {saleType === 'credit_sale' && <span className="text-destructive">*</span>}
            </label>
            <div className="relative">
              <select
                value={selectedClient?.id || ''}
                onChange={e => {
                  const c = clients.find(cl => cl.id === parseInt(e.target.value));
                  setSelectedClient(c || null);
                }}
                className="pos-input w-full pl-3 pr-8 py-2.5 text-sm appearance-none border-border bg-background"
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

          {/* Sale Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Sale Type</label>
            <div className="grid grid-cols-2 gap-2 h-[42px]">
              {['cash_sale', 'credit_sale'].map(type => (
                <button
                  key={type}
                  onClick={() => setSaleType(type)}
                  className={`py-2 rounded-lg font-medium text-sm transition-all border h-full ${
                    saleType === type
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {type === 'cash_sale' ? 'Cash Sale' : 'Credit Sale'}
                </button>
              ))}
            </div>
          </div>

          {/* Date (Read-only for now) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Receipt Date</label>
            <input
              type="text"
              readOnly
              value={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              className="pos-input w-full px-3 py-2.5 text-sm bg-muted/30 cursor-not-allowed text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* ── ITEMS TABLE ── */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-visible flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-foreground">Item Table</h3>
          <button
            onClick={() => { if (cart.length === 0 || window.confirm('Clear cart?')) resetSale(); }}
            disabled={cart.length === 0}
            className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors flex items-center gap-2 text-sm font-medium"
            title="Clear cart"
          >
            <Trash2 size={16} /> Clear All
          </button>
        </div>

        <div className="overflow-x-auto overflow-y-visible flex-1 min-h-[300px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10"></th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item Details</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36 text-center">Quantity</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-40 text-right">Rate</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-40 text-right">Amount</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border relative">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.tr
                    key={item.product_id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="hover:bg-muted/10 transition-colors group"
                  >
                    <td className="px-4 py-4 text-muted-foreground text-center">
                       <span className="opacity-0 group-hover:opacity-100 cursor-move">⋮⋮</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-foreground">{item.product_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.brand} {item.model}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center border border-border rounded-lg overflow-hidden bg-background w-28 mx-auto">
                        <button onClick={() => updateQuantity(item.product_id, -1)} className="px-3 py-1.5 hover:bg-muted transition-colors text-foreground">
                          <Minus size={14} />
                        </button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => {
                             const val = parseInt(e.target.value);
                             if (!isNaN(val)) {
                               const diff = val - item.quantity;
                               updateQuantity(item.product_id, diff);
                             }
                          }}
                          className="w-10 text-center font-bold text-sm bg-transparent border-none focus:ring-0 p-0 text-foreground"
                        />
                        <button onClick={() => updateQuantity(item.product_id, 1)} className="px-3 py-1.5 hover:bg-muted transition-colors text-foreground">
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <input 
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => updateUnitPrice(item.product_id, e.target.value)}
                        className="w-28 text-right font-medium text-foreground bg-transparent border-b-2 border-transparent hover:border-muted-foreground/30 focus:border-primary focus:ring-0 outline-none transition-colors py-1 rounded-none m-0 p-0"
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-foreground">{fmt(item.line_total)}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => removeFromCart(item.product_id)} className="text-muted-foreground hover:text-destructive p-2 transition-colors rounded-lg hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {/* Autocomplete / Search Row */}
              <tr>
                <td className="px-4 py-4 text-center text-muted-foreground">
                  <Search size={16} className="mx-auto opacity-50" />
                </td>
                <td colSpan={5} className="p-0 relative">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Type or click to select an item..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full px-4 py-5 bg-transparent border-none text-sm placeholder:text-muted-foreground focus:ring-0 outline-none text-foreground font-medium"
                    />
                    
                    {/* Dropdown for search results */}
                    {search.trim().length > 0 && (
                      <div className="absolute left-4 top-[90%] w-full max-w-[600px] bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="max-h-[300px] overflow-y-auto">
                          {loadingProducts ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">Loading products...</div>
                          ) : filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">No products found</div>
                          ) : (
                            <ul className="divide-y divide-border">
                              {filteredProducts.map(product => {
                                const inCart    = cart.find(c => c.product_id === product.id)?.quantity || 0;
                                const available = (product.quantity ?? 0) - inCart;
                                const outOfStock = available <= 0;

                                return (
                                  <li 
                                    key={product.id}
                                    onClick={() => {
                                      if (!outOfStock) {
                                        addToCart(product);
                                        setSearch('');
                                      }
                                    }}
                                    className={`flex items-center justify-between p-3 transition-colors ${outOfStock ? 'opacity-50 cursor-not-allowed bg-muted/20' : 'cursor-pointer hover:bg-muted/50'}`}
                                  >
                                    <div>
                                      <div className="font-semibold text-sm text-foreground">{product.name}</div>
                                      <div className="text-xs text-muted-foreground mt-0.5">{product.brand} • {product.model}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-sm text-foreground">{fmt(product.price)}</div>
                                      <div className={`text-[10px] uppercase tracking-wider font-semibold mt-1 ${available > 0 ? 'text-green-600' : 'text-destructive'}`}>
                                        {available > 0 ? `${available} in stock` : 'Out of stock'}
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── TOTALS & CHECKOUT FOOTER ── */}
        <div className="bg-muted/10 border-t border-border p-6 flex flex-col md:flex-row gap-8 justify-between items-end mt-auto">
          
          <div className="w-full md:w-1/2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                <div className="relative">
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value)}
                    className="pos-input w-full pl-3 pr-8 py-2.5 text-sm appearance-none bg-background"
                  >
                    {PAYMENT_MODES.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount Paid (UGX)</label>
                <input
                  type="number" value={amountPaidStr} min="0"
                  onChange={e => setAmountPaidStr(e.target.value)}
                  placeholder={totalAmount > 0 ? totalAmount.toFixed(0) : '0'}
                  className="pos-input w-full px-3 py-2.5 text-sm font-bold bg-background"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discount Amount</label>
              <input
                type="number" value={discountAmountStr} min="0"
                onChange={e => setDiscountAmountStr(e.target.value)}
                placeholder="0"
                className="pos-input w-full md:w-1/2 px-3 py-2.5 text-sm bg-background"
              />
            </div>
          </div>

          <div className="w-full md:w-[380px] space-y-3 p-5 bg-card rounded-xl border border-border shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">{fmt(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span className="font-semibold">- {fmt(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg pt-3 border-t border-border">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-black text-primary text-2xl">{fmt(totalAmount)}</span>
            </div>
            
            {(amountPaid > 0 || change > 0 || balanceDue > 0) && (
              <div className="pt-3 border-t border-border/50 text-sm space-y-1.5">
                {change > 0 && (
                  <div className="flex justify-between text-orange-500 font-medium">
                    <span>Change</span>
                    <span>{fmt(change)}</span>
                  </div>
                )}
                {balanceDue > 0 && (
                  <div className="flex justify-between text-destructive font-medium">
                    <span>Balance Due</span>
                    <span>{fmt(balanceDue)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-5 flex gap-3">
               <button
                 onClick={() => setShowPreview(true)}
                 disabled={cart.length === 0}
                 className="flex-[0.8] py-3.5 bg-muted text-foreground rounded-xl font-bold text-sm hover:bg-muted/80 transition-all disabled:opacity-50 border border-border"
               >
                 Preview
               </button>
               <button
                 onClick={handleCheckout}
                 disabled={createSaleMut.isPending || cart.length === 0}
                 className="flex-[1.2] py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {createSaleMut.isPending ? 'Processing...' : 'Save and Send'}
               </button>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════
         PREVIEW MODAL — Receipt Style
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
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* ── Receipt Header ── */}
              <div className="relative bg-gradient-to-br from-primary/90 to-primary rounded-t-2xl p-6 text-primary-foreground text-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <div className="absolute top-2 right-4 w-20 h-20 rounded-full bg-white/20" />
                  <div className="absolute bottom-2 left-4 w-14 h-14 rounded-full bg-white/10" />
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-primary-foreground"
                >
                  <X size={16} />
                </button>
                <Receipt size={32} className="mx-auto mb-2 opacity-90" />
                <h2 className="text-xl font-bold">Sale Preview</h2>
                <p className="text-xs opacity-80 mt-1">{profile?.branch_name || 'Branch'} &bull; {new Date().toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <span className={`inline-block mt-3 px-3 py-0.5 rounded-full text-xs font-semibold ${
                  saleType === 'cash_sale' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/20 text-amber-100'
                }`}>
                  {saleType === 'cash_sale' ? 'CASH SALE' : 'CREDIT SALE'}
                </span>
              </div>

              {/* ── Items Table ── */}
              <div className="p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-border text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="text-left py-2 font-medium">Qty</th>
                      <th className="text-left py-2 font-medium">Item</th>
                      <th className="text-right py-2 font-medium">Unit</th>
                      <th className="text-right py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {cart.map(item => (
                      <tr key={item.product_id} className="group">
                        <td className="py-2.5 text-foreground font-bold">{item.quantity}</td>
                        <td className="py-2.5">
                          <div className="font-medium text-foreground leading-tight">{item.product_name}</div>
                          {item.brand && <div className="text-[11px] text-muted-foreground">{item.brand} {item.model}</div>}
                        </td>
                        <td className="py-2.5 text-right text-muted-foreground">{fmt(item.unit_price)}</td>
                        <td className="py-2.5 text-right font-bold text-foreground">{fmt(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ── Dashed separator ── */}
                <div className="flex items-center gap-1 my-4">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="flex-1 h-[2px] bg-border rounded-full" />
                  ))}
                </div>

                {/* ── Totals ── */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{fmt(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">- {fmt(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-2 border-t border-border">
                    <span className="text-base font-bold text-foreground">Total Payable</span>
                    <span className="text-2xl font-black text-primary">{fmt(totalAmount)}</span>
                  </div>
                </div>

                {/* ── Dashed separator ── */}
                <div className="flex items-center gap-1 my-4">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="flex-1 h-[2px] bg-border rounded-full" />
                  ))}
                </div>

                {/* ── Payment Summary ── */}
                <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Banknote size={14} />
                      <span>Payment Mode</span>
                    </div>
                    <span className="font-semibold">{PAYMENT_MODES.find(m => m.id === paymentMode)?.label || paymentMode}</span>
                  </div>
                  {selectedClient && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Receipt size={14} />
                        <span>Client</span>
                      </div>
                      <span className="font-semibold">{selectedClient.full_name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-bold">{fmt(parseFloat(amountPaidStr) || 0)}</span>
                  </div>
                  {change > 0 && (
                    <div className="flex items-center justify-between bg-orange-500/10 rounded-lg px-3 py-2 -mx-1">
                      <span className="text-orange-600 font-medium">Change to Give</span>
                      <span className="font-black text-orange-600 text-base">{fmt(change)}</span>
                    </div>
                  )}
                  {balanceDue > 0 && (
                    <div className="flex items-center justify-between bg-destructive/10 rounded-lg px-3 py-2 -mx-1">
                      <span className="text-destructive font-medium">Balance Due</span>
                      <span className="font-black text-destructive text-base">{fmt(balanceDue)}</span>
                    </div>
                  )}
                  {change === 0 && balanceDue === 0 && totalAmount > 0 && (
                    <div className="flex items-center justify-center gap-1.5 bg-emerald-500/10 rounded-lg px-3 py-2 -mx-1 text-emerald-600">
                      <Check size={14} strokeWidth={3} />
                      <span className="font-semibold text-sm">Fully Paid</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="p-5 border-t border-border space-y-3 bg-muted/10 rounded-b-2xl">
                <button
                  onClick={handleCheckout}
                  disabled={createSaleMut.isPending}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {createSaleMut.isPending ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><Check size={22} strokeWidth={3} /> Confirm &amp; Print</>
                  )}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-full py-3 border border-border rounded-xl font-medium text-sm hover:bg-muted transition-colors text-muted-foreground"
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
