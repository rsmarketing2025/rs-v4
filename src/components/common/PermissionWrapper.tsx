
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionWrapperProps {
  children: React.ReactNode;
  chartType?: string;
  page?: string;
  requirePage?: string;
  fallback?: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  chartType,
  page,
  requirePage,
  fallback = null
}) => {
  const { canViewChart, canAccessPage, loading } = usePermissions();

  if (loading) {
    return null;
  }

  // Verificar permissão de página primeiro
  if (requirePage && !canAccessPage(requirePage)) {
    return <>{fallback}</>;
  }

  // Verificar permissão específica de gráfico se especificado
  if (chartType && page && !canViewChart(chartType, page)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
