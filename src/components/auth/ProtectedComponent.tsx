
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedComponentProps {
  children: React.ReactNode;
  page?: keyof ReturnType<typeof usePermissions>['permissions']['pages'];
  chart?: { page: string; type: string };
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  page,
  chart,
  fallback = null,
  requireAdmin = false,
}) => {
  const { hasPageAccess, hasChartAccess, loading } = usePermissions();

  if (loading) {
    return <div className="text-slate-400">Carregando...</div>;
  }

  // Verificar acesso à página
  if (page && !hasPageAccess(page)) {
    return <>{fallback}</>;
  }

  // Verificar acesso ao gráfico
  if (chart && !hasChartAccess(chart.page, chart.type)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
