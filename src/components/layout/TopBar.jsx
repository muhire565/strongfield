import React from 'react';
import { Menu, Activity } from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';
import { useNotificationStore } from '../../store/notificationStore';
import { useRealtimeStatus } from '../../hooks/useRealtimeStatus';

const STATUS_DOT = {
  connected: { color: 'bg-green-500', pulse: true },
  connecting: { color: 'bg-amber-500', pulse: true },
  reconnecting: { color: 'bg-amber-500', pulse: true },
  error: { color: 'bg-red-500', pulse: false },
  disconnected: { color: 'bg-slate-500', pulse: false },
};

export function TopBar({ onToggleMobileSidebar, title = 'Dashboard', branchName }) {
  const toggleActivity = useNotificationStore((s) => s.toggleActivityPanel);
  const status = useRealtimeStatus();
  const dot = STATUS_DOT[status] || STATUS_DOT.disconnected;

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-30 sticky top-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors text-foreground"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
        {branchName && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            {branchName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Realtime status dot */}
        <div className="hidden sm:flex items-center gap-1.5 mr-2">
          <span className={`w-2 h-2 rounded-full ${dot.color} ${dot.pulse ? 'animate-pulse' : ''}`} />
          <span className="text-[11px] text-muted-foreground capitalize">{status}</span>
        </div>

        {/* Activity feed toggle */}
        <button
          onClick={toggleActivity}
          className="p-2.5 rounded-xl hover:bg-accent transition-colors text-foreground"
          title="Activity Feed"
        >
          <Activity size={20} />
        </button>

        <NotificationBell />
      </div>
    </header>
  );
}
