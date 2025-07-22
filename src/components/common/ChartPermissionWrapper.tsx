import React from 'react';
import { useChartPermissions, ChartType } from '@/hooks/useChartPermissions';

interface ChartPermissionWrapperProps {
  children: React.ReactNode;
  requireChart: ChartType;
  fallback?: React.ReactNode;
}

export const ChartPermissionWrapper: React.FC<ChartPermissionWrapperProps> = ({
  children,
  requireChart,
  fallback = null
}) => {
  const { hasChartPermission, loading } = useChartPermissions();

  if (loading) {
    return <>{fallback}</>;
  }

  if (!hasChartPermission(requireChart)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};