
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target, Eye } from 'lucide-react';

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

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];

export const MetricsOverviewCharts: React.FC<MetricsOverviewChartsProps> = ({ creatives }) => {
  // Filtrar criativos com valores acima de zero
  const nonZeroCreatives = creatives.filter(c => 
    c.amount_spent > 0 || c.sales_count > 0 || c.gross_sales > 0
  );

  // Dados para gráfico de barras de investimento vs receita
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

  // Dados para gráfico de linha de performance
  const performanceData = nonZeroCreatives
    .map(creative => ({
      name: creative.creative_name.length > 12 
        ? creative.creative_name.substring(0, 12) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      roi: creative.roi,
      ctr: creative.ctr,
      convRate: creative.conv_body_rate
    }))
    .sort((a, b) => b.roi - a.roi);

  // Dados para gráfico de pizza - distribuição de vendas
  const salesDistribution = nonZeroCreatives
    .filter(c => c.sales_count > 0)
    .sort((a, b) => b.sales_count - a.sales_count)
    .slice(0, 8)
    .map((creative, index) => ({
      name: creative.creative_name.length > 20 
        ? creative.creative_name.substring(0, 20) + '...' 
        : creative.creative_name,
      value: creative.sales_count,
      color: COLORS[index % COLORS.length]
    }));

  // Top 3 criativos para cards
  const top3ByRevenue = [...nonZeroCreatives]
    .sort((a, b) => b.gross_sales - a.gross_sales)
    .slice(0, 3);

  const top3ByROI = [...nonZeroCreatives]
    .filter(c => c.roi > 0)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3);

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Cards TOP 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              TOP 3 - Maior Receita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {top3ByRevenue.map((creative, index) => (
              <div key={creative.creative_name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
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
              TOP 3 - Melhor ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {top3ByROI.map((creative, index) => (
              <div key={creative.creative_name} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
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

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gráfico de barras - Investimento vs Receita */}
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Investimento vs Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full overflow-x-auto">
              <div style={{ minWidth: Math.max(600, investmentData.length * 60) }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={investmentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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

        {/* Gráfico de linha - Performance */}
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Performance dos Criativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full overflow-x-auto">
              <div style={{ minWidth: Math.max(600, performanceData.length * 60) }}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                        name === 'roi' ? 'ROI' : name === 'ctr' ? 'CTR' : 'Conv. Rate'
                      ]}
                      labelFormatter={(label: any, payload: any) => 
                        payload?.[0]?.payload?.fullName || label
                      }
                    />
                    <Line type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                    <Line type="monotone" dataKey="ctr" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                    <Line type="monotone" dataKey="convRate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de pizza - Distribuição de vendas */}
      {salesDistribution.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Distribuição de Vendas por Criativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}`}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};
