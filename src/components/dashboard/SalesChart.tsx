
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Sale {
  id: string;
  gross_value: number;
  status: string;
  payment_method: string;
  sale_date: string;
}

interface SalesChartProps {
  sales: Sale[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ sales }) => {
  // Prepare daily revenue data
  const dailyRevenue = sales
    .filter(sale => sale.status === 'completed')
    .reduce((acc, sale) => {
      const date = format(parseISO(sale.sale_date), 'dd/MM', { locale: ptBR });
      acc[date] = (acc[date] || 0) + (sale.gross_value || 0);
      return acc;
    }, {} as Record<string, number>);

  const revenueData = Object.entries(dailyRevenue)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Prepare sales status distribution with quantities and values
  const statusDistribution = sales.reduce((acc, sale) => {
    const status = sale.status;
    if (!acc[status]) {
      acc[status] = { count: 0, value: 0 };
    }
    acc[status].count += 1;
    acc[status].value += (sale.gross_value || 0);
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const statusData = Object.entries(statusDistribution).map(([status, data]) => ({
    name: status === 'completed' ? 'Concluído' : 
          status === 'refunded' ? 'Reembolsado' : 
          status === 'chargeback' ? 'Chargeback' : status,
    value: data.count,
    monetaryValue: data.value
  }));

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          style={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #475569',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff'
          }}
        >
          <p style={{ color: '#ffffff', margin: '0 0 4px 0' }}>{data.name}</p>
          <p style={{ color: '#ffffff', margin: '0 0 4px 0' }}>
            Quantidade: {data.value}
          </p>
          <p style={{ color: '#ffffff', margin: '0' }}>
            Valor: R$ {data.monetaryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Receita</CardTitle>
          <CardDescription className="text-slate-400">
            Evolução da receita ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
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
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Status das Vendas</CardTitle>
          <CardDescription className="text-slate-400">
            Distribuição por status da venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
