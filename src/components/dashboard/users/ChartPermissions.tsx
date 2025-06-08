
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
    'summary_cards': 'Cards de Resumo',
    'metrics_overview': 'Panorama de Métricas',
    'time_series': 'Performance ao Longo do Tempo',
    'top_creatives': 'Top 10 Criativos',
    
    // Vendas
    'sales_chart': 'Gráfico de Vendas',
    'creatives_sales_chart': 'Vendas por Criativos',
    'state_sales_chart': 'Vendas por Estado',
    
    // Afiliados
    'affiliate_chart': 'Top Afiliados - Receita'
  };

  const pageLabels: Record<string, string> = {
    'creatives': 'Criativos',
    'sales': 'Vendas',
    'affiliates': 'Afiliados'
  };

  const chartsByPage = {
    'creatives': ['summary_cards', 'metrics_overview', 'time_series', 'top_creatives'],
    'sales': ['summary_cards', 'sales_chart', 'creatives_sales_chart', 'state_sales_chart'],
    'affiliates': ['summary_cards', 'affiliate_chart']
  };

  const getPermission = (chartType: string, page: string) => {
    const permission = chartPermissions.find(p => p.chartType === chartType && p.page === page);
    return permission ? permission.canView : true; // Default to true if no permission found
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-white mb-2">Permissões de Gráficos</h4>
        <p className="text-sm text-slate-400 mb-4">
          Controle quais gráficos o usuário pode visualizar em cada página do sistema
        </p>
      </div>

      {Object.entries(chartsByPage).map(([page, charts]) => (
        <div key={page} className="space-y-3">
          <h5 className="text-md font-medium text-slate-300 border-b border-slate-700 pb-2">
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
                  {chartTypeLabels[chartType] || chartType}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
