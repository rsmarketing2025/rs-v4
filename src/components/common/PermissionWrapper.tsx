
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionWrapperProps {
  children: React.ReactNode;
  requirePage?: string;
  fallback?: React.ReactNode;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  requirePage,
  fallback = null
}) => {
  const { canAccessPage, loading } = usePermissions();

  if (loading) {
    return null;
  }

  // Verificar permissão de página se especificado
  if (requirePage && !canAccessPage(requirePage)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
