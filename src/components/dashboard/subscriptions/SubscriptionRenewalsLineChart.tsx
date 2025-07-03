
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSubscriptionRenewalsLineData } from "@/hooks/useSubscriptionRenewalsLineData";
import { useProductSalesChartData } from "@/hooks/useProductSalesChartData";
import { TrendingUp, AlertCircle } from "lucide-react";
import { format, parseISO, eachDayOfInterval, eachHourOfInterval, eachMonthOfInterval, startOfDay, endOfDay } from 'date-fns';

interface SubscriptionRenewalsLineChartProps {
  dateRange: { from: Date; to: Date };
  totalSalesRevenue: number;
}

export const SubscriptionRenewalsLineChart: React.FC<SubscriptionRenewalsLineChartProps> = ({
  dateRange,
  totalSalesRevenue
}) => {
  // Stabilize filter dependencies with useMemo
  const renewalFilters = useMemo(() => ({
    plan: 'all',
    status: 'all'
  }), []);

  console.log('🔄 SubscriptionRenewalsLineChart render', {
    dateRange: {
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString()
    },
    totalSalesRevenue
  });

  const { lineData: renewalData, loading: renewalLoading, error: renewalError } = useSubscriptionRenewalsLineData(
    dateRange,
    renewalFilters
  );

  const { chartData: generalSalesData, loading: generalLoading } = useProductSalesChartData(
    dateRange,
    false // Get all sales, not just subscriptions
  );

  // Determine the chart period based on date range
  const chartPeriod = useMemo(() => {
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
  }, [dateRange.from, dateRange.to]);

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
  const processedGeneralData = useMemo(() => {
    if (!generalSalesData.length || !dateRange.from || !dateRange.to) {
      console.log('⚠️ processedGeneralData: No data or date range', {
        dataLength: generalSalesData.length,
        hasDateRange: !!(dateRange.from && dateRange.to)
      });
      return [];
    }

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

    const result = dateIntervals.map(intervalDate => {
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

    console.log('✅ processedGeneralData processed', {
      intervals: dateIntervals.length,
      resultLength: result.length,
      totalRevenue: result.reduce((sum, item) => sum + item.revenue, 0)
    });

    return result;
  }, [generalSalesData, dateRange.from, dateRange.to]);

  // Combine both datasets
  const combinedData = useMemo(() => {
    if (!renewalData.length && !processedGeneralData.length) {
      console.log('⚠️ combinedData: No data from either source');
      return [];
    }

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
    
    const result = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    console.log('📊 combinedData created', {
      dataPoints: result.length,
      totalRenewalRevenue: result.reduce((sum, item) => sum + item.renewalRevenue, 0),
      totalGeneralRevenue: result.reduce((sum, item) => sum + item.generalRevenue, 0),
      sampleData: result.slice(0, 2)
    });

    return result;
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
  const totalRenewalRevenue = useMemo(() => 
    combinedData.reduce((acc, item) => acc + item.renewalRevenue, 0), 
    [combinedData]
  );
  
  const totalGeneralRevenue = useMemo(() => 
    combinedData.reduce((acc, item) => acc + item.generalRevenue, 0), 
    [combinedData]
  );

  console.log('📊 Chart rendering state:', {
    loading,
    dataLength: combinedData.length,
    hasData,
    totalRenewalRevenue,
    totalGeneralRevenue,
    chartPeriod,
    renewalError,
    sampleData: combinedData.slice(0, 2)
  });

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
        ) : renewalError ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <div className="text-red-400 text-lg mb-2">Erro ao carregar dados</div>
              <div className="text-slate-500 text-sm">
                {renewalError}
              </div>
            </div>
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
            <AreaChart data={combinedData}>
              <defs>
                <linearGradient id="renewalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="generalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="renewalRevenue"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#renewalGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="generalRevenue"
                stackId="2"
                stroke="#10b981"
                fill="url(#generalGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
