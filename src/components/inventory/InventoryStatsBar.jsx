import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, XCircle, TrendingUp, Banknote } from 'lucide-react';
import { formatUGX } from '../../utils/formatCurrency';
import { useInventorySummary } from '../../hooks/useInventory';

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

  const stats = summary || { total: 0, lowStock: 0, outOfStock: 0, stockValue: 0, salesValue: 0 };

  const cards = [
    {
      label:     'Total Products',
      iconBg:    'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor:'text-blue-700 dark:text-blue-300',
      icon:      Package,
      value:     <AnimatedNumber value={stats.total} />,
    },
    {
      label:     'Stock Value',
      iconBg:    'bg-emerald-100 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor:'text-emerald-700 dark:text-emerald-300',
      icon:      TrendingUp,
      value:     <AnimatedCurrency value={stats.stockValue} />,
    },
    {
      label:     'Sales Value',
      iconBg:    'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor:'text-purple-700 dark:text-purple-300',
      icon:      Banknote,
      value:     <AnimatedCurrency value={stats.salesValue} />,
    },
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
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1.5 uppercase tracking-wide">
                  {card.label}
                </p>
                <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon size={19} className={card.iconColor} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Missing icon import fallback for the card array above
function PackageCheck(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/>
    </svg>
  );
}
