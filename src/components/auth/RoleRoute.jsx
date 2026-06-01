import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Route guard that checks user role.
 * - allowedRoles: array of role strings e.g. ['admin', 'sales']
 * - children: the element to render if allowed
 * - fallback: optional redirect path (defaults to /{branch}/dashboard)
 */
export default function RoleRoute({ allowedRoles = [], children, fallback }) {
  const profile = useAuthStore((s) => s.profile);
  const location = useLocation();
  const role = profile?.role || 'sales';

  const branchSegment = location.pathname.split('/')[1]; // 'highway' or 'main'
  const redirectTo = fallback || `/${branchSegment}/dashboard`;

  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
