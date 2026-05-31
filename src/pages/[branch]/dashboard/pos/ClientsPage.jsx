import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClients, useCreateClient, useClientDetail } from '../../../../hooks/usePOS';
import { usePOSRealtime } from '../../../../hooks/usePOSRealtime';
import { Search, Phone, Mail, MapPin, CreditCard, ChevronRight, X, UserPlus, Receipt, Banknote, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const formatCurrency = (val) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(val);

const STATUS_BADGES = {
  paid_in_full: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
  partial: { class: 'bg-blue-100 text-blue-800', icon: Clock },
  pending: { class: 'bg-yellow-100 text-yellow-800', icon: Clock },
  voided: { class: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function ClientsPage() {
  usePOSRealtime();

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ full_name: '', phone: '', email: '', address: '', client_type: 'walk_in' });

  const { data: clientsData, isLoading } = useClients();
  const { data: clientDetail } = useClientDetail(selectedClient?.id);
  const createClientMut = useCreateClient();
  const clients = clientsData || [];

  const filteredClients = clients.filter(c => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return c.full_name.toLowerCase().includes(lower) || c.phone.includes(search);
  });

  const handleCreateClient = () => {
    if (!newClient.full_name.trim() || !newClient.phone.trim()) return;
    createClientMut.mutate(newClient, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewClient({ full_name: '', phone: '', email: '', address: '', client_type: 'walk_in' });
      }
    });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage customer records and balances</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
          <UserPlus size={16} />
          Add New Client
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={18} />
            <input
              type="text"
              placeholder="Search clients by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pos-input w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Name</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Contact Info</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Type</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border text-right">Total Purchases</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border text-right">Outstanding Balance</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm border-b border-border">Registered</th>
                <th className="p-4 border-b border-border"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan="7" className="p-8 text-center text-muted-foreground">Loading clients...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-muted-foreground">No clients found.</td></tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} onClick={() => setSelectedClient(client)}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {client.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{client.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1 text-sm">
                        <div className="flex items-center text-foreground"><Phone size={14} className="mr-2 text-muted-foreground" /> {client.phone}</div>
                        {client.email && <div className="flex items-center text-muted-foreground"><Mail size={14} className="mr-2" /> {client.email}</div>}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${client.client_type === 'credit' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {client.client_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-foreground">{formatCurrency(client.total_purchases)}</td>
                    <td className="p-4 text-right">
                      {client.outstanding_balance > 0
                        ? <span className="text-destructive font-bold">{formatCurrency(client.outstanding_balance)}</span>
                        : <span className="text-muted-foreground">-</span>
                      }
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{format(new Date(client.created_at), 'MMM d, yyyy')}</td>
                    <td className="p-4 text-right">
                      <button className="text-muted-foreground hover:text-primary p-2 rounded-md transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-over */}
      <AnimatePresence>
        {selectedClient && clientDetail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                    {clientDetail.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{clientDetail.full_name}</h2>
                    <p className="text-sm text-muted-foreground">{clientDetail.client_type.replace('_', ' ').toUpperCase()} Client</p>
                  </div>
                </div>
                <button onClick={() => setSelectedClient(null)} className="p-2 bg-background rounded-full hover:bg-muted text-muted-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Contact */}
                <div className="bg-background border border-border rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-foreground"><Phone size={14} className="text-muted-foreground" /> {clientDetail.phone}</div>
                  {clientDetail.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail size={14} /> {clientDetail.email}</div>}
                  {clientDetail.address && <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={14} /> {clientDetail.address}</div>}
                </div>

                {/* Balance Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Purchases</p>
                    <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(clientDetail.total_purchases)}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Paid</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency((clientDetail.total_purchases || 0) - (clientDetail.outstanding_balance || 0))}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Outstanding</p>
                    <p className={`text-lg font-bold mt-1 ${clientDetail.outstanding_balance > 0 ? 'text-destructive' : 'text-primary'}`}>
                      {formatCurrency(clientDetail.outstanding_balance)}
                    </p>
                  </div>
                </div>

                {/* Purchase History */}
                {clientDetail.sales && clientDetail.sales.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ShoppingBag size={14} /> Purchase History
                    </h3>
                    <div className="space-y-2">
                      {clientDetail.sales.map((sale) => {
                        const sb = STATUS_BADGES[sale.status] || STATUS_BADGES.pending;
                        const Icon = sb.icon;
                        return (
                          <div key={sale.id} className="bg-background border border-border rounded-lg p-3 flex items-center justify-between text-sm">
                            <div>
                              <div className="flex items-center gap-2">
                                <Receipt size={14} className="text-primary" />
                                <span className="font-medium">{sale.sale_number}</span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${sb.class}`}>
                                  <Icon size={10} className="mr-1" /> {sale.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-muted-foreground text-xs mt-0.5">{format(new Date(sale.created_at), 'dd MMM yyyy')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-foreground">{formatCurrency(sale.total_amount)}</p>
                              {sale.balance_due > 0 && <p className="text-xs text-destructive">Due: {formatCurrency(sale.balance_due)}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Payment History */}
                {clientDetail.payments && clientDetail.payments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Banknote size={14} /> Payment History
                    </h3>
                    <div className="space-y-2">
                      {clientDetail.payments.map((p, i) => (
                        <div key={i} className="bg-background border border-border rounded-lg p-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-green-600" />
                            <span className="text-muted-foreground">{p.payment_mode.replace(/_/g, ' ')}</span>
                            {p.reference_number && <span className="text-xs text-muted-foreground">Ref: {p.reference_number}</span>}
                          </div>
                          <span className="font-bold text-green-600">{formatCurrency(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-[70] p-4"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Add New Client</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-muted rounded-full transition-colors"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                    <input type="text" value={newClient.full_name} onChange={(e) => setNewClient(p => ({ ...p, full_name: e.target.value }))}
                      placeholder="John Doe" className="pos-input w-full mt-1 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone *</label>
                    <input type="text" value={newClient.phone} onChange={(e) => setNewClient(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+256 700 000 000" className="pos-input w-full mt-1 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                    <input type="email" value={newClient.email} onChange={(e) => setNewClient(p => ({ ...p, email: e.target.value }))}
                      placeholder="email@example.com" className="pos-input w-full mt-1 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</label>
                    <input type="text" value={newClient.address} onChange={(e) => setNewClient(p => ({ ...p, address: e.target.value }))}
                      placeholder="Kampala, Uganda" className="pos-input w-full mt-1 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client Type</label>
                    <select value={newClient.client_type} onChange={(e) => setNewClient(p => ({ ...p, client_type: e.target.value }))}
                      className="pos-input w-full mt-1 px-3 py-2 text-sm appearance-none">
                      <option value="walk_in">Walk-in</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleCreateClient} disabled={createClientMut.isPending}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-40">
                  {createClientMut.isPending ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
