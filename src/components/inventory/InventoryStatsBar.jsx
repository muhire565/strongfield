import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, XCircle, TrendingUp, Banknote, PackageCheck } from 'lucide-react';
import { formatUGX } from '../../utils/formatCurrency';
import { useInventorySummary } from '../../hooks/useInventory';
import { useAuthStore } from '../../store/authStore';

// Smooth animated number counter using requestAnimationFrame
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(value);
  const prevRef = React.useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    prevRef.current = value;
    if (start === end) return;

    const duration = 450;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

function AnimatedCurrency({ value }) {
  const [display, setDisplay] = useState(value);
  const prevRef = React.useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    prevRef.current = value;
    if (start === end) return;

    const duration = 500;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]);

  return <span>{formatUGX(display)}</span>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.3, ease: 'easeOut' },
  }),
};

export default function InventoryStatsBar() {
  const { data: summary } = useInventorySummary();
  const { profile } = useAuthStore();
  const isStockManager = profile?.role === 'stock_manager';

  const stats = summary || { total: 0, lowStock: 0, outOfStock: 0, stockValue: 0, potentialSalesValue: 0 };

  const cards = [
    {
      label:     'Total Products',
      iconBg:    'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor:'text-blue-700 dark:text-blue-300',
      icon:      Package,
      value:     <AnimatedNumber value={stats.total} />,
    },
    ...(!isStockManager ? [{
      label:     'Stock Value',
      iconBg:    'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor:'text-emerald-700 dark:text-emerald-300',
      icon:      TrendingUp,
      value:     <AnimatedCurrency value={stats.stockValue} />,
    }] : []),
    ...(!isStockManager ? [{
      label:     'Potential Sales Value',
      iconBg:    'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor:'text-purple-700 dark:text-purple-300',
      icon:      Banknote,
      value:     <AnimatedCurrency value={stats.potentialSalesValue} />,
    }] : []),
    {
      label:     'In Stock',
      iconBg:    'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor:'text-emerald-700 dark:text-emerald-300',
      icon:      PackageCheck,
      value:     <AnimatedNumber value={stats.total - stats.lowStock - stats.outOfStock} />,
    },
    {
      label:     'Low Stock',
      iconBg:    'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      valueColor:'text-amber-700 dark:text-amber-300',
      icon:      AlertTriangle,
      value:     <AnimatedNumber value={stats.lowStock} />,
    },
    {
      label:     'Out of Stock',
      iconBg:    'bg-red-100 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor:'text-red-700 dark:text-red-300',
      icon:      XCircle,
      value:     <AnimatedNumber value={stats.outOfStock} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            layout
            className="card p-5 hover:shadow-md transition-shadow duration-200 cursor-default"
          >
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-1.5 uppercase tracking-wide truncate">
                  {card.label}
                </p>
                <p className={`text-lg font-bold break-all leading-tight ${card.valueColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon size={19} className={card.iconColor} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
