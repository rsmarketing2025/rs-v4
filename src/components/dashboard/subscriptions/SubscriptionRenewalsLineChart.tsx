
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSubscriptionRenewalsLineData } from "@/hooks/useSubscriptionRenewalsLineData";
import { useSalesChartData } from "@/hooks/useSalesChartData";
import { TrendingUp } from "lucide-react";

interface SubscriptionRenewalsLineChartProps {
  dateRange: { from: Date; to: Date };
  totalSalesRevenue: number;
}

export const SubscriptionRenewalsLineChart: React.FC<SubscriptionRenewalsLineChartProps> = ({
  dateRange,
  totalSalesRevenue
}) => {
  const { lineData: renewalsData, loading: renewalsLoading } = useSubscriptionRenewalsLineData(
    dateRange,
    { plan: 'all', status: 'all' }
  );

  const { chartData: salesData, loading: salesLoading } = useSalesChartData(
    dateRange,
    { creative: 'all', paymentMethod: 'all', status: 'all' }
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
        return 'Faturamento por Hora';
      case 'weekly':
        return 'Faturamento da Semana';
      case 'yearly':
        return 'Faturamento por Mês';
      default:
        return 'Faturamento Geral vs Renovações';
    }
  };

  const getChartDescription = () => {
    switch (chartPeriod) {
      case 'single-day':
        return 'Comparação entre faturamento geral e renovações ao longo do dia';
      case 'weekly':
        return 'Comparação entre faturamento geral e renovações da semana';
      case 'yearly':
        return 'Comparação entre faturamento geral e renovações por mês';
      default:
        return 'Comparação entre faturamento geral e receita de renovações';
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatTooltipValue = (value: any, name: string) => {
    const label = name === 'renewals' ? 'Renovações' : 'Faturamento Geral';
    return [formatCurrency(value), label];
  };

  // Combine data from both sources
  const combinedData = React.useMemo(() => {
    if (renewalsLoading || salesLoading) return [];

    // Create a map to merge data by date
    const dataMap = new Map();

    // Add renewals data
    renewalsData.forEach(item => {
      dataMap.set(item.date, {
        date: item.date,
        renewals: item.revenue,
        general: 0
      });
    });

    // Add sales data
    salesData.forEach(item => {
      const existing = dataMap.get(item.date) || { date: item.date, renewals: 0, general: 0 };
      existing.general = item.revenue;
      dataMap.set(item.date, existing);
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [renewalsData, salesData, renewalsLoading, salesLoading]);

  const loading = renewalsLoading || salesLoading;
  const hasData = combinedData.some(item => item.renewals > 0 || item.general > 0);

  // Calculate totals for display
  const totalRenewals = combinedData.reduce((acc, item) => acc + item.renewals, 0);
  const totalGeneral = combinedData.reduce((acc, item) => acc + item.general, 0);

  console.log('📊 Combined chart rendering state:', { 
    loading, 
    dataLength: combinedData.length,
    hasData,
    totalRenewals,
    totalGeneral,
    chartPeriod,
    sampleData: combinedData.slice(0, 2)
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
            <div className="mt-2 space-y-1">
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Faturamento Geral:</span>{' '}
                <span className="font-semibold text-green-400">
                  {formatCurrency(totalGeneral)}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Renovações:</span>{' '}
                <span className="font-semibold text-blue-400">
                  {formatCurrency(totalRenewals)}
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
            <LineChart data={combinedData}>
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
              <Legend 
                wrapperStyle={{ color: '#94a3b8' }}
                formatter={(value) => value === 'renewals' ? 'Renovações' : 'Faturamento Geral'}
              />
              <Line
                type="monotone"
                dataKey="general"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="general"
              />
              <Line
                type="monotone"
                dataKey="renewals"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="renewals"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
