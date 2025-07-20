
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Navigate, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePage?: string;
  requireAdmin?: boolean; // Manter para compatibilidade durante transição
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requirePage,
  requireAdmin = false 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { canAccessPage, loading: permissionsLoading, isAdmin } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard after successful login
    if (user && window.location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const loading = authLoading || permissionsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar permissão de página específica
  if (requirePage && !canAccessPage(requirePage)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Acesso negado. Você não tem permissão para acessar esta página.</div>
      </div>
    );
  }

  // Manter verificação de admin para compatibilidade durante transição
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Acesso negado. Você precisa ser administrador.</div>
      </div>
    );
  }

  return <>{children}</>;
};
