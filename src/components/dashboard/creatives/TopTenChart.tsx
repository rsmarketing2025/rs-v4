
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface TopTenChartProps {
  creatives: CreativeData[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
}

const metricOptions = [
  { value: 'amount_spent', label: 'Valor Gasto', color: '#ef4444' },
  { value: 'sales_count', label: 'Qtd de Vendas', color: '#22c55e' },
  { value: 'roi', label: 'ROI %', color: '#3b82f6' },
  { value: 'cpa', label: 'CPA', color: '#f59e0b' },
  { value: 'profit', label: 'Lucro', color: '#8b5cf6' },
  { value: 'gross_sales', label: 'Vendas Bruto', color: '#f59e0b' },
  { value: 'views_3s', label: 'Views 3s', color: '#06b6d4' },
  { value: 'views_75_percent', label: 'Views 75%', color: '#84cc16' },
  { value: 'views_total', label: 'Views Total', color: '#06b6d4' },
  { value: 'ctr', label: 'CTR %', color: '#ec4899' },
  { value: 'conv_body_rate', label: 'Conv. Body %', color: '#10b981' },
  { value: 'pr_hook_rate', label: 'PR Hook %', color: '#f97316' },
  { value: 'hook_rate', label: 'Hook Rate %', color: '#eab308' },
  { value: 'body_rate', label: 'Body Rate %', color: '#a855f7' },
  { value: 'cta_rate', label: 'CTA %', color: '#14b8a6' }
];

export const TopTenChart: React.FC<TopTenChartProps> = ({
  creatives,
  selectedMetric,
  onMetricChange
}) => {
  const currentMetric = metricOptions.find(m => m.value === selectedMetric) || metricOptions[0];
  
  // Filtrar criativos com valor acima de zero e pegar TOP 10
  const filteredData = creatives
    .filter(creative => (creative as any)[selectedMetric] > 0)
    .sort((a, b) => (b as any)[selectedMetric] - (a as any)[selectedMetric])
    .slice(0, 10)
    .map(creative => ({
      name: creative.creative_name.length > 15 
        ? creative.creative_name.substring(0, 15) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      value: (creative as any)[selectedMetric]
    }));

  const formatValue = (value: number) => {
    if (selectedMetric.includes('rate') || selectedMetric === 'roi' || selectedMetric === 'ctr') {
      return `${value.toFixed(1)}%`;
    }
    if (selectedMetric.includes('spent') || selectedMetric.includes('sales') || selectedMetric === 'profit' || selectedMetric === 'cpa') {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    return value.toLocaleString('pt-BR');
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-white text-xl">TOP 10 Criativos</CardTitle>
            <CardDescription className="text-slate-400">
              Ranking dos melhores criativos por métrica selecionada
            </CardDescription>
          </div>
          <Select value={selectedMetric} onValueChange={onMetricChange}>
            <SelectTrigger className="w-full sm:w-[200px] bg-slate-900/50 border-slate-600 text-white">
              <SelectValue placeholder="Selecionar métrica" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {metricOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full overflow-x-auto">
          <div style={{ minWidth: Math.max(800, filteredData.length * 80) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={formatValue}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [
                    formatValue(value),
                    currentMetric.label
                  ]}
                  labelFormatter={(label: any, payload: any) => 
                    payload?.[0]?.payload?.fullName || label
                  }
                />
                <Bar 
                  dataKey="value" 
                  fill={currentMetric.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
