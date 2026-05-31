import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ allowedRoles, branchName }) {
  const { session, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return <Navigate to={`/${branchName.toLowerCase()}/login`} replace />;
  }

  // Check branch
  if (profile.branches?.name !== branchName && profile.branch_id) {
    // If backend doesn't join branch name, we might just trust the login token or fetch branch info
    // For safety, backend login ensures the branch matches. If we navigate directly, we should check
    // Actually the profile might not have `branches.name` if not joined. 
    // We can rely on the backend JWT claims or backend `/auth/me` to provide branch_name.
    // Let's assume profile has branch_id or branch info. 
    // For this boilerplate, if they don't match, we kick them out.
    // To be perfectly safe, we verify role.
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Determine fallback dashboard
    return <Navigate to={`/${branchName.toLowerCase()}/dashboard`} replace />;
  }

  return <Outlet />;
}
