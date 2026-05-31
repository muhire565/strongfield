import React from 'react';
import { motion } from 'framer-motion';
import { usePaymentsByMode, useSummary } from '../../../../hooks/usePOS';
import { usePOSRealtime } from '../../../../hooks/usePOSRealtime';
import { CreditCard, Banknote, Calendar, Receipt, TrendingUp, ShoppingBag, Smartphone } from 'lucide-react';
import { format } from 'date-fns';

const formatCurrency = (val) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(val);

export default function PaymentsSummaryPage() {
  usePOSRealtime();

  const { data: paymentsData, isLoading } = usePaymentsByMode();
  const { data: summaryData } = useSummary();
  const payments = paymentsData || [];
  const summary = summaryData || {};

  const cards = [
    { label: 'Today\'s Sales', value: summary.sale_count || 0, icon: ShoppingBag, color: 'text-primary', prefix: '' },
    { label: 'Total Revenue', value: formatCurrency(summary.total_revenue || 0), icon: TrendingUp, color: 'text-green-600', prefix: '' },
    { label: 'Cash', value: formatCurrency(summary.cash || 0), icon: Banknote, color: 'text-amber-600', prefix: '' },
    { label: 'MTN MoMo', value: formatCurrency(summary.mtn_mobile_money || 0), icon: Smartphone, color: 'text-blue-600', prefix: '' },
    { label: 'Airtel Money', value: formatCurrency(summary.airtel_money || 0), icon: Smartphone, color: 'text-red-600', prefix: '' },
    { label: 'Bank Transfer', value: formatCurrency(summary.bank_transfer || 0), icon: CreditCard, color: 'text-purple-600', prefix: '' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments Summary</h1>
          <p className="text-muted-foreground">Recent transactions and installments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={card.color} />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</span>
              </div>
              <p className={`text-xl font-bold ${card.color}`}>{card.prefix}{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Date</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Invoice #</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Mode</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border text-right">Amount</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Reference</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Received By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">Loading payments...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-muted-foreground">No payments found.</td></tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 text-muted-foreground text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>{format(new Date(payment.payment_date), 'dd MMM yyyy, HH:mm')}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      <div className="flex items-center space-x-2">
                        <Receipt size={16} className="text-primary/70" />
                        <span>{payment.sales?.sale_number}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border`}>
                        {payment.payment_mode === 'cash' ? <Banknote size={12} className="mr-1" /> : <CreditCard size={12} className="mr-1" />}
                        {payment.payment_mode.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-foreground text-green-600">{formatCurrency(payment.amount)}</td>
                    <td className="p-4 text-muted-foreground text-sm">{payment.reference_number || '-'}</td>
                    <td className="p-4 text-foreground text-sm">{payment.received_by_user?.full_name || 'System'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
