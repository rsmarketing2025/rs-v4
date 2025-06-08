
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useSubscriptionChartData } from "@/hooks/useSubscriptionChartData";

interface SubscriptionsChartProps {
  type: 'timeline' | 'plan-distribution' | 'mrr' | 'churn-rate';
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: {
    plan: string;
    eventType: string;
    paymentMethod: string;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const SubscriptionsChart: React.FC<SubscriptionsChartProps> = ({
  type,
  dateRange,
  filters
}) => {
  const { data, loading } = useSubscriptionChartData(type, dateRange, filters);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-slate-400">Carregando dados...</div>
      </div>
    );
  }

  if (type === 'timeline') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="subscriptions" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Novas Assinaturas"
          />
          <Line 
            type="monotone" 
            dataKey="cancellations" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Cancelamentos"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'plan-distribution') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'mrr') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'MRR']}
          />
          <Area 
            type="monotone" 
            dataKey="mrr" 
            stroke="#10b981" 
            fill="#10b981"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'churn-rate') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Taxa de Churn']}
          />
          <Line 
            type="monotone" 
            dataKey="churnRate" 
            stroke="#ef4444" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return null;
};
