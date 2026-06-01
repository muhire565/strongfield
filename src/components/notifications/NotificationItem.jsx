import React from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Package,
  ArrowRightCircle,
  PackageCheck,
  FileText,
  UserPlus,
  Coins,
  ReceiptText,
  BanknoteX,
  Activity,
} from 'lucide-react';
import { useRelativeTime } from '../../hooks/useRelativeTime';

const ICON_MAP = {
  receipt: Receipt,
  cash: Banknote,
  'circle-check': CheckCircle2,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  package: Package,
  'arrow-right-circle': ArrowRightCircle,
  'package-check': PackageCheck,
  'file-text': FileText,
  'user-plus': UserPlus,
  coins: Coins,
  'receipt-2': ReceiptText,
  'cash-off': BanknoteX,
  activity: Activity,
};

export function NotificationItem({ notification, onClick }) {
  const timeText = useRelativeTime(notification.created_at);
  const Icon = ICON_MAP[notification.icon_type] || Activity;

  const read = notification.is_read;

  return (
    <motion.button
      layout
      onClick={() => onClick(notification)}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg transition-colors ${
        read ? 'hover:bg-accent/60' : 'bg-teal-500/5 hover:bg-teal-500/10'
      }`}
    >
      {!read && <span className="mt-2 w-2 h-2 rounded-full bg-teal-400 shrink-0" />}
      {read && <span className="mt-2 w-2 h-2 rounded-full bg-transparent shrink-0" />}

      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
        <Icon size={18} className="text-teal-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${read ? 'text-foreground/80' : 'text-foreground'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.description}</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">{timeText}</p>
      </div>
    </motion.button>
  );
}
