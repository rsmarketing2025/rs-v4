
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscriptionRenewalsLineData } from "@/hooks/useSubscriptionRenewalsLineData";
import { TrendingUp } from "lucide-react";

interface SubscriptionRenewalsLineChartProps {
  dateRange: { from: Date; to: Date };
  planFilter: string;
  onPlanFilterChange: (plan: string) => void;
  availablePlans: string[];
}

export const SubscriptionRenewalsLineChart: React.FC<SubscriptionRenewalsLineChartProps> = ({
  dateRange,
  planFilter,
  onPlanFilterChange,
  availablePlans
}) => {
  const { lineData, loading } = useSubscriptionRenewalsLineData(
    dateRange,
    { plan: planFilter, status: 'all' }
  );

  // Determine the chart period based on date range (same logic as SalesChart)
  const getChartPeriod = () => {
    if (!dateRange.from || !dateRange.to) return 'daily';
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    // If it's exactly 1 day (today or yesterday)
    if (daysDiff <= 1) {
      return 'single-day';
    }
    // If it's exactly 7 days (this week)
    else if (daysDiff === 6 || daysDiff === 7) {
      return 'weekly';
    }
    // If it's a year range (more than 300 days)
    else if (daysDiff > 300) {
      return 'yearly';
    }
    // Default to daily for other ranges
    else {
      return 'daily';
    }
  };

  const chartPeriod = getChartPeriod();

  // Get chart title based on period
  const getChartTitle = () => {
    switch (chartPeriod) {
      case 'single-day':
        return 'Renovações por Hora';
      case 'weekly':
        return 'Renovações da Semana';
      case 'yearly':
        return 'Renovações por Mês';
      default:
        return 'Faturamento de Renovações';
    }
  };

  const getChartDescription = () => {
    switch (chartPeriod) {
      case 'single-day':
        return 'Distribuição das renovações ao longo do dia';
      case 'weekly':
        return 'Renovações de cada dia da semana';
      case 'yearly':
        return 'Renovações mensais ao longo do ano';
      default:
        return 'Evolução diária da receita das renovações de assinatura';
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatTooltipValue = (value: any, name: string) => {
    return [formatCurrency(value), 'Receita'];
  };

  const hasData = lineData.some(item => item.revenue > 0);

  // Calcular total de receita para exibição
  const totalRevenue = lineData.reduce((acc, item) => acc + item.revenue, 0);

  console.log('📊 Chart rendering state:', { 
    loading, 
    dataLength: lineData.length,
    hasData,
    totalRevenue,
    chartPeriod,
    sampleData: lineData.slice(0, 2)
  });

  return (
    <Card className="bg-slate-900/95 border-slate-800/50 backdrop-blur-sm">
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
          <div className="w-full sm:w-40">
            <Select value={planFilter} onValueChange={onPlanFilterChange}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white backdrop-blur-sm">
                <SelectValue placeholder="Filtrar plano" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-slate-700/50 backdrop-blur-sm">
                <SelectItem value="all">Todos os planos</SelectItem>
                {availablePlans.map((plan) => (
                  <SelectItem key={plan} value={plan}>
                    {plan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-slate-400">Carregando dados...</div>
          </div>
        ) : !hasData ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 text-lg mb-2">📊 Nenhuma renovação encontrada</div>
              <div className="text-slate-500 text-sm">
                Não há dados de renovações para o período e filtros selecionados
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/50 rounded-lg p-4 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#334155" 
                  strokeOpacity={0.3}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backdropFilter: 'blur(16px)'
                  }}
                  formatter={formatTooltipValue}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                  activeDot={{ 
                    r: 6, 
                    fill: '#3b82f6', 
                    strokeWidth: 2, 
                    stroke: '#ffffff' 
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
