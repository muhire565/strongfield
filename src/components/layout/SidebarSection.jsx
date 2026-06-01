import React from 'react';

export function SidebarSection({ title, isCollapsed, children }) {
  return (
    <div className="mb-3">
      {!isCollapsed && title && (
        <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {title}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
