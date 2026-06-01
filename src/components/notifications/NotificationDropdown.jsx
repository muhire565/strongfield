import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Bell } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { NotificationFilterTabs, getTypesForTab } from './NotificationFilterTabs';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useNotifications, useMarkRead, useMarkAllRead } from '../../hooks/useNotifications';
import { useNotificationStore } from '../../store/notificationStore';
import { useNavigate, useLocation } from 'react-router-dom';

function useBranchPrefix() {
  const { pathname } = useLocation();
  const seg = pathname.split('/')[1];
  return seg ? `/${seg}` : '';
}

export function NotificationDropdown() {
  const open = useNotificationStore((s) => s.panelOpen);
  const close = useNotificationStore((s) => s.closePanel);
  const ref = useRef(null);
  const navigate = useNavigate();
  const prefix = useBranchPrefix();
  const [filter, setFilter] = useState('all');

  useClickOutside(ref, close);

  const types = getTypesForTab(filter);
  const { data, isLoading } = useNotifications({ limit: 50, read: false });
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const allNotifications = data?.data || [];
  const notifications = types.length
    ? allNotifications.filter((n) => types.includes(n.type))
    : allNotifications;

  const handleClick = (notif) => {
    if (!notif.is_read) markRead.mutate(notif.id);
    if (notif.reference_type) {
      const routes = {
        sale: `${prefix}/dashboard/pos/sales`,
        product: `${prefix}/dashboard/inventory`,
        expense: `${prefix}/dashboard/finance/expenses`,
        withdrawal: `${prefix}/dashboard/finance/withdrawals`,
        user: `${prefix}/admin`,
      };
      const path = routes[notif.reference_type];
      if (path) navigate(path);
    }
    close();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute right-0 top-full mt-3 w-[360px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-[60]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              title="Mark all read"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          </div>

          <NotificationFilterTabs value={filter} onChange={setFilter} />

          <div className="max-h-[360px] overflow-y-auto py-1">
            {isLoading && !notifications.length ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                <Bell size={24} className="mb-2 opacity-40" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onClick={handleClick} />
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
