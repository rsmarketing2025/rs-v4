
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useSubscriptionRenewalsLineData } from "@/hooks/useSubscriptionRenewalsLineData";
import { useProductSalesChartData } from "@/hooks/useProductSalesChartData";
import { TrendingUp } from "lucide-react";
import { format, parseISO, eachDayOfInterval, eachHourOfInterval, eachMonthOfInterval, startOfDay, endOfDay } from 'date-fns';

interface SubscriptionRenewalsLineChartProps {
  dateRange: { from: Date; to: Date };
  totalSalesRevenue: number;
}

export const SubscriptionRenewalsLineChart: React.FC<SubscriptionRenewalsLineChartProps> = ({
  dateRange,
  totalSalesRevenue
}) => {
  const { lineData: renewalData, loading: renewalLoading } = useSubscriptionRenewalsLineData(
    dateRange,
    { plan: 'all', status: 'all' }
  );

  const { chartData: generalSalesData, loading: generalLoading } = useProductSalesChartData(
    dateRange,
    false // Get all sales, not just subscriptions
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
        return 'Faturamento e Renovações por Hora';
      case 'weekly':
        return 'Faturamento e Renovações da Semana';
      case 'yearly':
        return 'Faturamento e Renovações por Mês';
      default:
        return 'Faturamento e Renovações';
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
        return 'Comparação entre faturamento geral e renovações';
    }
  };

  // Process general sales data to match the renewal data format
  const processedGeneralData = React.useMemo(() => {
    if (!generalSalesData.length) return [];

    const startDate = startOfDay(dateRange.from);
    const endDate = endOfDay(dateRange.to);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let dateIntervals: Date[];
    let formatString: string;
    
    if (daysDiff <= 1) {
      dateIntervals = eachHourOfInterval({ start: startDate, end: endDate });
      formatString = 'HH:mm';
    } else if (daysDiff > 300) {
      dateIntervals = eachMonthOfInterval({ start: startDate, end: endDate });
      formatString = 'MMM yyyy';
    } else {
      dateIntervals = eachDayOfInterval({ start: startDate, end: endDate });
      formatString = 'dd/MM';
    }

    return dateIntervals.map(intervalDate => {
      const dateKey = format(intervalDate, formatString);
      
      const salesInPeriod = generalSalesData.filter(sale => {
        const saleDate = parseISO(sale.date);
        
        if (daysDiff <= 1) {
          return format(saleDate, 'HH') === format(intervalDate, 'HH') &&
                 format(saleDate, 'yyyy-MM-dd') === format(intervalDate, 'yyyy-MM-dd');
        } else if (daysDiff > 300) {
          return format(saleDate, 'yyyy-MM') === format(intervalDate, 'yyyy-MM');
        } else {
          return format(saleDate, 'yyyy-MM-dd') === format(intervalDate, 'yyyy-MM-dd');
        }
      });

      const revenue = salesInPeriod.reduce((sum, sale) => sum + (sale.revenue || 0), 0);

      return {
        date: dateKey,
        revenue
      };
    });
  }, [generalSalesData, dateRange]);

  // Combine both datasets
  const combinedData = React.useMemo(() => {
    const dataMap = new Map();
    
    // Add renewal data
    renewalData.forEach(item => {
      dataMap.set(item.date, {
        date: item.date,
        renewalRevenue: item.revenue,
        generalRevenue: 0
      });
    });
    
    // Add general sales data
    processedGeneralData.forEach(item => {
      const existing = dataMap.get(item.date);
      if (existing) {
        existing.generalRevenue = item.revenue;
      } else {
        dataMap.set(item.date, {
          date: item.date,
          renewalRevenue: 0,
          generalRevenue: item.revenue
        });
      }
    });
    
    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [renewalData, processedGeneralData]);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatTooltipValue = (value: any, name: string) => {
    const label = name === 'renewalRevenue' ? 'Renovações' : 'Faturamento Geral';
    return [formatCurrency(value), label];
  };

  const hasData = combinedData.some(item => item.renewalRevenue > 0 || item.generalRevenue > 0);
  const loading = renewalLoading || generalLoading;

  // Calculate totals for display
  const totalRenewalRevenue = combinedData.reduce((acc, item) => acc + item.renewalRevenue, 0);
  const totalGeneralRevenue = combinedData.reduce((acc, item) => acc + item.generalRevenue, 0);

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {getChartTitle()}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {getChartDescription()}
            </CardDescription>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-400">Renovações:</span>
                <span className="font-semibold text-blue-400">
                  {formatCurrency(totalRenewalRevenue)}
                </span>
              </div>
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-400">Faturamento Geral:</span>
                <span className="font-semibold text-green-400">
                  {formatCurrency(totalGeneralRevenue)}
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
              <Line
                type="monotone"
                dataKey="renewalRevenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="generalRevenue"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
