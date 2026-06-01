import React from 'react';
import { NavLink } from 'react-router-dom';

export function SidebarNavItem({ to, icon: Icon, label, badge, badgeColor = 'bg-red-500', exact, onClick, isCollapsed, children }) {
  const hasBadge = badge != null && badge > 0;
  return (
    <div className="group">
      <NavLink
        to={to}
        end={exact}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-teal-500/10 text-teal-400'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`
        }
      >
        {Icon && <Icon size={18} />}
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            {hasBadge && (
              <span className={`min-w-[20px] h-5 flex items-center justify-center text-[11px] font-bold text-white ${badgeColor} rounded-full px-1.5`}>
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </>
        )}
      </NavLink>
      {children}
    </div>
  );
}
