import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useUsers, useCreateUser, useUpdateUser, useBlockUser, useUnblockUser, useTrackActivity } from '../../hooks/useUsers';
import {
  Plus, UserX, UserCheck, CheckCircle2, XCircle, X, Shield, ShoppingCart, Package,
  Pencil, Search, Wifi, WifiOff, Users, Eye, EyeOff,
} from 'lucide-react';

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-violet-500/10 text-violet-500 border-violet-500/20' },
  sales: { label: 'Sales', icon: ShoppingCart, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  stock_manager: { label: 'Stock Mgr', icon: Package, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
};

function isUserOnline(lastActive) {
  if (!lastActive) return false;
  const last = new Date(lastActive).getTime();
  const now = Date.now();
  return now - last < 5 * 60 * 1000;
}

function formatLastActive(lastActive) {
  if (!lastActive) return 'Never';
  const diff = Date.now() - new Date(lastActive).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatusBadge({ active, online }) {
  if (!active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
        <XCircle size={12} />
        Blocked
      </span>
    );
  }
  if (online) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        <Wifi size={12} />
        Online
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500 border border-gray-500/20">
      <WifiOff size={12} />
      Offline
    </span>
  );
}

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.sales;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

export default function AdminDashboardComponent({ branchName }) {
  const { profile } = useAuthStore();
  const { users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const trackActivity = useTrackActivity();

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [addForm, setAddForm] = useState({ username: '', password: '', full_name: '', role: 'sales' });
  const [editForm, setEditForm] = useState({ full_name: '', role: 'sales', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    trackActivity.mutate();
    const interval = setInterval(() => trackActivity.mutate(), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = users?.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createUser.mutate(addForm, {
      onSuccess: () => {
        setAddOpen(false);
        setAddForm({ username: '', password: '', full_name: '', role: 'sales' });
      },
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const payload = { full_name: editForm.full_name, role: editForm.role };
    if (editForm.password) payload.password = editForm.password;
    updateUser.mutate({ id: editUser.id, ...payload }, {
      onSuccess: () => {
        setEditOpen(false);
        setEditUser(null);
        setEditForm({ full_name: '', role: 'sales', password: '' });
      },
    });
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ full_name: user.full_name || '', role: user.role || 'sales', password: '' });
    setEditOpen(true);
  };

  const toggleBlock = (user) => {
    if (user.is_active) {
      blockUser.mutate(user.id);
    } else {
      unblockUser.mutate(user.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage employee accounts for {branchName} branch.
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, username, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3.5 font-semibold text-foreground text-xs uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 font-semibold text-foreground text-xs uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 font-semibold text-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 font-semibold text-foreground text-xs uppercase tracking-wider">Last Active</th>
                <th className="px-5 py-3.5 font-semibold text-foreground text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4"><div className="h-4 bg-accent rounded-md w-32 animate-pulse"></div></td>
                    <td className="px-5 py-4"><div className="h-5 bg-accent rounded-full w-20 animate-pulse"></div></td>
                    <td className="px-5 py-4"><div className="h-5 bg-accent rounded-full w-16 animate-pulse"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-accent rounded-md w-16 animate-pulse"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-accent rounded-md w-8 ml-auto animate-pulse"></div></td>
                  </tr>
                ))
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-muted-foreground">
                    {search ? 'No users match your search.' : 'No users found. Click "Add User" to create one.'}
                  </td>
                </tr>
              ) : (
                filtered?.map((user) => {
                  const online = isUserOnline(user.last_active);
                  const isSelf = user.id === profile?.id;
                  return (
                    <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {user.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={user.is_active} online={online} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {formatLastActive(user.last_active)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(user)}
                            disabled={isSelf}
                            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSelf ? 'Cannot edit yourself' : 'Edit User'}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => toggleBlock(user)}
                            disabled={isSelf}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              user.is_active
                                ? 'hover:bg-red-500/10 text-muted-foreground hover:text-red-500'
                                : 'hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500'
                            }`}
                            title={isSelf ? 'Cannot block yourself' : user.is_active ? 'Block User' : 'Unblock User'}
                          >
                            {user.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setAddOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Add New User</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{branchName} Branch</p>
                </div>
                <button onClick={() => setAddOpen(false)} className="p-1.5 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    value={addForm.full_name}
                    onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. johndoe"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  >
                    <option value="sales">Sales</option>
                    <option value="stock_manager">Stock Manager</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUser.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {createUser.isPending ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editOpen && editUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setEditOpen(false); setEditUser(null); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Edit User</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{editUser.full_name}</p>
                </div>
                <button onClick={() => { setEditOpen(false); setEditUser(null); }} className="p-1.5 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input
                    required
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  >
                    <option value="sales">Sales</option>
                    <option value="stock_manager">Stock Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    New Password <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setEditOpen(false); setEditUser(null); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateUser.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
