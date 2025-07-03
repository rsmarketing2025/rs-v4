
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSubscriptionStatusChartData } from "@/hooks/useSubscriptionStatusChartData";
import { useSubscriptionChartData } from "@/hooks/useSubscriptionChartData";

interface SubscriptionsChartProps {
  dateRange: { from: Date; to: Date };
  filters: { 
    plan: string; 
    eventType: string; 
    paymentMethod: string; 
    status: string; 
    products: string[]; 
  };
  type: 'subscriptions' | 'renewals';
}

export const SubscriptionsChart: React.FC<SubscriptionsChartProps> = ({
  dateRange,
  filters,
  type = 'subscriptions'
}) => {
  // Use subscription_status data for subscriptions chart, subscription_renewals for renewals
  const { chartData: subscriptionStatusData, loading: subscriptionStatusLoading } = useSubscriptionStatusChartData(dateRange, filters);
  const { chartData: renewalData, loading: renewalLoading } = useSubscriptionChartData(dateRange, filters, type);
  
  const loading = type === 'subscriptions' ? subscriptionStatusLoading : renewalLoading;
  const chartData = type === 'subscriptions' ? subscriptionStatusData : renewalData;

  // Prepare daily data
  const prepareDailyData = () => {
    const dailyRevenue: Record<string, number> = {};
    
    // Get all days in the range
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    
    // Initialize all days with 0
    days.forEach(day => {
      const dayStr = format(day, 'dd/MM', { locale: ptBR });
      dailyRevenue[dayStr] = 0;
    });
    
    // Aggregate data by day
    chartData.forEach(item => {
      const dayStr = format(parseISO(item.date), 'dd/MM', { locale: ptBR });
      const revenue = type === 'subscriptions' 
        ? (item.amount || 0) 
        : (item.revenue || 0);
      dailyRevenue[dayStr] = (dailyRevenue[dayStr] || 0) + revenue;
    });

    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Prepare plan distribution data with revenue
  const preparePlanData = () => {
    const planCounts: Record<string, number> = {};
    const planRevenues: Record<string, number> = {};
    
    chartData.forEach(item => {
      const plan = item.plan || 'Unknown';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
      
      const revenue = type === 'subscriptions' 
        ? (item.amount || 0) 
        : (item.revenue || 0);
      planRevenues[plan] = (planRevenues[plan] || 0) + revenue;
    });

    return Object.entries(planCounts).map(([name, value]) => ({
      name,
      value,
      revenue: planRevenues[name] || 0
    }));
  };

  const dailyRevenueData = prepareDailyData();
  const planData = preparePlanData();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartTitle = type === 'renewals' ? 'Receita de Renovações' : 'Receita de Assinaturas';
  const planTitle = type === 'renewals' ? 'Renovações por Plano' : 'Assinaturas por Plano';

  // Custom tooltip component for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-white text-sm">
            {type === 'renewals' ? 'Renovações' : 'Assinaturas'}: {data.value}
          </p>
          <p className="text-white text-sm">
            Valor: R$ {data.revenue.toLocaleString('pt-BR', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{chartTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-slate-400">Carregando dados...</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{planTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-slate-400">Carregando dados...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{chartTitle}</CardTitle>
          <CardDescription className="text-slate-400">
            Evolução diária da receita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyRevenueData}>
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
                formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{planTitle}</CardTitle>
          <CardDescription className="text-slate-400">
            Distribuição por {type === 'renewals' ? 'plano de renovação' : 'plano de assinatura'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {planData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
