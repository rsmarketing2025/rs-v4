
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin } from "lucide-react";

interface Sale {
  country: string;
  status: string;
  net_value: number;
  state?: string;
}

interface CountrySalesChartProps {
  sales: Sale[];
  countryFilter: string;
}

interface ChartDataPoint {
  country: string;
  orders: number;
  revenue: number;
}

export const CountrySalesChart: React.FC<CountrySalesChartProps> = ({ sales }) => {
  const [sortBy, setSortBy] = useState<'revenue' | 'orders'>('revenue');

  console.log('CountrySalesChart - Total sales:', sales.length);

  // Calcular métricas por país
  const metrics = sales.reduce((acc, sale) => {
    const country = sale.country || 'Não informado';
    
    if (!acc[country]) {
      acc[country] = { orders: 0, revenue: 0 };
    }
    
    acc[country].orders += 1;
    if (sale.status === 'completed' || sale.status === 'Unfulfilled') {
      acc[country].revenue += (sale.net_value || 0);
    }
    
    return acc;
  }, {} as Record<string, { orders: number; revenue: number }>);

  console.log('CountrySalesChart - Calculated metrics:', metrics);

  // Converter para array e ordenar - mostrar todos os países
  const chartData: ChartDataPoint[] = Object.entries(metrics)
    .map(([country, data]) => ({
      country,
      orders: data.orders,
      revenue: data.revenue
    }))
    .sort((a, b) => sortBy === 'revenue' ? b.revenue - a.revenue : b.orders - a.orders);

  console.log('CountrySalesChart - Chart data points:', chartData);

  if (sales.length === 0) {
    return null;
  }

  // Calcular totais para exibição
  const totalMetrics = chartData.reduce((acc, item) => ({
    revenue: acc.revenue + item.revenue,
    orders: acc.orders + item.orders
  }), { revenue: 0, orders: 0 });

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Vendas por País
            </CardTitle>
            <CardDescription className="text-slate-400">
              Distribuição de vendas e pedidos por país
            </CardDescription>
            <div className="mt-2 flex flex-wrap gap-4">
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Total:</span>{' '}
                <span className="font-semibold text-green-400">
                  R$ {totalMetrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Pedidos:</span>{' '}
                <span className="font-semibold text-blue-400">
                  {totalMetrics.orders.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={sortBy} onValueChange={(value: 'revenue' | 'orders') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="revenue">Receita</SelectItem>
                <SelectItem value="orders">Pedidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[500px]">
            <p className="text-slate-400 text-center">
              Nenhum dado encontrado para o período selecionado.
            </p>
          </div>
        ) : (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="country"
                  stroke="#9ca3af"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (sortBy === 'revenue') {
                      return `R$ ${value.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 0 
                      })}`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'revenue' 
                      ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : value.toLocaleString(),
                    name === 'revenue' ? 'Receita' : 'Pedidos'
                  ]}
                  labelFormatter={(label) => `País: ${label}`}
                />
                <Bar 
                  dataKey={sortBy}
                  fill={sortBy === 'revenue' ? '#22c55e' : '#3b82f6'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
