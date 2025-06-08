import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface CreativeData {
  creative_name: string;
  amount_spent: number;
  sales_count: number;
  roi: number;
  profit: number;
  gross_sales: number;
  views_3s: number;
  ctr: number;
  conv_body_rate: number;
}

interface MetricsOverviewChartsProps {
  creatives: CreativeData[];
}

export const MetricsOverviewCharts: React.FC<MetricsOverviewChartsProps> = ({ creatives }) => {
  // Filtrar criativos com valores acima de zero
  const nonZeroCreatives = creatives.filter(c => 
    c.amount_spent > 0 || c.sales_count > 0 || c.gross_sales > 0
  );

  // Dados para gráfico de barras de investimento vs receita - TODOS os criativos
  const investmentData = nonZeroCreatives
    .map(creative => ({
      name: creative.creative_name.length > 15 
        ? creative.creative_name.substring(0, 15) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      invested: creative.amount_spent,
      revenue: creative.gross_sales,
      profit: creative.profit
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Calculate minimum width based on number of items for better visualization
  const minChartWidth = Math.max(1200, investmentData.length * 80);

  // Top 5 criativos para cards
  const top5ByRevenue = [...nonZeroCreatives]
    .sort((a, b) => b.gross_sales - a.gross_sales)
    .slice(0, 5);

  const top5ByROI = [...nonZeroCreatives]
    .filter(c => c.roi > 0)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const formatROI = (value: number) => `${value.toFixed(2)}x`;

  const getRankingBadge = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-500 text-yellow-900'; // Ouro
      case 1: return 'bg-gray-400 text-gray-900'; // Prata
      case 2: return 'bg-orange-600 text-orange-100'; // Bronze
      case 3: return 'bg-blue-500 text-blue-100'; // 4º lugar
      case 4: return 'bg-purple-500 text-purple-100'; // 5º lugar
      default: return 'bg-slate-500 text-slate-100';
    }
  };

  return (
    <PermissionWrapper chartType="metrics_overview" page="creatives">
      <div className="space-y-6">
        {/* Cards TOP 5 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                TOP 5 - Maior Receita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {top5ByRevenue.map((creative, index) => (
                <div key={creative.creative_name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getRankingBadge(index)}`}>
                      {index + 1}º
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {creative.creative_name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {creative.sales_count} vendas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">
                      {formatCurrency(creative.gross_sales)}
                    </p>
                    <p className="text-slate-400 text-xs">
                      ROI: {formatROI(creative.roi)}
                    </p>
                  </div>
                </div>
              ))}
              {top5ByRevenue.length === 0 && (
                <p className="text-slate-400 text-center py-4">
                  Nenhum dado de receita encontrado
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                TOP 5 - Melhor ROI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {top5ByROI.map((creative, index) => (
                <div key={creative.creative_name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getRankingBadge(index)}`}>
                      {index + 1}º
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {creative.creative_name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {formatCurrency(creative.amount_spent)} investido
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-bold text-sm">
                      {formatROI(creative.roi)}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {formatCurrency(creative.profit)} lucro
                    </p>
                  </div>
                </div>
              ))}
              {top5ByROI.length === 0 && (
                <p className="text-slate-400 text-center py-4">
                  Nenhum dado de ROI encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de barras - Investimento vs Receita */}
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Investimento vs Receita - Panorama Geral</span>
              <span className="text-sm text-slate-400 font-normal">
                {investmentData.length} criativos
              </span>
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Use a barra de rolagem horizontal para navegar por todos os criativos
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full border border-slate-700/50 rounded-lg">
              <div style={{ width: minChartWidth, minWidth: minChartWidth }}>
                <ResponsiveContainer width={minChartWidth} height={400}>
                  <BarChart 
                    data={investmentData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    barCategoryGap="15%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12}
                      tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: any, name: string) => [
                        formatCurrency(value),
                        name === 'invested' ? 'Investido' : name === 'revenue' ? 'Receita' : 'Lucro'
                      ]}
                      labelFormatter={(label: any, payload: any) => 
                        payload?.[0]?.payload?.fullName || label
                      }
                    />
                    <Bar dataKey="invested" fill="#ef4444" name="invested" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="revenue" fill="#22c55e" name="revenue" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="profit" fill="#3b82f6" name="profit" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ScrollBar orientation="horizontal" className="bg-slate-800/50" />
            </ScrollArea>
            
            {investmentData.length === 0 && (
              <div className="flex items-center justify-center h-80">
                <p className="text-slate-400 text-center">
                  Nenhum dado de investimento/receita encontrado para o período selecionado.
                </p>
              </div>
            )}
            
            {investmentData.length > 10 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                </div>
                <span>Deslize horizontalmente para ver mais criativos</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionWrapper>
  );
};
