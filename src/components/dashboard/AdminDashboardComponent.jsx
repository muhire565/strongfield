import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { Plus, UserX, CheckCircle2, XCircle, X, Shield, ShoppingCart, Package } from 'lucide-react';

export default function AdminDashboardComponent({ branchName }) {
  const { session } = useAuthStore();
  const toast = useToastStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', full_name: '', role: 'sales' });
  const [formError, setFormError] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', branchName],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      return data.data;
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (newUser) => {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create user');
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['users', branchName]);
      setIsModalOpen(false);
      setFormData({ username: '', password: '', full_name: '', role: 'sales' });
      setFormError('');
      toast.success(`User "${data.full_name}" created successfully!`);
    },
    onError: (err) => {
      setFormError(err.message);
      toast.error(err.message);
    }
  });

  const deactivateUserMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to deactivate user');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users', branchName]);
      toast.success('User deactivated successfully.');
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    createUserMutation.mutate(formData);
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <Shield size={14} />;
      case 'sales': return <ShoppingCart size={14} />;
      case 'stock_manager': return <Package size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage employee accounts for {branchName} branch.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-4 font-semibold text-foreground">Full Name</th>
                <th className="px-6 py-4 font-semibold text-foreground">Username</th>
                <th className="px-6 py-4 font-semibold text-foreground">Role</th>
                <th className="px-6 py-4 font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 bg-accent rounded-md w-32 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-accent rounded-md w-20 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-accent rounded-full w-16 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-accent rounded-full w-16 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-accent rounded-md w-8 ml-auto animate-pulse"></div></td>
                  </tr>
                ))
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No users found. Click "Add User" to create one.
                  </td>
                </tr>
              ) : (
                users?.map(user => (
                  <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                          {user.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-foreground">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className={`badge badge-${user.role} inline-flex items-center gap-1`}>
                        {getRoleIcon(user.role)}
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="badge badge-active inline-flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="badge badge-inactive inline-flex items-center gap-1">
                          <XCircle size={12} />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        disabled={!user.is_active || user.role === 'admin'}
                        onClick={() => {
                          if(confirm(`Deactivate user "${user.full_name}"?`)) {
                            deactivateUserMutation.mutate(user.id);
                          }
                        }}
                        className="btn btn-ghost text-destructive disabled:opacity-20 disabled:cursor-not-allowed p-2"
                        title={user.role === 'admin' ? "Cannot deactivate admin" : "Deactivate User"}
                      >
                        <UserX size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-foreground">Add New User</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{branchName} Branch</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost p-1.5 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                  <XCircle size={16} />
                  {formError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input 
                  required type="text" placeholder="e.g. John Doe"
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                  className="input" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                <input 
                  required type="text" placeholder="e.g. johndoe"
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  className="input" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input 
                  required type="password" placeholder="Min 6 characters"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="input" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  className="select"
                >
                  <option value="sales">Sales</option>
                  <option value="stock_manager">Stock Manager</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createUserMutation.isPending} className="btn btn-primary">
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
