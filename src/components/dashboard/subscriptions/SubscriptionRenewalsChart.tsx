
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useSubscriptionChartData } from "@/hooks/useSubscriptionChartData";

interface SubscriptionRenewalsChartProps {
  dateRange: { from: Date; to: Date };
  filters: { plan: string; eventType: string; paymentMethod: string; status: string };
}

export const SubscriptionRenewalsChart: React.FC<SubscriptionRenewalsChartProps> = ({
  dateRange,
  filters
}) => {
  const { chartData, loading } = useSubscriptionChartData(dateRange, filters, 'renewals');

  // Prepare plan distribution data
  const preparePlanData = () => {
    const planCounts: Record<string, number> = {};
    
    chartData.forEach(item => {
      const plan = item.plan || 'Unknown';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    return Object.entries(planCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const planData = preparePlanData();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Renovações por Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-slate-400">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Renovações por Plano</CardTitle>
        <CardDescription className="text-slate-400">
          Distribuição de renovações por tipo de plano
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
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
