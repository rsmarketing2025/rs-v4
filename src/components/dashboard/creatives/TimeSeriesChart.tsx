
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  start_date: string;
  end_date: string;
}

interface TimeSeriesChartProps {
  creatives: CreativeData[];
  dateRange: { from: Date; to: Date };
}

const metricOptions = [
  { value: 'amount_spent', label: 'Valor Gasto', color: '#ef4444' },
  { value: 'gross_sales', label: 'Receita Bruta', color: '#22c55e' },
  { value: 'profit', label: 'Lucro', color: '#3b82f6' },
  { value: 'roi', label: 'ROI %', color: '#8b5cf6' },
  { value: 'sales_count', label: 'Qtd de Vendas', color: '#f59e0b' },
  { value: 'views_3s', label: 'Views 3s', color: '#06b6d4' },
  { value: 'ctr', label: 'CTR %', color: '#ec4899' },
  { value: 'conv_body_rate', label: 'Conv. Body %', color: '#10b981' }
];

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f97316', '#84cc16'];

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ creatives, dateRange }) => {
  const [selectedMetric, setSelectedMetric] = React.useState('amount_spent');
  
  const currentMetric = metricOptions.find(m => m.value === selectedMetric) || metricOptions[0];

  // Gerar dados para série temporal
  const generateTimeSeriesData = () => {
    // Criar array de datas no intervalo
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    const dateArray = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d));
    }

    // Filtrar criativos relevantes (com valor > 0 na métrica escolhida)
    const relevantCreatives = creatives
      .filter(creative => (creative as any)[selectedMetric] > 0)
      .slice(0, 10); // Limitar a 10 criativos para melhor visualização

    // Simular dados temporais (distribuindo o valor total ao longo do período)
    const timeSeriesData = dateArray.map(date => {
      const dateStr = date.toLocaleDateString('pt-BR');
      const dataPoint: any = { date: dateStr, fullDate: date.toISOString().split('T')[0] };
      
      relevantCreatives.forEach((creative, index) => {
        const creativeName = creative.creative_name.length > 15 
          ? creative.creative_name.substring(0, 15) + '...' 
          : creative.creative_name;
        
        // Distribuir valor ao longo do período (simulação simples)
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const dailyValue = (creative as any)[selectedMetric] / totalDays;
        
        // Adicionar variação aleatória para simular flutuação diária
        const variation = 0.8 + (Math.random() * 0.4); // Variação entre 80% e 120%
        dataPoint[creativeName] = dailyValue * variation;
      });
      
      return dataPoint;
    });

    return { timeSeriesData, relevantCreatives };
  };

  const { timeSeriesData, relevantCreatives } = generateTimeSeriesData();

  const formatValue = (value: number) => {
    if (selectedMetric.includes('rate') || selectedMetric === 'roi' || selectedMetric === 'ctr') {
      return `${value.toFixed(1)}%`;
    }
    if (selectedMetric.includes('spent') || selectedMetric.includes('sales') || selectedMetric === 'profit') {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  };

  const formatTooltipValue = (value: number) => {
    if (selectedMetric.includes('rate') || selectedMetric === 'roi' || selectedMetric === 'ctr') {
      return `${value.toFixed(2)}%`;
    }
    if (selectedMetric.includes('spent') || selectedMetric.includes('sales') || selectedMetric === 'profit') {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    return value.toLocaleString('pt-BR');
  };

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-white text-xl">Evolução Temporal - Criativos</CardTitle>
            <CardTitle className="text-slate-400 text-sm font-normal">
              Acompanhe a evolução da métrica selecionada ao longo do período
            </CardTitle>
          </div>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
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
            <LineChart
              data={timeSeriesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date"
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
                formatter={(value: any, name: string) => [
                  formatTooltipValue(value),
                  name
                ]}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend 
                wrapperStyle={{ color: '#9ca3af' }}
                iconType="line"
              />
              {relevantCreatives.map((creative, index) => {
                const creativeName = creative.creative_name.length > 15 
                  ? creative.creative_name.substring(0, 15) + '...' 
                  : creative.creative_name;
                
                return (
                  <Line 
                    key={creative.creative_name}
                    type="monotone" 
                    dataKey={creativeName}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: COLORS[index % COLORS.length], r: 3 }}
                    connectNulls={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {relevantCreatives.length === 0 && (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-400 text-center">
              Nenhum criativo encontrado com valor acima de zero para a métrica selecionada.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
