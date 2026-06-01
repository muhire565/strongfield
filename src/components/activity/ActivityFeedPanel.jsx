import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity } from 'lucide-react';
import { ActivityFeedItem } from './ActivityFeedItem';
import { useActivityFeed, useActivityRealtime } from '../../hooks/useActivityFeed';
import { useNotificationStore } from '../../store/notificationStore';
import { useRelativeTime } from '../../hooks/useRelativeTime';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sale', label: 'Sales' },
  { key: 'stock_movement', label: 'Stock' },
  { key: 'payment', label: 'Payments' },
];

export function ActivityFeedPanel() {
  const open = useNotificationStore((s) => s.activityPanelOpen);
  const close = useNotificationStore((s) => s.closeActivityPanel);
  const markViewed = useNotificationStore((s) => s.markActivityViewed);
  const [filter, setFilter] = useState('all');
  const [before, setBefore] = useState(null);
  const [accumulated, setAccumulated] = useState([]);

  useActivityRealtime();

  React.useEffect(() => {
    setBefore(null);
    setAccumulated([]);
  }, [filter]);

  const { data, isLoading } = useActivityFeed({ limit: 50, before, type: filter === 'all' ? undefined : filter });

  // Accumulate fetched pages
  React.useEffect(() => {
    if (data && Array.isArray(data)) {
      if (!before) {
        setAccumulated(data);
      } else {
        setAccumulated((prev) => {
          const existingIds = new Set(prev.map((i) => `${i.event_source}-${i.ref_id}-${i.event_time}`));
          const newItems = data.filter((i) => !existingIds.has(`${i.event_source}-${i.ref_id}-${i.event_time}`));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, before]);

  const filteredData = React.useMemo(() => {
    if (!accumulated.length) return [];
    if (filter === 'all') return accumulated;
    return accumulated.filter((item) => {
      if (filter === 'stock_movement') return item.event_source === 'stock_movement';
      return item.event_source === filter;
    });
  }, [accumulated, filter]);

  const handleClose = useCallback(() => {
    markViewed();
    close();
  }, [close, markViewed]);

  const loadOlder = useCallback(() => {
    if (filteredData.length > 0) {
      const last = filteredData[filteredData.length - 1];
      setBefore(last.event_time);
    }
  }, [filteredData]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - does NOT block sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:ml-[240px]"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-card/95 backdrop-blur-md border-l border-border z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-teal-400" />
                <h3 className="font-semibold text-foreground">Live Activity Feed</h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-green-400 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Realtime
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    filter === f.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-1">
              {isLoading && !filteredData.length ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  No activity yet
                </div>
              ) : (
                filteredData.map((item, idx) => (
                  <ActivityFeedItem key={`${item.event_source}-${item.ref_id}-${item.event_time}`} item={item} isNew={idx < 3} />
                ))
              )}

              {filteredData.length > 0 && (
                <div className="px-4 py-3">
                  <button
                    onClick={loadOlder}
                    className="w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-accent/50 hover:bg-accent rounded-lg transition-colors"
                  >
                    Load older events
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
