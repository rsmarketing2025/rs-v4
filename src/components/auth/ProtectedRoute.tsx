
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Navigate, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredPage?: 'creatives' | 'sales' | 'affiliates' | 'revenue' | 'users';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requiredPage
}) => {
  const { user, loading, isAdmin } = useAuth();
  const { hasPageAccess, loading: permissionsLoading, getAccessiblePages } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard after successful login
    if (user && window.location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const isLoading = loading || permissionsLoading;

  console.log('ProtectedRoute state:', {
    user: !!user,
    loading,
    permissionsLoading,
    isAdmin,
    requireAdmin,
    requiredPage,
    hasAccess: requiredPage ? hasPageAccess(requiredPage) : 'N/A'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    console.log('Admin access denied for user:', user.email);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Acesso negado</div>
          <div className="text-slate-400">Você precisa ser administrador para acessar esta página.</div>
        </div>
      </div>
    );
  }

  // Check page-specific permission
  if (requiredPage && !hasPageAccess(requiredPage)) {
    console.log(`Page access denied for ${requiredPage} to user:`, user.email);
    const accessiblePages = getAccessiblePages();
    const firstAccessiblePage = accessiblePages[0];
    
    // If user has access to other pages, redirect to the first accessible one
    if (firstAccessiblePage && firstAccessiblePage !== 'users') {
      const redirectPath = firstAccessiblePage === 'creatives' ? '/dashboard' : `/${firstAccessiblePage}`;
      return <Navigate to={redirectPath} replace />;
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Acesso negado</div>
          <div className="text-slate-400">Você não tem permissão para acessar esta página.</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
