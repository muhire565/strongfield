import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, limit, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  if (totalPages <= 1 && total <= limit) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
      <span className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}</span>–<span className="font-medium text-foreground">{end}</span> of <span className="font-medium text-foreground">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`min-w-[28px] h-7 px-1.5 rounded-md text-xs font-medium transition-colors ${
              p === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-foreground transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
