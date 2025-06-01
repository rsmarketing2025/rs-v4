
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ChartPermission {
  chartType: string;
  page: string;
  canView: boolean;
}

interface ChartPermissionsProps {
  chartPermissions: ChartPermission[];
  onPermissionChange: (chartType: string, page: string, canView: boolean) => void;
}

export const ChartPermissions: React.FC<ChartPermissionsProps> = ({
  chartPermissions,
  onPermissionChange
}) => {
  const chartTypeLabels: Record<string, string> = {
    // Criativos
    'performance_overview': 'Resumo de Performance dos Criativos',
    'time_series': 'Performance ao Longo do Tempo',
    'top_creatives': 'Top 10 Criativos',
    'metrics_comparison': 'Comparação de Métricas',
    
    // Vendas
    'sales_summary': 'Resumo de Vendas',
    'conversion_funnel': 'Funil de Conversão',
    'creatives_sales': 'Vendas por Criativo',
    
    // Afiliados
    'affiliate_performance': 'Top Afiliados - Receita',
    
    // Receita
    'revenue_breakdown': 'Detalhamento de Receita',
    'roi_analysis': 'Análise de ROI'
  };

  const pageLabels: Record<string, string> = {
    'creatives': 'Criativos',
    'sales': 'Vendas',
    'affiliates': 'Afiliados',
    'revenue': 'Receita'
  };

  const chartsByPage = {
    'creatives': ['performance_overview', 'time_series', 'top_creatives', 'metrics_comparison'],
    'sales': ['sales_summary', 'conversion_funnel', 'time_series', 'creatives_sales'],
    'affiliates': ['affiliate_performance', 'time_series'],
    'revenue': ['revenue_breakdown', 'roi_analysis', 'time_series']
  };

  const getPermission = (chartType: string, page: string) => {
    return chartPermissions.find(p => p.chartType === chartType && p.page === page)?.canView ?? true;
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-medium text-white mb-4">Permissões de Gráficos</h4>
        <p className="text-sm text-slate-400 mb-4">
          Controle quais gráficos o usuário pode visualizar em cada página
        </p>
      </div>

      {Object.entries(chartsByPage).map(([page, charts]) => (
        <div key={page} className="space-y-3">
          <h5 className="text-sm font-medium text-slate-300">
            {pageLabels[page]}
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
            {charts.map((chartType) => (
              <div key={`${page}-${chartType}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`${page}-${chartType}`}
                  checked={getPermission(chartType, page)}
                  onCheckedChange={(checked) => 
                    onPermissionChange(chartType, page, checked as boolean)
                  }
                  className="border-slate-600"
                />
                <Label 
                  htmlFor={`${page}-${chartType}`} 
                  className="text-white text-sm cursor-pointer"
                >
                  {chartTypeLabels[chartType]}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
