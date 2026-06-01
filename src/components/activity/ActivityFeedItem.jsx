import React from 'react';
import { motion } from 'framer-motion';
import { ActivityIcon } from './ActivityIcon';
import { useRelativeTime } from '../../hooks/useRelativeTime';
import { useNotificationStore } from '../../store/notificationStore';

export function ActivityFeedItem({ item, isNew = false }) {
  const timeText = useRelativeTime(item.event_time);
  const lastViewedAt = useNotificationStore((s) => s.lastViewedAt);
  const isUnread = lastViewedAt ? new Date(item.event_time) > new Date(lastViewedAt) : false;

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: -12, backgroundColor: 'rgba(13,148,136,0.15)' } : false}
      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(255,255,255,0.03)' }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
    >
      {isUnread && (
        <span className="mt-2 w-2 h-2 rounded-full bg-teal-400 shrink-0" />
      )}
      {!isUnread && <span className="mt-2 w-2 h-2 rounded-full bg-transparent shrink-0" />}

      <ActivityIcon eventType={item.event_type} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.amount != null && `UGX ${Number(item.amount).toLocaleString()} · `}
          {timeText}
        </p>
      </div>
    </motion.div>
  );
}
