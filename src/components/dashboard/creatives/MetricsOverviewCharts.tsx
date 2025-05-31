
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign, Target, Eye, BarChart3, Activity } from 'lucide-react';

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
  views_75_percent: number;
  views_total: number;
  pr_hook_rate: number;
  hook_rate: number;
  body_rate: number;
  cta_rate: number;
  cpa: number;
}

interface MetricsOverviewChartsProps {
  creatives: CreativeData[];
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f97316', '#84cc16'];

export const MetricsOverviewCharts: React.FC<MetricsOverviewChartsProps> = ({ creatives }) => {
  // Filtrar criativos com valores acima de zero
  const nonZeroCreatives = creatives.filter(c => 
    c.amount_spent > 0 || c.sales_count > 0 || c.gross_sales > 0
  );

  // Dados para gráfico de barras de investimento vs receita - TODOS os criativos
  const investmentData = nonZeroCreatives
    .map(creative => ({
      name: creative.creative_name.length > 12 
        ? creative.creative_name.substring(0, 12) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      invested: creative.amount_spent,
      revenue: creative.gross_sales,
      profit: creative.profit
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Dados para gráfico de área de performance - TODOS os criativos
  const performanceData = nonZeroCreatives
    .map(creative => ({
      name: creative.creative_name.length > 10 
        ? creative.creative_name.substring(0, 10) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      roi: creative.roi,
      ctr: creative.ctr,
      convRate: creative.conv_body_rate,
      hookRate: creative.hook_rate,
      bodyRate: creative.body_rate
    }))
    .sort((a, b) => b.roi - a.roi);

  // Dados para gráfico de linha composto - Views e Conversões
  const viewsConversionsData = nonZeroCreatives
    .map(creative => ({
      name: creative.creative_name.length > 10 
        ? creative.creative_name.substring(0, 10) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      views3s: creative.views_3s,
      views75: creative.views_75_percent,
      viewsTotal: creative.views_total,
      sales: creative.sales_count,
      cpa: creative.cpa
    }))
    .sort((a, b) => b.views3s - a.views3s);

  // Dados para gráfico de pizza - distribuição de vendas (TOP 10)
  const salesDistribution = nonZeroCreatives
    .filter(c => c.sales_count > 0)
    .sort((a, b) => b.sales_count - a.sales_count)
    .slice(0, 10)
    .map((creative, index) => ({
      name: creative.creative_name.length > 20 
        ? creative.creative_name.substring(0, 20) + '...' 
        : creative.creative_name,
      value: creative.sales_count,
      color: COLORS[index % COLORS.length]
    }));

  // TOP 5 criativos para cards
  const top5ByRevenue = [...nonZeroCreatives]
    .sort((a, b) => b.gross_sales - a.gross_sales)
    .slice(0, 5);

  const top5ByROI = [...nonZeroCreatives]
    .filter(c => c.roi > 0)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const formatNumber = (value: number) => value.toLocaleString('pt-BR');

  const getRankBadgeColor = (index: number) => {
    switch(index) {
      case 0: return 'bg-yellow-500';
      case 1: return 'bg-gray-400';
      case 2: return 'bg-orange-600';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-8">
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
              <div key={creative.creative_name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getRankBadgeColor(index)}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {creative.creative_name.length > 25 
                        ? creative.creative_name.substring(0, 25) + '...' 
                        : creative.creative_name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {creative.sales_count} vendas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">
                    {formatCurrency(creative.gross_sales)}
                  </p>
                  <p className="text-slate-400 text-xs">
                    ROI: {formatPercentage(creative.roi)}
                  </p>
                </div>
              </div>
            ))}
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
              <div key={creative.creative_name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getRankBadgeColor(index)}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {creative.creative_name.length > 25 
                        ? creative.creative_name.substring(0, 25) + '...' 
                        : creative.creative_name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {formatCurrency(creative.amount_spent)} investido
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-bold">
                    {formatPercentage(creative.roi)}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {formatCurrency(creative.profit)} lucro
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais - Grade expandida */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Gráfico de barras - Investimento vs Receita vs Lucro */}
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Investimento vs Receita vs Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full overflow-x-auto">
              <div style={{ minWidth: Math.max(800, investmentData.length * 60) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={investmentData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
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
                    <Bar dataKey="invested" fill="#ef4444" name="invested" />
                    <Bar dataKey="revenue" fill="#22c55e" name="revenue" />
                    <Bar dataKey="profit" fill="#3b82f6" name="profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de área - Performance dos Criativos */}
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Performance e Taxas de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full overflow-x-auto">
              <div style={{ minWidth: Math.max(800, performanceData.length * 60) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={12}
                      tickFormatter={formatPercentage}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: any, name: string) => [
                        formatPercentage(value),
                        name === 'roi' ? 'ROI' : 
                        name === 'ctr' ? 'CTR' : 
                        name === 'convRate' ? 'Conv. Rate' :
                        name === 'hookRate' ? 'Hook Rate' : 'Body Rate'
                      ]}
                      labelFormatter={(label: any, payload: any) => 
                        payload?.[0]?.payload?.fullName || label
                      }
                    />
                    <Area type="monotone" dataKey="roi" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="convRate" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="hookRate" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Gráfico composto - Views e Vendas */}
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Views vs Vendas e CPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full overflow-x-auto">
              <div style={{ minWidth: Math.max(800, viewsConversionsData.length * 60) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={viewsConversionsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'cpa' ? formatCurrency(value) : formatNumber(value),
                        name === 'views3s' ? 'Views 3s' : 
                        name === 'views75' ? 'Views 75%' : 
                        name === 'sales' ? 'Vendas' : 'CPA'
                      ]}
                      labelFormatter={(label: any, payload: any) => 
                        payload?.[0]?.payload?.fullName || label
                      }
                    />
                    <Bar yAxisId="left" dataKey="views3s" fill="#06b6d4" />
                    <Bar yAxisId="left" dataKey="views75" fill="#84cc16" />
                    <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={3} />
                    <Line yAxisId="right" type="monotone" dataKey="cpa" stroke="#ef4444" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de pizza - Distribuição de vendas */}
        {salesDistribution.length > 0 && (
          <Card className="bg-slate-800/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Distribuição de Vendas (TOP 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => `${entry.value}`}
                      labelLine={false}
                    >
                      {salesDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: any) => [`${value} vendas`, 'Quantidade']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {salesDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-300 truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
