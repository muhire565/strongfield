import React from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useReportStore } from '../../store/useReportStore';

const presets = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'this_week', label: 'This Week' },
  { key: 'last_week', label: 'Last Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'this_quarter', label: 'This Quarter' },
  { key: 'last_quarter', label: 'Last Quarter' },
  { key: 'this_year', label: 'This Year' },
  { key: 'last_year', label: 'Last Year' },
];

export default function PeriodSelector() {
  const { fromDate, toDate, setPeriod, applyPreset } = useReportStore();
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    function handleClick(e) { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Preset dropdown */}
      <div className="relative" ref={wrapperRef}>
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm hover:bg-muted transition-colors">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{fromDate} – {toDate}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {presets.map(p => (
              <button key={p.key} onClick={() => { applyPreset(p.key); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom range */}
      <div className="flex items-center gap-2">
        <input type="date" value={fromDate}
          onChange={(e) => setPeriod(e.target.value, toDate)}
          className="pos-input text-sm px-2 py-1.5 rounded-lg" />
        <span className="text-muted-foreground text-sm">to</span>
        <input type="date" value={toDate}
          onChange={(e) => setPeriod(fromDate, e.target.value)}
          className="pos-input text-sm px-2 py-1.5 rounded-lg" />
      </div>
    </div>
  );
}
