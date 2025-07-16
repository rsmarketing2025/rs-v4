
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { AccessDenied } from './AccessDenied';

interface PermissionWrapperProps {
  children: React.ReactNode;
  requirePage?: string;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
  accessDeniedTitle?: string;
  accessDeniedMessage?: string;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  requirePage,
  fallback = null,
  showAccessDenied = false,
  accessDeniedTitle,
  accessDeniedMessage
}) => {
  const { canAccessPage, loading } = usePermissions();

  if (loading) {
    return null;
  }

  // Verificar permissão de página se especificado
  if (requirePage && !canAccessPage(requirePage)) {
    if (showAccessDenied) {
      return (
        <AccessDenied 
          title={accessDeniedTitle}
          message={accessDeniedMessage}
        />
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
