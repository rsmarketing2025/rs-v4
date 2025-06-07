
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

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
}

interface TopTenChartProps {
  creatives: CreativeData[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
}

const metricOptions = [
  { value: 'amount_spent', label: 'Valor Gasto', color: '#ef4444' },
  { value: 'sales_count', label: 'Qtd de Vendas', color: '#22c55e' },
  { value: 'roi', label: 'ROI', color: '#3b82f6' },
  { value: 'profit', label: 'Lucro', color: '#8b5cf6' },
  { value: 'gross_sales', label: 'Vendas Bruto', color: '#f59e0b' },
  { value: 'views_3s', label: 'Views 3s', color: '#06b6d4' },
  { value: 'ctr', label: 'CTR %', color: '#ec4899' },
  { value: 'conv_body_rate', label: 'Conv. Body %', color: '#10b981' }
];

export const TopTenChart: React.FC<TopTenChartProps> = ({
  creatives,
  selectedMetric,
  onMetricChange
}) => {
  const currentMetric = metricOptions.find(m => m.value === selectedMetric) || metricOptions[0];
  
  const filteredData = creatives
    .filter(creative => (creative as any)[selectedMetric] > 0)
    .sort((a, b) => (b as any)[selectedMetric] - (a as any)[selectedMetric])
    .slice(0, 10)
    .map(creative => ({
      name: creative.creative_name.length > 20 
        ? creative.creative_name.substring(0, 20) + '...' 
        : creative.creative_name,
      fullName: creative.creative_name,
      value: (creative as any)[selectedMetric]
    }));

  const formatValue = (value: number) => {
    if (selectedMetric === 'roi') {
      return value.toFixed(2);
    }
    if (selectedMetric.includes('rate') || selectedMetric === 'ctr') {
      return `${value.toFixed(1)}%`;
    }
    if (selectedMetric.includes('spent') || selectedMetric.includes('sales') || selectedMetric === 'profit' || selectedMetric === 'cpa') {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    return value.toLocaleString('pt-BR');
  };

  return (
    <PermissionWrapper chartType="top_creatives" page="creatives">
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
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={formatValue}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: any, props: any) => [
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
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </PermissionWrapper>
  );
};
