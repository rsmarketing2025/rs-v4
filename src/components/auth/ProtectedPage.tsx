
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedPageProps {
  children: React.ReactNode;
  page: 'creatives' | 'sales' | 'affiliates' | 'revenue' | 'users';
  fallback?: React.ReactNode;
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({ 
  children, 
  page,
  fallback 
}) => {
  const { hasPageAccess, loading } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Verificando permissões...</div>
      </div>
    );
  }

  if (!hasPageAccess(page)) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xl mb-4">Acesso Negado</div>
            <div className="text-slate-400">
              Você não tem permissão para acessar esta página.
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};
