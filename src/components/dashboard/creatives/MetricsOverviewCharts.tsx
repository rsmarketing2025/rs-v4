
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface CreativeData {
  creative_name: string;
  amount_spent: number;
  sales_count: number;
  roi: number;
  cpa: number;
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
}

interface MetricsOverviewChartsProps {
  creatives: CreativeData[];
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export const MetricsOverviewCharts: React.FC<MetricsOverviewChartsProps> = ({ creatives }) => {
  // Preparar dados para gráfico de performance por criativo
  const performanceData = creatives
    .filter(creative => creative.amount_spent > 0)
    .slice(0, 8)
    .map(creative => ({
      name: creative.creative_name.length > 12 
        ? creative.creative_name.substring(0, 12) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      spent: creative.amount_spent,
      sales: creative.sales_count,
      roi: creative.roi
    }));

  // Preparar dados para gráfico de funil de conversão
  const funnelData = creatives.reduce((acc, creative) => {
    acc.views += creative.views_3s;
    acc.views75 += creative.views_75_percent;
    acc.sales += creative.sales_count;
    return acc;
  }, { views: 0, views75: 0, sales: 0 });

  const conversionFunnelData = [
    { stage: 'Views 3s', value: funnelData.views, percentage: 100 },
    { stage: 'Views 75%', value: funnelData.views75, percentage: funnelData.views > 0 ? (funnelData.views75 / funnelData.views) * 100 : 0 },
    { stage: 'Vendas', value: funnelData.sales, percentage: funnelData.views > 0 ? (funnelData.sales / funnelData.views) * 100 : 0 }
  ];

  // Preparar dados para distribuição de ROI
  const roiDistribution = creatives
    .filter(creative => creative.roi > 0)
    .reduce((acc, creative) => {
      if (creative.roi >= 300) acc.high++;
      else if (creative.roi >= 100) acc.medium++;
      else acc.low++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

  const roiPieData = [
    { name: 'ROI Alto (>300%)', value: roiDistribution.high, color: '#22c55e' },
    { name: 'ROI Médio (100-300%)', value: roiDistribution.medium, color: '#f59e0b' },
    { name: 'ROI Baixo (<100%)', value: roiDistribution.low, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Preparar dados para tendência de CPA vs ROI
  const cpaRoiData = creatives
    .filter(creative => creative.cpa > 0 && creative.roi > 0)
    .slice(0, 10)
    .map(creative => ({
      name: creative.creative_name.length > 10 
        ? creative.creative_name.substring(0, 10) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      cpa: creative.cpa,
      roi: creative.roi
    }));

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Performance por Criativo */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Performance por Criativo</CardTitle>
          <CardDescription className="text-slate-400">
            Comparação de investimento vs vendas por criativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'spent' ? formatCurrency(value) : value,
                    name === 'spent' ? 'Investido' : name === 'sales' ? 'Vendas' : 'ROI %'
                  ]}
                  labelFormatter={(label: any, payload: any) => 
                    payload?.[0]?.payload?.fullName || label
                  }
                />
                <Bar dataKey="spent" fill="#3b82f6" name="spent" />
                <Bar dataKey="sales" fill="#22c55e" name="sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Funil de Conversão */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Funil de Conversão</CardTitle>
          <CardDescription className="text-slate-400">
            Jornada do usuário desde visualização até compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionFunnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="stage" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [value.toLocaleString(), 'Quantidade']}
                />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de ROI */}
      {roiPieData.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Distribuição de ROI</CardTitle>
            <CardDescription className="text-slate-400">
              Classificação dos criativos por performance de ROI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roiPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {roiPieData.map((entry, index) => (
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CPA vs ROI Analysis */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Análise CPA vs ROI</CardTitle>
          <CardDescription className="text-slate-400">
            Relação entre custo por aquisição e retorno sobre investimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cpaRoiData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'cpa' ? formatCurrency(value) : formatPercentage(value),
                    name === 'cpa' ? 'CPA' : 'ROI'
                  ]}
                  labelFormatter={(label: any, payload: any) => 
                    payload?.[0]?.payload?.fullName || label
                  }
                />
                <Line type="monotone" dataKey="cpa" stroke="#ef4444" strokeWidth={2} name="cpa" />
                <Line type="monotone" dataKey="roi" stroke="#22c55e" strokeWidth={2} name="roi" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
