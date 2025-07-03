
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscriptionRenewalsLineData } from "@/hooks/useSubscriptionRenewalsLineData";
import { TrendingUp } from "lucide-react";

interface SubscriptionRenewalsLineChartProps {
  dateRange: { from: Date; to: Date };
  totalSalesRevenue: number;
}

export const SubscriptionRenewalsLineChart: React.FC<SubscriptionRenewalsLineChartProps> = ({
  dateRange,
  totalSalesRevenue
}) => {
  const [revenueFilter, setRevenueFilter] = useState('renewal');
  
  const { lineData, loading } = useSubscriptionRenewalsLineData(
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
        return 'Distribuição do faturamento ao longo do dia';
      case 'weekly':
        return 'Faturamento de cada dia da semana';
      case 'yearly':
        return 'Faturamento mensal ao longo do ano';
      default:
        return 'Evolução diária do faturamento';
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatTooltipValue = (value: any, name: string) => {
    return [formatCurrency(value), 'Receita'];
  };

  // Calculate data based on revenue filter
  const processedData = React.useMemo(() => {
    if (revenueFilter === 'renewal') {
      return lineData;
    } else {
      // For "Faturamento sem Renovação", subtract renewal revenue from total sales revenue
      const renewalTotalRevenue = lineData.reduce((acc, item) => acc + item.revenue, 0);
      const nonRenewalRevenue = totalSalesRevenue - renewalTotalRevenue;
      
      // Distribute the non-renewal revenue proportionally across the period
      const totalDataPoints = lineData.length;
      const avgNonRenewalRevenue = totalDataPoints > 0 ? nonRenewalRevenue / totalDataPoints : 0;
      
      return lineData.map(item => ({
        ...item,
        revenue: avgNonRenewalRevenue
      }));
    }
  }, [lineData, revenueFilter, totalSalesRevenue]);

  const hasData = processedData.some(item => item.revenue > 0);

  // Calcular total de receita para exibição
  const totalRevenue = processedData.reduce((acc, item) => acc + item.revenue, 0);

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
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
                <span className="text-slate-400">Total:</span>{' '}
                <span className="font-semibold text-blue-400">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={revenueFilter} onValueChange={setRevenueFilter}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white backdrop-blur-sm">
                <SelectValue placeholder="Filtrar receita" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-slate-700/50 backdrop-blur-sm">
                <SelectItem value="renewal">Renovação</SelectItem>
                <SelectItem value="non-renewal">Faturamento sem Renovação</SelectItem>
              </SelectContent>
            </Select>
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
                Não há dados para o período e filtros selecionados
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={processedData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
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
                dataKey="revenue"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
