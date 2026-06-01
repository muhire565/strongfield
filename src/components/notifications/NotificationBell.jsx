import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { useUnreadCount } from '../../hooks/useNotifications';
import { useNotificationStore } from '../../store/notificationStore';

export function NotificationBell() {
  const open = useNotificationStore((s) => s.panelOpen);
  const toggle = useNotificationStore((s) => s.togglePanel);
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative p-2.5 rounded-xl hover:bg-accent transition-colors text-foreground"
      >
        <Bell size={20} />

        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
            >
              {count > 9 ? '9+' : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <NotificationDropdown />
    </div>
  );
}
