
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedChartProps {
  children: React.ReactNode;
  chartType: string;
  page: string;
  fallback?: React.ReactNode;
}

export const ProtectedChart: React.FC<ProtectedChartProps> = ({ 
  children, 
  chartType,
  page,
  fallback 
}) => {
  const { hasChartAccess, loading } = usePermissions();

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex items-center justify-center">
        <div className="text-slate-400">Carregando...</div>
      </div>
    );
  }

  if (!hasChartAccess(chartType, page)) {
    return (
      fallback || (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-400 text-sm">
              Você não tem permissão para visualizar este gráfico.
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};
