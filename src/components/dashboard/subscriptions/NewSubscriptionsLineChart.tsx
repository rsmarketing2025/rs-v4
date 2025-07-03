
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNewSubscriptionsLineData } from "@/hooks/useNewSubscriptionsLineData";
import { TrendingUp } from "lucide-react";

interface NewSubscriptionsLineChartProps {
  dateRange: { from: Date; to: Date };
}

export const NewSubscriptionsLineChart: React.FC<NewSubscriptionsLineChartProps> = ({
  dateRange
}) => {
  const { lineData: subscriptionsData, loading: subscriptionsLoading } = useNewSubscriptionsLineData(
    dateRange,
    { plan: 'all', status: 'all' }
  );

  // Determine the chart period based on date range
  const getChartPeriod = () => {
    if (!dateRange.from || !dateRange.to) return 'daily';
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      return 'single-day';
    } else if (daysDiff >= 6 && daysDiff <= 7) {
      return 'weekly';
    } else if (daysDiff > 300) {
      return 'yearly';
    } else {
      return 'daily';
    }
  };

  const chartPeriod = getChartPeriod();

  // Get chart title based on period
  const getChartTitle = () => {
    switch (chartPeriod) {
      case 'single-day':
        return 'Novas Assinaturas por Hora';
      case 'weekly':
        return 'Novas Assinaturas da Semana';
      case 'yearly':
        return 'Novas Assinaturas por Mês';
      default:
        return 'Novas Assinaturas';
    }
  };

  const getChartDescription = () => {
    switch (chartPeriod) {
      case 'single-day':
        return 'Receita de novas assinaturas ao longo do dia';
      case 'weekly':
        return 'Receita de novas assinaturas da semana';
      case 'yearly':
        return 'Receita de novas assinaturas por mês';
      default:
        return 'Receita de novas assinaturas';
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatTooltipValue = (value: any, name: string) => {
    return [formatCurrency(value), 'Novas Assinaturas'];
  };

  const loading = subscriptionsLoading;
  const hasData = subscriptionsData.some(item => item.revenue > 0);

  // Calculate totals for display
  const totalNewSubscriptions = subscriptionsData.reduce((acc, item) => acc + item.revenue, 0);

  console.log('📊 New subscriptions chart rendering state:', { 
    loading, 
    dataLength: subscriptionsData.length,
    hasData,
    totalNewSubscriptions,
    chartPeriod,
    sampleData: subscriptionsData.slice(0, 2)
  });

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col justify-between items-start gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {getChartTitle()}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {getChartDescription()}
            </CardDescription>
            <div className="mt-2">
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Total de Novas Assinaturas:</span>{' '}
                <span className="font-semibold text-green-400">
                  {formatCurrency(totalNewSubscriptions)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-slate-400">Carregando dados...</div>
          </div>
        ) : !hasData ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 text-lg mb-2">📊 Nenhum dado encontrado</div>
              <div className="text-slate-500 text-sm">
                Não há dados para o período selecionado
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={subscriptionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={formatTooltipValue}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="newSubscriptions"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
