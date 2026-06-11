import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Users, ShieldAlert, ShieldCheck, Send, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export default function DeveloperDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const session = useAuthStore((s) => s.session);

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/developer/users`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(data.data || []);
    } catch (err) {
      toast.error('Failed to load users', { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUnblock = async (user) => {
    try {
      const res = await fetch(`${API_URL}/developer/users/${user.id}/unblock`, {
        method: 'PATCH', headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${user.username} unblocked`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to unblock user', { description: err.message });
    }
  };

  const submitBlock = async () => {
    if (!blockReason.trim()) return toast.error('Please provide a block reason');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/developer/users/${selectedUser.id}/block`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ block_reason: blockReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${selectedUser.username} blocked`);
      setBlockModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to block user', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNotify = async () => {
    if (!notifyMessage.trim()) return toast.error('Message cannot be empty');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/developer/users/${selectedUser.id}/notify`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ message: notifyMessage, branch_id: selectedUser.branch_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Notification sent to ${selectedUser.username}`);
      setNotifyModalOpen(false);
    } catch (err) {
      toast.error('Failed to send notification', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Developer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Global User Management & Real-time Alerts</p>
        </div>
        <button onClick={fetchUsers} className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors">
          Refresh List
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role & Branch</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Active</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading users...
                  </div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-muted-foreground">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{user.full_name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">@{user.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                        {user.role}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">{user.branches?.display_name || user.branches?.name || 'No Branch'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_blocked ? (
                        <div className="flex items-start gap-1.5 text-destructive">
                          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold block text-xs">Blocked</span>
                            <span className="text-[11px] opacity-80 block truncate max-w-[150px]" title={user.block_reason}>
                              {user.block_reason}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600">
                          <ShieldCheck size={14} /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar size={13} />
                          <span>{user.last_active ? format(new Date(user.last_active), 'dd MMM yyyy') : 'Never'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock size={13} />
                          <span>{user.last_active ? formatDistanceToNow(new Date(user.last_active), { addSuffix: true }) : '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedUser(user); setNotifyMessage(''); setNotifyModalOpen(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-lg font-medium text-xs transition-colors"
                        >
                          <Send size={13} /> Notify
                        </button>
                        {user.is_blocked ? (
                          <button
                            onClick={() => handleUnblock(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg font-medium text-xs transition-colors"
                          >
                            <ShieldCheck size={13} /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedUser(user); setBlockReason(''); setBlockModalOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg font-medium text-xs transition-colors"
                          >
                            <ShieldAlert size={13} /> Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Modal */}
      {blockModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border">
            <h3 className="text-lg font-bold text-destructive mb-2">Block @{selectedUser.username}</h3>
            <p className="text-sm text-muted-foreground mb-4">The user will see this reason when they try to log in.</p>
            <textarea
              className="w-full rounded-xl bg-background border border-border p-3 text-sm focus:ring-2 focus:ring-destructive outline-none mb-4 min-h-[100px] resize-none"
              placeholder="e.g. Suspicious activity detected on your account..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setBlockModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={submitBlock} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-60">
                {isSubmitting ? 'Blocking...' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notify Modal */}
      {notifyModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border">
            <h3 className="text-lg font-bold text-blue-600 mb-2">Notify @{selectedUser.username}</h3>
            <p className="text-sm text-muted-foreground mb-4">This will appear as a real-time alert on their screen instantly.</p>
            <textarea
              className="w-full rounded-xl bg-background border border-border p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4 min-h-[100px] resize-none"
              placeholder="Type your message here..."
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setNotifyModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={submitNotify} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60">
                {isSubmitting ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
